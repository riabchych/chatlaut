// 
//  mime.js
//  chatlaut
//  
//  Created by Yevhenii Riabchych on 2012-05-24.
//  Copyright 2012 Yevhenii Riabchych. All rights reserved.
// 

module.exports = {
	lookupExtension : function(ext, fallback) {
		return this.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
	},
	TYPES : {
		".css" : "text/css",
		".htm" : "text/html",
		".html" : "text/html",
		".ico" : "image/vnd.microsoft.icon",
		".jpeg" : "image/jpeg",
		".jpg" : "image/jpeg",
		".gif" : "image/gif",
		".js" : "application/javascript",
		".json" : "application/json",
		".log" : "text/plain",
		".appcache" : "text/cache-manifest",
		".swf" : "application/x-shockwave-flash",
		".text" : "text/plain",
		".tif" : "image/tiff",
		".tiff" : "image/tiff",
		".txt" : "text/plain",
		".woff" : "font/woff",
		".xhtml" : "application/xhtml+xml",
		".xml" : "application/xml",
		".xsl" : "application/xml",
		".xslt" : "application/xslt+xml",
		".yaml" : "text/yaml",
		".yml" : "text/yaml",
		".zip" : "application/zip"
	}
};