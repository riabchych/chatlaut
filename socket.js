//
//  socket.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-04-21.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

const help = '<br><br><span class="info">/clear</span> – Очистить чат<br/>' + 
					 '<span class="info">/list</span> – Показать список пользователей в чате<br/>' + 
					 '<span class="info">/pm</span> &#60;user&#62; &#60;message&#62; – Оправить приватное сообщение заданому пользователю<br/>' + 
					 '<span class="info">/help</span> – Показать список доступный комманд<br/><br>';

const MESSAGE_BACKLOG = 200, SESSION_TIMEOUT = 2 * 60 * 1000;

var crypto			= require('crypto'), 
	loadProfile		= require('./middleware/profiles/loadProfile'), 
	createProfile	= require('./middleware/profiles/create'),
	sockets 		= {}, 
	buffer 			= [], 
	nameCache 		= [], 
	sessions 		= {};
	
exports.set = function(io) {
	var self = this;
	io.configure(function() {
		io.enable('browser client etag');
		io.set('log level', 9);
		io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
	});

	io.sockets.on('connection', function(socket) {
		socket.on("join", function(data) {
			createProfile(data, function(msg) {
				socket.emit("broadcast", msg);
			});
		});

		socket.on("auth", function(data) {
			loadProfile(data, function(msg) {
				msg.status ? createSession(msg) : socket.emit("broadcast", msg);
			});
		});

		socket.on("incoming", function(msg) {
			var session = checkSession(msg.id);
			if(!checkSession(msg.id) || !msg.text) {
				return;
			}
			socket.broadcast.emit("broadcast", initHistory({
				"type" 		: "chat",
				"text" 		: msg.text,
				"id" 		: session.id,
				"username" 	: session.username
			}));
			
			sessions[msg.id].msgCount++;
			session.poke();
		});

		socket.on("util-list", function(msg) {
			socket.emit("broadcast", {
				"type"		: "chat",
				"text" 		: ('Сейчас в чате: [<span class="author">' + nameCache.join('</span>,<span class="author">') + '</span>]'),
				"username" 	: "info"
			});
		});

		socket.on("util-help", function(msg) {
			socket.emit("broadcast", {
				"type" 		: "chat",
				"text" 		: help,
				"username" 	: "Info"
			});
		});

		socket.on("util-pm", function(msg) {
			if(msg[0] != socket._uname) {
				var otherUser = msg[0];
				var text = msg.slice(1).join(" ");
				privateMessage(otherUser, text);
			}
		});
		function privateMessage(other, text) {
			var session = checkSession(socket._uid);
			if(!session || !text) {
				return;
			}
	
			other = sockets[other] || other;
			if(other) {
				other.emit("broadcast", {
					"type" 		: "private",
					"text" 		: text,
					"username" 	: socket._uname
				});
				socket.emit("broadcast", {
					"type"		: "private",
					"text" 		: text,
					"username" 	: 'Вы'
				});
				
				session.poke();
				session.msgCount++;
				
			} else {
				socket.emit("broadcast", {
					"type"		: "error",
					"text"		: ("Пользователь с данным никнеймом не активен (" + other + ")"),
					"username"	: "Info"
				});
			}
		}

		function killSession(id) {
			id = id || socket._uid;
			var session = sessions[id];
			if(id && session) {
				session.destroy();
				return true;
			} else {
				return false;
			}
		}
		
		function checkSession(id) {
			var session = sessions[id];
			if(!session) {
				socket.emit("broadcast", {
					"type" : "error",
					"text" : 'Неверный идентификатор сессии',
				});
				return false;
			} else {
				return session;
			}
		}
		function createSession(user) {
			user = user.profile;
			var userHash= createHash(user);
			
			var session = sessions[userHash];
			if(session) {
				socket._uid				= userHash;
				socket._uname			= user.nn;
				sockets[socket._uname] 	= socket;
				
				socket.emit("init", {
					"id"		: session.id,
					"username" 	: session.username,
					"gravatar" 	: session.gravatar,
					"email" 	: user.em,
					"pass" 		: user.pw,
					"history" 	: buffer,
					"users" 	: sessions
				});
				return session;
			}

			var session = {
				id 			: userHash,
				username	: user.nn,
				email		: user.em,
				pass		: user.pw,
				gravatar	: user.sg,
				msgCount	: 0,
				timestamp 	: new Date(),
				duration 	: new Date().getTime(),
				
				poke : function() {
					this.timestamp = new Date();
				},
				
				destroy : function() {
					socket.emit("broadcast", {
						"type"		: 'disconnect',
						"text" 		: 'покинул чат',
						"id" 		: session.id,
						"gravatar" 	: session.gravatar,
						"username" 	: session.username
					});
					socket.broadcast.emit("broadcast", initHistory({
						"type"		: 'disconnect',
						"text" 		: 'покинул чат',
						"id" 		: session.id,
						"gravatar" 	: session.gravatar,
						"username" 	: session.username
					}));
					loadProfile({
						p_email : this.email,
						p_pass 	: this.pass
					}, function(data) {
						if(data.status && data.profile) {
							var timeLeft= (new Date().getTime() - session.duration) / 1000;
							data.profile.cm= data.profile.cm ? data.profile.cm + session.msgCount : session.msgCount;
							var rating = ((data.profile.cm + timeLeft) * 0.00001).toFixed(3);
							rating = data.profile.rt ? (Number(data.profile.rt) + Number(rating)) : Number(rating);
							data.profile.rt = Number(rating);
							data.profile.save();
						}
					});
					
					var idx = nameCache.indexOf(this._username);
					if(idx >= 0) {
						nameCache.splice(idx, 1);
					}
					delete sessions[this.id];
					delete sockets[this.username];
				}
			};

			socket._uid 			= session.id;
			socket._uname			= session.username;
			sockets[socket._uname] 	= socket;
			
			sessions[userHash] 	= session;
			
			nameCache.push(session.username);
			
			socket.emit("init", {
				"id" 		: session.id,
				"username"	: session.username,
				"gravatar" 	: session.gravatar,
				"email" 	: session.email,
				"pass" 		: session.pass,
				"text" 		: "присоеденились к чату",
				"history" 	: buffer,
				"users" 	: sessions
			});
			socket.broadcast.emit("broadcast", initHistory({
				"id" 		: session.id,
				"username"	: session.username,
				"gravatar"	: session.gravatar,
				"type"		: "connect",
				"text"		: "присоеденился к чату"
			}));

			return session;
		}

		function initHistory(msg) {
			buffer.push(msg);
			while(buffer.length > MESSAGE_BACKLOG) {
				buffer.shift();
			}
			return msg;
		}

		function createHash(user) {
			return crypto.createHmac('md5', 'user-' + user._id + '-' + user.nn).update(user.nn + user.em + user.pass + user._id).digest('hex') || false;
		}

		setInterval(function() {
			var now = new Date();
			for(var id in sessions) {
				if(!sessions.hasOwnProperty(id)) {
					continue;
				}
				var session = sessions[id];

				if(now - session.timestamp > SESSION_TIMEOUT) {
					session.destroy();
				}
			}
		}, 1000);
	});
	
	io.sockets.on('disconnected', function(socket) {
		delete sockets[socket._uname];
	});
};
