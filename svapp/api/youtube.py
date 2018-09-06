import requests

from django.conf import settings

def get_live_stream_details_from_video(video_id=None):
    params = {
        'part': 'snippet,liveStreamingDetails',
        'id':video_id,
        'key': getattr(settings, 'GOOGLE_API_KEY', None)
    }
    r = requests.get('https://www.googleapis.com/youtube/v3/videos', params=params)
    r.raise_for_status()

    return r.json()['items'][0]
