module.exports = {
	worker:{
		template: null,

		build: function(template){
			this.template = template.toString();
		},

		apply: function(marker,data){
			this.template = this.template.replace('{{'+marker+'}}',data);
		},

		doWork: function(){
			// Throughout this function, you should communicate with whatever external
			// data sources you need, perform any computations necessary, and apply
			// any changes to the template you need.
			this.apply('exampleMarker','This text was inserted by a worker!');
			return this.template;
		}
	}
}
