module.exports = {
// Worker object used for applying data to markers in template files
	worker: function(template,pathname,request){
	        this.template = template.toString();
	        this.pathname = pathname;
		this.request = request;
		this.get = {};
		this.post = {};

		// Function to set GET
		this.setGet = function(get){
			this.get = get;
		};
		// Function to set POST array
		this.setPost = function(post){
			this.post = post;
		};
		
	        // Shortcut function to apply data to a single marker
	        //this.apply = function(marker,data){
	        //        this.template = this.template.replace('{{'+marker+'}}',data);
	        //};
	        // Check if a worker file exists and execute the contents of the file if it does
	        this.doWork = function(){
			// Make GET and POST variables available
			var _this = this;
			var get = this.get;
			var post = this.post;
			var request = this.request;

			var apply = function(marker,data){
				// Fill the marker with an empty string if invalid data is provided
				data = (typeof(data !== 'undefined') && data) ? data : '';
				_this.template = _this.template.replace('{{'+marker+'}}',data);
			};

	                var workerFileName = this.pathname+'.js';
	                try{
	                        // Inject worker data into template file
				var path = require('path');
				var fs = require('fs');
	                        eval(fs.readFileSync(path.dirname(__dirname)+'/workers'+workerFileName).toString());
	                }catch(error){
	                        // If the eval fails, it usually means no template file exists. This isn't really a problem.
	                        // We will just end up retuning the unchanged file.
				// But if the error is something other than ENOENT (file not found), we should log it.
				if(error.code !== 'ENOENT') console.log(error.stack);
	                }

			// Always return the template - modified or not.
			return this.template;
	        };
	}
}
