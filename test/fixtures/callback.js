/**
 * Created by yangyang on 2018/1/5.
 */

const LYAUTH = require('../..');

const userInfo = {
  id: '123',
  username: 'yang'
}

function getUserById(userId) {
  if (userId === '123') {
    return userInfo
  } else {
    return undefined
  }
}

function loginWithMobilephone(mobilephone, password) {
  if (mobilephone === '13587369299' && password === '321456') {
    return userInfo
  } else {
    throw new LYAUTH.Error('login with mobile phone error', {code: 100})
  }
}

function loginWithUsername(username, password) {
  if (username === 'yang' && password === '321456') {
    return userInfo
  } else {
    return undefined
  }
}

const callbackFuncs = {
  getUserById: getUserById,
  loginWithMobilephone: loginWithMobilephone,
  loginWithUsername: loginWithUsername
}

module.exports = callbackFuncs