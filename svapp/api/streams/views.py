import json
import svapp.api.youtube as youtube

from django.core import serializers
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.db.models import Count, F
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from oauth2_provider.decorators import protected_resource
from oauth2_provider.models import AccessToken
from rest_framework.decorators import api_view
from rest_framework.response import Response

from svapp.models import Channel, Video, LiveChat, Message


@api_view(['POST'])
@csrf_exempt
@protected_resource()
def StreamMessageView(request, video_id):

    if ('message' not in request.data or len(request.data['message']) > 200):
        err = {
            'details': 'Message must between (0, 200] characters long.'
        }
        return Response(err, status=400)

    text = request.data['message']
    string_token = request.META.get('HTTP_AUTHORIZATION', " ").split(' ')[-1]
    token = AccessToken.objects.get(token=string_token)
    live_chat = LiveChat.objects.filter(video__video_id=video_id)

    # we haven't seen this live chat before
    if (len(live_chat) == 0):
        details = youtube.get_live_stream_details_from_video(video_id)
        channel_id = details['snippet']['channelId']
        live_chat_id = details['liveStreamingDetails']['activeLiveChatId']

        channel = Channel.objects.filter(channel_id=channel_id)
        # see if we already have a record of this channel
        if (len(channel) == 0):
            # if not, make it
            channel = Channel(channel_id=channel_id)
            channel.save()
        else:
            channel = channel[0]

        video = Video(video_id=video_id, channel=channel)
        video.save()

        live_chat = LiveChat(live_chat_id=live_chat_id, video=video)
        live_chat.save()

    else:
        live_chat = live_chat[0]

    message = Message(text=text, live_chat=live_chat, author=token.user)
    message.save()

    return Response(status=200)

@api_view(['POST'])
@csrf_exempt
@protected_resource()
def StreamSearchView(request, video_id):

    if (not request.query_params):
        err = {
            'details': 'Must include search query parameters \
                        (e.g ?username-starts-with="abc").'
        }
        return Response(err, status=400)

    page = request.query_params.get('page', '1')
    length = request.query_params.get('length', '50')
    video = get_object_or_404(Video, video_id=video_id)
    channel_id = video.channel_id

    messages = Message.objects.filter(live_chat__video__channel_id=channel_id)      \
                              .filter(author__username__contains=                   \
                                      request.query_params['username-starts-with']) \
                              .order_by('-created_at')
    status_code = 200
    result = None

    try:
        paginator = Paginator(messages, int(length))
        messages = paginator.get_page(int(page))
        result = [ob.to_json() for ob in messages]
    except:
        result = {
            'details': 'Invalid page or length specified.'
        }
        status_code = 400
    finally:
        return Response(result, status=status_code)

@api_view(['GET'])
@csrf_exempt
@protected_resource()
def StreamStatsView(request, video_id):
    video = get_object_or_404(Video, video_id=video_id)
    channel_id = video.channel_id

    order = request.query_params.get('order_by', '-message_count')
    stats = get_stream_stats(video_id, channel_id, order)

    return Response(stats, status=200)

# TODO: pagination
def get_stream_stats(video_id, channel_id, order, page=0, length=0):
    message_count_per_user = \
        Message.objects.filter(live_chat__video__channel_id=channel_id)             \
                       .values('author')                                            \
                       .annotate(message_count=Count('author'), username=F('author__username')) \
                       .order_by(order)
    return message_count_per_user
