from django.urls import re_path, include
from svapp.api.streams.views import StreamMessageView

urlpatterns = [
    re_path(r'^(?P<video_id>[^/]+)/message$', StreamMessageView),
]
