function MVVM(options) {
	var self = this;
	this.options = options;
	this.data = options.data;
	Object.keys(this.data).forEach(function(key){
		self._proxyData(key);
	});
	this._initComputed();
    observe(this.data, this);
	this.$compile = new Compile(options.el || document.body, this);
}

MVVM.prototype = {
    _proxyData: function(key) {
    	var self = this;
        Object.defineProperty(this,key,{
        	enumerable: true,
            configurable: false,
            set: function(newValue){
            	self.data[key] = newValue;
            },
            get: function(){
            	return self.data[key];
            }
        });
    },
    _initComputed: function() {
        if(this.options.computed){
        	for(var key in computed){
	        	Object.defineProperty(this,key,{
	        		get: computed[key],
	        		set: function(){}
	        	})
        	}
        }
    }
};