import React, { Component } from 'react';

import StreamViewerAPI from '../services/api';
import Auth from '../services/auth';
import Message from './message';

import './chat.css';
import './errors.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();
    this.retrievingMessages = false;
    this.posted = new Set();
    this.state = {liveChatId: null, videoId: this.props.videoId, messages:[], error: false};

    this.sendMessage = () => {
      // only send messages if we're authorized on youtube and our api
      Auth.isInitialized.then(() => {
        if (this.textArea && this.state.liveChatId) {
          let text = this.textArea.value;
          this.textArea.value = "";
          this.sendMessageToYTandLocal(text, this.state.liveChatId, () => {});
        }
      });
    }
  }

  scrollToBottom = () => {
    let target = this.end;
    if (target) {
      target.parentNode.scrollTop = target.offsetTop - target.parentNode.offsetTop
    }
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  async sendMessageToYTandLocal(text, liveChatId) {
    // TODO: disable sending multiple pending messages
    // or implement unique temporary ID's so that some messages
    // may fail sending, while others can succeed without being removed
    let message = {
      id: '__temp-id__',
      authorDetails: {
        displayName: Auth.channelInfo.snippet.localized.title,
        profileImageUrl: Auth.channelInfo.snippet.thumbnails.default.url,
      },
      snippet: {
        authorChannelId: Auth.channelInfo.id,
        displayMessage: text,
      }
    }
    // immediately add the temporary message
    this.setState(prevState => ({
      messages: [...prevState.messages, message]
    }));
    try {
      const youtubeResponse = await this.sendLiveStreamMessage(text, this.state.liveChatId);
      const localResponse = await StreamViewerAPI.sendMessageToChat(text, this.state.videoId);
      this.posted.add(youtubeResponse.result.id);
      // replace temporary message with message from youtube response
      this.setState(prevState => {
        const index = prevState.messages.find(message => message.id === '__temp-id__');
        prevState.messages[index] = youtubeResponse.result;
        return prevState;
      });
    } catch(err) {
      console.error("Error sending live stream message.", err);
      // remove temporary message if sending fails
      this.setState(prevState => ({
        messages: prevState.messages.filter(message => message.id === '__temp-id__')
      }));
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
    this.retrievingMessages = true;
    this.getStreamingDetails(videoId, response => {
      const videos = response.result.items;
      if (videos.length > 0) {
        if (videos[0].liveStreamingDetails) {
          const liveChatId = videos[0].liveStreamingDetails.activeLiveChatId;
          this.setState({'liveChatId': liveChatId});
          this.getMessagesAndRecurse(liveChatId, '');
        }
      }
    }, err => {
      console.error(err);
    });
  }

  getMessagesAndRecurse(liveChatId, pageToken) {
    this.getStreamLiveMessages(liveChatId, pageToken, (response) => {

      // filter any messages we've sent
      let messages = response.result.items
                             .filter(message => !(this.posted.has(message.id)));
      this.setState(prevState => ({
        messages: [...prevState.messages, ...messages]
      }));
      setTimeout(() => {
        this.getMessagesAndRecurse(liveChatId, response.result.nextPageToken)
      }, response.result.pollingIntervalMillis);
    }, (err) => {
      console.error(err);
      this.setState({error: err});
    });
  }

  getStreamingDetails(videoId, callback) {
    window.gapi.client.youtube.videos.list({
      'part': 'snippet, liveStreamingDetails',
      'id': videoId,
    }).then(callback);
  }

  getStreamLiveMessages(liveChatId, pageToken, successHandler, errorHandler) {
    window.gapi.client.youtube.liveChatMessages.list({
      'liveChatId': liveChatId,
      'part': 'snippet, authorDetails',
      ...(pageToken ? {'pageToken': pageToken} : '')
    }).then(successHandler, errorHandler);
  }

  render() {
    let messages = this.state.messages;

    if (this.state.error) {
      return (
        <div class='chat-error'>
          <div class='error-header'>
            {"Sorry!"}
          </div>
          <div class='error-icon'>
            {"☹️"}
          </div>
          <div>
            {"We couldn't find an associated chat for this video."}
          </div>
        </div>
      )
    }

    if (this.props.isSignedIn && messages.length === 0 && !this.retrievingMessages) {
      this.getVideoChatMessages(this.props.videoId);
    }

    return (
      <div class='chat'>
        <div class='chat-messages'>
          {messages.map(message => <div><Message message={message}/></div>)}
          <div style={{ float: "left", clear: "both"}} ref={el => {this.end = el; }}></div>
        </div>
        <div class='chat-input'>
          <textarea ref={(textArea) => this.textArea = textArea} placeholder='Send chat message'></textarea>
          <div class='chat-send-button' onClick={this.sendMessage}>
            <i class='material-icons'>send</i>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
