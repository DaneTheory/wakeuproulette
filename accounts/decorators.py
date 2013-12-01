from django.core.urlresolvers import reverse
from accounts.models import MessageVerification
from django.shortcuts import redirect
from django.utils.decorators import available_attrs

from django.utils.functional import wraps

def active_required(view_func):
    
    def _wrapped_view(request, *args, **kwargs):
        mv = MessageVerification.objects.get(user=request.user)
        if not mv.verified:
            return redirect(reverse("accounts.views.sms_verify"))
        if not request.user.profile.activated:
            return redirect(reverse("accounts.views.not_activated"))
        return view_func(request, *args, **kwargs)
    
    return wraps(view_func, assigned=available_attrs(view_func))(_wrapped_view)
            