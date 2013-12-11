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
        var alarm = $('#dash-alarm');
		
		$("#all_contacts_btn").bind("click", function() {
			$("#all_contacts").show();
			$("#requests").hide();
		});
		
		$("#requests_btn").bind("click", function() {
			$("#all_contacts").hide();
			$("#requests").show();
		});

        /*###### ALARM ######## */
        function divClicked() {
            var divHtml = $(this).html();
            var editableText = $("<input style='margin-bottom: -40px;' id='dash-alarm-time' class='inline' type='text' />");
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
            
            var time_string = "Beta available times: " + alarm_times[0] + ", " + alarm_times[1] + ", " + alarm_times[2] + ", " + alarm_times[3] + ", " + alarm_times[4] + " and " + alarm_times[5] + " only";

            $('.alarm-tooltip').attr("title", time_string);
        }

        function editableTextBlurred() {
            var html = $(this).val();
            var viewableText = $("<div style='margin-bottom: -40px;' id='dash-alarm-time' class='inline'>");
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
		
		$("#recurrent").bind("click", function(e) {
			var check_box = $(this);
			$.ajax({
				url: check_box.attr("data-set_recurrent_url"),
				dataType: "json",
				type: "POST",
				success: function(res) {
					
				}
			});
		});


//        Intro Guide

        var introguide = introJs();
        introguide.setOptions({
            steps: [
                {
                    element: '#profile-picture',
                    intro: "Hey there! We'd be delighted if you'd like to take a super-quick WakeUp Tour to learn all the awesome features!",
                    position: 'bottom'
                },
                {
                    element: '#chart',
                    intro: 'This chart displays your WakeUp activity. WakeUps are in <font color="green">Green</font>, Snoozes are in <font color="blue">Blue</font> and Oversleeps are in <font color="gray">Black</a>.',
                    position: 'left'
                },
                {
                    element: '#dash-alarm-time',
                    intro: "You can click your alarm to select the time you'd like to wake up.",
                    position: 'left'
                },
                {
                    element: '#call-history',
                    intro: "After each call, you will find your recordings here, which you can then share in your WakeUp diary, Twitter or even Facebook!.",
                    position: 'left'
                },
                {
                    element: '#wakeup-diary',
                    intro: "Your WakeUp diary will contain your shared WakeUps, which then people will be able to comment, like and share!.",
                    position: 'left'
                },
                {
                    element: '#contacts',
                    intro: "After each call, you will be invited to connect with your WakeUp buddy!.",
                    position: 'right'
                },
                {
                    element: '#settings',
                    intro: "Finally, you can tweak your profile in your settings! We wish you An awesome WakeUp conversation!!",
                    position: 'bottom'
                }
            ]
        });
//        introguide.start();
    }
}


$(function() {
	dashboard.init();
});

