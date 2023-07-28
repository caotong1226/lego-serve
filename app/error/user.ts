export const userErrorMessages = {
  userValidateFail: {
    errCode: 101001,
    message: '输入信息验证失败',
  },
  createUserAlreadyExists: {
    errCode: 101002,
    message: '该邮箱已被注册，请直接登录',
  },
  loginCheckFailInfo: {
    errCode: 101003,
    message: '该用户不存在或密码错误',
  },
  loginValidateFail: {
    errCode: 101004,
    message: '登录检验失败',
  },
  sendVeriCodeFrequentlyFailInfo: {
    errCode: 101005,
    message: '请勿频繁的获取短信验证码',
  },
  loginVeriCodeIncorrectFailInfo: {
    errCode: 101006,
    message: '验证码不正确',
  },
  sendVeriCodeError: {
    errCode: 101007,
    message: '验证码发送失败',
  },
  giteeOauthError: {
    errCode: 101008,
    message: 'gitee 授权出错',
  },
};

