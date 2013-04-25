/*
 *  Project:
 *  Description:
 *  Author:
 *  License:
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "swiper",
        defaults = {
            propertyName: "value",
			curtainId: "lb_curtain",
			containerId: "lb_container",
			loaderId: "lb_loader",
			loaderImage: "loader.gif",
			imageClass: "lb_image",
			imageContainerClass: "lb_imageContainer",
			beforeAfterAnimation: false,
			beforeAfterAnimationSize: 10,
			beforeAfterVisibility : 80,
			displayTitle: true,
			minMarginHeight: 50,
			minMarginWidth: 120
        };
		
	var imageArray=[];
	


    // MODEL
	
	var List = function(options){
		var self = this;
		var imageArray=[];
		var currentImageIndex;
		
		this.updateCurrentIndex = function(event){
			event.stopPropagation();
			if (event.data == 'before'){
				currentImageIndex = currentImageIndex - 1;
			}else{
				currentImageIndex = currentImageIndex + 1;
			}
			$("#lb_curtain").trigger("model-newIndex", [{"imageArray":imageArray, "currentImageIndex":currentImageIndex, "direction":event.data}]);
		}
		
		this.addImages = function(el){
			imageArray=[];
			var imageRef = $(el).attr('href');
			//check if rel attribute existe
			if ($(el).attr('rel') !== undefined) {
				//add selecte image of the group
				var cGroupe = $(el).attr('rel');
				var cTitle = $(el).attr('title');
				var cType = $(el)[0].tagName;
				var cIndex = $(el).index(''+cType+'[rel="'+cGroupe+'"]');
				imageArray[cIndex] = {"imageref":imageRef,"title":cTitle};
				currentImageIndex = cIndex;
				
				//populate array with all the group
				$(''+cType+'[rel="'+cGroupe+'"]').each(function(){
					var imageRef = $(this).attr('href');
					var cTitle = $(this).attr('title')
					var cIndex = $(this).index(''+cType+'[rel="'+cGroupe+'"]');
					if (cIndex != currentImageIndex){
						imageArray[cIndex] = {"imageref":imageRef,"title":cTitle};
					}
				});
				console.log(imageArray);
				$("#lb_curtain").trigger("model-newList", [{"imageArray":imageArray, "currentImageIndex":currentImageIndex}]);
				
				
				
				
			}
			
			
			//$(el).find(img).each(function(){
			//	var imageRef = $(this).attr('href');
			//	imageArray.push(imageRef);
			
			//});
		}
	}
	
	//VIEW
	
	var Lbox = function(elem, options) {
		var elem = elem;
		var projects = projects;
		var draw = function(){
			//append elements to DOM
			 $('body').append("<div id='"+options.curtainId+"'></div>").append("<div id='"+options.containerId+"'></div>");
			 $("#"+options.curtainId+"").append("<img src="+options.loaderImage+" id='"+options.loaderId+"' />");
		};
		var setPosition = function(imgLoad, drawPosition){
			var width = $(window).width();
			var height = $(window).height();
			
			imgLoad.unbind("load");
			imgLoad.bind("load", function () {
			
				//resize image if nessecary
				if (this.height > (height - options.minMarginHeight*2)){
					var ratio = (height - options.minMarginHeight*2)/this.height;
					imgLoad.attr("height", ''+(height - options.minMarginHeight*2)+'');
					//resize prop.
					imgLoad.attr("width", ''+(this.width * ratio)+'');
				}
				if (this.width > (width - options.minMarginWidth*2)){
					var ratio = (width - options.minMarginWidth*2)/this.width;
					imgLoad.attr("width", ''+(width - options.minMarginWidth*2)+'');
					//resize prop.
					imgLoad.attr("height", ''+(this.height * ratio)+'');
				}
			    // Get image sizes
			    if(drawPosition == 'center'){
					var topPos = (height/2) - (this.height/2);
				    var leftPos = (width/2) - (this.width/2);
			    }else if (drawPosition == 'before'){
					var topPos = (height/2) - (this.height/2);
					var leftPos = - (this.width) + options.beforeAfterVisibility;
			    }else if (drawPosition == 'after'){
					var topPos = (height/2) - (this.height/2);
				    var leftPos = (width) - options.beforeAfterVisibility;
					
			    }
			    $("#"+options.loaderId+"").hide();
			    $("#"+options.containerId+"").append("<div class='"+options.imageContainerClass+" lbc-"+drawPosition+"'></div>");
			    $(".lbc-"+drawPosition+"").append(imgLoad);
			    if (options.displayTitle == true && imgLoad.attr('title') !== 'undefined' ){
					var title = imgLoad.attr('title')
					var titleArea = $("<div class='lb_label' style='top:"+this.height+"px; width:"+this.width+"px;'></div>").append("<p>"+title+"</p>")
					$(".lbc-"+drawPosition+"").append(titleArea);
			    }
			    //$("#"+options.containerId+"").append(imgLoad);
			    //imgLoad.css({"top":topPos, "left":leftPos })
			    $(".lbc-"+drawPosition+"").css({"position":"fixed", "height":this.height,"width":this.width,"top":topPos, "left":leftPos });
			});
		
		}
		
		var resizeContent = function(){
			var height = $(window).height();
			$('.lb_imageContainer').each(function(){
				var tHeight = $(this).find('img').height()
				$(this).stop().animate({"top":""+((height/2) - (tHeight/2))+"px"});
			});
		}
		
		
		var updatePosition = function(e, data){
			var currentImageIndex = data.currentImageIndex;
			var imageArray = data.imageArray;
			var direction = data.direction;
			var width = $(window).width();
			var height = $(window).height();
			//Update center position
			if (direction == 'after'){
				if ($('.lbc-before').length !== 0){
					$('.lbc-before').animate({"left":""+(-10*($('.lbc-before').find('img').width()))+"px"},function(){$(this).remove()});
				}
				$('.lbc-center').animate({"left":""+(- ($('.lbc-center').find('img').width()) + options.beforeAfterVisibility)+"px","margin-left":"0px"}).removeClass('lbc-center').addClass('lbc-before');
				$('.lbc-after').animate({"margin-left":"0px","left":""+((width/2)-($('.lbc-after').find('img').width()/2))+"px"}).removeClass('lbc-after').addClass('lbc-center');
				console.log(currentImageIndex)
				if (imageArray[currentImageIndex+1] !== undefined){
					var imageRef = imageArray[currentImageIndex+1].imageref;
					var imageTitle = imageArray[currentImageIndex+1].title;
					var imgLoadAfter = $("<img title='"+imageTitle+"' class='"+options.imageClass+"' />");
					imgLoadAfter.attr("src", imageRef);
					setPosition(imgLoadAfter, 'after');
					imgLoadAfter.delay(500).fadeIn();
				}
			}
			if (direction == 'before'){
				if ($('.lbc-after').length !== 0){
					$('.lbc-after').animate({"left":""+(10*($('.lb-after').find('img').width()+width))+"px"},function(){$(this).remove()});
				}
				
				$('.lbc-center').animate({"left":""+(width- options.beforeAfterVisibility)+"px"}).removeClass('lbc-center').addClass('lbc-after');
				$('.lbc-before').animate({"margin-left":"0px","left":""+((width/2)-($('.lbc-before').find('img').width()/2))+"px"}).removeClass('lbc-before').addClass('lbc-center');
				console.log(currentImageIndex)
				if (imageArray[currentImageIndex-1] !== undefined){
					var imageRef = imageArray[currentImageIndex-1].imageref;
					var imageTitle = imageArray[currentImageIndex-1].title;
					var imgLoadAfter = $("<img title='"+imageTitle+"' class='"+options.imageClass+" lb-before' />");
					imgLoadAfter.attr("src", imageRef);
					setPosition(imgLoadAfter, 'before');
					imgLoadAfter.delay(500).fadeIn();
				}
			}
			$("#"+options.loaderId+"").hide();
		}
		var drawNewList = function(e, data){
			var currentImageIndex = data.currentImageIndex;
			var imageArray = data.imageArray;
			
			
			console.log('view receive update');
			//show containers
			$("#"+options.curtainId+"").stop().fadeIn();
			$("#"+options.containerId+"").stop().show();
			
			$("#"+options.loaderId+"").show();
			//add images
            var imageRef = imageArray[currentImageIndex].imageref;
			var imageTitle = imageArray[currentImageIndex].title;
			var imgLoadCenter = $("<img title='"+imageTitle+"' class='"+options.imageClass+"' />");
			imgLoadCenter.attr("src", imageRef);
			setPosition(imgLoadCenter, 'center')
			//load precedent if needed
			if (imageArray[currentImageIndex-1] !== undefined){
				var imageRef = imageArray[currentImageIndex-1].imageref;
				var imageTitle = imageArray[currentImageIndex-1].title;
				var imgLoadBefore = $("<img title='"+imageTitle+"' class='"+options.imageClass+"' />");
				imgLoadBefore.attr("src", imageRef);
				setPosition(imgLoadBefore, 'before');
				imgLoadBefore.fadeIn();
			}
			if (imageArray[currentImageIndex+1] !== undefined){
				var imageRef = imageArray[currentImageIndex+1].imageref;
				var imageTitle = imageArray[currentImageIndex+1].title;
				var imgLoadAfter = $("<img title='"+imageTitle+"' class='"+options.imageClass+"' />");
				imgLoadAfter.attr("src", imageRef);
				setPosition(imgLoadAfter, 'after');
				imgLoadAfter.fadeIn();
			}
			imgLoadCenter.fadeIn();
			$("body").on("click", ".lb-after", function(){ alert('test')});
			
			
		};
		var animateImages = function(event){
			var direction = event.data.direction;
			var action = event.data.action;
			if (action == 'enter'){
				if (direction == 'after'){ $('.lbc-after').animate({"margin-left":"-"+options.beforeAfterAnimationSize+"px"}); }
				if (direction == 'before'){ $('.lbc-before').animate({"margin-left":"+"+options.beforeAfterAnimationSize+"px"}); }
			}
			if (action == 'leave'){
				if (direction == 'after'){ $('.lbc-after').animate({"margin-left":"0px"}); }
				if (direction == 'before'){ $('.lbc-before').animate({"margin-left":"0px"}); }
			}
		}
		draw();
		//BINDINGS
		$("#lb_curtain").on("model-newList", drawNewList);
		$("#lb_curtain").on("model-newIndex", updatePosition);
		$(window).on("resize", resizeContent);
		//animate before after
		if (options.beforeAfterAnimation == true){
			$("#"+options.containerId+"").on("mouseover", ".lbc-after", {"action":'enter', "direction":'after'}, animateImages );
			$("#"+options.containerId+"").on("mouseout", ".lbc-after", {"action":'leave', "direction":'after'}, animateImages );
			$("#"+options.containerId+"").on("mouseover", ".lbc-before", {"action":'enter', "direction":'before'}, animateImages );
			$("#"+options.containerId+"").on("mouseout", ".lbc-before", {"action":'leave', "direction":'before'}, animateImages );
		}
		
		//mouse event test
		$("#"+options.containerId+"").append("<div id='testmouse'></div>")
		$("#"+options.containerId+"").bind('mousedown', function(e){
			e.preventDefault();
			var originalpos = e.pageX - this.offsetLeft;
			var volumen = 0;
			$("#"+options.containerId+"").bind('mousemove', function(e){
				e.preventDefault();
				e.stopPropagation();
				volumen = originalpos - (e.pageX - this.offsetLeft);
				$('.lbc-after').stop().animate({"margin-left":""+(-volumen)+"px"},10);
				$('.lbc-before').stop().animate({"margin-left":""+(-volumen)+"px"},10);
				$('.lbc-center').stop().animate({"margin-left":""+(-volumen)+"px"},10);
				$("#testmouse").html(volumen)
				if (volumen < (-300)){ 
					$('.lbc-before').click();
					originalpos =(e.pageX - this.offsetLeft);
					$("#"+options.containerId+"").unbind('mousemove')
				}
				if (volumen > (300)){ 
					$('.lbc-after').click();
					originalpos =(e.pageX - this.offsetLeft);
					$("#"+options.containerId+"").unbind('mousemove');
				}
			});

			$("#"+options.containerId+"").bind('mouseup',function(){
				$("#"+options.containerId+"").unbind('mousemove');
				if (volumen < (-3) || volumen > (3)){ 
					$('.lbc-after').animate({"margin-left":"0px"},100);
					$('.lbc-before').animate({"margin-left":"0px"},100);
					$('.lbc-center').animate({"margin-left":"0px"},100);
				}
			});
		});
		
		function MouseWheelHandler(e) {
		// cross-browser wheel delta
			var e = window.event || e; // old IE support
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			$("#testmouse").html(delta)
			if (delta == 1){ 
						$('.lbc-after').click();
						delta =0;
			}
			if (delta == -1){ 
						$('.lbc-before').click();
						delta =0;
			}
		}
		
		
		var myimage = document.getElementById(""+options.containerId+"");
		if (myimage.addEventListener) {
			// IE9, Chrome, Safari, Opera
			myimage.addEventListener("mousewheel", MouseWheelHandler, false);
			// Firefox
			myimage.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
		}
		// IE 6/7/8
		else myimage.attachEvent("onmousewheel", MouseWheelHandler);
		//end test
	}
	
	
    function Plugin( element, options,mList,vLbox ) {
        this.element = element;
		var self = this;
		

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = options;

        this._defaults = defaults;
        this._name = pluginName;
		//instanciate MODEL
		this.mList = mList;
		this.vLbox = vLbox;

        this.init();
		//this.addCurtain(self.element, self.options)
		this.addBindings(self, self.element, self.options)
    }

    Plugin.prototype = {

        init: function(self) {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).
			
        },

        addCurtain: function(el, options) {
			
            $('body').append("<div id='"+options.curtainId+"'></div>");
			$('body').append("<div id='"+options.containerId+"'></div>");
			
			
        },
		
		addBindings: function(self, el, options) {
			$(el).click(function(event) {
				event.preventDefault();
				//self.addImage(self,el,options);
				console.log('controller-emit click')
				self.mList.addImages(this);
				
			});
			
						//clear all
			$("#"+options.containerId+"").click(function() {
				$(this).fadeOut();
				
				$("#"+options.curtainId+"").fadeOut();
				$(this).delay(100).html('');
			});
			
        },
		
		addImage: function(self, options, imageIndex, drawPosition) {
			var width = $(window).width();
			var height = $(window).height();
            var imageRef = imageArray[imageIndex];
			var imgLoad = $("<img class='"+options.imageClass+"' />");
			imgLoad.attr("src", imageRef);
			//$("#"+options.containerId+"").append("<img class='"+options.currentImageId+"' src='"+imageRef+"'/>");
			imgLoad.unbind("load");
			imgLoad.bind("load", function () {
			   // Get image sizes
			   if(drawPosition == 'center'){
					var topPos = (height/2) - (this.height/2);
				    var leftPos = (width/2) - (this.width/2);
			   }else if (drawPosition == 'left'){
					var topPos = (height/2) - (this.height/2);
					var leftPos = - (this.width) + 100;
			   }else{
					var topPos = (height/2) - (this.height/2);
				    var leftPos = (width) - 100;
			   }
			   $("#"+options.containerId+"").append(imgLoad);
			   imgLoad.css({"top":topPos, "left":leftPos })
			   alert(this.width +" "+height+" "+topPos);
			   imgLoad.fadeIn();
			});
        },
		
		displayImages: function(self, el, options, imageIndex) {
			self.addImage(self, options, imageIndex, 'center');
			self.addImage(self, options, imageIndex, 'center');
			
        },
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {

		var options = $.extend( {}, defaults, options );
		//model
		var vLbox = new Lbox(this, options);
		var mList = new List();
		
		$("#"+options.containerId+"").on("click", ".lbc-after", 'after', mList.updateCurrentIndex ); //TODO find a better way to handle next and before
		$("#"+options.containerId+"").on("click", ".lbc-before", 'before', mList.updateCurrentIndex );
		
		
		
		
	
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options,mList,vLbox ));
            }
        });
    };

})( jQuery, window, document );