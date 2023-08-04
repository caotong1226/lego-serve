FROM node:18-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# 安装提前，缓存npm包，否则每次业务代码更改都会使缓存失效
COPY package.json package-lock.json /usr/src/app/
RUN npm config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"
RUN npm config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"
RUN npm install
COPY . /usr/src/app/
RUN npm run tsc
EXPOSE 7001
CMD npx egg-scripts start --title=lego-server