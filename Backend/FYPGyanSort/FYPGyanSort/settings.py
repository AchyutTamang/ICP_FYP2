from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')
# SECRET_KEY="django-insecure-f-y6g*dt&7nd$q8kuji8g^o#8*6r*kcwknc7fcu%h680=+ae@*"
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'jet',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
]

EXTERNAL_APPS =[
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'students',
    'instructors',
    'courses',
    'payments',
    'cart',
    'forums',    
    
]

INSTALLED_APPS += EXTERNAL_APPS  # Now INSTALLED_APPS contains both internal and external apps


 
AUTH_USER_MODEL = "students.Student"

 
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'FYPGyanSort.authentication.CustomJWTAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  
    'django.middleware.common.CommonMiddleware'
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React frontend
    "http://127.0.0.1:5173",
]


# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-user-email',
    'x-user-role',
]

# Frontend URL for redirects
FRONTEND_URL = 'http://localhost:5173' 

ROOT_URLCONF = 'FYPGyanSort.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'FYPGyanSort.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'GyanSort_Data',
#         'USER': 'postgres',
#         'PASSWORD': 'achyuthancy',
#         'HOST': '127.0.0.1',
#         'PORT': '5432',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTHENTICATION_BACKENDS = [
    'FYPGyanSort.auth_backends.MultiModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Add JWT settings

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=20),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=10),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'USER_ID_FIELD': 'id',  # Default user ID field
    'USER_ID_CLAIM': 'user_id',  # Default user ID claim
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


# File Upload Settings
DATA_UPLOAD_MAX_MEMORY_SIZE = 314572800  # 300MB in bytes
FILE_UPLOAD_MAX_MEMORY_SIZE = 314572800  # 300MB in bytes
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# For handling large file uploads in production
FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]

# Email settings (for verification)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = 'achyuttamang23@gmail.com'  
# EMAIL_HOST_PASSWORD = 'xkxe aiwv hrio ggbj'   


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = os.getenv('EMAIL_PORT')
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

# for file storages 
DEFAULT_FILE_STORAGE = 'storages.backends.S3boto3Storage'

# AWS Settings
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_REGION')
# CLOUDFRONT_DOMAIN = os.getenv('CLOUDFRONT_DOMAIN')
# AWS_S3_CUSTOM_DOMAIN = f'{CLOUDFRONT_DOMAIN}'


# Khalti Payment Settings
KHALTI_SECRET_KEY = os.getenv('KHALTI_SECRET_KEY')
KHALTI_PUBLIC_KEY = os.getenv('KHALTI_PUBLIC_KEY') 
KHALTI_API_URL = os.getenv('KHALTI_API_URL')
