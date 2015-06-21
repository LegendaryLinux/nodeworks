// Dependencies
var 	http = require('http'),
	url = require('url'),
	strftime = require('strftime'),
	fs = require('fs'),
	path = require('path')
;

var httpCallback = function(request,response){
	// Let's gather and log info on the requestor
	var incoming = url.parse(request.url);
	var currentDate = new Date();
	console.log("Received request from "+request.connection.remoteAddress+' for '+incoming.pathname+' at '+strftime('%F %T',new Date()));

	// People requesting / usually want the index
	if(incoming.pathname === '/') incoming.pathname = '/index';

	// Try to serve the requested file
	var fileContents = fs.readFile(__dirname+'/templates'+incoming.pathname,function(err,data){
		if(err){
			var errorPage = fs.readFile(__dirname+'/templates/404.html',function(subErr,subData){
				if(subErr) return;
				response.writeHeader(404,{"Content-Type":"text/html"});
				response.write(subData);
				response.end();
				console.log('File does not exist, responded with error page.');	
			});
			return;
		}
		
		// Determine what the worker file name should look like (assuming one exists)
		var workerFileName = incoming.pathname.replace(/\\/g,',');
		workerFileName = workerFileName.substring(workerFileName.lastIndexOf('/')+1, workerFileName.lastIndexOf('.'));
		workerFileName = workerFileName+'.js';

		// Determine whether or not the worker file actually exists
		//

		//Try to determine which content-type we're dealing with
		switch(path.extname(incoming.pathname)){
			case '.css':
				response.writeHeader(200,{"Content-Type":"text/css"});
				break;
			case '.js':
				response.writeHeader(200,{"Content-Type":"application/javascript"});
				break;
			case '.pdf':	
				response.writeHeader(200,{"Content-Type":"application/pdf"});
				break;
			default:
				response.writeHeader(200,{"Content-Type":"text/html"});
		}
		// Send the file contents to the response
		response.write(data);
		response.end();
		console.log('Responded to request from '+request.connection.remoteAddress+' with /templates'+incoming.pathname);
	});
};

var httpServer = http.createServer(httpCallback);
httpServer.listen(3000);
