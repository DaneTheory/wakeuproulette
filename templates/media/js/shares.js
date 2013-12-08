var shares = {
	init: function() {
		
        var recordings = $("#recordings");
        var diary = $("#wakeup-diary");
        var modal = $('#share-modal');
        var shares_info = $("#shares_info");
		
        function get_element_id(elem) {
            while(!$(elem).attr('idx')){
                elem = $(elem).parent();
            }
            return elem.attr('idx');
        }
        
		 /*###### COMMENTS ####### */

        $('body').on('keydown', '.comment-textarea', function(event) {
            // This extends textarea as required
            var that = $(this);
            if (that.scrollTop()) {
                $(this).height(function(i,h){
                    return h + 20;
                });
                $(this).parent().height(function(i,h){
                    return h + 20;
                });
            }

            //This submits the form if the user pressed enter
            if (event.keyCode == 13) {
                comment = $(this).val();
                idx = get_element_id(this);

                $(this).attr('disabled', 'true');

                var that = $(this);
                var url = shares_info.attr("data-insert_comment");
                $.ajax({
                    url: shares_info.attr("data-insert_comment"),
                    dataType: "json",
                    type: "POST",
                    data: {
                        comment: comment,
                        idx : idx
                    },
                    success: function(res) {
                        if (!res.error) {
                            console.log(that.closest('div').children('.comments-section'));
                            $(that.closest('div').children()[0]).append(res.html);
                            that.val('')
                        }
                        
                    },
                    complete: function() {
                    	that.removeAttr('disabled');
                    }

                });
            }
        });
        

        /*###### RECORDINGS ####### */

        $('body').on('click', '.share-aura-button', function(event) {
            var that = $(this);
            var curr = that.children('span');
            // This gets the sharing id rather than the recording ID
            idx = get_element_id(this);
            console.log(idx);

            $.ajax({
                url: shares_info.attr("data-increment_share_aura_url"),
                dataType: "json",
                type: "POST",
                data: {
                    idx: idx
                },
                success: function(res) {
                    if (!res.error) {
                        that.find('img').attr("src", "/media/icons/like-white.png")
                        curr.text(+ parseInt(curr.text(), 10) + 1);
                    }
                }
            });
        });

        $('body').on("click", ".rewakes-button", function() {
            var curr = $(this).children('span');
            idx = get_element_id(this);

            $.ajax({
                url: shares_info.attr("data-increment_rec_rewake_url"),
                dataType: "json",
                type: "POST",
                data: {
                    rec_id: idx
                },
                success: function(res) {
                    if (!res.error) {
                        curr.text(+ parseInt(curr.text(), 10) + 1);
                    }
                }
            });
        });
        $('body').on("play", ".recording-audio, .shared-recording-audio", function() {
            var curr = $(this).parent().parent().find('.play-count span');
            idx = get_element_id(this);

            $.ajax({
                url: shares_info.attr("data-increment_rec_play_url"),
                dataType: "json",
                type: "POST",
                data: {
                    rec_id: idx
                },
                success: function(res) {
                    if (!res.error) {
                        curr.text(+ parseInt(curr.text(), 10) + 1);
                    }
                }
            });
        });
        

        /*###### CALL SHARE ####### */
        $('body').on("click", ".recording-share", function() {
            idx = get_element_id(this);
            var that = $(this);

            console.log(that.closest(".recording").find(".recording-source"));
            src = that.closest(".recording").find(".recording-source").attr("src");
            console.log(src);

            $('#share-modal-audio').attr("idx", idx);
            $('#share-modal-audio-source').attr("src", src);
            $('#share-modal-audio').load();
        });

        $('#submit-share-btn').bind('click', function() {
            idx = $('#share-modal-audio').attr('idx');
            body = $('#share-modal-text').val();

            $.ajax({
                url: shares_info.attr("data-share_recording_url"),
                dataType: "json",
                type: "POST",
                data: {
                      rec_id: idx
                    , body: body
                },
                success: function(res) {
                    console.log(res);
                    if (!res.error) {

                        facebookurl = "http://www.facebook.com/sharer/sharer.php?s=100"
                            + "&p[url]=" + res.url
                            + "&p[images][0]="
                            + "&p[title]=Wake%20Up%20Roulette"
                            + "&p[summary]=Wake%20Up%20every%20day%20to%20an%20Amazing%20conversation!";
                        twitterurl = "http://twitter.com/home?status=Check%20out%20my%20@WakeUpRoulette%20call!!%20"
                            + res.url;

                        if ($('#twitter-share-a-ref').hasClass("checked")) {
                            window.open(twitterurl, '_blank');
                        }
                        if ($('#facebook-share-a-ref').hasClass("checked")) {
                            window.open(facebookurl, '_blank');
                        }

                        $('.close-reveal-modal').click();
                        $('#no-shares').remove();
                        $('#wakeup-diary-box').prepend(res.data);
                        $('#twitter-share-a-ref').removeClass("checked");
                        $('#facebook-share-a-ref').removeClass("checked");
                        $('#share-modal-text').val('');
                    }
                },
                async: false
            });
        });

//        Share buttons checkbox
        $('body').on("click", ".share-btn", function() {
            var that = $(this);

            if (that.hasClass("checked")) {
                that.removeClass("checked");
            } else {
                that.addClass("checked");
            }
        });
        
        if (shares_info.attr("data-load_on_scroll") === "1") {
	        
	        var min_bottom_scroll = 100;
			var query_time = $.now();
			var list_full = false;
			var loading_list = false;
			var main_feed = $("#main-feed-content-box");
			
			function query_shares() {
				if (!loading_list && !list_full) {
					query_time = $.now();
					var time_copy = query_time;
					loading_list = true;
					$.ajax({
						url: shares_info.attr("data-load_shares_url"),
						type: "POST",
						dataType: "json",
						data: {
							upper_id: main_feed.find(".shared-recording").last().attr("idx"),
						},
						success: function(res) {
							if (time_copy === query_time) {
								loading_list = false;
								main_feed.append(res.html);
								if (res.fetched === 0) {
									list_full = true;
								}
							}
						}
					});
				}
			}
			
			$(window).on("scroll", function(e) {
				var s = $(window).scrollTop();
				var window_height = $("html").height();
				var left_height = window_height - s - $(window).height() + 50;
				if (left_height < min_bottom_scroll) {
					query_shares();
				}
			});
			
			
		
        }
        
        
	}	
}


$(function() {
	shares.init();
});