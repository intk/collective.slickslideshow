/* ------------------------------------------------------------------------------
    S L I D E S H O W - E N H A N C E M E N T S
--------------------------------------------------------------------------------- */
var $ = jQuery;

(function(){ //Closure, to not leak to the scope
  var s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api"; 
  var before = document.getElementsByTagName("script")[0];
  before.parentNode.insertBefore(s, before);
})();

function isElementInViewport (el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    var rect = el.getBoundingClientRect();

    return (
        Math.abs(rect.top) <= jQuery(el).height()
    );
};

slickSlideshow = {};

slickSlideshow.slides = [];
slickSlideshow.players = {};
slickSlideshow.debug = false;
slickSlideshow.playing = false;
slickSlideshow.youtube_ready = false;
slickSlideshow.initiated_youtube = false;

/* Responsive storytelling enhancement */

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

slickSlideshow.log = function(text) {
	if (slickSlideshow.debug) {
		console.log(text);
	}
};

slickSlideshow.getDetails = function() {
	slickSlideshow.url = slickSlideshow.$contentListingObj.attr('href');
	slickSlideshow.recursive = !slickSlideshow.$contentListingObj.parent().hasClass('disableRecursive');
	if (slickSlideshow.$obj.hasClass("audio")) {
		slickSlideshow.isAudioSlideshow = true;
		slickSlideshow.audioduration = slickSlideshow.$obj.attr("data-audio-duration");
		jQuery(".audio-control-interface").show();
	}
};

slickSlideshow.getYoutubeEmbed = function (media) {
  var embed = '<iframe width="100%" height="100%" src="'+media.url+'" class="embed-responsive-item" frameborder="0" allowfullscreen></iframe>';
  return embed;
};

slickSlideshow.addAudioPlayer = function() {
	//TODO
};

slickSlideshow.addSlides = function() {
	var partial_duration = slickSlideshow.audioduration / slickSlideshow.slides.length;
	for (var i = 0; i < slickSlideshow.slides.length; i++) {
		if (slickSlideshow.isAudioSlideshow) {
			if (slickSlideshow.slides[i].video) {
			} else {
				var slide_time = i * partial_duration;
				var data_thumbnail = slickSlideshow.slides[i].url + "/@@images/image/large";
				slickSlideshow.$obj.slickAdd("<div><div class='inner-bg'><img src='"+slickSlideshow.slides[i].url+"/@@images/image/large' data-thumbnail='"+data_thumbnail+"'></div></div>");
			}
		} else {
			if (slickSlideshow.slides[i].video) {
				slickSlideshow.$obj.slickAdd("<div><div class='inner-bg'>"+slickSlideshow.slides[i].embed+"</div></div>");
			} else {
				slickSlideshow.$obj.slickAdd("<div><div class='inner-bg'><img src='"+slickSlideshow.slides[i].url+"/@@images/image/large'></div></div>");
			}
		}
	};

	slickSlideshow.addAudioPlayer();
};

slickSlideshow.getSlideDetails = function(item, last) {
	var URL = "";
	var embed = "";
	var isVideo = false;

	URL = item.url + '/get_slideshow_item';

	var slide_item = {
		'url': item.url,
		'UID': item.UID
	}

	slickSlideshow.slides.push(slide_item);

	$.getJSON(URL, function(data) {
		if (data.media.type == "Youtube") {
			embed = slickSlideshow.getYoutubeEmbed(data.media);
			isVideo = true;
		} 

		slide_item.video = isVideo;
		slide_item.embed = embed;
		slide_item.description = data.description;

		if (last) {
			slickSlideshow.addSlides();
			slickSlideshow.$obj.slickGoTo(0);
		}
	});
};

slickSlideshow.getContentListing = function() {
	var URL, querystring;

	if (slickSlideshow.url.indexOf("?") != -1) {
		querystring = slickSlideshow.url.slice(slickSlideshow.url.indexOf("?") + 1);
		slickSlideshow.url = slickSlideshow.url.slice(0, slickSlideshow.url.indexOf("?"));
	} else {
		querystring = "";
	}

	// Make it non-recursive
	slickSlideshow.recursive = false;
	querystring = "";

	if (slickSlideshow.recursive) {
		if (querystring == "") {
			URL = slickSlideshow.url + '/slideshowListing';
		} else {
			URL = slickSlideshow.url + '/slideshowListing' + '?' + querystring;
		}
	} else {
		if (querystring == "") {
			URL = slickSlideshow.url + '/slideshowListing?recursive=false';
		} else {
			URL = slickSlideshow.url + '/slideshowListing' + '?' + querystring + "&recursive=false";
		}
	}
	
	$.getJSON(URL, function(data) {
		var data_len = jQuery(data).length;

		$.each(data, function(index, item) {
			if (index == data_len - 1) {
				slickSlideshow.getSlideDetails(item, true)
			} else {
				slickSlideshow.getSlideDetails(item, false)
			}
		});
	});
};

slickSlideshow.addDescription = function(slideNumber) {
	/*var slide = slickSlideshow.slides[slideNumber];
	var total = slickSlideshow.slides.length;
	var numberOfSlides = (slideNumber+1)+"/"+total;
	jQuery(".slideshowDetails .slideshow-description").html("<p>"+slide.description+"</p>");
	jQuery(".slideshowDetails .slideshow-slides").html("<p>"+numberOfSlides+"</p>");*/
};

slickSlideshow.slideMouseMove = function() {
  if (slickSlideshow.$obj.getSlick() != undefined) {

    if (jQuery("#slickslideshow").length) {
      if (slickSlideshow.$obj.slickCurrentSlide() == 0) {
         jQuery(".site-heading").css("opacity", 1);

        if (slickSlideshow.playing != true) {
        	jQuery(".video-play-btn").css("opacity", 0.75);
        }
      }
      if (slickSlideshow.playing != true) {
        jQuery(".wrap-prev, .wrap-next").css("opacity", 1);
      }
    }
  }
};

slickSlideshow.afterChange = function(event) {
	var currentSlide = event.currentSlide;
	slickSlideshow.addDescription(currentSlide);

	var diff = currentSlide - slickSlideshow.last_item;

	if (diff > 1) {
		jQuery("div.wrap-next").css("opacity", 0);
	} else {
		if (diff < 0) {
			var total_diff = Math.abs(diff);
			if (total_diff > 1) {
				jQuery("div.wrap-prev").css("opacity", 0);
			} else {
				jQuery("div.wrap-next").css("opacity", 0);
			}
		} else if (diff == 1) {
			jQuery("div.wrap-prev").css("opacity", 0);
		}
	}

	if (currentSlide != 0) {
		jQuery(".site-heading").css("opacity", 0);
	}

	slickSlideshow.last_item = currentSlide;
	
	if (!slickSlideshow.moved) {
		slickSlideshow.moved = true;
	} else {
		
		/* Update slideshow wrapper */
		if (!jQuery(".slideshowWrapper").hasClass('moved')) {
			jQuery(".slideshowWrapper").addClass("moved");
		}
		/* Update hash */
		var slide = slickSlideshow.slides[currentSlide]
		if (slide != undefined) {
			var url = slide.url;
			var hash = "/"+url.split("/").slice(3).join("/");
			window.location.hash = hash;
		}
	}
	var $slides = slickSlideshow.$obj.getSlick().$slides;
	var $currentSlideObj = jQuery($slides[currentSlide]);
	if ($currentSlideObj.hasClass('video-slide')) {
		slickSlideshow.startVideoFromSlide($currentSlideObj);
	}
};

slickSlideshow.beforeChange = function(event) {

	currentSlide = event.currentSlide;
	var $currSlider = jQuery(event.$slides[currentSlide]);


	if ($currSlider.hasClass("video-slide")) {
		var frameID = jQuery($currSlider.find('iframe')[0]).attr("id");
		// Pause video
		var slide_player = slickSlideshow.players[frameID];
		if (slide_player != undefined && slide_player.pauseVideo) {
			slide_player.pauseVideo();
		}
	}
};

slickSlideshow.initSlick = function() {
	slickSlideshow.$obj.slick({
		accessibility: true,
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		adaptiveHeight: false,
		appendArrows: jQuery(".slideshowWrapper"),
		focusOnSelect: false,
		onAfterChange: slickSlideshow.afterChange,
		onBeforeChange: slickSlideshow.beforeChange,
		nextArrow: "<div class='wrap-next'><button type='button' class='slick-next'></button></div>",
		prevArrow: "<div class='wrap-prev'><button type='button' class='slick-prev'></button></div>"
	});

	jQuery("#slickslideshow").addClass("slick-init");

};

slickSlideshow.onPlayerStateChange = function(iframeID) {
	return function(event) {
		if (event.data == 1) {
			jQuery(".wrap-prev, .wrap-next").css("opacity", 0);
			jQuery(".site-heading").fadeOut();
			
			slickSlideshow.playing = true;
			
			setTimeout(function() {
				jQuery(".slick-active.video-slide img.overlay-image").hide();
				jQuery(".video-play-btn").css("opacity", 0);
				jQuery(".video-play-btn").hide();
				jQuery(".slick-active.video-slide iframe").show();
			}, 400);

		} else if (event.data == 2) {
			jQuery(".wrap-prev, .wrap-next").css("opacity", 1);
			jQuery(".site-heading").fadeIn();
			slickSlideshow.playing = false;
		}

		/* Video ended 
		 * Got to next slide */

		else if (event.data == 0) {
			slickSlideshow.$obj.slickNext();
		}
	}
};

slickSlideshow.YT_ready = function() {
	if (slickSlideshow.$obj.getSlick() != undefined) { 
		var $first_slide = jQuery(slickSlideshow.$obj.getSlick().$slides[slickSlideshow.initialSlide]);

		jQuery(".video-slide:not(.slick-cloned) iframe").each(function() {
			var iframeID = this.id;
			slickSlideshow.players[iframeID] = new YT.Player(iframeID, {
				events: {
					"onReady": slickSlideshow.createYTEvent(iframeID, $first_slide),
					"onStateChange": slickSlideshow.onPlayerStateChange(iframeID)
				}
			});
		});
	}
};

slickSlideshow.createYTEvent = function(iframeID, first_slide) {
	return function(event) {
		var player = slickSlideshow.players[iframeID];
		if (first_slide.hasClass('video-slide')) {
			var slide_iframeID = jQuery(first_slide.find('iframe')[0]).attr('id');
			if (slide_iframeID == iframeID) {
				slickSlideshow.startFirstVideo(first_slide);
			}
		}
	}
};

slickSlideshow.startVideoFromSlide = function(slide) {

	if (!slickSlideshow.editingMode && !isMobile.any()) {
		var iframeID = jQuery(slide.find('iframe')[0]).attr('id');

		var player = slickSlideshow.players[iframeID];
		if (player != undefined) {
			if (player.playVideo) {
				player.playVideo();
			} else {
				jQuery(".slick-active.video-slide img.overlay-image").hide();
				jQuery(".video-play-btn").hide();
				jQuery(".video-play-btn").css("opacity", 0);
				jQuery(".slick-active.video-slide iframe").show();
			}
		}  else {
			jQuery(".slick-active.video-slide img.overlay-image").hide();
			jQuery(".video-play-btn").hide();
			jQuery(".video-play-btn").css("opacity", 0);
			jQuery(".slick-active.video-slide iframe").show();
		}
	}
};

slickSlideshow.startFirstVideo = function(slide) {
	if (!slickSlideshow.editingMode && !isMobile.any()) {
		var iframeID = jQuery(slide.find('iframe')[0]).attr('id');
		var player = slickSlideshow.players[iframeID];
		
		if (player != undefined) {
			if (player.playVideo) {
				if (!slickSlideshow.alreadyScrolled) {
					player.playVideo();
				}
			} else {
				jQuery(".slick-active.video-slide img.overlay-image").hide();
				jQuery(".video-play-btn").css("opacity", 0);
				jQuery(".slick-active.video-slide iframe").show();
				jQuery(".video-play-btn").hide();
			}
		} else {
		}
	}
};

function onYouTubePlayerAPIReady() {
	slickSlideshow.youtube_ready = true;
	if (slickSlideshow.initiated_youtube == false) {
		if (slickSlideshow.$obj != undefined) { 
			slickSlideshow.YT_ready();
		}
	}
};

slickSlideshow.pauseCurrentSlide = function() {
	var curr = slickSlideshow.$obj.slickCurrentSlide();
	var $slide = jQuery(slickSlideshow.$obj.getSlick().$slides[curr]);
	if ($slide.hasClass("video-slide")) {
		var frameID = jQuery($slide.find('iframe')[0]).attr("id");
		// Pause video
		var slide_player = slickSlideshow.players[frameID];
		if (slide_player != undefined) {
			slide_player.pauseVideo();
		}
	}
};

slickSlideshow.init = function() {
	/* Util variables */
	slickSlideshow.initiated_youtube = false;
	slickSlideshow.youtube_ready = false;
	slickSlideshow.forward = false;
	slickSlideshow.moved = false;
	slickSlideshow.last_item = 0;
	slickSlideshow.editingMode = false;
	slickSlideshow.alreadyScrolled = false;
	slickSlideshow.playing = false;
	slickSlideshow.initialSlide = 0;
	/* Check editing mode */
	if (jQuery("body").hasClass('userrole-authenticated')) {
		slickSlideshow.editingMode = true;
	}
	
	/* Init slideshow */
	slickSlideshow.log("==== INIT ====");
	slickSlideshow.$obj = jQuery(jQuery('.slick-slideshow')[0]);
	slickSlideshow.$contentListingObj = jQuery(jQuery('.slick-slideshow a')[0]);
	slickSlideshow.$contentListingObj.remove();
	slickSlideshow.$container = jQuery(jQuery(".slideshow")[0]);
	
	if (slickSlideshow.$obj.hasClass('collection')) {
	
		slickSlideshow.initSlick();

		if (slickSlideshow.youtube_ready) {
			slickSlideshow.initiated_youtube = true;
			slickSlideshow.YT_ready();
		}

		jQuery(".website-wrapper").scroll(function() {
			var isvisible = isElementInViewport(jQuery("#slickslideshow"));
			
			if (!isvisible) {
				if (slickSlideshow.playing) {
					slickSlideshow.pauseCurrentSlide();
				} else {
					slickSlideshow.alreadyScrolled = true;
				}
			} else {
				slickSlideshow.alreadyScrolled = true;
			}
		});

	} else {
		slickSlideshow.getDetails();
		slickSlideshow.initSlick();
		slickSlideshow.getContentListing();
	}

	slickSlideshow.$obj.mousemove(slickSlideshow.slideMouseMove);
	if (isMobile.any()) {
	    jQuery("body").addClass("mobile");
	    jQuery(".video-play-btn").addClass('mobile');
	 } else {
	 	jQuery("body").addClass("no-touch");
	 }

	/* Mouse leave */
	jQuery(".intro-header").mouseleave(function() {
        jQuery(".wrap-prev, .wrap-next").css("opacity", 0);
        jQuery(".video-play-btn").css("opacity", 0);
    });

    jQuery(".video-play-btn").click(function() {
	    jQuery(".slick-active.video-slide img.overlay-image").hide();
	    jQuery(".video-play-btn").hide();
  	});

};

jQuery(document).ready(function() {
	if (jQuery('.slick-slideshow').length) {
		slickSlideshow.init();
	}
});

