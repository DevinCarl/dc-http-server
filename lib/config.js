exports.handle_Config = {
	'welcome_file' : 'index.html',
	'expire_file'  : /^\.(gif|png|jpg|js|css|ttf)$/gi,
	'maxAge'       : 606024365,
	'compress_file': /^\.(css|js|html)$/gi,
}

exports.server_Config = {
	'port' : 9090
}