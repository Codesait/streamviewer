import React, { Component } from 'react';

import './message.css';

class Message extends Component {

  render() {
    const message = this.props.message;

    return (
    <div class='message'>
      <div class='message-author-thumbnail'>
        <img src={message.authorDetails.profileImageUrl} alt={'Profile picture of ' + message.authorDetails.displayName}></img>
      </div>
      <div class='message-text-fields'>
        <p class='message-author'>
          {message.authorDetails.displayName}
        </p>
        <p class='message-content'>
          {message.snippet.displayMessage}
        </p>
      </div>
    </div>)
  }
}

export default Message;
