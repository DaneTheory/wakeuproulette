
var sms_verify = {
	init: function() {
		$("#resend_code").bind("click", function(e) {
			$("#resend_code_hidden").val("1");
		});

        $('#call_verification').bind("click", function(e) {
            $("#call_hidden").val("1");
            $("#verification-form").submit();
            return false;
        });

        $("#submit_btn").bind("keypress"), function(e) {
            if (event.keyCode == 13) {
                $("#verification-form").submit();
            }
        }
	}
}

$(function() {
	sms_verify.init();
});