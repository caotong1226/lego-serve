import { Controller } from 'egg';
import sharp from 'sharp';
import { parse, join } from 'path';

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
      thumbnailUrl = thumbnailFilePath.replace(app.config.baseDir, app.config.baseUrl);
    }
    const url = filepath.replace(app.config.baseDir, app.config.baseUrl);
    ctx.helper.success({ ctx, res: { url, thumbnailUrl: thumbnailUrl ? thumbnailUrl : url } });
  }
}
