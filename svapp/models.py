from django.db import models
from django.conf import settings

# Create your models here.
class Channel(models.Model):
    channel_id = models.CharField(primary_key=True, max_length=50)

class Video(models.Model):
    video_id = models.CharField(primary_key=True, max_length=50)
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)

class LiveChat(models.Model):
    live_chat_id = models.CharField(primary_key=True, max_length=50)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)

class Message(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    live_chat = models.ForeignKey(LiveChat, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
