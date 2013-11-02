from django.conf.urls import patterns, include, url
from wakeup import views

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.home, name='home'),
    url(r'^wakeuproulette/', include('wakeuproulette.urls')),

    url(r'^admin/', include(admin.site.urls)),
)


urlpatterns += patterns(''
    , url(r'^.*/', views.notFound, name='notFound')
)
