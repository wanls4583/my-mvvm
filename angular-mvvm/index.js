window.onload = function(){
	var scope = {
		increase: function(){
			this.sum++;
		},
		decrease: function(){
			this.sum--;
		},
		sum: 1,
	}

	function Scope(){
		this.watchList = [];
	}

	Scope.prototype.$watch = function(name,getValue,listener){
		var watch = {
			name: name,
			getValue: getValue,
			listener: listener
		}
		this.watchList.push(watch);
	}

	Scope.prototype.$digist = function(){
		var dirty = true;
		var checkTime = 0;
		while(dirty){
			dirty = false;
			this.watchList.forEach(function(watch){
				var oldValue = watch.last;
				var newValue = watch.getValue();
				if(oldValue!=newValue & !(isNaN(oldValue) && isNaN(newValue))){
					watch.last = newValue;
					watch.listener(oldValue,newValue);
					dirty = true;
				}
			});
			checkTime++;
			if(checkTime>10){
				throw new Error('检查次数超过10次');
			}
		}
	}
	var $scope = new Scope();

	$scope.$watch('sum',function(){
		return	scope['sum'];
	},function(oldValue,newValue){
		console.log(oldValue,newValue)
	});

	function bind(){
		var list = document.querySelectorAll('[ng-click]');
		list.forEach(function(node){
			node.onclick = function(){
				var fn = node.getAttribute('ng-click');
				if(scope[fn]){
					scope[fn]();
					apply(); //点击事件触发apply
				}
			}
		})

		var list = document.querySelectorAll('[ng-model]');
		list.forEach(function(node){
			node.oninput = function(){
				var name = node.getAttribute('ng-model');
				scope[name] = node.value;
				apply(); //触发apply
			}
		})
	}

	function apply(){
		$scope.$digist(); //脏检查
		var list = document.querySelectorAll('[ng-bind]');
		list.forEach(function(node){
			var name = node.getAttribute('ng-bind');
			node.innerHTML = scope[name];
		})

		var list = document.querySelectorAll('[ng-model]');
		list.forEach(function(node){
			var name = node.getAttribute('ng-model');
			node.value = scope[name];
		})
	}

	bind();
	apply();
}