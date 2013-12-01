
var sms_verify = {
	init: function() {
		$("#resend_code").bind("click", function(e) {
			$("#resend_code_hidden").val("1");
		});
	}
}

$(function() {
	sms_verify.init();
});