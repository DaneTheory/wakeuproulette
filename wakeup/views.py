from django.shortcuts import render
from django import forms
from xml.dom.minidom import parseString

from django.http import HttpResponse
from django.core.urlresolvers import reverse


def home(request):
    return render(request, 'index.html')

def serveConference(request, confname):
    return HttpResponse(getXML(confname), mimetype="application/xml")

def setAlarm(request):
    if request.method == 'POST':
        form = AlarmForm(request.POST)
        if form.is_valid():
            alarm = form.cleaned_data['alarm']

    else:
        form = AlarmForm()

    return render(request, 'genericform.html', {
        'form': form,
        'name': 'Set Up Alarm'
    })

class AlarmForm(forms.Form):
    time = forms.TimeField()

def notFound(request):
    return render(request, '404.html')


#Generate XML response dynamically
def getXML(conf, say=""):
    xml = "<Response>"
    if say:
        xml += "<Say>" + say + "</Say>"

    xml += "<Dial timeLimit='30'><Conference>"
    xml += conf
    xml += "</Conference></Dial></Response>"

    return xml