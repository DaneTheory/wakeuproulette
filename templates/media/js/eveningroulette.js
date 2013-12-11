var eveningroueltte = {
    init : function() {

        evening_info = $('#evening_info');


        $('.switch').bind('click', function(e) {

            var checked = $(this).find("label").is(":checked");
            var date = $(this).closest(".evening-block").find('.evening-components').attr("data-server_time");
            console.log(evening_info.attr("data-set_evening_url"));

            $.ajax({
                url: evening_info.attr("data-set_evening_url"),
                dataType: "json",
                type: "POST",
                data: {
                      checked: checked
                    , date: date
                },
                success: function(res) {
                    console.log(res);
                }
            });
        });
    }
}

$(function() {
    eveningroueltte.init()
});