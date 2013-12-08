# Django settings for wakeuproulette project.

import os
#Getting Project Root
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT =  '/'.join(PROJECT_ROOT.split('/')[0:-1])

# Check if we are running Locally or in production server
## (ubuntu is when the server is ran normally - i.e. python manage.py shell
##   root is for sudo to run on port 80 in the server)
#if os.environ['USER'] == 'ubuntu' or os.environ['USER'] == 'root':
#    PROD = True
#else:
#    PROD = False

# Too many issues - until we know a reliable way, this will have to be manual:
PROD = False

if PROD:
    WEB_ROOT = "http://wakeuproulette.com/"
    ALLOWED_HOSTS = [".wakeuproulette.com"]
    DEBUG = False

# If app is not in production it will use the following web root, please modify it as required:
else:
    WEB_ROOT = "http://65038fc5.ngrok.com/"




DEBUG = not PROD
TEMPLATE_DEBUG = DEBUG

#USERENA OVERRIDE SETTINGS
USERENA_REDIRECT_ON_SIGNOUT = '/'
USERENA_SIGNIN_REDIRECT_URL = '/'
USERENA_SIGNIN_AFTER_SIGNUP = True
USERENA_ACTIVATION_DAYS = 30
USERENA_ACTIVATION_NOTIFY = False
USERENA_ACTIVATION_REQUIRED = False
USERENA_HIDE_EMAIL = False
USERENA_DISABLE_PROFILE_LIST = True
USERENA_MUGSHOT_SIZE = 200
USERENA_DEFAULT_PRIVACY = 'closed'
#USERENA_MUGSHOT_PATH = os.path.abspath(os.path.join(PROJECT_ROOT, "..", "WakeUpRouletteMugshots"))


ADMINS = (
    ('Alejandro Saucedo', 'axsauze@gmail.com'),
    ('Alejandro (Mobile)', '447926925347@mmail.co.uk'),
    ('Anton Smyrnov', 'as8g10@soton.ac.uk'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'wakeupdb',                      # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': 'wakeup',
        'PASSWORD': 'wakeup',
        'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '',                      # Set to empty string for default.
    }
}


# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Europe/London'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = PROJECT_ROOT + '/templates/media/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '^--!*rux&17c(z_-slkc(axld%us!$=$37$5tcob4gg^(8hv2k'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'wakeuproulette.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'wakeuproulette.wsgi.application'

TEMPLATE_DIRS = (
        os.path.join(PROJECT_ROOT, 'templates').replace('\\','/'),
    )

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    #Admin
    'django.contrib.admin',

    #Userena
    'userena',
    'guardian',
    'easy_thumbnails',
    'accounts',

    #Databases
    'south',

    #App
    'wakeup'
)

#USED FOR USERENA AND GUARDIAN
AUTHENTICATION_BACKENDS = (
    'userena.backends.UserenaAuthenticationBackend',
    'guardian.backends.ObjectPermissionBackend',
    'django.contrib.auth.backends.ModelBackend',
    )

ANONYMOUS_USER_ID = -1

#OVERRIDING AUTH METHODS
AUTH_PROFILE_MODULE = 'accounts.UserProfile'

LOGIN_REDIRECT_URL = '/accounts/%(username)s/'
LOGIN_URL = '/accounts/signin/'
LOGOUT_URL = '/accounts/signout/'
#OVERRIDING AUTH METHODS

#Use email
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'wakeuproulette@gmail.com'
EMAIL_HOST_PASSWORD = 'wakeup!!'


LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format' : "[%(asctime)s] %(levelname)s [%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
        },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
            },
        'logfile': {
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename': PROJECT_ROOT + "/logs/wakeup.log",
            'maxBytes': 50000,
            'backupCount': 2,
            'formatter': 'standard',
            },
        'console':{
            'level':'INFO',
            'class':'logging.StreamHandler',
            'formatter': 'standard'
        },
    },
    'loggers': {
        'django': {
            'handlers':['console'],
            'propagate': True,
            'level':'WARN',
            },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
            },
        'wakeup': {
            'handlers': ['console', 'logfile'],
            'level': 'DEBUG',
        },
    }
}

#LOGGING = {
#    'version': 1,
#    'disable_existing_loggers': True,
#    'formatters': {
#        'standard': {
#            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
#        },
#    },
#    'handlers': {
#        'wakeup_handler': {
#            'level':'DEBUG',
#            'class':'logging.handlers.RotatingFileHandler',
#            'filename': 'logs/wakeup.log',
#            'maxBytes': 1024*1024*5, # 5 MB
#            'backupCount': 5,
#            'formatter':'standard',
#            },
#    },
#    'loggers': {
#        'wakeup': {
#            'handlers': ['wakeup_handler'],
#            'level': 'DEBUG',
#            'propagate': True
#        },
#    }
#}


TEMPLATE_CONTEXT_PROCESSORS=(
      "django.core.context_processors.request"
    , "django.contrib.auth.context_processors.auth"
    , "wakeup.context_processors.in_prod"
)
