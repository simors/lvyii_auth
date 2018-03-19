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