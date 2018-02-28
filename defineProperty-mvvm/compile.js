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
        this.compile();
    },
    compile: function() {
        var childNodes = this.fragment.childNodes;
        var self = this;
        var reg = /\{\{(.*)\}\}/; //匹配双大括号表达式
        childNodes.forEach(function(node){
            var text = node.textContent;
            if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, RegExp.$1);
            }
        })
    },
    compileText: function(node, exp) {
       compileUtil.text(node, this.vm, exp);
    },
    isTextNode: function(node) {
       return node.nodeType === 3;
    }
};

// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
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
    _getVMVal: function(vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        //console.log(val);
        return val;
    },
};

// 更新函数
var updater = {
    textUpdater: function(node,value,oldValue){
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
};