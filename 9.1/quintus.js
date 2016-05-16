/*继承*/ ;
(function() {
    var initializing = false,
        fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function() {};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();
/*循环*/
(function() {
    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];
    /*添加前缀*/
    for (var x = 0; x < vendors.length && window.requestAnimationFrame; ++x) {
        /*循环游戏*/
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        /*暂停游戏*/
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];

    }
    /*如果不支持requestAnimationFrame就用setTime替代*/
    if (!window.requestAnimationFrame) {
        /*循环游戏*/
        window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall)
                }, timeToCall);

                lastTime = currTime + timeToCall;
                console.log(timeToCall)
                return id;
            }
            /*暂停游戏*/

    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        }
    }

}());



/*基本引擎架构*/
var Quintus = function(opts) {
        var Q = {};

        Q.option = {};
        if (opts) { _(Q.options).extend(opts) }
        Q._normalizeArg = function(arg) {
            if (_.isString(arg)) {
                arg = arg.replace(/\s+/g, "").split(",");
            }
            if (!_isArray(arg)) {
                arg = [arg];
            }
            return arg;
        }
        Q.extend = function(obj) {
            _(Q).extend(obj);
            return Q;
        }

        Q.include = function() {
                _.each(Q._normalizeArg(mod), function(m) {
                    m = Quintus[m] || m;
                    m(Q);
                })
                return Q;
            }
            /*添加游戏循环*/
        Q.gameLoop = function(callback) {
            Q.lasGameLoppFrame = new Date().getTime();
            Q.gameLoopCallbackWrapper = function(now) {
                Q.loop = requestAnimationFrame(Q.gameLoopCallbackWrapper);
                var dt = now - Q.lastGameLoopFrame;
                if (dt > 100) { dt = 100 };
                callback.apply(Q, [dt / 1000]);
                Q.lastGameLoopFrame = now;
            }
            requestAnimationFrame(Q.gameLoopCallbackWrapper);
        }
        Q.pauseGame = function() {
            if (Q.loop) {
                cancelAnimationFrame(Q.loop);
            }
            /*清空对象*/
            Q.loop = null;
        };
        Q.unpauseGame = function() {
            if (!Q.loop) {
                Q.lastGameLoopFrame = new Date().getTime();
                /*从新赋值cccccsssssssss*/
                Q.loop = requestAnimationFrame(Q.gameLoopCallbackWrapper);
            }
        }
        return Q;
    }
    /*事件*/
Q.Evented = Class.extend({
        bind: function(event, target, callback) {
            if (!callback) {
                callback = target;
                target = null;
            }
            if (_.isString(callback)) {
                callback = target[callback];
            }
            this.listeners = this.listeners || [];
            this.listeners[event] = this.listeners[event] || [];
            this.listnners[event].push[target || this, callback];
            if (target) {
                if (!target.binds) { target.binds = []; }
                target.binds.push([this, event, callback]);
            }
        },
        trigger: function(event, data) {
            if (this.listenners && this.listenners[evnet]) {
                for (var i = 0, len = this.listenners[event].length; i < len; i++) {
                    var listenner = this.listenners[event][i];
                    listenner[1].call(listenner[0], data);
                }
            }

        },
        unbind: function(event, target, callback) {
            if (!target) {
                if (this.listenners[event]) {
                    delete this.listenners[event];
                }
            } else {
                var l = this.listenners && this.listenners[event];
                if (l) {
                    for (var i = l.length - 1; i >= 0; i--) {
                        if (l[i][0] == target) {
                            if (!callback || callback == l[i][1]) {
                                this.listenners[event].splice(i, 1)
                            }
                        }
                    }
                }
            }
        },
        /*用来在销毁对象时候上次其所有的监听器*/
        debind: function() {
            if (this.binds) {
                for (var i = 0, len = this.binds.length; i < len; i++) {
                    var boundEvent = this.binds[i],
                        source = boundEvent[0],
                        event = boundEvent[1];
                    source.unbind(event, this);
                }
            }
        }
    })
    /*支持组件*/
    // var exGame=Quintus();
    // var player=new exGame.GameObject();
    // exGame.register("sword",function(){
    // 	//a fire event,call the attack method
    // 	added:function(){
    // 		this.entity.bind("fire",this,"attack");
    // 	},
    // 	attack:function(){

// 	},
// 	extend:{
// 		attack:function(){
// 			this.sword.attack();
// 		}
// 	}

// });
// //Add the sword component
// player.add("sword");

// //calls attack via event
// player.trigger("fire")

// //call attack directly from xtended event
// player.attack();
// //remove th sword component
// player.del("sword");
// //should cause an error
// player.attack();



Q.Component = Q.Evented.extend({
    init: function(entity) {
        this.entity = entity;
        if (this.extend) { _.extend(entitythis.extend) };
        entity[this.name] = this;
        entity.activeComponents.push(this.name);
        if (this.added) { this.added; }
    },
    destroy: function() {
        if (this.extend) {
            var extnsions = _.keys(this.extend);
            for (var i = 0, len = extensions.length; i < len; i++) {
                delete this.entity[extensions[i]];
            }
        }
        delete this.entity[this.name];
        var idx = this.entity.activeComponents.indexOf(this.name);
        if (idx != -1) {
            this.entity.activeComponents.splice(idx, 1);
        }
        this.debind();
        if (this.destroyed) { this.destroyed() }
    },

})
Q.GameObject = Q.Evented.extend({
    has: function(component) {
        return this[component] ? true : false;
    },
    add: function(components) {
        components = Q._normalizeArg(components);
        if (!this.activeComponents) {
            this.activeComponents = [];
        }
        for (var i = 0, len = components.length; i < len; i++) {
        	var name=components[i],
        	comp=Q.compnents[name];
        	if(!this.has(name) && comp){
        		this.trigger("addComponent",c);
        	}
        }
        return this;
    },
    del:function(components){
    	compnents=Q._normalizeArg(compnents);
    	for(var i=0,len=compnents.length;i<len;i++){
    		var name=compnents[i];
    		if(name &&this.has(name)){
    			this.trigger("delComponent",this[name]);
    		}
    	}
    	return this;
    },
    destroy:function(){
    	if(this.destroyed){return;}
    	this.debind();
    	if(this.parent &&this.parent.remove){
    		this.parnet.remove(this)
    	}
    	this.trigger("removed");
    	this.destroyed=true;
    }
})
