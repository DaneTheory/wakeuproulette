from django.conf.urls import patterns, include, url
from wakeup import views
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.home, name='home'),

    # Serving Calls
    url(r'^wakeuprequest/(?P<schedule>.+)$', views.wakeUpRequest, name='wakeup'),
    url(r'^answercallback/(?P<schedule>.+)$', views.answerCallback, name='answer'),
    url(r'^privaterequest/(?P<schedule>.+)$', views.sendToPrivateRoom, name='private'),
    url(r'^ratingrequest/(?P<schedule>.+)$', views.ratingRequest, name='rating'),
    url(r'^anymatchrequest/(?P<schedule>.+)$', views.tryAnyMatch, name='anymatch'),
    url(r'^finishrequest/(?P<schedule>.+)$', views.finishRequest, name='finish'),

    url(r'^waitingrequest/(?P<username>.*)$', views.waitingRequest, name='waiting'),
    # Handling fallback errors
    url(r'^fallback/(?P<schedule>.+)$', views.fallbackRequest, name='fallback'),

    # Handling Incoming Calls and Text messages
#    url(r'^call/initial/', views.callInitial, name='call'),
#    url(r'^call/register/', views.callRegister, name='call'),
#    url(r'^call/setup/', views.callSetup, name='call'),

    #    url(r'newsletter/', views.newsletter, name='newsletter'),
    url(r'^sharedwakeup/(?P<shareid>\d+)/$', views.shared_wakeup, name='shared_wakeup'),
    url(r'^beta/', views.beta, name='beta'),
    url(r'^dayrun/', views.eveningRoulette, name='evening' ),
    url(r'^evening/', views.eveningRoulette, name='evening' ),

    url(r'^survey/', views.survey, name='survey'),

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
