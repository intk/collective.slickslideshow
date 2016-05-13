/* ------------------------------------------------------------------------------
    S L I D E S H O W - E N H A N C E M E N T S
--------------------------------------------------------------------------------- */

slickSlideshow = {};

slickSlideshow.slides = [];
slickSlideshow.debug = false;

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
		$(".audio-control-interface").show();
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
		var data_len = $(data).length;

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
	$(".slideshowDetails .slideshow-description").html("<p>"+slide.description+"</p>");
	$(".slideshowDetails .slideshow-slides").html("<p>"+numberOfSlides+"</p>");*/
};

slickSlideshow.slideMouseMove = function() {
  if (slickSlideshow.$obj.getSlick() != undefined) {

    if ($("#slickslideshow").length) {
      if (slickSlideshow.$obj.slickCurrentSlide() == 0) {
         $(".site-heading").css("opacity", 1);
      }
      $(".wrap-prev, .wrap-next").css("opacity", 1);
    }
  }
};

slickSlideshow.afterChange = function(event) {
	var currentSlide = event.currentSlide;
	slickSlideshow.addDescription(currentSlide);

	var diff = currentSlide - slickSlideshow.last_item;

	if (diff > 1) {
		$("div.wrap-next").css("opacity", 0);
	} else {
		if (diff < 0) {
			var total_diff = Math.abs(diff);
			if (total_diff > 1) {
				$("div.wrap-prev").css("opacity", 0);
			} else {
				$("div.wrap-next").css("opacity", 0);
			}
		} else if (diff == 1) {
			$("div.wrap-prev").css("opacity", 0);
		}
	}

	if (currentSlide != 0) {
		$(".site-heading").css("opacity", 0);
	}

	slickSlideshow.last_item = currentSlide;
	
	if (!slickSlideshow.moved) {
		slickSlideshow.moved = true;
	} else {
		
		/* Update slideshow wrapper */
		if (!$(".slideshowWrapper").hasClass('moved')) {
			$(".slideshowWrapper").addClass("moved");
		}


		/* Update hash */
		var slide = slickSlideshow.slides[currentSlide]
		var url = slide.url;
		var hash = "/"+url.split("/").slice(3).join("/");
		window.location.hash = hash;
	}
};

slickSlideshow.initSlick = function() {
	slickSlideshow.$obj.slick({
		accessibility: true,
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		adaptiveHeight: true,
		appendArrows: $(".slideshowWrapper"),
		focusOnSelect: true,
		onAfterChange: slickSlideshow.afterChange,
		nextArrow: "<div class='wrap-next'><button type='button' class='slick-next'></button></div>",
		prevArrow: "<div class='wrap-prev'><button type='button' class='slick-prev'></button></div>"
	});
};

slickSlideshow.init = function() {
	slickSlideshow.forward = false;
	slickSlideshow.moved = false;
	slickSlideshow.last_item = 0;
	slickSlideshow.log("==== INIT ====");
	slickSlideshow.$obj = $($('.slick-slideshow')[0]);
	slickSlideshow.$contentListingObj = $($('.slick-slideshow a')[0]);
	slickSlideshow.$contentListingObj.remove();
	slickSlideshow.$container = $($(".slideshow")[0]);
	

	if (slickSlideshow.$obj.hasClass('collection')) {
		slickSlideshow.initSlick();
	} else {
		slickSlideshow.getDetails();
		slickSlideshow.initSlick();
		slickSlideshow.getContentListing();
	}

	slickSlideshow.$obj.mousemove(slickSlideshow.slideMouseMove);

	/* Mouse leave */
	$(".intro-header").mouseleave(function() {
        $(".wrap-prev, .wrap-next").css("opacity", 0);
    });

};

$(document).ready(function() {
	if ($('.slick-slideshow').length) {
		slickSlideshow.init();
	}
});

