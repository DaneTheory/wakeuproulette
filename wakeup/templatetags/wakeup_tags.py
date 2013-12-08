from django import template

register = template.Library()

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
