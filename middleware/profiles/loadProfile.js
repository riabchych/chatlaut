//
//  login.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-04-21.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

/******************************************************************************
 * DEPENDANCIES
 *****************************************************************************/

var validator = require('../../protection/validator');

module.exports = function(data, callback) {
	if(!validator.checkEmail(data.p_email)) {
		callback ? callback({
			status : 0,
			type : 'auth',
			msg : 'Пожалуйста, проверьте правильность написания логина и пароля.'
		}) : emptyFunction();
		return false;
	} else {
		Profile.findOne({
			em : data.p_email
		}, function(err, profile) {
			if(profile && !err) {
				if(profile.authenticate(data.p_pass)) {
					callback ? callback({
						status : 1,
						type : 'auth',
						profile : profile
					}) : emptyFunction();
				} else {
					callback ? callback({
						status : 0,
						type : 'auth',
						msg : 'Пожалуйста, проверьте правильность написания логина и пароля.'
					}) : emptyFunction();
				}
			} else {
				callback ? callback({
					status : 0,
					type : 'auth',
					msg : 'Пожалуйста, проверьте правильность написания логина и пароля.'
				}) : emptyFunction();
			}
		});
		return true;
	}
	function emptyFunction() {
		return false;
	}

};
