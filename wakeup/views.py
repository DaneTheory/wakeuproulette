from django.shortcuts import render, render_to_response, redirect
from django.core.urlresolvers import reverse
from django import forms
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User
from models import Conference, Call, Recording, RecordingShare, WakeUp
from django.core.management import call_command
from django.db import transaction
from twilio.rest import TwilioRestClient
from django.conf import settings
import datetime
from accounts.models import UserProfile
from django.utils import timezone
import os
from wakeup.tools.toolbox import local_date, local_time

from django.contrib.auth.decorators import login_required
from userena.decorators import secure_required
from accounts.decorators import active_required

from wakeup.tools.toolbox import send_async_mail, call_async

import logging
logger = logging.getLogger(__name__)

############# PROD - DO NOT MODIFY #################
if settings.PROD:
    # These are the settings that will be used in PROD
    # For testing please modify the variables below
    CALL_LIMIT = 60
    WELCOME_LIMIT = 10
    HOLD_LIMIT = 20
    TIMEOUT = 20

    WAITING_ROOM_MAX = 4

    RE_DIAL_LIMIT = 5
    REDIRECT_LIMIT = 3
    RATING_LIMIT = 3

    CONFERENCE_SCHEDULE_DELIMITER = ':'

    # Rating given to users that are reported
    USER_REPORT_RATING = -5

############# DEV - Feel free to make changes #################
else:
# These are the settings that will be used in PROD
    # For testing please modify the variables below
    CALL_LIMIT = 60
    WELCOME_LIMIT = 5
    HOLD_LIMIT = 5
    TIMEOUT = 20

    WAITING_ROOM_MAX = 4

    RE_DIAL_LIMIT = 5
    REDIRECT_LIMIT = 1
    RATING_LIMIT = 3

    CONFERENCE_SCHEDULE_DELIMITER = ':'

    # Rating given to users that are reported
    USER_REPORT_RATING = -5



@transaction.commit_manually
def flush_transaction():
    transaction.commit()

def home(request):

    if not request.user.is_authenticated() or not request.user.profile.is_verified():
        return render(request, 'index.html')

    else:
        data = {}
        data['shares'] = RecordingShare.query_list(request.GET, request)
        data['recordings'] = Recording.objects.filter(call__user=request.user)
        return render(request, 'main_feed.html', data)

def as_date(schedule):
    return datetime.datetime.strptime(schedule, "%d:%m:%y:%H:%M:%S")

def find_match(schedule, call):
    logger.debug("Finding match for: " + call.user.username)

    # Refresh Database Changes
    flush_transaction()
    # TODO Now we are only comparing opposite gender - we need to add functionality to match by anything
    allmatches = Call.objects.filter(datecreated=as_date(schedule), answered=True, matched=False, completed=False, user__profile__activated=True).exclude(user=call.user)

    # Gender matching
    any_match_q = Q(user__profile__any_match=True)
    male_match_q = Q(user__profile__malematch=True)
    female_match_q = Q(user__profile__femalematch=True)
    if not call.user.profile.any_match:
        if call.user.profile.malematch == True and call.user.profile.femalematch == False:
            allmatches = allmatches.filter(user__profile__gender='M')
        elif call.user.profile.malematch == False and call.user.profile.femalematch == True:
            allmatches = allmatches.filter(user__profile__gender='F')
        elif call.user.profile.malematch == False and call.user.profile.femalematch == False:
            allmatches = allmatches.empty()
    if call.user.profile.gender == 'M':
        allmatches = allmatches.filter(any_match_q | male_match_q)
    else:
        allmatches = allmatches.filter(any_match_q | female_match_q)

    # Ordering
    allmatches = allmatches.order_by('?')

    logger.debug("Matches found are: " + str(allmatches))

    if allmatches:
        return allmatches[0]
    else:
        return None


def get_call_or_none(schedule, phone):
    try:
        # Refresh Database Changes
        flush_transaction()
        return Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)

    # Catch Exeption caused for a call not existing and return None
    except Exception:
        return None

def get_active_waiting_room(schedule):
    dateSchedule = as_date(schedule)
    # Refreshing database
    flush_transaction()
    try:
        allWaitingRooms = Conference.objects.filter(datecreated=dateSchedule, maxcapacity=WAITING_ROOM_MAX)
        logger.debug("All waiting rooms: " + str(allWaitingRooms))

        # Find free waiting room
        for waiting in allWaitingRooms:
            if waiting.available():
                logger.debug("Waiting room chosen: " + str(waiting.pk))
                return waiting

    # No free waiting rooms so create one
    except Conference.DoesNotExist:
        pass # None found, so create one

    waiting = Conference()
    waiting.datecreated = dateSchedule
    waiting.maxcapacity = WAITING_ROOM_MAX
    waiting.save()
    return waiting


def send_to_conference_room(call, schedule, match, initial=False):

    # Check if the match is still on the phone - if not, mark match as not completed and try to find him a match
    flush_transaction()
    match.reload()
    if match.completed:
        call.matched = False
        call.save()
        return None

    say = "We have found you a match! You are now connected with " + match.user.username + "! Press Star if you wish to end the conversation immediately and rate your wake up buddy."
    return render_to_response("twilioresponse.xml", {     'say' :say
                                                        , 'confname' : call.conference.pk
                                                        , 'timelimit' : CALL_LIMIT
                                                        , 'finishrequest' : schedule
                                                        , 'hanguponstar' : True
                                                        , 'record' : not initial
                                                        , 'beep' : True
                                                        , 'waiturl' : '/waitingrequest/' + (call.user.username if initial else "")
                                                    })

def send_to_waiting_room(timelimit, schedule, username, gather=None, say=None):
    print "Sending to conference room", username, "with schedule", schedule
    return render_to_response("twilioresponse.xml", { 'say' :say
                                                    , 'gather' : gather
                                                    , 'wakeuprequest' : schedule
                                                    , 'confname' : username
                                                    , 'timelimit' : timelimit
                                                    , 'record' : False
                                                    , 'waiturl' : '/waitingrequest/' + username
                                                    , 'beep' : False })

# TODO Ensure mutually exclusive transactions - once there was a deadlock, idk why
# This method needs to be atomic
@transaction.commit_on_success
def match_or_send_to_waiting_room(call, schedule):

    # Refreshing database object
    flush_transaction()
    call.reload()

    if call.matched:
        other = call.conference.call_set.exclude(pk=call.pk)[0]
        data = send_to_conference_room(call, schedule, other, initial=False)

        if data: return data


    matchcall = find_match(schedule, call)
    if matchcall:
        conf = Conference()
        conf.maxcapacity = 2
        conf.datecreated = as_date(schedule)
        conf.save()

        call.conference = conf
        call.matched = True
        call.save()

        matchcall.conference = conf
        matchcall.matched = True
        matchcall.save()

        data = send_to_conference_room(call, schedule, matchcall, initial=True)
        if data: return data

    if call.user.profile.any_match:
        call.user.profile.any_match = False
        call.user.profile.save()

        return render_to_response("twilioresponse.xml", { 'say' :"We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day!",
                                                          'hangup' : True })
    #Check if we have exceeded the waiting redirect limits
    elif call.retries >= REDIRECT_LIMIT:
        # The user has reached the limit of redials, so hang up
        logger.debug("LIMIT RETRIES - Ask to try to match with any person")
        any_match = "We could not find any matches. If you'd like us to try to match you with Anyone please press any number now."
        goodbye = "We wish you an Amazing day! Good bye!"
        return render_to_response("twilioresponse.xml", { 'any_match' :any_match, 'schedule': schedule, 'hangup': True, 'goodbye' : goodbye })

    call.retries = call.retries + 1
    call.save()

    # Send user to private conference (Conferencename=Username) or send them to the waiting room they were at
    return send_to_waiting_room(  HOLD_LIMIT
                                    , schedule
                                    , call.user.username
                                    , False
                                    , "Please bare with us - we'll find the best match for you!")

@csrf_exempt
def wakeUpRequest(request, schedule):
    # Removing any trailing '/'
    schedule = schedule.replace("/", "")

    post = request.POST

    logger.info("REQUEST - WAKE UP REQUEST - " + schedule + " - " + post['CallStatus'] + " " + post['To'])

    phone = post['To']

    call = get_call_or_none(schedule, phone)

    # Check that call has been created
    if not call:
        logger.error("[Error in WakeUpRequest - " + schedule + " - "+phone+"] Call does not exist!")

        say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day!"
        data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })

    elif 'AnsweredBy' in post and post['AnsweredBy'] == 'human' and post['CallStatus'] == 'in-progress':
        data = None

        # If user is currently waiting
        if 'DialCallStatus' in post and post['DialCallStatus'] == 'answered':
            logger.debug("Wake Up Request: " + call.user.username + " - Awake and Waiting.")

            data = match_or_send_to_waiting_room(call, schedule)

        # Else, person has just woken up
        else:
            logger.debug("Wake Up Request: " + call.user.username + " just woke up.")

            # TODO Evaluate this: Right now we're avoiding waiting rooms as people found them confusing, but we might implement them again later
#            waiting = get_active_waiting_room(schedule)
#            call.conference = waiting

            # Setting the redials to zero - we'll use this count to limit the waiting time
            call.retries = 0
            call.matched = False
            call.answered = True
            call.save()

            # Mark user as awake so he doesn't get any more snoozes
            #call.user.profile.alarmon = False
            #call.user.profile.save()

            data = send_to_waiting_room(  WELCOME_LIMIT
                                        , schedule
                                        , call.user.username
                                        , "Welcome to Wake Up Roulette! We'll connect you with an awesome Person!")

        print '\n'

    else:
        logger.error("Something unexpected happened for user "+ call.user.username +". Check what was it: " + str(post))
        data = render_to_response("twilioresponse.xml")

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def answerCallback(request, schedule):
    post = request.POST
    phone = post.get('To')


    logger.info("REQUEST - ANSWER CALLBACK - " + schedule + " - " + post['CallStatus'] + " " + post['To'])
    if 'CallDuration' in post: logger.debug('CallDuration: ' + post['CallDuration'])
    if 'AnsweredBy' in post: logger.debug("AnsweredBy: " + post['AnsweredBy'])
    if 'DialCallStatus' in post: logger.debug("DialCallStatus: " + post['DialCallStatus'])
    if 'RecordingUrl' in post:
        logger.debug("Recoding URL: " + post['RecordingUrl'])
        logger.debug("Recording Duration: " + post['RecordingDuration'])


    call = get_call_or_none(schedule, phone)

    if not call:
        logger.error("[Error in Answer Callback - " + schedule + " - "+phone+"] Call does not exist!")
        data = render_to_response("twilioresponse.xml")

    # Call has been completed
    elif post['CallStatus'] == 'completed' and post['AnsweredBy'] == 'human':
        logger.info("CALL COMPLETED - "+schedule + " - User: " + call.user.username + " Answered: " + str(call.answered) + " Matched: " + str(call.matched))
        logger.info(post)

        # Resetting all wakeup flags
        call.retries = 0
        call.completed = True
        if 'CallDuration' in post: call.callduration = post['CallDuration']
        call.save()

        if call.conference:
            conf = call.conference.call_set

            logger.debug("Call set for conference: " + str(conf))
        else:
            logger.debug("Call had no conference.")

        data = render_to_response("twilioresponse.xml")

    # This is the case when post['CallStatus'] == 'no-answer' or post['CallStatus'] == 'busy' or post['CallStatus'] == 'failed' or post['AnsweredBy'] == 'machine'
    elif not call.answered:
        # Make sure that number of re-dials has not been exceeded
        if call.retries >= RE_DIAL_LIMIT:
            logger.debug("Answer Callback: LIMIT REDIALS. HANGING UP...")

            data = render_to_response("twilioresponse.xml")

            # Check the call status - if it says failed, it is most probably because the phone number doesn't exist or there is no signal
            if post['CallStatus'] == 'failed':
                call.errorcode = "cfail"

                logger.error("Call Failed! Reporting"+call.user.username+". Phone: "+ phone )
                msg = "CallStatus: Failed\n"
                msg += "Phone: " + phone + "\n"
                msg += "Probably Number Doesn't Exist"

                send_async_mail("WUR Fallback", msg, "wakeuproulette@gmail.com", zip(*settings.ADMINS)[1], True)

            # Re-setting redial count
            call.retries = 0
            call.completed = True
            call.save()

        elif not call.answered:
            logger.debug("REDIALING - Retries: " + str(call.retries) + " User: " + call.user.username + " Phone: " + phone)

            confurl = settings.WEB_ROOT + 'wakeuprequest/' + schedule
            noanswerurl = settings.WEB_ROOT + 'answercallback/' + schedule
            fallbackurl = settings.WEB_ROOT + 'fallback/' + schedule

            call_async(phone, confurl, fallbackurl, noanswerurl)

            call.retries = call.retries + 1
            call.save()

        data = render_to_response("twilioresponse.xml")

    # This else means that the user has answered already and there is no reason to call again
    else:
        logger.warning(call.user.username + " was called when he already answered " + str(call.answered) + " POST: " + str(post))
        data = render_to_response("twilioresponse.xml")

    print '\n'
    return HttpResponse(data, mimetype="application/xml")


@csrf_exempt
def tryAnyMatch(request, schedule):

    schedule = schedule.replace("/", "")
    post = request.POST
    phone = post['To']

    logger.info("REQUEST - ANY MATCH - " + schedule + " - " + post['CallStatus'] + " " + phone)

    call = get_call_or_none(schedule, phone)
    call.user.profile.any_match = True
    call.user.profile.save()
    call.retries = 0
    call.save()
    data = send_to_waiting_room(  HOLD_LIMIT
                                , schedule
                                , call.user.username
                                , False
                                , "We'll try to find you an awesome person!")

    return HttpResponse(data, mimetype="application/xml")



@csrf_exempt
def sendToPrivateRoom(request, schedule):
    post = request.POST

    phone = post['To']

    logger.info("REQUEST - PRIVATE ROOM - " + schedule + " - " + post['CallStatus'] + " " + phone)

    call = get_call_or_none(schedule, phone)


    if not call:
        logger.error("[Error in Send To Private Room - " + schedule + " - "+phone+"] Call does not exist!")

        say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!"
        data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })

    # Call has been matched, so just send him to the waiting room - when he comes back, he'll be set up with his other caller
    if call.matched:
        data = send_to_waiting_room(  HOLD_LIMIT
                                    , schedule
                                    , call.user.username
                                    , False
                                    , "We'll send you to a private room while we connect you with an awesome person!")

    else:
        call.conference = None
        call.user.profile.roomdesired = True

        call.save()
        call.user.profile.save()

        data = send_to_waiting_room(  HOLD_LIMIT
                                    , schedule
                                    , call.user.username
                                    , False
                                    , "We'll send you to a private room while we connect you with an awesome person!")


    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def ratingRequest(request, schedule):
    post = request.POST

    phone = post['To']


    logger.info("REQUEST - RATING - " + schedule + " - " + post['CallStatus'] + " - " + phone)

    call = get_call_or_none(schedule,phone)

    goodbye = "Thank you for your rating! We hope you had a great time! See you soon!"
    rating = ""
    gatherurl = ""

    try:
        othercall = call.conference.call_set.exclude(pk=call.pk)[0]

        digit = post['Digits']

        # Request contact
        if digit == '1':
            logger.debug(call.user.username + " has requested connection to " + othercall.user.username + " plus thumbs up")
            call.user.profile.request_contact(othercall.user)
        # Thumbs up:
        if digit == '1' or digit == '2':
            logger.debug(call.user.username + " gave +1 reputation to "+ othercall.user.username)
            othercall.user.profile.reputation = othercall.user.profile.reputation + 1
            othercall.user.profile.save()

            call.rated = True
            call.save()

            othercall.rating = 1
            othercall.save()
        # Thumbs down:
        elif digit == '3':
            logger.debug(call.user.username + " gave -1 reputation to "+ othercall.user.username)
            othercall.user.profile.reputation = othercall.user.profile.reputation - 1
            othercall.user.profile.save()

            call.rated = True
            call.save()

            othercall.rating = -1
            othercall.save()
        # Reported
        elif digit == '0':
            goodbye =  othercall.user.username + " has been reported. We apologize in behalf of your wake up buddy! Please contact us if you need anything! Wish you a great day!"
            othercall.user.profile.reputation = othercall.user.profile.reputation + USER_REPORT_RATING
            othercall.user.profile.save()

            othercall.rating = USER_REPORT_RATING
            othercall.save()

            call.rated = True
            call.save()

            msg = "User: " + call.user.username + "\r\n"
            msg += "Reported: " + othercall.user.username + "\r\n"
            msg += "Schedule: " + schedule + "\r\n"

            # Reporting to admins
            logger.warning(call.user.username + " has reported "+ othercall.user.username + " CallID: " + str(call.id))
            send_async_mail("USER REPORTED",msg, "hackasoton@gmail.com", zip(*settings.ADMINS)[1], True)
        else:

            logger.debug("Incorrect number, user pressed" + str(digit))

            # Check if number of rating retries has not exceeded
            if call.retries < RATING_LIMIT:
                call.retries = call.retries + 1
                call.save()

                gatherurl = schedule
                rating = "We're sorry, we didn't get that! To connect press One. For thumbs up press Two. For thumbs down press three. To report, please press ZERO."

        data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                            , 'rating' : rating
                                                            , 'ratingurl' : gatherurl
                                                            , 'goodbye' : goodbye
                                                        })
    # TODO Exceptions caught include a digit not found in POST, as well as Call not found, but reporting could be included, and it shoudl be handled somehow when Call doesn't exist
    except Exception:
        logger.error("ERROR - CONFERENCE SHOULD EXIST. [In Rating Request. CallID: " + str(call.id) + "]")
        data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                            , 'goodbye' : goodbye
                                                        })

    return HttpResponse(data, mimetype="application/xml")

# TODO Make sure that there are no bugs due to not locking this function for transactions
@csrf_exempt
def finishRequest(request, schedule):

    post = request.POST

    # Refresh Database Changes
    flush_transaction()
    phone = post.get('To')
    rURL = post.get('RecordingUrl')
    rDuration = post.get('RecordingDuration')


    logger.info("REQUEST - FINISH - " + schedule + " - " + post['CallStatus'] + " - " + phone)

    call = get_call_or_none(schedule, phone)

    if not call:
        logger.error("[Error in Finish Request - " + schedule + " - "+phone+"] Call does not exist!")

    else:
        # TODO: Test this
        # For info on how Recording privacy is handled check out https://docs.google.com/document/d/1LkKosw9-EMtIkx9Y5f0AxTAA418KHbJ2eTWbPOGrgoc/edit
#            try:
        # If other caller doesn't exist, throw Exeption and don't store Recording object
        callOther = call.conference.call_set.exclude(pk=call.pk)[0]


        # Check for recording
        if not rURL or not rDuration:
            # TODO Handle this error, as this it twilio error [Log]
            logger.error("[Error in Finish Request - " + schedule + " - "+phone+"] No recording in Twilio POST!" )


        # Create the recording if it doesn't exists, otherwise, update the recording values
        # If there are no recordings created for the other user we proceed to create a new recording with this values just in case that
        # the other user experiences an error when getting and storing the recordings from the post request

        recording = call.recording or callOther.recording or Recording()

        recording.recordingurl = rURL if rURL else ""
        recording.recordingduration = rDuration if rDuration else 0
        recording.datecreated = as_date(schedule)
        recording.call = call
        recording.save()

        call.recording = recording
        callOther.recording = recording

        call.save()
        callOther.save()

    # Setting retries to zero to limit the number of rating retries
    call.retries = 0
    call.save()

    rating = "Please rate your Wake Up Buddy Now! If you'd like to connect with " + callOther.user.username +" press one. To give "+callOther.user.profile.g("him","her")+" a thumbs up, press two. Otherwise, to give "+callOther.user.profile.g("him","her")+" thumbs down press Three. To report "+callOther.user.profile.g("him","her")+" press ZERO.! . ! . !"
    rating += "We're sorry, we didn't quite get that. To connect press One. For thumbs up press Two. For thumbs down press three. To report, please press ZERO."
    goodbye = "We hope you had a great time! See you soon!"
    data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                        , 'goodbye' : goodbye
                                                        , 'rating' : rating
                                                        , 'ratingurl' : schedule
                                                    })

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def fallbackRequest(request, schedule):
    logger.error("UNEXPECTED FALLBACK!")

    post = request.POST

    phone = post.get('To')
    errorURL = post.get('ErrorURL')
    errorCode = post.get('ErrorCode')

    # Send async text message to admins to report error
    msg = ""
    if phone:
        print "Phone:", phone
        msg += "Phone: " + phone + "\n"
        # Save error in call

        call = get_call_or_none(schedule, phone)
        if call:
            call.completed = True
            if errorCode: call.errorcode = errorCode
            else: call.errorCode = '00000'
            msg += "User: " + call.user.username + "\n"
            call.save()
        else:
            print "Call not found"
            msg += "Call Not Found\n"
    if errorURL:
        print "ErrorURL:", errorURL
        msg += "ErrorURL:" + errorURL + "\n"
    if errorCode:
        print "ErrorCode:", errorCode
        msg += "ErrorCode: " + errorCode + "\n"
#    send_async_mail("WUR Fallback", msg, "", zip(*settings.ADMINS)[1], True)

    # Error Code means HTTP Failure, or no response - this could be due to a transaction deadlock, or just bad traffic - just try again
#    if errorCode == '11205':
#        # TODO  This is repeated code, maybe create a function form the code that sends the person to the waiting room
#        #Check if we have exceeded the waiting redirect limits
#        if call.retries > REDIRECT_LIMIT:
#            # The user has reached the limit of redials, so hang up
#            print "WAITING LIMIT DONE - HANGING UP NAO"
#            say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!"
#            data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })
#        else:
#            print "FINDING MATCH"
#            call.retries = call.retries + 1
#            call.save()
#            data = match_or_send_to_waiting_room(call, schedule)
#    else:
    goodbye = "We are very sorry, something unexpected happened! This has been reported and will be handled immediately. Feel free to contact the Wake Up Roulette Team! We'd love to hear from you!"
    data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                        , 'goodbye' : goodbye
                                                    })
    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def waitingRequest(request, username):
    params = {}
    logger.info("[WAITING REQUEST] Username: " + username)

    try:
        if not username: raise UserProfile.DoesNotExist

        u = UserProfile.objects.get(user__username=username)

    except UserProfile.DoesNotExist:
        params['say'] = "Oh no! We just noticed that your WakeUp buddy hung up or got disconnected, please press star to proceed to the rating."

    params['song'] = '/media/mp3/evenings-babe.mp3'

    data = render_to_response("waitingresponse.xml",params)
    return HttpResponse(data, mimetype="application/xml")

@login_required
@secure_required
@active_required
def eveningRoulette(request):

    number_of_evenings = 12
    now_server = timezone.now()
    local_now = local_date(now_server, request)
    now_schedule = now_server.replace(minute=0, second=0, microsecond=0)

    evenings = []

    for time in xrange(number_of_evenings):
        now_schedule = now_schedule + datetime.timedelta(seconds=60*60)

        active_alarm = UserProfile.objects.filter(alarmon=True, alarm=now_schedule.time()).count()

        local_schedule = local_date(now_schedule, request)

        evening = {
              'server_time' : now_schedule
            , 'local_time' : local_schedule
            , 'subscribed' : WakeUp.objects.filter(user=request.user, schedule=now_schedule).exists()
            , 'active_count' : active_alarm
        }

        evenings.append(evening)


    recordings = Recording.objects.filter(call__user=request.user)

    print evenings
    return render(request, 'eveningroulette.html', {'evenings': evenings, 'recordings': recordings })


def shared_wakeup(request, shareid):
    share = None

    try:
        share = RecordingShare.objects.get(id=shareid)
    except RecordingShare.DoesNotExist:
        pass

    print share

    return render(request, 'share_page.html', { 'share': share })


class AlarmForm(forms.Form):
    alarm = forms.TimeField()
    alarmon = forms.CheckboxInput()

def survey(request):
    return render(request, 'survey.html')

def beta(request):
    return render(request, 'beta.html')

def notFound(request):
    return render(request, '404.html')





## Handling incoming calls
#@csrf_exempt
#def callInitial(request):
#    gatherurl = "/call/register/"
#    gather =        "Welcome to WakeUpRoulette! If you'd like to register to this awesome service and join this new awesome way of waking up, please press any number now. "
#    +   "I'm sorry, I didn't get that. If you'd like to register to this awesome service and join this new awesome way of waking up, please press any number now. "
#    +   "If you'd like more information before registering, please check out www.wakeuproulette.com."
#    +   "Wish you an awesome day. Good bye!"
#    data = render_to_response("callresponse.xml", {     'gatherurl': gatherurl,
#                                                        'gather' : gather})
#    return HttpResponse(data, mimetype="application/xml")
#
#@csrf_exempt
#def callRegister(request):



