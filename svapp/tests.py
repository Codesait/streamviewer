from django.contrib.auth.models import User
from django.test import TestCase
from svapp.models import Message, LiveChat, Video, Channel
from svapp.api.streams.views import get_stream_stats

class StreamViewTestCase(TestCase):
    def setUp(self):
        super(StreamViewTestCase, self).setUp()

    @classmethod
    def setUpClass(self):
        super(StreamViewTestCase, self).setUpClass()
        self.user_a = User.objects.create_user(username='a', password='a')
        self.user_b = User.objects.create_user(username='b', password='b')
        self.user_c = User.objects.create_user(username='c', password='c')
        self.user_d = User.objects.create_user(username='d', password='d')
        self.channel = Channel.objects.create(channel_id='1')
        self.video = Video.objects.create(video_id='1', channel=self.channel)
        self.live_chat = LiveChat.objects.create(live_chat_id='1',
                                                 video=self.video)

        for i in range(3):
            message = Message.objects.create(text='test_a',
                                             author=self.user_a,
                                             live_chat=self.live_chat)

        for i in range(4):
            message = Message.objects.create(text='test_b',
                                             author=self.user_b,
                                             live_chat=self.live_chat)

        for i in range(7):
            message = Message.objects.create(text='test_c',
                                             author=self.user_c,
                                             live_chat=self.live_chat)

        for i in range(4):
            message = Message.objects.create(text='test_d',
                                             author=self.user_d,
                                             live_chat=self.live_chat)

    #
    # Stats sorting and message count tests
    #
    def test_stream_stats_message_counts(self):
        users_with_message_counts = get_stream_stats(self.video.video_id,
                                                     self.channel.channel_id,
                                                     '-message_count')

        for i in range(len(users_with_message_counts)):
            current = users_with_message_counts[i]

            if (current['username'] == 'a'):
                self.assertEquals(current['message_count'], 3)
            elif (current['username'] == 'b'):
                self.assertEquals(current['message_count'], 4)
            elif (current['username'] == 'c'):
                self.assertEquals(current['message_count'], 7)

    def test_stream_stats_sort_order_descending_count(self):
        users_with_message_counts = get_stream_stats(self.video.video_id,
                                                     self.channel.channel_id,
                                                     '-message_count')

        for i in range(1, len(users_with_message_counts)):
            current = users_with_message_counts[i]
            previous = users_with_message_counts[i-1]
            self.assertTrue(current['message_count'] <= previous['message_count'])

    def test_stream_stats_sort_order_ascending_count(self):
        users_with_message_counts = get_stream_stats(self.video.video_id,
                                                     self.channel.channel_id,
                                                     'message_count')

        for i in range(1, len(users_with_message_counts)):
            current = users_with_message_counts[i]
            previous = users_with_message_counts[i-1]
            self.assertTrue(current['message_count'] >= previous['message_count'])

    def test_stream_stats_sort_order_descending_username(self):
        users_with_message_counts = get_stream_stats(self.video.video_id,
                                                     self.channel.channel_id,
                                                     '-username')
        for i in range(1, len(users_with_message_counts)):
            current = users_with_message_counts[i]
            previous = users_with_message_counts[i-1]
            self.assertTrue(current['username'] <= previous['username'])

    def test_stream_stats_sort_order_ascending_username(self):
        users_with_message_counts = get_stream_stats(self.video.video_id,
                                                     self.channel.channel_id,
                                                     'username')
        for i in range(1, len(users_with_message_counts)):
            current = users_with_message_counts[i]
            previous = users_with_message_counts[i-1]
            self.assertTrue(current['username'] >= previous['username'])

    #
    # Searching messages by username
    #
