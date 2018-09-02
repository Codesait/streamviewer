import React, { Component } from 'react';

import StreamViewerAPI from '../services/api';
import Auth from '../services/auth';
import Message from './message';

import './chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();
    this.retrievingMessages = false;
    this.state = {liveChatId: null, videoId: this.props.videoId, messages:[], authors:{}};

    this.sendMessage = () => {
      // only send messages if we're authorized on youtube and our api
      Auth.isInitialized.then(() => {
        if (this.textArea && this.state.liveChatId) {
          let message = this.textArea.value;
          this.sendMessageToYTandLocal(message, this.state.liveChatId, () => {});
        }
      })
    }
  }

  async sendMessageToYTandLocal(message, liveChatId) {
    try {
      //await this.sendLiveStreamMessage(message, this.state.liveChatId);
      console.log(StreamViewerAPI.sendMessageToChat);
      await StreamViewerAPI.sendMessageToChat(message, this.state.videoId);
    } catch(err) {
      console.error("Error sending live stream message.", err);
    }
  }

  async sendLiveStreamMessage(message, liveChatId) {
    let response = await window.gapi.client.youtube.liveChatMessages.insert({
      'part': 'snippet',
      'resource': {
        'snippet': {
          'liveChatId': liveChatId,
          'type': 'textMessageEvent',
          'textMessageDetails': {
            'messageText': message,
          }
        }
      }
    });
    return response;
  }

  getVideoChatMessages(videoId) {
    this.getStreamingDetails(videoId, response => {
      const videos = response.result.items;
      if (videos.length > 0) {
        if (videos[0].liveStreamingDetails) {
          const liveChatId = videos[0].liveStreamingDetails.activeLiveChatId;
          this.setState({'liveChatId': liveChatId});
          this.getMessagesAndRecurse(liveChatId, '');
        }
      }
    });
  }

  getMessagesAndRecurse(liveChatId, pageToken) {
    this.getStreamLiveMessages(liveChatId, pageToken, (response) => {
      const messages = response.result.items;
      // TODO: ignore any messages that we've sent
      // because we've already pushed them to messages
      for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        const authorId = message.snippet.authorChannelId;

        if (!(authorId in this.state.authors)) {
          this.getChannelProfile(authorId, (profile) => {
            this.setState(prevState => {
              prevState.authors[authorId] = profile;
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

    if (this.props.isSignedIn && messages.length === 0 && !this.retrievingMessages) {
      this.retrievingMessages = true;
      this.getVideoChatMessages(this.props.videoId);
    }

    return (
      <div class='chat'>
        <div class='chat-messages'>
          {messages.map(message => <div><Message message={message} authors={this.state.authors}/></div>)}
        </div>
        <div class='chat-input'>
          <textarea ref={(textArea) => this.textArea = textArea} placeholder='Send chat message'></textarea>
          <div class='clear'></div>
          <button type='button' onClick={this.sendMessage}>send</button>
        </div>
      </div>
    );
  }
}

export default Chat;
