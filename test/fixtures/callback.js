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
    throw new LYAUTH.Error('Can not find user', {code: 110})
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
    throw new LYAUTH.Error('login with username error', {code: 100})
  }
}

function signUpWithUsername(username, password) {
  if (password === '123456') {
    let user = {
      id: '123',
      username: username ,
      password: password ,
    }
    return user
  } else {
    throw new LYAUTH.Error('login with username error', {code: 100})
  }
}

function signUpWithMobilePhone(mobilePhone, smsCode, password) {
  if (mobilePhone === '13888888888' && smsCode === '123456') {
    let user = {
      id: '123',
      mobilePhone: '13888888888',
      password: password,
    }
    return user
  } else {
    throw new LYAUTH.Error('sign up with mobilePhone error', {code: 101})
  }
}

const callbackFuncs = {
  getUserById: getUserById,
  loginWithMobilephone: loginWithMobilephone,
  loginWithUsername: loginWithUsername,
  signUpWithMobilePhone: signUpWithMobilePhone,
  signUpWithUsername: signUpWithUsername


}

module.exports = callbackFuncs