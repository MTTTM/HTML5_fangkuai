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
    //资源基础信息
    Q.options = {
        imagePath: "images/",
        audioPath: "audio/",
        dataPath: "data/",
        audioSupported: ['mp3', 'ogg'],
        sound: true
    };
    if (opts) { _(Q.options).extend(opts); }
    Q._normalizeArg = function(arg) {
        if (_.isString(arg)) {
            arg = arg.replace(/\s+/g, '').split(",");
        }
        if (!_.isArray(arg)) {
            arg = [arg];
        }
        return arg;
    };

    // Shortcut to extend Quintus with new functionality
    // binding the methods to Q
    Q.extend = function(obj) {
        _(Q).extend(obj);
        return Q;
    };

    Q.include = function(mod) {
        _.each(Q._normalizeArg(mod), function(m) {
            m = Quintus[m] || m;
            m(Q);
        });
        return Q;
    };
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
                this.listeners[event].push[target || this, callback];
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
        //  //a fire event,call the attack method
        //  added:function(){
        //      this.entity.bind("fire",this,"attack");
        //  },
        //  attack:function(){

    //  },
    //  extend:{
    //      attack:function(){
    //          this.sword.attack();
    //      }
    //  }

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
                    var name = components[i],
                        comp = Q.compnents[name];
                    if (!this.has(name) && comp) {
                        this.trigger("addComponent", c);
                    }
                }
                return this;
            },
            del: function(components) {
                compnents = Q._normalizeArg(compnents);
                for (var i = 0, len = compnents.length; i < len; i++) {
                    var name = compnents[i];
                    if (name && this.has(name)) {
                        this.trigger("delComponent", this[name]);
                    }
                }
                return this;
            },
            destroy: function() {
                if (this.destroyed) {
                    return;
                }
                this.debind();
                if (this.parent && this.parent.remove) {
                    this.parnet.remove(this)
                }
                this.trigger("removed");
                this.destroyed = true;
            }
        })
        /*访问容器元素*/
    Q.setup = function(id, options) {
        var touchDevice = "onouchstart" in document;
        options = options || {};
        id = id || "quintus";
        Q.el = $(_.isString(id) ? "#" + id : id);
        console.log(Q.el)
        if (Q.el.length === 0) {
            Q.el = $('<canvas width="320" height="420"></canvas>')
                .attr("id", id).appendTo("body");
        }


        var maxWidth = options.maxWidth || 5000,
            maxHeight = options.maxHeight || 5000,
            resampleWidth = options.resampleWidth,
            resampleHeight = options.resampleHeight;

        /*自适应屏幕*/
        if (options.maxmize) {
            $("html,body").css({ "margin": "0", "padding": "0" });
            var w = Math.min(window.innerWidth, maxWidth);
            var h = Math.min(window.innerHeight - 5, maxHeight);

            if (touchDevice) {
                Q.el.css({ height: h * 2 });
                window.scrollTo(0, 1);
                w = Math.min(window.innerWidth, maxWidth);
                h = Math.min(window.innerHeight - 5, maxHeight);
            }

            if ((resampleWidth && w > resampleWidth) ||
                (resampleHeight && h > resampleHeight) && touchDevice) {
                Q.el.css({ width: w, height: h }).attr({ width: w / 2, height: h });

            } else {
                Q.el.css({ width: w, height: h }).attr({ width: w, height: h })
            }
        }

        Q.wrapper = Q.el.wrap('<div class=' + id + '_comtainer/>').parent()
            .css({ width: Q.el.width(), margin: "0 auto" });

        Q.el.css({ "position": "relative" });
        Q.ctx = Q.el[0].getContext && Q.el[0].getContext("2d");

        Q.width = parseInt(Q.el.attr("width"), 10);
        Q.height = parseInt(Q.el.attr("height"), 10);

        $(window).bind("orientationchange", function() {
            setTimeout(function() { window.scrollTo(0, 1) }, 0);

        })
        return Q;
    };
    Q.clear = function() {
        Q.ctx.clearRect(0, 0, Q.el[0].width, Q.el[0].height);
    }
    Q.assetTypes = {
        // Image Assets
        png: 'Image',
        jpg: 'Image',
        gif: 'Image',
        jpeg: 'Image',
        // Audio Assets
        ogg: 'Audio',
        wav: 'Audio',
        m4a: 'Audio',
        mp3: 'Audio'
    };
    // Determine the type of an asset with a lookup table
    Q.assetType = function(asset) {
        // Determine the lowercase extension of the file
        var fileExt = _(asset.split(".")).last().toLowerCase();

        // Lookup the asset in the assetTypes hash, or return other
        return Q.assetTypes[fileExt] || 'Other';
    };

    //加载资产------
    //加载图片
    Q.loadAssetImage = function(key, src, callback, errorCallback) {
            var img = new Image();
            $(img).on("load", function() {
                callback(key, img);
            })
            $(img).on("error", errorCallback);
            img.src = Q.options.imagePath + src;

            Q.audioMimeTypes = {
                mp3: "audio/mpeg",
                ogg: "audios.ogg;codecs='vorbis'",
                m4a: "audio/m4a",
                wav: "audio/wav"
            }
        }
        //加载媒体
    Q.loadAssetAudio = function(key, src, callback, errorCallback) {
            if (!document.createElement('audios').play || !Q.options.sound) {
                callback(key, null);
                return;
            }

            var snd = new Audio(),
                baseName = Q._removeExtension(arc),
                extension = null,
                filename = null;

            extension = _(Q.option.audioSupported).detect(function() {
                return snd.canPlayType(Q.audioMimeTypes[extension]) ? extension : null;

            })

            if (!extension) {
                callback(key, null);
                return;
            }

            $(snd).on("error", errorCallback);
            $(snd).on("canplaythrough", function() {
                callback(key, snd);
            })

            snd.src = Q.options.adioPath + baseName + "." + extension;
            snd.load();
            return snd;
        }
        //加载其他资源
    Q.loadAssetOther = function(key, src, callback, errorCallback) {
            $.get(Qoption.dataPath + src, function(data) {
                callback(key, data);
            }).fail(errorCallback);
        }
        //移除一个拓展
    Q._removeExtension = function(filename) {
        return filename.replace(/\.(\w{3,4})$/, "");
    };
    //保存资产到一个数组
    Q.assets = {};
    //返回一个资产
    Q.asset = function(name) {
            return Q.assets[name];
        }
        //加载资源，并在加载完毕后回调
        // Load assets, and call our callback when done
    Q.load = function(assets, callback, options) {
        var assetObj = {};
        console.log(assetObj)

        // Make sure we have an options hash to work with
        if (!options) { options = {}; }

        // Get our progressCallback if we have one
        var progressCallback = options.progressCallback;

        var errors = false,
            errorCallback = function(itm) {
                errors = true;
                (options.errorCallback ||
                    function(itm) { alert("Error Loading: " + itm); })(itm);
            };

        // If the user passed in an array, convert it
        // to a hash with lookups by filename
        if (_.isArray(assets)) {
            _.each(assets, function(itm) {
                if (_.isObject(itm)) {
                    _.extend(assetObj, itm);
                } else {
                    assetObj[itm] = itm;
                }
            });
        } else if (_.isString(assets)) {
            // Turn assets into an object if it's a string
            assetObj[assets] = assets;
        } else {
            // Otherwise just use the assets as is
            assetObj = assets;
        }

        // Find the # of assets we're loading
        var assetsTotal = _(assetObj).keys().length,
            assetsRemaining = assetsTotal;

        // Closure'd per-asset callback gets called
        // each time an asset is successfully loadded
        var loadedCallback = function(key, obj) {
            if (errors) return;

            // Add the object to our asset list
            Q.assets[key] = obj;

            // We've got one less asset to load
            assetsRemaining--;

            // Update our progress if we have it
            if (progressCallback) {
                progressCallback(assetsTotal - assetsRemaining, assetsTotal);
            }

            // If we're out of assets, call our full callback
            // if there is one
            if (assetsRemaining === 0 && callback) {
                // if we haven't set up our canvas element yet,
                // assume we're using a canvas with id 'quintus'
                callback.apply(Q);
            }
        };

        // Now actually load each asset
        _.each(assetObj, function(itm, key) {

            // Determine the type of the asset
            var assetType = Q.assetType(itm);

            // If we already have the asset loaded,
            // don't load it again
            if (Q.assets[key]) {
                loadedCallback(key, Q.assets[key]);
            } else {
                // Call the appropriate loader function
                // passing in our per-asset callback
                // Dropping our asset by name into Q.assets
                Q["loadAsset" + assetType](key, itm,
                    loadedCallback,
                    function() { errorCallback(itm); });
            }
        });

    };

    // Array to store any assets that need to be 
    // preloaded
    Q.preloads = [];

    // Let us gather assets to load
    // and then preload them all at the same time
    Q.preload = function(arg, options) {
        if (_(arg).isFunction()) {
            Q.load(_(Q.preloads).uniq(), arg, options);
            Q.preloads = [];
        } else {
            Q.preloads = Q.preloads.concat(arg);
        }
    };
    return Q;
}
