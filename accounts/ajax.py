from accounts.models import UserProfile, Contact
import json
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST

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