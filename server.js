// Dependencies
var 	http = 		require('http'),
	url = 		require('url'),
	strftime = 	require('strftime'),
	fs = 		require('fs'),
	path = 		require('path'),
	file = 		require('./lib/contentType')
;

var httpCallback = function(request,response){
	// Let's gather and log info on the requestor
	var incoming = url.parse(request.url);
	var currentDate = new Date();
	console.log("Received request from "+request.connection.remoteAddress+' for '+incoming.pathname+' at '+strftime('%F %T',new Date()));

	// People requesting / usually want the index
	if(incoming.pathname === '/') incoming.pathname = '/index.html';

	// Try to serve the requested template
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
		//var workerFileName = incoming.pathname.replace(/\\/g,',');
		//workerFileName = workerFileName.substring(workerFileName.lastIndexOf('/')+1, workerFileName.lastIndexOf('.'));
		//workerFileName = workerFileName+'.js';

		var workerFileName = incoming.pathname+'.js';

		try{
			// Inject worker data into template file
			var jobController = require('./workers/'+workerFileName);
			try{
				var worker = jobController.worker;
				worker.build(data);
				data = worker.doWork();
			}catch(wError){
				console.log('An error occurred while the worker was applying the template.');
				console.log(wError.stack);
			}
		}catch(error){
			// If the require fails, it means no template file exists. This isn't really a problem.
			// We will just end up retuning the unchanged file.
		}

		// Determine the content type of the file we are responding with
		var contentType = file.contentType(incoming.pathname);
		response.writeHeader(200,{"Content-Type":contentType});

		// Send the file contents to the response
		response.write(data);
		response.end();
		console.log('Responded to request from '+request.connection.remoteAddress+' with /templates'+incoming.pathname);
	});
};

var httpServer = http.createServer(httpCallback);
httpServer.listen(3000);
