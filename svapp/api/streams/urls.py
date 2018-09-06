from django.urls import re_path, include
from svapp.api.streams.views import StreamMessageView, StreamSearchView, StreamStatsView

urlpatterns = [
    re_path(r'^(?P<video_id>[^/]+)/message$', StreamMessageView),
    re_path(r'^(?P<video_id>[^/]+)/search$', StreamSearchView),
    re_path(r'^(?P<video_id>[^/]+)/stats$', StreamStatsView),
]
