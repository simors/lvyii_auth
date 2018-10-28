/**
 * Created by yangyang on 2018/1/4.
 */
'use strict';
var _ = require('underscore');

var LYAUTH = {}

LYAUTH._config = {}
LYAUTH._callback = {}

var fillServerURLs = function fillServerURLs(url) {
  return {
    api: url,
  };
};

/**
 * appName: 设置工程名称
 * secret: 设置jwt用户token认证时使用的secret
 * serverURLs: 设置外部服务器地址，目前只支持设置api服务器，配置如下
 *    {
 *        api: api服务器地址
 *    }
 * media: 外部存储媒介的类型，目前只支持redis
 * mediaCfg: 外部存储媒介的配置信息，目前只支持redis的配置，配置项如下
 *    {
 *        redis_url:    连接url
 *        redis_port:   端口号
 *        redis_db:     数据库索引号
 *        redis_auth:   认证密码
 *    }
 * verifyPhoneSmsTempId: 指定验证用户手机号码时，发生验证短信的模板编号
 * resetPwdSmsTempId: 重置密码时验证手机号的短信模板编号
 *
 * fetchUserById: 设置回调函数，根据用户编号获取用户信息，回调函数必须返回Promise
 * loginWithMobilePhone: 设置回调函数，根据手机号和密码来完成用户登录，回调函数必须返回Promise
 * loginWithUsername: 设置回调函数，根据用户名和密码来完成用户登录，回调函数必须返回Promise
 * signUpWithUsername: 设置回调函数，根据用户名和密码来完成用户注册，回调函数必须返回Promise
 * signUpWithMobilePhone: 设置回调函数，根据手机号和密码来完成用户注册，回调函数必须返回Promise
 * signUpOrlogInWithMobilePhone: 设置回调函数，根据手机号即验证码完成用户注册或者登录，回调函数必须返回Promise
 * resetPassword: 设置回调函数，验证旧密码重置新密码，回调函数返回bool值表示成功或失败
 * resetPasswordBySmsCode: 设置回调函数，验证手机号后重置密码，用于忘记密码的场景，回调函数返回bool值表示成功或失败
 * 
 * @param options
 * @param params
 */
LYAUTH.init = function init(options, ...params) {
  const {
    appName,
    secret,
    serverURLs,
    media,
    mediaCfg,
    verifyPhoneSmsTempId,
    fetchUserById,
    loginWithMobilePhone,
    loginWithUsername,
    signUpWithUsername,
    signUpWithMobilePhone,
    signUpOrlogInWithMobilePhone,
    resetPassword,
    resetPasswordBySmsCode
  } = options
  
  LYAUTH._config.appName = appName
  LYAUTH._config.secret = secret
  if (typeof serverURLs !== 'string') {
    LYAUTH._config.serverURLs = serverURLs;
  } else {
    LYAUTH._config.serverURLs = fillServerURLs(serverURLs);
  }
  LYAUTH._config.media = media
  LYAUTH._config.mediaCfg = mediaCfg
  LYAUTH._config.verifyPhoneSmsTempId = verifyPhoneSmsTempId
  
  LYAUTH._callback.fetchUserById = fetchUserById;
  LYAUTH._callback.loginWithMobilePhone = loginWithMobilePhone
  LYAUTH._callback.loginWithUsername = loginWithUsername
  LYAUTH._callback.signUpWithMobilePhone = signUpWithMobilePhone
  LYAUTH._callback.signUpWithUsername = signUpWithUsername
  LYAUTH._callback.signUpOrlogInWithMobilePhone = signUpOrlogInWithMobilePhone
  LYAUTH._callback.resetPassword = resetPassword
  LYAUTH._callback.resetPasswordBySmsCode = resetPasswordBySmsCode
  
  if (media !== 'redis') {
    throw new Error('unsupported media!')
  }
  
  if (!mediaCfg.redis_url || !mediaCfg.redis_port || !mediaCfg.redis_db || !mediaCfg.redis_auth) {
    throw new Error('init cfg for redis error!')
  }
  
  if (typeof mediaCfg !== "object") {
    throw new Error('mediaCfg must be an object')
  }
}

LYAUTH.Error = class LYAuthError extends Error {
  constructor(message, extra) {
    super()
    
    extra = extra || {}
    
    if (!extra.status) {
      extra.status = 400;
    }
    
    _.extend(this, {
      name: 'CloudError',
      message: message
    }, extra)
    
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = LYAUTH