import { Controller } from 'egg';
import sharp from 'sharp';
import { parse, join, extname } from 'path';
import { nanoid } from 'nanoid';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export default class UtilsController extends Controller {
  async fileLocalUpload() {
    const { ctx, app } = this;
    const { filepath } = ctx.request.files[0];
    // 生成sharp实例
    const imageSource = sharp(filepath);
    const metadata = await imageSource.metadata();
    app.logger.debug(metadata);
    let thumbnailUrl = '';
    // 检查图片宽度是否大于300
    if (metadata.width && metadata.width > 300) {
      // 生成一个新的file path
      // uploads/*/a.png => uploads/**/a-thumbnail.png
      const { name, ext, dir } = parse(filepath);
      app.logger.debug(name, ext, dir);
      const thumbnailFilePath = join(dir, `${name}-thumbnail${ext}`);
      await imageSource.resize({ width: 300 }).toFile(thumbnailFilePath);
      thumbnailUrl = this.pathToURL(thumbnailFilePath);
    }
    const url = filepath.replace(app.config.baseDir, app.config.baseUrl);
    ctx.helper.success({ ctx, res: { url, thumbnailUrl: thumbnailUrl ? thumbnailUrl : url } });
  }
  pathToURL(path:string) {
    const { app } = this;
    return path.replace(app.config.baseDir, app.config.baseUrl);
  }
  async fileUploadByStream() {
    const { ctx, app } = this;
    const stream = await ctx.getFileStream();
    const uid = nanoid(6);
    const savedFilePath = join(app.config.baseDir, 'uploads', uid + extname(stream.filename));
    const savedThumbnailFilePath = join(app.config.baseDir, 'uploads', uid + '_thumbnail' + extname(stream.filename));

    // 处理保存原始文件的流
    const saveTarget = createWriteStream(savedFilePath);
    const savePromise = pipeline(stream, saveTarget);

    // 创建sharp实例并调整大小
    const transformer = sharp().resize({ width: 300 });

    // 处理保存缩略图文件的流
    const thumbnailTarget = createWriteStream(savedThumbnailFilePath);
    const thumbnailPromise = pipeline(stream, transformer, thumbnailTarget);

    try {
      await Promise.all([ savePromise, thumbnailPromise ]);
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: 'imageUploadFail' });
    }

    ctx.helper.success({ ctx, res: { url: this.pathToURL(savedFilePath), thumbnailUrl: this.pathToURL(savedThumbnailFilePath) } });
  }
}
