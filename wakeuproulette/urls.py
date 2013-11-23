from django.conf.urls import patterns, include, url
from wakeup import views
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.home, name='home'),
    url(r'^alarm/', views.setAlarm, name='alarm'),
    url(r'start/', views.startRoulette, name='start'),

    # Serving Calls
    url(r'^wakeuprequest/(?P<schedule>.+)$', views.wakeUpRequest, name='wakeup'),
    url(r'^answercallback/(?P<schedule>.+)$', views.answerCallback, name='answer-callback'),
    url(r'^privaterequest/(?P<schedule>.+)$', views.sendToPrivateRoom, name='private-room'),
    url(r'^ratingrequest/(?P<confname>.+)$', views.ratingRequest, name='rating-request'),
    url(r'^recordingrequest/(?P<confname>.+)$', views.recordingRequest, name='recording-request'),
    # Handling fallback errors
    url(r'^fallback/(?P<confname>.+)$', views.fallbackRequest, name='fallback'),

    #    url(r'newsletter/', views.newsletter, name='newsletter'),
    url(r'beta/', views.beta, name='beta'),

    url(r'survey/', views.survey, name='survey'),

    #    Handling responses
    url(r'callfeedback/(?P<conf>.+)$', views.processCallFeedback, name='callfeedback'),
    url(r'sms/', views.processSMS, name='sms'),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('accounts.urls')),
)

urlpatterns += patterns('',
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
)

urlpatterns += patterns(''
    , url(r'^.*/', views.notFound, name='notFound')
)
