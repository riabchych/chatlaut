// 
//  profile.js
//  chatlaut
//  
//  Created by Yevhenii Riabchych on 2012-05-24.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
// 

/******************************************************************************
 * DEPENDANCIES
 *****************************************************************************/

var crypto = require('crypto'), crypto = require('crypto'), gravatar = require('../gravatar');

/****************************************************************************
 * Model
 ***************************************************************************/

var Profile = new Schema({ 
	nn  : { type: String, required: true, index: { unique: true } },	//  nickname
	em  : { type: String, required: true, index: { unique: true } },	//  email
	sg	: { type: String },												//  small gravatar
	bg	: { type: String },												//  big gravatar
	sl  : { type: String },												//  salt
	cm	: { type: Number },												//  count messages
	rt	: { type: Number },												//  rating
	pw  : { type: String, required: true },								//	password hash
	rd  : { type: Date }												//	registration date
});

Profile.pre('save', function(next) {
	if(!this.sl) {
		this.rd = Date.now();
		this.cm = 0;
		this.rt = 0;
		this.sg = gravatar.get(this.em, 'R', 32, 'identicon');
		this.bg = gravatar.get(this.em, 'R', 64, 'identicon');
		this.phash = this.pw;
	}
	next();
});

Profile.virtual('phash').set(function(pass) {
	this.sl = this.makeSalt();
	this.pw = this.encryptPassword(pass);
}).get(function() {
	return this.pw;
});

Profile.method('authenticate', function(pass) {
	return (pass.length == 32 ? pass : this.encryptPassword(pass)) === this.pw;
});

Profile.method('makeSalt', function() {
	return Math.round((new Date().valueOf() * Math.random())) + '';
});

Profile.method('encryptPassword', function(password) {
	return crypto.createHmac('md5', this.sl).update(password).digest('hex');
});

Profile.on('init', function(model) {
	notify('   Profile\'s model is initialized', false, 'yellow');
});

module.exports = Profile;
