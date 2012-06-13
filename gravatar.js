//
//  gravatar.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-03-12.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

var crypto = require('crypto');

var Gravatar = module.exports = function() {
	var md5 = {};
	var RATINGS = ['G', 'PG', 'R', 'X'];
	var G_URL = 'http://www.gravatar.com/avatar/';
	var DEFAULT_ICON_SIZE = 96;
	var DEFAULT_RATING = 'G';
	var DEFAULT_ICON_PATH = undefined;

	function getURL(ob) {
		var email = ob.email;
		delete ob.email;

		var params = [];
		for(var k in ob ) {
			if( typeof ob[k] !== 'undefined' && ob[k] !== null)
				params[params.length] = k + '=' + encodeURIComponent(ob[k]);
		}

		return G_URL + email + '?' + params.join('&');
	}

	return {
		get : function(email, rating, size, defaultForMissing) {
			var qs = {};

			if(!email)
				throw Error('[Error] Invalid email, email is :' + email);
			email = email.toLowerCase().trim();

			if(!md5[email]) {
				qs.email = crypto.createHash('md5').update(email).digest('hex');
				md5[email] = qs.email;
			} else
				qs.email = md5[email];
			qs.r = rating && RATINGS.indexOf(rating) >= 0 ? rating : DEFAULT_RATING;
			qs.s = size && size >= 1 && size <= 512 ? size : DEFAULT_ICON_SIZE;
			qs.d = defaultForMissing || DEFAULT_ICON_PATH;

			return getURL(qs);
		},
		setDefaultOptions : function(rating, size, defaultForMissing) {
			if(rating)
				DEFAULT_RATING = rating;

			if(size)
				DEFAULT_ICON_SIZE = size;

			if(defaultForMissing)
				DEFAULT_ICON_PATH = defaultForMissing;
		}
	};

}();
