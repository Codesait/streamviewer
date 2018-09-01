import React, { Component } from 'react';

import Message from './message';

import './chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {messages:[], authors:{}};
  }

  getVideoChatMessages(videoId) {
    this.getStreamingDetails(videoId, response => {
      const videos = response.result.items;
      if (videos.length > 0) {
        if (videos[0].liveStreamingDetails) {
          const liveChatId = videos[0].liveStreamingDetails.activeLiveChatId;
          this.getMessagesAndRecurse(liveChatId, '');
        }
      }
    });
  }

  getMessagesAndRecurse(liveChatId, pageToken) {
    this.getStreamLiveMessages(liveChatId, pageToken, (response) => {
      const messages = response.result.items;
      for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        const authorId = message.snippet.authorChannelId;
        if (!(authorId in this.state.authors)) {
          this.getChannelProfile(authorId, (profile) => {
            this.setState(prevState => {
              prevState[authorId] = profile;
              return prevState;
            });
          });
        }
      }
      this.setState(prevState => ({
        messages: [...prevState.messages, ...messages]
      }));
      window.setTimeout(() => {
        this.getMessagesAndRecurse(liveChatId, response.result.nextPageToken)
      }, response.result.pollingIntervalMillis);
    });
  }

  getChannelProfile(channelId, callback) {
    window.gapi.client.youtube.channels.list({
      'part': 'snippet',
      'id': channelId,
    }).then(response => {
      if (response.result.items.length > 0) {
        return callback(response.result.items[0].snippet);
      }
    });
  }

  getStreamingDetails(videoId, callback) {
    window.gapi.client.youtube.videos.list({
      'part': 'snippet, liveStreamingDetails',
      'id': videoId,
    }).then(callback);
  }

  getStreamLiveMessages(liveChatId, pageToken, callback) {
    window.gapi.client.youtube.liveChatMessages.list({
      'liveChatId': liveChatId,
      'part': 'snippet',
      ...(pageToken ? {'pageToken': pageToken} : '')
    }).then(callback);
  }

  render() {
    let messages = this.state.messages;

    if (this.props.isSignedIn && messages == 0) {
      this.getVideoChatMessages(this.props.videoId);
    }

    return (
      <div class='chat'>
        {messages.map(message => <div><Message message={message} authors={this.state.authors}/></div>)}
      </div>
    );
  }
}

export default Chat;
