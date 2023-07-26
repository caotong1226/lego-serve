import { Service } from 'egg';
import { UserProps } from '../model/user';
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
}
