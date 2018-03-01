function Compile(el, vm) {
    this.el = typeof el === 'object'? el : document.querySelector(el);
    this.vm = vm;
    if(this.el){
        this.fragment = this.getFragment(this.el);
        this.init();
        this.el.appendChild(this.fragment);
    }
}

Compile.prototype = {
    getFragment: function(el) {
        var fragment = document.createDocumentFragment(),child;
        while(child = this.el.firstChild){
            fragment.appendChild(child);
        }
        return fragment;
    },
    init: function() {
        this.compile(this.fragment);
    },
    compile: function(node) {
        var childNodes = node.childNodes;
        var self = this;
        var reg = /\{\{(.*)\}\}/; //匹配双大括号表达式
        childNodes.forEach(function(node){
            var text = node.textContent;
            if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, RegExp.$1);
            }else if(self.isElementNode(node)){
                self.compileElement(node);
            }

            if(node.childNodes.length){
                self.compile(node);
            }
        })
    },
    compileText: function(node, exp) {
       compileUtil.text(node, this.vm, exp);
    },
    compileElement: function(node){
        var attrs = node.attributes;
        var self = this;
        [].slice.call(attrs).forEach(function(attr){
            if(self.isDirective(attr)){
                var dir = attr.name.slice(2);
                var exp = attr.nodeValue;
                compileUtil[dir] && compileUtil[dir](node, self.vm, exp);
            }
            if(self.isEventDirective(attr)){
                var event = attr.name.slice(5);
                var fn = attr.nodeValue;
                compileUtil.eventHanlder(node,self.vm,fn,event);
            }
        });
    },
    isTextNode: function(node) {
       return node.nodeType === 3;
    },
    isElementNode: function(node){
        return node.nodeType === 1;
    },
    isDirective: function(attr){
        return attr.name.indexOf('v-') == 0;
    },
    isEventDirective: function(attr){
        return attr.name.indexOf('v-on:') == 0;
    }
};

// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    html: function(node, vm, exp){
        this.bind(node, vm, exp, 'html');
    },
    model: function(node, vm, exp){
        var self = this;
        this.bind(node, vm, exp, 'model');
        node.addEventListener('input',function(){
            self._setVMVal(vm, exp, this.value);
        });
    },
    bind: function(node, vm, exp, dir){
        var updaterFn = updater[dir + 'Updater'];
        // 第一次初始化视图
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, function(value, oldValue) {
            // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, oldValue);
        });
    },
    eventHanlder: function(node,vm,fn,event){
        node.addEventListener(event,function(){
            if(vm.options.method[fn]){
                vm.options.method[fn].call(vm,vm);
            }else{
                eval(fn);
            }
        });
    },
    _getVMVal: function(vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },
    _setVMVal: function(vm, exp, val){
        var obj = vm;
        exp = exp.split('.');
        for(var i=0; i<exp.length; i++){
            if(i<exp.length-1){
                obj = obj[exp[i]];
            }else{
                obj[exp[i]] = val;
            }
        }
    }
};

// 更新函数
var updater = {
    textUpdater: function(node,value,oldValue){
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    htmlUpdater: function(node,value,oldValue){
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater: function(node,value,oldValue){
        node.value = typeof value == 'undefined' ? '' : value;
    }
};