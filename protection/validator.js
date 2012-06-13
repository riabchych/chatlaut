//
//  validator.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-04-21.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

/******************************************************************************
 * SIGNUP FORM VALIDATOR
 *****************************************************************************/

var paterns = {
	name : /[^\w_\-^!]/,
	email : /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b$/i
};

module.exports.checkEmail = function(email) {
	email = email.toLowerCase().trim();

	return email ? email.length < 50 ? email.match(paterns.email) ? true : false : false : false;
};

module.exports.check = function(data) {

	var errors = {
		isErrors : false,
		_errList : {},

		set : function() {
			this.isErrors = true;
			return this._errList;
		},
		get : function() {
			return this._errList;
		}
	};
	String.prototype.initCap = function() {
		return this.length > 1 ? this[0].toUpperCase() + this.substring(1, this.length).toLowerCase() : '';
	};

	String.prototype.trim = function() {
		return this ? this.replace(/^\s+|\s+$/g, '') : '';
	};

	if(data.p_name) {
		if(data.p_name.length < 20) {
			data.p_name = data.p_name.trim();
			/*if(!data.p_name.match(paterns.name)) {
			 errors.set().p_name = 'Недопустимое имя';
			 }*/
		} else {
			errors.set().p_name = 'Максимум 20 символов';
		}
	} else {
		errors.set().p_name = 'Введите Ваше имя';
	}

	if(data.p_email) {
		if(data.p_email.length < 50) {
			data.p_email = data.p_email.toLowerCase().trim();
			if(!data.p_email.match(paterns.email)) {
				errors.set().p_email = 'Неверный e-mail';
			}
		} else {
			errors.set().p_email = 'Максимум 50 символов';
		}
	} else {
		errors.set().p_email = 'Введите e-mail';
	}

	if(data.p_pass) {
		if(data.p_pass.length > 5 && data.p_pass.length < 31) {
			if(data.p_pass !== data.p_repass) {
				errors.set().p_pass = 'Пароли не совпадают';
			}
		} else {
			errors.set().p_pass = 'От 6 до 30 символов';
		}
	} else {
		errors.set().p_pass = 'Введите пароль';
	}

	if(!data.p_tos) {
		errors.set().p_tos = 'Вы должны принять наши условия';
	}

	var _profile = {
		nn : data.p_name || '', // first name
		em : data.p_email || '', // email
		pw : data.p_pass || '',    // password
	};

	if(errors.isErrors) {
		return {
			status : 0,
			err : errors.get()
		};
	} else {
		return {
			status : 1,
			profile : _profile
		}
	}
};
