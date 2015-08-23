var path = require('path');
var fs = require('fs');
var config = require('./config').handle_Config;
var TYPES = require('./mime').TYPES; 
var zlib = require("zlib");

//默认处理 文件服务器
function defaultHandle (urlname, req, res, exePath) {
	//
	
	//将url地址的中的%20替换为空格，不然Node.js找不到文件
	var pathname = urlname.pathname.replace(/%20/g, ' ');
    //能够正确显示中文，将三字节的字符转换为utf-8编码
	var re = /(%[0-9A-Fa-f]{2}){3}/g;
    pathname = pathname.replace(re,function(word){
        var buffer=new Buffer(3),
            array=word.split('%');
        array.splice(0,1);
        array.forEach(function(val,index){
            buffer[index]=parseInt('0x'+val,16);
        });
        return buffer.toString('utf8');
    });
    var realPath = path.normalize(pathname.replace(/^\.\./g,''));
    var fullPath = path.join(exePath, realPath);
    // var realPath = path.join('assets', path.normalize(pathname.replace(/.../g,'')));
    (function parse(fullPath){
    	console.log(fullPath);
	    fs.stat(fullPath, function(err, stats){
	    	if (err) {  
	    		//1. 如果文件不存在，返回404
	    		res.writeHeader(404, {'Content-Type':'text/html'});
				res.write('<h1>404</h1><h2>Page is missing!</h2>');
				res.end();
	    	} else {
	    		//2. 如果文件存在
	    		if (stats.isDirectory()) {
	    			//3. 如果为文件夹
	    			realPath = path.join(realPath, '/');
	    			fullPath = path.join(fullPath, '/');
	    			var tmpPath = path.join(fullPath,'/',config.welcome_file);
	    			
	    			if (fs.existsSync(tmpPath)){
	    				//4. 如果文件夹下存在配置的首页（如index.html），则读取该页面
	    				parse(tmpPath);
	    			} else{
	    				//5. 如果文件夹下不存在配置的首页，则列出目录下所有文件
	    				console.log(fullPath);
	    				fs.readdir(fullPath, function(err, files){
	    					if (err) {
	    						res.writeHeader(500,"", {'Content-Type':'text/plain'});
	    						res.end(err);
	    					} else{
	    						var data = listDirFiles(fullPath, realPath, files);
	    						res.writeHeader(200, {'Content-Type':'text/html'});
	    						res.write(data);
	    						res.end();
	    					};
	    				})
	    			};
	    		} else{
	    			var ext = path.extname(fullPath);
	    			var contentType = TYPES[ext];
	    			res.setHeader('Content-Type', contentType);

	    			//用于缓存支持/控制
	    			var lastModified = stats.mtime.toUTCString();
	    			var ifModifiedSince = 'If-Modified-Since'.toLowerCase();
	    			res.setHeader('"Last-Modified', lastModified);
	    			
	    			if (ext.match(config.expire_file)) {
	    				var expires = new Date();
	    				expires.setTime(expires.getTime()+config.maxAge * 1000);
	    				res.setHeader('Expires', expires.toUTCString());
	    				res.setHeader('Cache-Control', 'max-age='+config.maxAge);
	    			};
	    			if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
	    				res.writeHead(304, 'Not Modified');
	    				res.end();
	    			} else{
	    				var raw = fs.createReadStream(fullPath);
	    				var acceptEncoding = req.headers['accept-encoding'] || '';
	    				var matched = ext.match(config.compress_file);

	    				if (matched && acceptEncoding.match(/\bgzip\b/)) {
	    					response.writeHead(200, "Ok", {
						        'Content-Encoding': 'gzip'
						    });
	    					raw.pipe(zlib.createGzip()).pipe(res);
	    				}else if( matched && acceptEncoding.match(/\bdeflate\b/)){
	    					response.writeHead(200, "Ok", {
						        'Content-Encoding': 'deflate'
						    });
	    					raw.pipe(zlib.createDeflate()).pipe(res);
	    				}else{
	    					res.writeHead(200, 'OK');
	    					raw.pipe(res);
	    				}
	    			};
	    		};
	    		
	    	};
	    })
    })(fullPath);
	
}

//列出所有文件
function listDirFiles(fullPath,showPath,files){
    var data=[];
    data.push("<!doctype>");
    data.push("<html>");
    data.push("<head>");
    data.push("<meta http-equiv='Content-Type' content='text/html;charset=utf-8'></meta>")
    data.push("<title>Devin文件服务器</title>");
    data.push("<style>	a{text-decoration: none;}</style>");
    data.push("</head>");
    data.push("<body  style='margin:auto;width:80%'>");
    data.push("<table>");
    data.push("<tr><td><a href='../'>../</a></td></tr>");
    files.forEach(function(val,index){
        var stat=fs.statSync(path.join(fullPath,val));
        if(stat.isDirectory(val)){
            val=path.basename(val)+"/";
        }else{
            val=path.basename(val);
        }
        data.push("<tr><td><a href='"+showPath+val+"'>"+val+"</a></td></tr>");
    });
    data.push("</table>");
    data.push("<br/>");
    data.push("<address>author: Devin; Powered By Node.js</address>");
    data.push("</div>")
    data.push("</body>");
    return data.join("");
}










exports.defaultHandle = defaultHandle;