/**
 * Created by yangyang on 2018/1/4.
 */
'use strict';
var _ = require('underscore');

var LYAUTH = {}

LYAUTH._config = {}
LYAUTH._callback = {}

LYAUTH.init = function init(options, ...params) {
  const {
    secret,
    fetchUserById,
    loginWithMobilePhone,
    loginWithUsername,
    signUpWithUsername,
    signUpWithMobilePhone,

  } = options
  
  LYAUTH._config.secret = secret
  
  LYAUTH._callback.fetchUserById = fetchUserById;
  LYAUTH._callback.loginWithMobilePhone = loginWithMobilePhone
  LYAUTH._callback.loginWithUsername = loginWithUsername
  LYAUTH._callback.signUpWithMobilePhone = signUpWithMobilePhone
  LYAUTH._callback.signUpWithUsername = signUpWithUsername

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