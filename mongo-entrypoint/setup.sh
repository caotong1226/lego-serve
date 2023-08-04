#!/bin/bash

# shell脚本中发生错误，即命令返回值不等于0，则停止执行并退出shell
set -e

# << EOF后续输入作为子命令或者子shell的输入，直到遇到EOF为止，再返回主调shell
mongo <<EOF
use admin
db.auth('$MONGO_INITDB_ROOT_USERNAME', '$MONGO_INITDB_ROOT_PASSWORD')
use lego
db.createUser({
  user:  '$MONGO_DB_USERNAME',
  pwd: '$MONGO_DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'lego'
  }]
})
db.createCollection('works')
db.works.insertMany([
  {
    id: 19,
    title: '1024 程序员日',
    desc: '1024 程序员日',
    author: '185****2625',
    coverImg: 'http://static-dev.imooc-lego.com/imooc-test/sZHlgv.png',
    copiedCount: 737,
    isHot: true,
    isTemplate: true,
    isPublic: true,
    createdAt: '2020-11-26T09:27:19.000Z',
  }
])
EOF