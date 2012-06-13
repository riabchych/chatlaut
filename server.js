//
//  server.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-02-19.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

/******************************************************************************
 * DEPENDANCIES
 *****************************************************************************/

var sys = require("sys"), 
	router = require('router'),
	sockets = require('socket.io'),
	mongoose = require('mongoose'),
	models = require('./models/db'),
	server = router();

/******************************************************************************
 * CONFIGURATIONS
 *****************************************************************************/

HOST = null;
PORT = 3000;

notify = function(str, isError, color){
  sys.puts(isError ? stylize(str, 'red') : color ? stylize(str, color) :str);
};

function stylize(str, style) {
  var styles = {
      'bold'      : [1,  22],
      'inverse'   : [7,  27],
      'underline' : [4,  24],
      'yellow'    : [33, 39],
      'green'     : [32, 39],
      'red'       : [31, 39]
  };
  return '\033[' + styles[style][0] + 'm' + str +
         '\033[' + styles[style][1] + 'm';
}

/******************************************************************************
 * MODELS
 *****************************************************************************/

models.defineModels(mongoose, function() {
	server.Profile = Profile = mongoose.model('Profile');
	db = mongoose.connect('mongodb://localhost/clautDB');
});

/******************************************************************************
 * ROUTES
 *****************************************************************************/

require('./router').set(server);

/*****************************************************±±±±±*************************
 * LAUNCH
 *****************************************************************************/

if(!module.parent) {
	require('./socket').set(sockets.listen(server.listen(Number(process.env.PORT || PORT))));
	notify(new Date().toUTCString() + " server.js served on port " + PORT, false, 'green');
}