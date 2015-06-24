module.exports = {
// Worker object used for applying data to markers in template files
	worker: {
	        template: null,
	        pathname: null,
	        // This is basically a constructor
	        build: function(template, pathname){
	                this.template = template.toString();
	                this.pathname = pathname;
	        },
	        // Shortcut function to apply data to a single marker
	        apply: function(marker,data){
	                this.template = this.template.replace('{{'+marker+'}}',data);
	        },
	        // Check if a worker file exists and execute the contents of the file if it does
	        doWork: function(){
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
	        }
	}
}
