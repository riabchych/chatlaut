// 
//  ratingProfiles.js
//  chatlaut
//  
//  Created by Yevhenii Riabchych on 2012-05-24.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
// 


module.exports.load = function(data, callback) {
	callback = callback ? callback : emptyFunction();
	var query = Profile.find({});
	query.limit(20)
	query.desc('rt'),
	query.skip(10);
	query.exec(callback);

	function emptyFunction() {
		return false;
	}
};