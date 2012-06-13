//
//  db.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-04-21.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//


/******************************************************************************
 * MODELS
 *****************************************************************************/

function defineModels(mongoose, fn) {
	Schema = mongoose.Schema;
	ObjectId = Schema.ObjectId;
	/*
	 * PROFILE MODEL
	 */
	mongoose.model('Profile', require('./profile'));

	fn();
}

/******************************************************************************
 * EXPORT
 *****************************************************************************/
exports.defineModels = defineModels;
