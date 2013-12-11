from django.conf.urls.defaults import *
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from accounts.views import WakeUpSignupForm
from django.views.generic.base import RedirectView
from django.core.urlresolvers import reverse

from accounts import views as account_views
from accounts import ajax as account_ajax
from userena import settings as userena_settings

urlpatterns = patterns('',

    url(r'^set_evening/$', account_ajax.set_evening, name='set_evening'),
    url(r'^accept_request/$', account_ajax.accept_request, name='accept_request'),
    url(r'^ignore_request/$', account_ajax.ignore_request, name='ignore_request'),
    url(r'^connect_gender/$', account_ajax.connect_gender, name='connect_gender'),
    url(r'^increment_share_aura/$', account_ajax.increment_share_aura, name='increment_share_aura'),
    url(r'^increment_rec_rewake/$', account_ajax.increment_rec_rewake, name='increment_rec_rewake'),
    url(r'^increment_rec_play/$', account_ajax.increment_rec_play, name='increment_rec_play'),
    url(r'^insert_comment/$', account_ajax.insert_comment, name='insert_comment'),
    url(r'^set_alarm/$', account_ajax.set_alarm, name='set_alarm'),
    url(r'^share_recording/$', account_ajax.share_recording, name='share_recording'),
    url(r'^add_contact/$', account_ajax.add_contact, name='add_contact'),
    url(r'^set_timezone/$', account_ajax.set_timezone, name='set_timezone'),
    url(r'^load_shares/$', account_ajax.load_shares, name='load_shares'),
    url(r'^set_recurrent/$', account_ajax.set_recurrent, name='set_recurrent'),
    # View Profiles
    url(r'^dashboard/(?P<command>[\.\w-]*)$', account_views.wakeup_dashboard, name='wakeup_call_dashboard'),
    url(r'^public/(?P<username>[\.\w-]+)/$', account_views.wakeup_public, name='wake_up_public'),
    url(r'^sms_verify/$', account_views.sms_verify, name='sms_verify'),
    url(r'^not_activated/$', account_views.not_activated, name='not_activated'),
                
    # Signup, signin and signout
    url(r'^signup/$',
        account_views.signup,
        {'signup_form': WakeUpSignupForm }
        , name='userena_signup'),
#    url(r'^signup/$', RedirectView.as_view(url='/beta', permanent=False), name='beta'),
    url(r'^signin/$',
        account_views.signin,
        name='userena_signin'),
    url(r'^signout/$',
        account_views.signout,
        name='userena_signout'),

    # Reset password
    url(r'^password/reset/$',
        auth_views.password_reset,
        {'template_name': 'userena/password_reset_form.html',
         'email_template_name': 'userena/emails/password_reset_message.txt'},
        name='userena_password_reset'),
    url(r'^password/reset/done/$',
        auth_views.password_reset_done,
        {'template_name': 'userena/password_reset_done.html'},
        name='userena_password_reset_done'),
    url(r'^password/reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$',
        auth_views.password_reset_confirm,
        {'template_name': 'userena/password_reset_confirm_form.html'},
        name='userena_password_reset_confirm'),
    url(r'^password/reset/confirm/complete/$',
        auth_views.password_reset_complete,
        {'template_name': 'userena/password_reset_complete.html'}),

    # Signup
    url(r'^(?P<username>[\.\w-]+)/signup/complete/$',
        account_views.direct_to_user_template,
        {'template_name': 'userena/signup_complete.html',
         'extra_context': {'userena_activation_required': userena_settings.USERENA_ACTIVATION_REQUIRED,
                           'userena_activation_days': userena_settings.USERENA_ACTIVATION_DAYS}},
        name='userena_signup_complete'),

    # Activate
    url(r'^activate/(?P<activation_key>\w+)/$',
        account_views.activate,
        name='userena_activate'),

    # Change email and confirm it
    url(r'^(?P<username>[\.\w-]+)/email/$',
        account_views.email_change,
        name='userena_email_change'),
    url(r'^(?P<username>[\.\w-]+)/email/complete/$',
        account_views.direct_to_user_template,
        {'template_name': 'userena/email_change_complete.html'},
        name='userena_email_change_complete'),
    url(r'^(?P<username>[\.\w-]+)/confirm-email/complete/$',
        account_views.direct_to_user_template,
        {'template_name': 'userena/email_confirm_complete.html'},
        name='userena_email_confirm_complete'),
    url(r'^confirm-email/(?P<confirmation_key>\w+)/$',
        account_views.email_confirm,
        name='userena_email_confirm'),

    # Disabled account
    url(r'^(?P<username>[\.\w-]+)/disabled/$',
        account_views.direct_to_user_template,
        {'template_name': 'userena/disabled.html'},
        name='userena_disabled'),

    # Change password
    url(r'^(?P<username>[\.\w-]+)/password/$',
        account_views.password_change,
        name='userena_password_change'),
    url(r'^(?P<username>[\.\w-]+)/password/complete/$',
        account_views.direct_to_user_template,
        {'template_name': 'userena/password_complete.html'},
        name='userena_password_change_complete'),

    # Edit profile
    url(r'^edit/$',
        account_views.profile_edit,
        name='userena_profile_edit'),

    # View profiles
    url(r'^(?P<username>(?!signout|signup|signin)[\.\w-]+)/$',
        account_views.profile_detail,
        name='userena_profile_detail'),
    url(r'^page/(?P<page>[0-9]+)/$',
        account_views.ProfileListView.as_view(),
        name='userena_profile_list_paginated'),

    # WAKEUPROULETTE
                              

    # Uncomment this if we want to see full profile list - however all users are currently private so there is no use
#    url(r'^$',
#        account_views.ProfileListView.as_view(),
#        name='userena_profile_list'),
)
