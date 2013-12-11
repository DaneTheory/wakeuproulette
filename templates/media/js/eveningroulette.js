var eveningroueltte = {
    init : function() {

        evening_info = $('#evening_info');


        $('.switch').bind('click', function(e) {


            if (e.target.innerHTML == "") {
                var date = $(this).closest(".evening-block").find('.evening-components').attr("data-server_time");
                var checked = $(this).find(".onoffswitch-checkbox").is(":checked");

                var url = evening_info.attr("data-set_evening_url");

                $.ajax({
                    url: evening_info.attr("data-set_evening_url"),
                    dataType: "json",
                    type: "POST",
                    data: {
                          checked: checked
                        , date: date
                    },
                    success: function(res) {

                    }
                });
            }
        });

        $('#tutorial').bind('click', function() {
            var introguide = introJs();
            introguide.setOptions({
                steps: [
                    {
                        element: '#tutorial',
                        intro: "Hey! It's such a pleasure to see you again! We hope everything is going Amazing!",
                        position: 'right'
                    },
                    {
                        element: '#evening-content',
                        intro: "This is your #EveningRoulette panel! You will be able to subscribe to a schedule and bring happiness to others around the world through an Awesome WakeUp!",
                        position: 'right'
                    },
                    {
                        element: '#evening-evenings',
                        intro: "You can join the most convenient time for you - the server will then match you with a WakeUp buddy around the world!",
                        position: 'left'
                    },
                    {
                        element: '.evening-components',
                        intro: "You will be able to see the schedule, and the number of WakeUp buddies! If we don't manage to find you a match, you can optionally be matched with an Evening Buddy if desired!",
                        position: 'bottom'
                    },
                    {
                        element: '#evening-info-description div',
                        intro: "You can hover over the secret panel for a short summary of what #EveningRoulette consists of! >.",
                        position: 'top'
                    },
                    {
                        element: '#dashboard-nav-btn',
                        intro: "If you'd like to set up your alarm, and wake up to an awesome conversation, you can go to your Dashboard!",
                        position: 'left'
                    },
                    {
                        element: '#tutorial',
                        intro: "Thank you Very much for your time! We wish you an Awesome WakeUp!",
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
    eveningroueltte.init()
});