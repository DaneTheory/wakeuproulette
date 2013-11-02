from django.shortcuts import render
from django import forms

from django.core.urlresolvers import reverse

from django.http import HttpResponseRedirect
from django.db import models

def home(request):
        return render(request, 'index.html')

def notFound(request):
    return render(request, '404.html')