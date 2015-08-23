var http = require('http');
var url = require('url');
var config = require('./config').server_Config;

//启动服务器
function startServer (route, handle, exePath) {
	function onRequest (req, res) {
		if (url.parse(req.url).pathname == '/closeServer') {
			ser.close(); //关闭服务器
			console.log('server has closed.');
		} else{
			route(req, res, handle, exePath);
		};
	}
	var ser = http.createServer(onRequest).listen(config.port);
	console.log('server has started.');
}

exports.start = startServer;
