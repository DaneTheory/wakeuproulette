from django.conf.urls import patterns, include, url
from wakeup import views
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.home, name='home'),
    url(r'^alarm/', views.setAlarm, name='alarm'),
    url(r'^conf/(?P<confname>.+)$', views.serveConference, name='conference'),
    url(r'start/', views.startRoulette, name='start'),
    url(r'newsletter/', views.newsletter, name='newsletter'),

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
