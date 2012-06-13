//
//  create.js
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
	var validData = validator.check(data || null);
	
	if(validData.err) {
		callback ? callback({
			status : 0,
			type : 'join',
			errors : validData.err
		}) : emptyFunction();
	} else {
		var prf = validData.profile;
		Profile.findOne().or([{ nn : prf.nn },{ em : prf.em }]).run(function(err, profile) {
			if(!profile && !err) {
				var _profile = new Profile(prf);
				_profile.save(function(err) {
					if(err) {
						console.log(err);
						callback ? callback({
							status : 0,
							type : 'join',
							msg : 'Ведутся технические работы. Приносим свои извинения за неудобства.'
						}) : emptyFunction();
						return false;
					} else {
						callback ? callback({
							status : 1,
							type : 'join',
							msg : 'Регистрация прошла успешно'
						}) : emptyFunction();
						return true;
					}
				});
			} else if(profile) {
				var _errors = {};
				if(profile.nn == prf.nn) {
					_errors.p_name = 'Данный никнейм уже используется';
				}  
				if(profile.em == prf.em) {
					_errors.p_email = 'Данный email уже занят';
				}
				console.log(_errors);
				callback ? callback({
					status : 0,
					type : 'join',
					errors : _errors
					
				}) : emptyFunction();
				return false;
			}
		});
	}

	function emptyFunction() {
		return false;
	}

}