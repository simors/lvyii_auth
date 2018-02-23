/**
 * Created by yangyang on 2018/1/5.
 */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var should = require('should');
var assert = require('assert');

const LYAUTH = require('../');
const appInfo = require('./fixtures/app-info');

var app = express();

app.use(LYAUTH.express());
app.use(bodyParser.json());

describe('auth', function() {
  it('mobile_login', function (done) {
    request(app)
      .post('/1/users/loginWithMobilePhone')
      .send({mobilephone: '13587369299', password: '321456'})
      .expect(200, function (err, res) {
        var result = res.body
        result.id.should.be.equal('123')
        done(err);
      });
  });
  
  it('mobile_login_error', function (done) {
    request(app)
      .post('/1/users/loginWithMobilePhone')
      .send({mobilephone: '13587369299', password: '21456'})
      .expect(400, function (err, res) {
        done(err);
      });
  });
  
  it('username_login', function (done) {
    request(app)
      .post('/1/users/loginWithUsername')
      .send({username: 'yang', password: '321456'})
      .expect(200, function (err, res) {
        var result = res.body
        result.id.should.be.equal('123')
        done(err);
      });
  });
  
  it('username_login_error', function (done) {
    request(app)
      .post('/1/users/loginWithUsername')
      .send({username: 'yang', password: '21456'})
      .expect(400, function (err, res) {
        done(err);
      });
  });

  it('mobile_sign', function (done) {
    request(app)
      .post('/1/users/signUpWithMobilephone')
      .send({mobilephone: '13888888888', smsCode: '123456'})
      .expect(200, function (err, res) {
        var result = res.body
        result.id.should.be.equal('123')
        done(err);
      });
  });

  it('mobile_sign_error', function (done) {
    request(app)
      .post('/1/users/signUpWithMobilephone')
      .send({mobilephone: '13587369299', smsCode: '21456'})
      .expect(400, function (err, res) {
        done(err);
      });
  });

  it('username_sign', function (done) {
    request(app)
      .post('/1/users/signUpWithUsername')
      .send({username: 'yang', password: '123456'})
      .expect(200, function (err, res) {
        var result = res.body
        result.id.should.be.equal('123')
        done(err);
      });
  });

  it('username_sign_error', function (done) {
    request(app)
      .post('/1/users/signUpWithUsername')
      .send({username: 'yang', password: '21456'})
      .expect(400, function (err, res) {
        done(err);
      });
  });
  
  it('user_token', function (done) {
    request(app)
      .post('/1/users/me')
      .send({sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTUxNTE1NjA3OX0.w-kmCMGh4ifoZzXFVIMV2-0GsNf8dhOOFBEynxecTUg'})
      .expect(200, function (err, res) {
        var result = res.body
        done(err)
      });
  });
  
  it('user_token_invalid', function (done) {
    request(app)
      .post('/1/users/me')
      .send({sessionToken: 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTUxNTE1NjA3OX0.w-kmCMGh4ifoZzXFVIMV2-0GsNf8dhOOFBEynxecTUg'})
      .expect(400, function (err, res) {
        var result = res.body
        done(err)
      });
  });
  
  it('user_token_notfound', function (done) {
    request(app)
      .post('/1/users/me')
      .send({sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzEyMyIsImlhdCI6MTUxNTE1NzkzNH0.UZwv-N8TqHX8clWuIYFW5oSQ9GosQS4Po9HlVc2LI-w'})
      .expect(400, function (err, res) {
        var result = res.body
        done(err)
      });
  });
  
});