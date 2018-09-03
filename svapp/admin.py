from django.contrib import admin
from .models import Channel, Video, LiveChat, Message

# Register your models here.
admin.site.register(Channel)
admin.site.register(Video)
admin.site.register(LiveChat)
admin.site.register(Message)
