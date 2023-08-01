/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerWebpackPlugin = require('filemanager-webpack-plugin');
const buildFileDest = path.resolve(__dirname, '../app/public');
const templateFileDest = path.resolve(__dirname, '../app/view');

module.exports = env => {
  return {
    mode: 'production',
    context: path.resolve(__dirname, '../webpack'),
    entry: './index.js',
    output: {
      path: buildFileDest,
      filename: 'bundle.[hash].js',
      publicPath: env.production ? 'http://robot-server-image.oss-cn-hangzhou.aliyuncs.com/h5-assets/' : '/public/',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [ MiniCssExtractPlugin.loader, 'css-loader' ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'page.nj',
        template: path.resolve(__dirname, './template.html'),
      }),
      new FileManagerWebpackPlugin({
        events: {
          onEnd: {
            copy: [
              {
                source: path.join(buildFileDest, 'page.nj'),
                destination: path.join(templateFileDest, 'page.nj'),
              },
            ],
          },
        },
      }),
    ],
  };
};
