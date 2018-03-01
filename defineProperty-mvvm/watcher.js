function Watcher(vm, expOrFn, cb) { //mvvm,属性的值，回调函数
    this.cb = cb;
    this.vm = vm;
    if(typeof expOrFn === 'function'){
        this.getter = expOrFn;
    }else{
        this.getter = this.parseGetter(expOrFn,vm);
    }
    this.depIds = [];
    this.value = this.get();
}

Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var oldValue = this.value;
        var newValue = this.get();
        if(oldValue!=newValue){
            this.cb.call(this.vm,newValue,oldValue);
            this.value = newValue;
        }
    },
    addDep: function(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    get: function() {
        Dep.target = this;
        var value = this.getter.call(this.vm,this.vm);
        Dep.target = null;
        return value;
    },
    parseGetter: function(exp) {
        var reg = /^[$_a-zA-Z][$_a-zA-Z0-9]*(.[$_a-zA-Z][$_a-zA-Z0-9]*)*$/ //标识符正则
        if(reg.test(exp)){
            var exps = exp.split('.');
            return function(obj){
                var val = obj;
                for(var i=0; i<exps.length; i++){
                    if(i==exps.length-1){
                        return val[exps[i]];
                    }else{
                        val = val[exps[i]];
                    }
                }
            }
        }else{
            throw new Error('表达式错误:'+exp);
        }
    }
};