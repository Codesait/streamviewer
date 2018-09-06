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
    created_at = models.DateTimeField(auto_now_add=True)

    def to_json(self):

        return dict(
            author_id = self.author.id,
            author_name = self.author.username,
            live_chat_id = self.live_chat.live_chat_id,
            text = self.text,
            created_at = self.created_at.isoformat(),
        )
