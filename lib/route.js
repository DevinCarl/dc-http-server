var url = require('url');
var path = require('path');

//路由，根据请求的url进行对应路由
function route (req, res, handle, exePath) {
	var urlname = url.parse(req.url, true);
	var base = path.basename(urlname.pathname);
	if (base in handle) {
		
	}else{
		base = 'default';
	};
	return handle[base](urlname, req, res, exePath);
}


exports.route = route;