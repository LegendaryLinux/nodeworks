module.exports = {	
	// A function to determine the content type to be used in an HTTP header based on a filename
	contentType: function(filepath){
		// Dependencies
		var path = require('path');
	
		// Run over a long list of file extensions and return a content type when one matches
		switch(path.extname(filepath)){
			case '.css':
				return 'text/css';
			case '.js':
				return 'application/javascript';
			case '.pdf':
				return 'application/pdf';
			default:
				return 'text/html';
		}
	}
}
