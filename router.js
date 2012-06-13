//
//  page.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-04-21.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

/******************************************************************************
 * DEPENDANCIES
 *****************************************************************************/

var ejs = require('ejs'), fs = require('fs'), mime = require('./mime'), NOT_FOUND = "Not Found\n";

/******************************************************************************
 * ROUTES
 ******************************************************************************/

exports.set = function(server) {

	server.get('/', function(req, res) {
		getFile('pages/index.html', function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/signup', function(req, res) {
		getFile('pages/signup.html', function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/rules', function(req, res) {
		getFile('pages/rules.html', function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/terms', function(req, res) {
		getFile('pages/terms.html', function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/about', function(req, res) {
		getFile('pages/about.html', function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/ratings', function(req, res) {
		var query = Profile.find({});
		query.desc('rt');
		query.limit(20);
		query.exec(function(err, profiles) {
			if(!err) {
			getFile('pages/ratings.html', function(body, headers) {
				res.writeHead(200, headers);
				res.end(body);
			}, true, {
				profiles : profiles
			});
			}
		});

	});
	
	server.get('/css/{stylesheet}', function(req, res) {
		getFile('css/' + req.params.stylesheet, function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/js/{javascript}', function(req, res) {
		getFile('js/' + req.params.javascript, function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});

	server.get('/fonts/{font}', function(req, res) {
		getFile('fonts/' + req.params.font, function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});
	
	server.get('/img/smiles/{smile}', function(req, res) {
		getFile('img/smiles/' + req.params.smile, function(body, headers) {
			res.writeHead(200, headers);
			res.end(body);
		});
	});
};

/******************************************************************************
 * HELPER METHODS
 ******************************************************************************/

function extname(path) {
	var index = path.lastIndexOf(".");
	return index < 0 ? "" : path.substring(index);
}

function notFound(req, res) {
	res.writeHead(404, {
		"Content-Type" : "text/plain",
		"Content-Length" : NOT_FOUND.length
	});
	res.end(NOT_FOUND);
}

function getFile(filename, callback, isTemplate, params) {
	var body, headers;
	filename = 'static/' + filename;
	var contentType = mime.lookupExtension(extname(filename));
	fs.readFile(filename, function(err, data) {
		if(err) {
			notify('      server - error loading ' + filename, true, 'yellow');
		} else {
			body = isTemplate ? ejs.render(data.toString(), params) : data;
			headers = {
				"Content-Type" : contentType,
				"Content-Length" : body.length
			};
			notify('      server - static file ' + filename + ' loaded', false, 'yellow');
			callback(body, headers);
		}
	});
}
