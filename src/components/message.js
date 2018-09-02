import React, { Component } from 'react';

import './message.css';

class Message extends Component {

  render() {
    const authorChannelId = this.props.message.snippet.authorChannelId;

    return (
    <div class='message'>
      {this.props.message.snippet.displayMessage}
    </div>)
  }
}

export default Message;
