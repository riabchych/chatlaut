//
//  core.js
//  chatlaut
//
//  Created by Yevhenii Riabchych on 2012-05-25.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
//

/*******************************************************************************
 * SOCKETS
 *******************************************************************************/

var Socket = {
	owner : Object,
	connect : function() {
		this.owner = io.connect(Common.getHostname() + ':3000');
		return this.owner;
	},

	init : function() {
		this.connect().on("connect", function(data) {
			this.on("broadcast", function(data) {
				if(data.hasOwnProperty('type')) {
					switch(data.type) {
						case "chat" :
							Chat.data.profile && Chat.appendMsg(data.username, data.text);
							break;
						case "auth" :
							if(!data.status) {
								sessionStorage.removeItem('profile');
								Layers.showContent();
								alert(data.msg);
							}
							break;
						case "join" :
							if(data.errors) {
								var delay = 0;
								$('.inputError').remove();
								$('.tosInputError').remove();
								$.each(data.errors, function(k, v) {
									var inputErr = $("<p>", {
										"class" : k == 'p_tos' ? 'tosInputError' : "inputError",
										html : "&#042;&nbsp;" + v
									});
									$('input[name=' + k + ']').after(inputErr);
									setTimeout(function() {
										inputErr.show(400);
									}, delay);
									delay += 200;
								});
							} else if(data.status == 1) {
								$('#content').fadeOut(0).html('<div id="reg_success"><p><b>Регистрация прошла успешно.</b></p></div>').fadeIn(500);
							}
							break;
						case "private" :
							Chat.data.profile && Chat.appendMsg(data.username, data.text, true);
							break;
						case "connect" :
							Chat.data.profile && Chat.appendMsg(data.username, data.text).appendUser(data.id, data.username, data.gravatar);
							break;
						case "disconnect" :
							if(Chat.data.profile) {
								if(data.id !== Chat.data.profile.id) {
									Chat.removeUser(data.id).appendMsg(data.username, data.text);
								} else {
									sessionStorage.removeItem('profile');
									Chat.clearChatLog().clearUserList().data.profile = null;
									Layers.showContent();
								}
							}
							break;
						default :
							Chat.data.profile && Chat.appendMsg(data.username, data.text);
							break;
					}
				}
			});

			this.on("init", function(data) {
				sessionStorage.setItem('profile', JSON.stringify(data));
				Layers.showChat(data.history, data.users);
				Chat.appendMsg(data.username, data.text);
				Chat.data.profile = data;
			});
		});
	}
};

/*******************************************************************************
 * SMILES
 *******************************************************************************/

var Smiles = {
	
	data : {
		path : '/img/smiles/',
		count : 32,
		alt : 'Смайл №'
	},

	init : function() {
		this.clear();
		var smilesList = [];
		for(var i = 1; i <= this.data.count; i++) {
			smilesList.push('<img src="', this.data.path, i, '.gif" title="id', i, '" alt="', this.data.alt, '" onclick="Smiles.addSmile(', i, ')">');
		}
		Chat.DOM.toolbar.smilesContainer.append(smilesList.join(''));
	},
	replaceCodes : function(text) {
		return text.replace(/\#S([0-9]*)\#/g, '<img src="' + this.data.path + '$1.gif" title="id$1" alt="' + this.data.alt + '" onclick="Smiles.addSmile($1)">');
	},
	addSmile : function(code) {
		var value = $('#chat-input-field').val();
		$('#chat-input-field').val(value + "#S" + code + "#").focus();
	},

	clear : function() {
		Chat.DOM.toolbar.smilesContainer.children().remove();
	}
};

/*******************************************************************************
 * UTILS
 *******************************************************************************/

var Util = {
	
	urlRE : /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,

	toStaticHTML : function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	zeroPad : function(digits, n) {
		n = n.toString();
		while(n.length < digits)
		n = '0' + n;
		return n;
	},
	timeString : function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},
	isBlank : function(text) {
		var blank = /^\s*$/;
		return (text.match(blank) !== null);
	}
};

/*******************************************************************************
 * LAYERS
 *******************************************************************************/

var Layers = {
	
	showContent : function() {
		$("#loading").fadeOut(0, function() {
			$("#chat-workspace").fadeOut(0, function() {
				$("#main-workspace").fadeIn(0);
			});
		});
	},

	showLoad : function() {
		$("#main-workspace").fadeOut(0, function() {
			$("#chat-workspace").fadeOut(0, function() {
				$("#loading").fadeIn(0);
			});
		});
	},

	showChat : function(history, users) {
		$("#main-workspace").fadeOut(function() {
			$("#loading").fadeOut(function() {
				history && $.each(history, function(key, msg) {
					Chat.appendMsg(msg.username, msg.text);
				});
				users && $.each(users, function(key, msg) {
					Chat.appendUser(msg.id, msg.username, msg.gravatar);
				});
				$("#chat-workspace").fadeIn(function() {
					Smiles.init();
				});
			});
		});
	}
};

/*******************************************************************************
 * CHAT
 *******************************************************************************/

var Chat = {

	DOM : {
		chatLog : Object,
		userList : Object,
		toolbar : Object,
		
		init : function() {
			this.chatLog = $('#chat-log');
			this.userList = $('#user-list');
			this.toolbar = $('#toolbar');
			this.toolbar.sendChatForm = $('#send-chat-form');
			this.toolbar.sendChatForm.inputField = $('#chat-input-field');
			this.toolbar.privateChatLog = $('#private-chat-log');
			this.toolbar.smilesContainer = $('#smiles-container');
		}
	},
	
	data : {
		profile : Object,
		users : Object,
		recipient : Object,
		history : Object
	},

	appendMsg : function(username, text, priv) {
		if(!username || !text) {
			return false;
		} else {
			( priv ? this.DOM.toolbar.privateChatLog : this.DOM.chatLog).append('<p class="msg-block"><time class="date">12:30:34</time><span class="author">' + (username == Chat.data.profile.username ? 'Вы' : username) + '</span><span class="text">' + Smiles.replaceCodes(text) + '</span></p>');
		}
		Common.scrollDown();
		return this;
	},

	appendUser : function(id, username, gravatar) {
		if(!id || !username) {
			return false;
		}
		$('#user-list ul').append('<li id="' + id + '" class="user-block"><img class="avatar" src="' + gravatar + '"><span class="author">' + (username == Chat.data.profile.username ? 'Вы' : username) + '</span></li>');
		return this;
	},

	removeUser : function(id) {
		if(!id) {
			return false;
		}
		$('#' + id).fadeOut(function() {
			$(this).remove();
		});
		return this;
	},
	clearUserList : function() {
		$("#user-list ul").children().remove();
		return this;
	},

	clearChatLog : function() {
		Chat.chatLog.children().remove();
		return this;
	},

	sendUtility : function(text) {
		text = text.replace("\/", "");
		var parts = text.split(" ");
		var command = "util-" + parts[0];

		if(parts[0] == "clear") {
			return $('#chat-log').html('');
		}
		if(parts[0] == "pm") {
			this.data.recipient = parts.slice(1)[0];
			this.DOM.toolbar.sendChatForm.inputField.val('/pm ' + this.data.recipient + ' ').focus();
		}
		if(parts[0] == "me") {
			this.appendMsg("info", 'Ваш никнейм [<span class="author">' + this.data.profile.username + '</span>]');
		}
		Socket.owner.emit(command, parts.slice(1));
		return this;
	}
};

/*******************************************************************************
 * COMMON
 *******************************************************************************/

var Common = {
	
	scrollDown : function() {
		Chat.DOM.chatLog.scrollTop(9999999);
		return this;
	},

	getHostname : function() {
		return document.location.protocol + '//' + document.location.host;
		return this;
	}
};

/*******************************************************************************
 * INIT
 *******************************************************************************/

$(document).ready(function() {
	Chat.DOM.init();
	Socket.init();
	if(sessionStorage.getItem('profile')) {
		Chat.data.profile = JSON.parse(sessionStorage.getItem('profile'));
		Layers.showLoad();

		Socket.owner.emit('auth', {
			p_email : Chat.data.profile.email || '',
			p_pass : Chat.data.profile.pass || ''
		});
	} else {
		Layers.showContent();
	}
	$("#auth-form").submit(function(e) {
		Layers.showLoad();
		var data = $(this).serializeArray();
		Socket.owner.emit('auth', {
			p_email : data[0]['value'],
			p_pass : data[1]['value']
		});
		e.preventDefault();
	});

	$("#reg-form").submit(function(e) {
		var data = $(this).serializeArray();
		Socket.owner.emit('join', {
			p_name : data[0]['value'],
			p_email : data[1]['value'],
			p_pass : data[2]['value'],
			p_repass : data[3]['value'],
			p_tos : data[4] ? data[4]['value'] : ''
		});
		e.preventDefault();
	});

	Chat.DOM.toolbar.sendChatForm.submit(function(e) {
		var text = $('#chat-input-field').val();
		if(text.search("\/") == 0) {
			Chat.sendUtility(text);
		} else {
			Socket.owner.emit('incoming', {
				id : Chat.data.profile.id,
				text : text
			});
			Chat.appendMsg("Вы", Util.toStaticHTML(text));
			$('#chat-input-field').val('')
		}
		e.preventDefault();
	});

	$(".author").live('click', function(e) {
		Chat.data.recipient = $(this).html()
		if(Chat.data.recipient == 'Вы' || Chat.data.recipient == Chat.data.profile.username) {
			return false;
		} else {
			$('#chat-input-field').val('/pm ' + Chat.data.recipient + ' ').focus();
		}
	});
	
	$(window).bind('resize', function(e) {
		var wndWidth = $(this).width();
		var wndHeight = $(this).height();
		var cw = $('#chat-workspace').width(wndWidth - 100).width();
		var us = $('#user-list').width();
		$('#chat-log').width(cw - us - 50);
	});
});
