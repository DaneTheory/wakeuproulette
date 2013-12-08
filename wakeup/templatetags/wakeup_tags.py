from django import template

register = template.Library()

from wakeup.tools.toolbox import local_time as local_time_func

@register.assignment_tag(takes_context=True)
def liked(context, share):
    user = context['request'].user
    print "here"

    try:
        rating = share.recordingrating_set.get(user=user)
        print rating.rated
        ret = rating.rated

    except Exception:
        ret = False

    return 1 if ret else 0

@register.simple_tag(takes_context=True)
def local_time(context, time):
    return local_time_func(time, context['request']).strftime("%H:%M")
