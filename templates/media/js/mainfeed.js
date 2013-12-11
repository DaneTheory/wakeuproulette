var mainfeed = {
    init : function() {

        $('#tutorial').bind('click', function(event) {
            var introguide = introJs();
            introguide.setOptions({
                steps: [
                    {
                        element: '#tutorial',
                        intro: "Hey there! We're extremely happy to see you here!",
                        position: 'bottom'
                    },
                    {
                        element: '#main-feed-content',
                        intro: "This is your main WakeUp feed - where you'll be able to see all the activity from your contacts!",
                        position: 'right'
                    },
                    {
                        element: '#call-history',
                        intro: "This is your call-history! You can share any of your WakeUps, which your contacts will then be able to like and comment!",
                        position: 'left'
                    },
                    {
                        element: '#dashboard-nav-btn',
                        intro: "If you'd like to set up your alarm and wake up to an awesome conversation, you can go to your Dashboard!",
                        position: 'left'
                    },
                    {
                        element: '#nav-evening-roulette-btn',
                        intro: "If you're up for making someone's day amazing by waking him/her up, you can go to the #EveningRoulette! Remember, it's free and anonymous!",
                        position: 'bottom'
                    }
                ]
            });
            introguide.start();
            return false;
        });

    }
}

$(function(){
    mainfeed.init();
})();