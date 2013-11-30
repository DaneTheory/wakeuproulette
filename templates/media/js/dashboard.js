//Time
function startTime()
{
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
// add a zero in front of numbers<10
    m=checkTime(m);
    s=checkTime(s);
    document.getElementById('dash-time').innerHTML=h+":"+m+":"+s;
    t=setTimeout(function(){startTime()},500);
}

function checkTime(i)
{
    if (i<10)
    {
        i="0" + i;
    }
    return i;
}

window.onload=startTime;

var dashboard = {
	init: function() {






        /*################### AJAX REQUESTS #################### */
        /*################### AJAX REQUESTS #################### */
        /*################### AJAX REQUESTS #################### */
		function getCookie(name) {
		    var cookieValue = null;
		    if (document.cookie && document.cookie != '') {
		        var cookies = document.cookie.split(';');
		        for (var i = 0; i < cookies.length; i++) {
		            var cookie = jQuery.trim(cookies[i]);
		            // Does this cookie string begin with the name we want?
		            if (cookie.substring(0, name.length + 1) == (name + '=')) {
		                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
		                break;
		            }
		        }
		    }
		    return cookieValue;
		}
		var csrftoken = getCookie('csrftoken');
		
		function csrfSafeMethod(method) {
		    // these HTTP methods do not require CSRF protection
		    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
		}
		$.ajaxSetup({
		    crossDomain: false, // obviates need for sameOrigin test
		    beforeSend: function(xhr, settings) {
		        if (!csrfSafeMethod(settings.type)) {
		            xhr.setRequestHeader("X-CSRFToken", csrftoken);
		        }
		    }
		});
		
		var contacts = $("#contacts");
        var recordings = $("#recordings");
        var comments = $(".comments");
		
		$("#all_contacts_btn").bind("click", function() {
			$("#all_contacts").show();
			$("#requests").hide();
		});
		
		$("#requests_btn").bind("click", function() {
			$("#all_contacts").hide();
			$("#requests").show();
		});

        function get_recording_id(elem) {
            while(!$(elem).attr('idx')){
                elem = $(elem).parent();
            }
            return elem.attr('idx');
        }


        /*###### ALARM ######## */
        function divClicked() {
            var divHtml = $(this).html();
            var editableText = $("<input id='dash-alarm-time' class='inline' type='text' />");
            editableText.val(divHtml);
            $(this).replaceWith(editableText);
            editableText.focus();
            // setup the blur event for this new textarea
            editableText.blur(editableTextBlurred);
            $('#dash-alarm-time').timeEntry({show24Hours: true, minTime: '07:00AM', maxTime: '10:00AM'});
        }

        function editableTextBlurred() {
            var html = $(this).val();
            var viewableText = $("<div id='dash-alarm-time' class='inline'>");
            viewableText.html(html);
            $(this).replaceWith(viewableText);
            // setup the click event for this new div
            viewableText.click(divClicked);
        }

        $('#dash-alarm-time').bind('click', divClicked)

        $('#switch').bind('click', function() {
            var checked = $('#myonoffswitch').is(':checked')

            console.log()
            if(checked) {
                $('#dash-alarm-time').removeClass('unactive');
                $('#dash-alarm').removeClass('unactive');
            }
            else {
                $('#dash-alarm-time').addClass('unactive');
                $('#dash-alarm').addClass('unactive');
            }

            $.ajax({
                url: comments.attr("data-set_alarm"),
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
                    that.attr('disabled', 'false');
                },
                failure: function(res) {
                    that.attr('disabled', 'false');
                }

            });
        });




        /*###### COMMENTS ####### */

        $('.comment-textarea').keydown(function(event) {
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
                idx = get_recording_id(this);
                $(this).attr('disabled', 'true');
                var that = $(this);

                $.ajax({
                    url: comments.attr("data-insert_comment"),
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
                        that.attr('disabled', 'false');
                    },
                    failure: function(res) {
                        that.attr('disabled', 'false');
                    }

                });
            }
        });


        /*###### RECORDINGS ####### */

        $('.aura-button').bind("click", function() {
            var curr = $(this).children('span');
            idx = get_recording_id(this);

            $.ajax({
                url: recordings.attr("data-increment_rec_aura_url"),
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

        $('.rewakes-button').bind("click", function() {
            var curr = $(this).children('span');
            idx = get_recording_id(this);

            $.ajax({
                url: recordings.attr("data-increment_rec_rewake_url"),
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

        $('.recording-audio').bind("play", function() {
            var curr = $(this).parent().parent().find('.play-count span');
            idx = get_recording_id(this);

            $.ajax({
                url: recordings.attr("data-increment_rec_play_url"),
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

        /*###### CONTACTS ####### */

        $(".accept_request").bind("click", function() {
			var btn = $(this);
			$.ajax({
				url: contacts.attr("data-accept_request_url"),
				dataType: "json",
				type: "POST",
				data: {
					contact_id: btn.closest(".request").attr("data-request_id")
				},
				success: function(res) {
					if (!res.error) {
						btn.closest(".request").remove();
						$("#all_contacts").append(res.html);
					}
				}
			});
		});
		
		$(".ignore_request").bind("click", function() {
			var btn = $(this);
			$.ajax({
				url: contacts.attr("data-ignore_request_url"),
				dataType: "json",
				type: "POST",
				data: {
					contact_id: btn.closest(".request").attr("data-request_id"),
				},
				success: function(res) {
					if (!res.error) {
						btn.closest(".request").remove();
					}
				}
			});
		});
		
	}
}


$(function() {
	dashboard.init();
});

