import { Controller, FileStream } from 'egg';
// import * as sharp from 'sharp';
import { join, extname } from 'path';
// import { parse, join, extname } from 'path';
import { nanoid } from 'nanoid';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import * as sendToWormhole from 'stream-wormhole';
import * as Busboy from 'busboy';
import { createSSRApp } from 'vue';
import { renderToString, renderToNodeStream } from '@vue/server-renderer';

export default class UtilsController extends Controller {
  async renderH5PageTest() {
    const { ctx } = this;
    const vueApp = createSSRApp({
      data: () => ({ msg: 'hello world' }),
      template: '<h1>{{msg}}</h1>',
    });
    const appContent = await renderToString(vueApp);
    ctx.response.type = 'text/html';
    ctx.body = appContent;
    const stream = renderToNodeStream(vueApp);
    ctx.status = 200;
    await pipeline(stream, ctx.res);
  }
  splitIdAndUuid(str = '') {
    const result = { id: 0, uuid: '' };
    if (!str) return result;
    const index = str.indexOf('-');
    if (index < 0) return result;
    result.id = Number(str.slice(0, index));
    result.uuid = str.slice(index + 1);
    return result;
  }
  async renderToH5Page() {
    // id-uid split('-')
    // uuid = aa-bb-cc
    const { ctx } = this;
    const { idAndUuid } = ctx.params;
    const query = this.splitIdAndUuid(idAndUuid);
    try {
      const pageData = await ctx.service.utils.renderToPageData(query);
      await ctx.render('page.nj', pageData);
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'h5WorkNotExistError' });
    }
  }
  async uploadToOss() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    const savedOssPath = join('test', nanoid(6) + extname(stream.filename));
    try {
      const result = await ctx.oss.put(savedOssPath, stream);
      const { name, url } = result;
      ctx.helper.success({ ctx, res: { name, url } });
    } catch (error) {
      await sendToWormhole(stream);
      return ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
    }
  }
  async uploadMultipleFiles() {
    const { ctx, app } = this;
    const { fileSize } = app.config.multipart;
    const parts = ctx.multipart({ limits: { fileSize: fileSize as number } });
    const urls: string[] = [];
    let part: FileStream | string[];
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        app.logger.info(part);
      } else {
        try {
          const savedOssPath = join('test', nanoid(6) + extname(part.filename));
          const result = await ctx.oss.put(savedOssPath, part);
          const { url } = result;
          urls.push(url);
          if (part.truncated) {
            await ctx.oss.delete(savedOssPath);
            return ctx.helper.error({
              ctx,
              errorType: 'imageUploadFileSizeError',
            });
          }
        } catch (error) {
          await sendToWormhole(part);
          return ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } });
  }
  uploadFileUseBusBoy() {
    const { ctx, app } = this;
    return new Promise<string[]>(resolve => {
      const busboy = Busboy({ headers: ctx.req.headers });
      const results: string[] = [];
      busboy.on('file', (fieldname, file, filename) => {
        app.logger.info(fieldname, file, filename);
        const uid = nanoid(6);
        const savedFilePath = join(
          app.config.baseDir,
          'uploads',
          uid + extname(filename as any),
        );
        file.pipe(createWriteStream(savedFilePath));
        file.on('end', () => {
          results.push(savedFilePath);
        });
      });
      busboy.on('field', (fieldname, val) => {
        app.logger.info(fieldname, val);
      });
      busboy.on('finish', () => {
        app.logger.info('finish');
        resolve(results);
      });
      ctx.req.pipe(busboy);
    });
  }
  async testBusBoy() {
    const { ctx } = this;
    const results = await this.uploadFileUseBusBoy();
    ctx.helper.success({ ctx, res: results });
  }
  // async fileLocalUpload() {
  //   const { ctx, app } = this;
  //   const { filepath } = ctx.request.files[0];
  //   // 生成sharp实例
  //   const imageSource = sharp(filepath);
  //   const metadata = await imageSource.metadata();
  //   app.logger.debug(metadata);
  //   let thumbnailUrl = '';
  //   // 检查图片宽度是否大于300
  //   if (metadata.width && metadata.width > 300) {
  //     // 生成一个新的file path
  //     // uploads/*/a.png => uploads/**/a-thumbnail.png
  //     const { name, ext, dir } = parse(filepath);
  //     app.logger.debug(name, ext, dir);
  //     const thumbnailFilePath = join(dir, `${name}-thumbnail${ext}`);
  //     await imageSource.resize({ width: 300 }).toFile(thumbnailFilePath);
  //     thumbnailUrl = this.pathToURL(thumbnailFilePath);
  //   }
  //   const url = filepath.replace(app.config.baseDir, app.config.baseUrl);
  //   ctx.helper.success({
  //     ctx,
  //     res: { url, thumbnailUrl: thumbnailUrl ? thumbnailUrl : url },
  //   });
  // }
  pathToURL(path: string) {
    const { app } = this;
    return path.replace(app.config.baseDir, app.config.baseUrl);
  }
  // async fileUploadByStream() {
  //   const { ctx, app } = this;
  //   const stream = await ctx.getFileStream();
  //   const uid = nanoid(6);
  //   const savedFilePath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     uid + extname(stream.filename),
  //   );
  //   const savedThumbnailFilePath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     uid + '_thumbnail' + extname(stream.filename),
  //   );

  //   // 处理保存原始文件的流
  //   const saveTarget = createWriteStream(savedFilePath);
  //   const savePromise = pipeline(stream, saveTarget);

  //   // 创建sharp实例并调整大小
  //   const transformer = sharp().resize({ width: 300 });

  //   // 处理保存缩略图文件的流
  //   const thumbnailTarget = createWriteStream(savedThumbnailFilePath);
  //   const thumbnailPromise = pipeline(stream, transformer, thumbnailTarget);

  //   try {
  //     await Promise.all([ savePromise, thumbnailPromise ]);
  //   } catch (error) {
  //     return ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
  //   }

  //   ctx.helper.success({
  //     ctx,
  //     res: {
  //       url: this.pathToURL(savedFilePath),
  //       thumbnailUrl: this.pathToURL(savedThumbnailFilePath),
  //     },
  //   });
  // }
}
