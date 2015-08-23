var server = require('./lib/server');
var route = require("./lib/route");
var requestHandler = require("./lib/requestHandler");

//申明处理函数
var handle = {};
handle['default'] = requestHandler.defaultHandle;


server.start(route.route, handle, __dirname);