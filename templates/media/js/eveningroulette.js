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
    }
}

$(function() {
    eveningroueltte.init()
});