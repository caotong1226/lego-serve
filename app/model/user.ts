import { Application } from 'egg';
// import * as AutoIncrementFactory from 'mongoose-sequence';

export interface UserProps {
  username: string;
  password: string;
  nickName?: string;
  picture?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
function initUserModel(app: Application) {
  // const AutoIncrement = AutoIncrementFactory(app.mongoose);
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema<UserProps>({
    username: { type: 'string', unique: true, required: true },
    password: { type: 'string', required: true },
    nickName: { type: 'string' },
    picture: { type: 'string' },
    email: { type: 'string' },
    phoneNumber: { type: 'string' },
  }, {
    timestamps: true, toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  });
  // UserSchema.plugin(AutoIncrement, { inc_filed: 'id', id: 'users_id_counter' });
  return mongoose.model<UserProps>('User', UserSchema);
}
export default initUserModel;
