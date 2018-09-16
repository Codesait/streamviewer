"""streamviewer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from svapp.api.streams.views import StreamMessageView

def return_manifest(request):
    data = {}
    with open(os.path.join(BASE_DIR, 'build/manifest.json')) as f:
        data = json.load(f)

    return HttpResponse(data, content_type='application/json')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('rest_framework_social_oauth2.urls')),
    path('api/', include('svapp.api.urls')),
    path('manifest.json', return_manifest),
    re_path('.*', TemplateView.as_view(template_name='index.html')),
]
