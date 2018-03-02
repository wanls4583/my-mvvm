function PubSub(data){
	this.subs = [];
	this.data = data;
}

PubSub.prototype.addSub = function(name){
	this.subs.push(name);
	var self = this;
	var attr = 'data-'+name;
	var list = document.querySelectorAll('['+attr+']');
	if(list){
		list.forEach(function(node){
			node.addEventListener('input',function(){
				self.data[name] = node.value;
				self.publish(name);
				console.log(node.value);
			});
		})
	}
	this.publish(name);
}

PubSub.prototype.publish = function(name){
	var self = this;
	this.subs.forEach(function(sub){
		var attr = 'data-'+sub;
		var list = document.querySelectorAll('['+attr+']');
		if(list){
			list.forEach(function(node){
				if(node.nodeName == 'INPUT'){
					node.value = self.data[sub];
				}else{
					node.innerHTML = self.data[sub];
				}
			})
		}
	});
}