import 'egg';
import { Connection, Model } from 'mongoose'
import { type } from "os";
import { UserProps } from "../app/model/user";
import * as OSS from 'ali-oss'
import { Options } from 'ali-oss'
declare module 'egg' {
    interface MongooseModels extends IModel {
        [key: string]: Model<any>;
    }
    //扩展到app上面
    interface Application {
        mongoose: Connection;
        model: MongooseModels;
        sessionMap: {
            [key: string]: any;
        },
        sessionStore: any;
    }
    //扩展加密解密到ctx上面
    interface Context {
        genHash(plainText: string): Promise<string>;
        compare(plainText: string, hash: string): Promise<boolean>;
        oss: OSS;
    }
    //扩展加密需要多少轮
    interface EggAppConfig {
        bcrypt: {
            saltRounds: number;
        },
        oss: {
            client?: Options;
        }
    }
}