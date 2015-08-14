var	// Native Dependencies
	http = 		require('http'),
	url = 		require('url'),
	fs = 		require('fs'),
	qs = 		require('querystring'),

	// Local Dependencies
	worker = 	require('./lib/worker'),

	// NPM Dependencies
	strftime = 	require('strftime'),
	mime =		require('mime')
;

// Global config
var listenPort = 1500;

var sendResponse = function(request,response,incoming,data,workman){	
	// Set the worker loose on the template
	data = workman.doWork();
	
	// Determine the content type of the file we are responding with
	var contentType = mime.lookup(incoming.pathname);
	response.writeHeader(200,{"Content-Type":contentType});

	// Send the file contents to the response
	response.write(data);
	response.end();
	console.log('Responded to request from '+request.connection.remoteAddress+' with /templates'+incoming.pathname);			
};

var httpCallback = function(request,response){
	// Let's gather and log info on the requestor
	var incoming = url.parse(request.url);
	console.log("Received request from "+request.connection.remoteAddress+' for '+incoming.pathname+' at '+strftime('%F %T',new Date()));

	// People requesting / usually want the index
	if(incoming.pathname === '/') incoming.pathname = '/index.html';

	// Try to serve the requested template
	fs.readFile(__dirname+'/templates'+incoming.pathname,function(err,data){
		if(err){
			// Error page handling
			fs.readFile(__dirname+'/templates/404.html',function(subErr,subData){
				if(subErr) return;
				response.writeHeader(404,{"Content-Type":"text/html"});
				response.write(subData);
				response.end();
				console.log('File does not exist, responded with error page.');	
			});
			return;
		}

		// Create the worker object and set it's mandatory data
		var workman = new worker.worker(data,incoming.pathname,request);

		// Find any get variables (POST or not - it's always possible we get a combo request)
		workman.setGet(url.parse(request.url,true).query);

		// Was this a POST request?
		if(request.method === 'POST'){
			var postBody = '';
			request.on('data', function(data){
				// Make sure nobody tried to flood the RAM
				postBody += data;
				if(postBody.length > 1e6){
					console.log('Request from '+request.connection.remoteAddress+' was an attempt to flood RAM. Destroying connection.');
					request.connection.destroy();
					response.end('Too much data submitted!');
					return null;
				}
			});
	
			// Make sure the request processing is done before calling the worker
			request.on('end',function(){
				workman.setPost(qs.parse(postBody));
				sendResponse(request,response,incoming,data,workman);
			});
			// Return here so we don't accidentally try to write to the response after closing it.
			return;
		}
		sendResponse(request,response,incoming,data,workman);
	});
};

var httpServer = http.createServer(httpCallback);
httpServer.listen(listenPort);
console.log('Server running on port '+listenPort);
