import { Service } from 'egg';
import { UserProps } from '../model/user';
import * as $Dysmsapi from '@alicloud/dysmsapi20170525';

interface GiteeUserResp {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}
export default class UserService extends Service {
  public async createByEmail(payload: UserProps) {
    const { ctx } = this;
    const { username, password } = payload;
    const hash = await ctx.genHash(password);
    const userCreateData: Partial<UserProps> = {
      username,
      password: hash,
      email: username,
    };
    return ctx.model.User.create(userCreateData);
  }
  async findById(id: string) {
    return this.ctx.model.User.findById(id);
  }
  async findByUsername(username: string) {
    return this.ctx.model.User.findOne({ username });
  }
  async sendSMS(phoneNumber: string, veriCode: string) {
    const { app } = this;
    // 配置参数
    const sendSMSRequest = new $Dysmsapi.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: ' 慕课乐高',
      templateCode: 'SMS_223580190',
      templateParam: `\"code\"\"${veriCode}\"`,
    });
    const resp = await app.ALClient.sendSms(sendSMSRequest);
    return resp;
  }
  async loginByCellphone(cellphone: string) {
    const { ctx, app } = this;
    const user = await this.findByUsername(cellphone);
    // 检查user记录是否存在
    if (user) {
      const token = app.jwt.sign({ username: user.username }, app.config.jwt.secret);
      return token;
    }
    const userCreatedData: Partial<UserProps> = {
      username: cellphone,
      phoneNumber: cellphone,
      nickName: `lego${cellphone.slice(-4)}`,
      type: 'cellphone',
    };
    const newUser = await ctx.model.User.create(userCreatedData);
    const token = app.jwt.sign({ username: newUser.username }, app.config.jwt.secret);
    return token;
  }
  async getAccessToken(code: string) {
    const { ctx, app } = this;
    const { clientId, clientSecret, redirectUrl, authUrl } = app.config.giteeOauthConfig;
    const { data } = await ctx.curl(authUrl, {
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: {
        code,
        client_id: clientId,
        redirect_uri: redirectUrl,
        client_secret: clientSecret,
      },
    });
    return data.accessToken;
  }
  async getGiteeUserData(accessToken: string) {
    const { ctx, app } = this;
    const { giteeUserInfoApi } = app.config.giteeOauthConfig;
    const { data } = await ctx.curl<GiteeUserResp>(`${giteeUserInfoApi}?access_token=${accessToken}`, {
      dataType: 'json',
    });
    return data;
  }

  async loginByGitee(code: string) {
    const { ctx, app } = this;
    // 获取accessToken
    const accessToken = await this.getAccessToken(code);
    // 获取用户信息
    const user = await this.getGiteeUserData(accessToken);
    const { id, name, email, avatar_url } = user;
    const stringId = id.toString();
    // Gitee + id
    const existUser = await this.findByUsername(`Gitee${stringId}`);
    // 假如存在，返回token
    if (existUser) {
      const token = app.jwt.sign({ username: existUser.username }, app.config.jwt.secret);
      return token;
    }
    // 假如不存在，新建用户
    const userCreatedData: Partial<UserProps> = {
      oauthID: stringId,
      provider: 'gitee',
      username: `Gitee${stringId}`,
      picture: avatar_url,
      nickName: name,
      email,
      type: 'oauth',
    };
    const newUser = await ctx.model.User.create(userCreatedData);
    const token = app.jwt.sign({ username: newUser.username }, app.config.jwt.secret);
    return token;
  }
}
