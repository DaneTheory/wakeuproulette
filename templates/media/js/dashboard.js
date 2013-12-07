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

		var contacts = $("#contacts");
        var recordings = $("#recordings");
        var diary = $("#wakeup-diary");
        var alarm = $('#dash-alarm');
        var modal = $('#share-modal');
		
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
            
            alarm_times = [];
            $(".allowed_time").each(function(i) {
            	alarm_times.push($(this).attr("data-time"));
            });
            
            $('#dash-alarm-time').timeEntry({show24Hours: true, minTime: alarm_times[0] + ":00", maxTime: alarm_times[alarm_times.length - 1] + ":00"});
            
            var time_string = "Beta available times: " + alarm_times[0] + ", " + alarm_times[1] + ", " + alarm_times[2] + " and " + alarm_times[3] + " only";

            $('.alarm-tooltip').attr("title", time_string);
        }

        function editableTextBlurred() {
            var html = $(this).val();
            var viewableText = $("<div id='dash-alarm-time' class='inline'>");
            viewableText.html(html);
            $(this).replaceWith(viewableText);
            // setup the click event for this new div
            viewableText.click(divClicked);
            $('.alarm-tooltip').removeClass("alarm-tooltip tooltip");

            var alarm_time = $('#dash-alarm-time').text()
            set_alarm(alarm_time);
        }

        $('#dash-alarm-time').bind('click', divClicked)

        $('#switch').bind('click', function(e) {
            if (e.target.innerHTML == "") {
                var alarm_time = $('#dash-alarm-time').text()

                set_alarm(alarm_time);
            }
        });

        function set_alarm(alarm_time) {
            var checked = $('#myonoffswitch').is(':checked');

            if(checked) {
                $('#dash-alarm-time').removeClass('unactive');
                $('#dash-alarm').removeClass('unactive');
            }
            else {
                $('#dash-alarm-time').addClass('unactive');
                $('#dash-alarm').addClass('unactive');
            }

            $.ajax({
                url: alarm.attr("data-set_alarm"),
                dataType: "json",
                type: "POST",
                data: {
                    onoff: checked,
                    alarm_time : alarm_time
                },
                success: function(res) {
                    if (!res.error) {

                    }
                },
                failure: function(res) {

                }

            });
        }




        /*###### COMMENTS ####### */

        $('#wakeup-diary-box').on('keydown', '.comment-textarea', function(event) {
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

                setTimeout(function(){
                    console.log("here")
                    $('.comment-textarea').removeAttr('disabled', 'false');
                }, 5000);


                var that = $(this);

                $.ajax({
                    url: diary.attr("data-insert_comment"),
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

        $('.recording-audio, .shared-recording-audio').bind("play", function() {
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



        /*###### CALL SHARE ####### */

        $('.recording-share').bind('click', function() {
            idx = get_recording_id(this);
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
                url: modal.attr("data-share_recording_url"),
                dataType: "json",
                type: "POST",
                data: {
                      rec_id: idx
                    , body: body
                },
                success: function(res) {
                    console.log(res);
                    if (!res.error) {
                        $('.close-reveal-modal').click();
                        $('#no-shares').remove();
                        $('#wakeup-diary-box').prepend(res.data);
                    }
                }
            });
        });



        /*###### CONTACTS ####### */

        $("#add-contact-button").bind("click", function() {
            var btn = $(this);

            $.ajax({
                url: btn.attr("data-add_contact_url"),
                dataType: "json",
                type: "POST",
                data: {
                    username: btn.attr('data-other_username')
                },
                success: function(res) {
                    if (!res.error) {
                        btn.replaceWith("");
                    }
                }
            });
        });

        $(".accept_request").bind("click", function() {
			var btn = $(this);
            console.log(contacts.attr("data-accept_request_url"));

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
		
		function connect_gender(men, women) {
			$.ajax({
				url: contacts.attr("data-connect_gender_url"),
				dataType: "json",
				type: "POST",
				data: {
					men: men,
					women: women
				},
				success: function(res) {
					
				}
			});
		}
		
		$("#connect_men").bind("click", function(e) {
			if ($("#connect_women").prop('checked')) {
				connect_gender(true, false);
			}
			else {
				e.preventDefault();
			}
		});
		
		$("#connect_women").bind("click", function(e) {
			if ($("#connect_men").prop('checked')) {
				connect_gender(false, true);
			}
			else {
				e.preventDefault();
			}
		});
		
	}
}


$(function() {
	dashboard.init();
});

