from accounts.models import UserProfile, Contact
from wakeup.models import Recording, RecordingRating
import json
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from datetime import datetime

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