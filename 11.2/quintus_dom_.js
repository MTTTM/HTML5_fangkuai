Quintus.DOM = function(Q) {
    Q.setupDOM= function(id, options) {
        options = options || {};
        id = id || "quintus";
        Q.el = $(_.isString(id) ? "#" + id : id);
        if (Q.el.length === 0) {
            Q.el = $("<div>").attr("id", id).css({width: 320, height: 420}).appendTo("body");
        }
        if (options.maximize) {
            var w = $(window).width();
            var h = $(window).height();
            Q.el.css({ width: w, height: h });
        }
        Q.wraper = Q.el.wrap('<div id="' + id + '_container"').parent().
        css({ width: Q.el.width(), height: Q.el.height(), margin: "0 auto" });

        Q.el.css({ position: "relative", overflow: "hidden" });
        Q.width = Q.el.width();
        Q.height = Q.el.height();
        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 0)

        $(window).bind("orientationchange", function() {
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 0)
        })
        return Q;

    }
    //动画
    (function(){
    	function translateBuilder(attribute){
    		return function(dom,x,y){
    			dom.style[attribute]="translate("+Math.floor(x)+"px,"+Math.floor(y)+"px,0px)"
    		}
    	}
    	function translate3DBuilder(attribute){
    		return function(dom,x,y){
    			dom.style[attribute]="translate3d("+Math.floor(x)+"px,"+Math.floor(y)+"px,0px)";
    		}
    	}
    	function scaleBuilder(){
    		return function(dom,scale){
    			dom.style[attribute+ "Origin"]="0% 0%";
    			dom.style[attribute]="scale("+scale+")";
    		}
    	}
    	function fallbackTranslate(dom,x,y){
    		dom.style.left=x+"px";
    		dom.style.top=y+"px";
    	}

    	var has3D=("WebKitCSSMatrix" in wndow && "m11" in new WebKitCSSMatrix());
    	var dummyStyle=$("<div>")[0].style;
    	var transformMethods=["transform","webkitTransform","MozTransform","msTransform"];

    	for(var i=0;i<transformMethods.length;i++){
    		var transformName=transformMethods[i];
    		if(!_.isUndefined(dummyStyle[transformName])){
    			if(has3D){
    				Q.positionDOM=translate3d(transformName);
    			}
    			else{
    				Q.positionDOM=translateBuilder(transformName);
    			}
    			Q.scaleDOM=scaleBuilder(transformName);
    			break;
    		}
    	}
    	Q.positionDOM=Q.positionDOM||fallbackTranslate;
    	Q.scaleDOM=Q.scaleDOM||function(scale){}

    })()
    //检查支持过度
    (function(){
    	function transitionBuilder(attribute,prefix){
    		return function(dom,property,sec,easing){
    			easing=easing||"";
    			if(property==="transform"){
    				property=prefix+property;
    			}
    			sec=sec||"1s";
    			dom.style[attribute]=property+" "+sec+" "+easing;
    		}
    	}
    	//dummy methond
    	function fallbackTransition(){
    		var dummyStyle=$("<div>")[0].style;
    		var transitioMenthods=["transition","webkitTransition","MozTranstion","msTransition"];
    		var prefixNames=["","-webkit-","-moz-","-ms-"];
    		for(var i=0;i<transitioMenthods.length;i++){
    			var trasitionName=transitioMenthods[i];
    			var prefixName=prefixNames[i];
    			if(!_.isUndefined(dummyStyle[transitionName])){
    				Q.transitionDOM=transitionBuilder(transitionName,prefixName);
    				break;
    			}
    		}

    	}
    	Q.transitionDOM=Q.transitionDOM||fallbackTransition;
    })()
    //实现DOM精灵
    Q.DOMSprite=Q.Sprite.extend({
    	init:function(props){
    		this._super(props);
    		this.el=$("<div>").css({
    			width:this.p.w,
    			height:this.p.h,
    			zIndex:this.p.z||0,
    			position:"absolute"
    		});
    		this.dom=this.el[0];
    		this.rp={};
    		this.setImage();
    		this.setTransform();

    	},
    	setImage:function(){
    		var asset;
    		if(this.sheet(0)){
    			asset=Q.asset(this.sheet().asset);
    		}
    		else{
    			asset=this.asset();
    		}
    		if(asset){
    			this.dom.style.backgroundImage="url("+asset.src+")";
    		}
    	},
    	setTransform:function(){
    		var p=this.p;
    		var rp=this.rp;
    		if(rp.frame!=p.frame){
    			if(p.sheet){
    				this.dom.style.backgroundPosition=(-this.sheet().fx(p.frame))+"px"+ (-this.sheet().fy(p.frame))+"px";
    			}else{
    				this.dom.style.backgroundPosition=" 0px 0px";
    			}
    			rp.frame=p.frame;
    		}
    		if(rp.x!==p.x||rp.y!==p.y){
    			Q.positionDOM(this.dom,p.x,p.y);
    			rp.x=px;
    			rp.y=p.y;
    		}

    	},
    	hide:function(){
    		this.dom.style.display="none";
    	},
    	show:function(){
    		this.dom.style.display="block";
    	},
    	draw:function(ctx){
    		this.trigger("draw");
    	},
    	step:function(dt){
    		this.trigger("step",dt);
    	},
    	destroy:function(){
    		if(this.destroyed) return false;
    		this._supper();
    		this.el.remove();
    	}
    });
    if(Q.Stage){
    	Q.DOMStage=Q.Stage.extend({
    		init:function(scene){
    			this.el=$("<div>").css({
    				top:0,
    				position:"relative"
    			}).appendTo(Q.el);
    			this.dom=this.el[0];
    			this.wrapper=this.el.wrap("<div>").parent().css({
    				position:"absolute",
    				left:0,
    				top:0
    			});
    			this.scale=1;
    			this.wrapper_dom=this.wrapper[0];
    			this._super(itm);
    		},
    		insert:function(){
    			this.wrapper.remove();
    			this._supper();

    		},
    		destroy:function(){
    			this.wrapper.remove();
    			this._super();
    		},
    		rescale:function(scale){
    			Q.scaleDOM(this.wrapper_dom,scale);
    		},
    		centerOn:function(x,y){
    			this.x=Q.width/2/this/tis.scale-x;
    			this.y=Q.height/2/this.scale-y;
    			Q.positionDOM(tihs.dom,tis.x,thix.y);
    		}
    	})
    }

    Q.domOnly=function(){
    	Q.Stage=Q.DOMStage;
    	Q.step=Q.setupDOM;
    	Q.Sprite=Q.DOMSprite;
    }
}

