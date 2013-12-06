from accounts.models import UserProfile, Contact
from wakeup.models import Recording, RecordingRating, RecordingComment
import json
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from datetime import datetime
from wakeup.tools.toolbox import sms_async, send_async_mail
from wakeuproulette.settings import EMAIL_HOST_USER


#########################################
############### CONTACTS ################
#########################################


@require_POST
@login_required
def add_contact(request):
    user = request.user
    othername = request.POST.get("username", "")

    response = {}
    try:
        contact = UserProfile.objects.get(user__username=othername)
        user.profile.request_contact(contact.user)
        user.profile.send_request_contact_email(contact.user)

    except Exception:
        response['error'] = True

    return HttpResponse(json.dumps(response), content_type="application/json")


@require_POST
@login_required
def accept_request(request):
    contact_id = request.POST.get("contact_id", "")
    response = {}
    try:
        contact_request = Contact.objects.get(id=contact_id, contact=request.user, status='P')
        contact_request.status='A'
        contact_request.save()
        contact = Contact.objects.create(user=request.user,contact=contact_request.user,status='A')
        request.user.profile.send_accept_contact_email(contact_request.user)
        response = {'html': render_to_string('layouts/contact.html', {'contact': contact})}
    except Contact.DoesNotExist:
        response['error'] = True
    return HttpResponse(json.dumps(response), content_type="application/json")

@require_POST
@login_required
def ignore_request(request):
    contact_id = request.POST.get("contact_id", "")
    response = {}
    try:
        contact_request = Contact.objects.get(id=contact_id, contact=request.user, status='P')
        contact_request.delete()
    except Contact.DoesNotExist:
        response['error'] = True
    return HttpResponse(json.dumps(response), content_type="application/json")





#########################################
############### COMMENTS ################
#########################################
@require_POST
@login_required
def insert_comment(request):

    txt = request.POST.get("comment", "")
    idx = request.POST.get("idx", "")
    response = {}
    try:
        recording = Recording.objects.get(pk=idx)
        comment = RecordingComment()
        comment.user = request.user
        comment.recording = recording
        comment.comment = txt
        comment.save()

        response = { 'html': render_to_string('layouts/comment.html', { 'comment': comment }) }

    except Recording.DoesNotExist:
        response['error'] = True

    return HttpResponse(json.dumps(response), content_type="application/json")



#########################################
################# ALARM #################
#########################################
@require_POST
@login_required
def set_alarm(request):
    print "here!!"
    onoff = request.POST.get("onoff", "")
    alarm_time = request.POST.get("alarm_time", "")
    response = {};

    print "onoff:",onoff
    print alarm_time

    request.user.profile.alarmon = onoff == "true"
    request.user.profile.alarm = alarm_time
    request.user.profile.save()
    request.user.save()

    return HttpResponse(json.dumps(response), content_type="application/json")




#########################################
############## RECORDINGS ###############
#########################################
@require_POST
@login_required
def increment_rec_aura(request):
    rec_id = request.POST.get("rec_id", "")
    response = {}
    try:
        recording = Recording.objects.get(pk=rec_id)

        rating = None
        try:
            rating = RecordingRating.objects.get(recording=recording, user=request.user)
            if rating.rated: raise Exception
        except RecordingRating.DoesNotExist:
            rating = RecordingRating()

        recording.rating = recording.rating + 1
        recording.save()

        rating.recording = recording
        rating.user = request.user
        rating.rated = True
        rating.save()

        #send_async_mail("WakeUpRoulette Aura Boost", request.user.username + " has rated up your recording! To see the recording, please login to your account at http://wakeuproulette.com/accounts/dashboard/", EMAIL_HOST_USER, [contact_request.user.email])

    except Exception:
        response['error'] = True
    return HttpResponse(json.dumps(response), content_type="application/json")

@require_POST
@login_required
def increment_rec_play(request):
    rec_id = request.POST.get("rec_id", "")
    response = {}
    try:

        recording = Recording.objects.get(pk=rec_id)

        rating = None

        try:
            rating = RecordingRating.objects.get(recording=recording, user=request.user)

            if rating.last_viewed_one_hour():
                response['error'] = True
                return HttpResponse(json.dumps(response), content_type="application/json")

        except RecordingRating.DoesNotExist:
            rating = RecordingRating()

        recording.plays = recording.plays + 1
        recording.save()

        rating.recording = recording
        rating.user = request.user
        rating.datecreated = datetime.now()
        rating.lastplayed = datetime.now()
        rating.save()

    except Recording.DoesNotExist:
        response['error'] = True
    return HttpResponse(json.dumps(response), content_type="application/json")

@require_POST
@login_required
def increment_rec_rewake(request):
    contact_id = request.POST.get("rec_id", "")
    response = {}
    response['error'] = True
#    try:
#        # TODO Implement rewakes
#    except Contact.DoesNotExist:
#        response['error'] = True
    return HttpResponse(json.dumps(response), content_type="application/json")


@require_POST
@login_required
def publish_recording(request):
    rec_id = request.POST.get("rec_id", "")
    response = {}

    try:
        recording = Recording.objects.get(id=rec_id, call__user=request.user)
        recording.privacy = 'P'
        recording.save()

    except Recording.DoesNotExist:
        response['error'] = True

    return HttpResponse(json.dumps(response), content_type="application/json")

@require_POST
@login_required
def connect_gender(request):
    change_men = request.POST.get("men", "false")
    change_women = request.POST.get("women", "false")
    if change_men == "true" and request.user.profile.femalematch == True:
        request.user.profile.malematch = not request.user.profile.malematch
    if change_women == "true" and request.user.profile.malematch == True:
        request.user.profile.femalematch = not request.user.profile.femalematch
    request.user.profile.save()
    response = {}
    return HttpResponse(json.dumps(response), content_type="application/json")
    
