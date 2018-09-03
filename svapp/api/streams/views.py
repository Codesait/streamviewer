from oauth2_provider.models import Application, AccessToken
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from svapp.models import Channel, Video, LiveChat

import svapp.api.youtube as youtube

@api_view(['POST'])
@csrf_exempt
def StreamMessageView(request, video_id):


    live_chat = LiveChat.objects.filter(video__video_id=video_id)
    text = request.data['message']
    for header, value in request.META.items():
        print(header, value)
    #user = AccessToken.objects.get(token=token)


    # do we already have a live chat for this video id
    if (len(live_chat) > 0):
        # if so, create the message and add it to the live chat

        message = Message(text=text, live_chat=live_chat, author=request.user)
        message.save()

    # otherwise, we have a new video
    else:
        details = youtube.get_live_stream_details_from_video(video_id)
        channel_id = details['snippet']['channelId']
        live_chat_id = details['liveStreamingDetails']['activeLiveChatId']

        # do we already have a record of this channel
        # channel = Channel.objects.filter(pk=channel_id)
        # if (len(channel) == 0):
        #     # if not, make it
        #     channel = Channel(channel_id=channel_id)
        # else:
        #     channel = channel[0]
        #
        # video = Video(video_id=video_id)
        # live_chat = LiveChat(live_chat_id=live_chat_id)
        #
        # video.live_chat = live_chat
        # channel.video = video
        # channel.save()

    return
