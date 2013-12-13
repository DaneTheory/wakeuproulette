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

            var time_string = "Press up and down arrow keys.";

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


        $('#tutorial').bind('click', function() {
            var introguide = introJs();
            introguide.setOptions({
                steps: [
                    {
                        element: '#profile-picture',
                        intro: "Welcome to WakeUp Roulette! We'd be delighted if you'd like to take a super-quick WakeUp Tour to learn all the awesome features!",
                        position: 'bottom'
                    },
                    {
                        element: '#dash-alarm-time',
                        intro: "You can set up your alarm by clicking in the time! When you're ready you can turn it on and you'll be waken up to an Awesome conversation!",
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
                        element: '#dash-stats',
                        intro: 'This section displays your WakeUp stats. The number of times you wake up immediately, after a snooze, or oversleep will give you aura points!',
                        position: 'left'
                    },
                    {
                        element: '#all-wakeups-nav-button',
                        intro: "If you're up for making someone's day amazing by waking him/her up, you can go to the #EveningRoulette! Remember, it's free and anonymous!",
                        position: 'bottom'
                    } ,
                    {
                        element: '#tutorial',
                        intro: "Thank you Very much for your time! You can click these icons for mini-tutorials like this! We wish you an Awesome WakeUp!",
                        position: 'bottom'
                    }
                ]
            });
            introguide.start();
            return false;
        });
    }
}


$(function() {
	dashboard.init();
});

