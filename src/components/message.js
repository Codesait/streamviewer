import React, { Component } from 'react';

import './message.css';

class Message extends Component {

  render() {
    const authorChannelId = this.props.message.snippet.authorChannelId;
    const author = this.props.authors[authorChannelId];

    if (!author) {
      return null
    }

    return (
    <div class='message'>
      <div class='message-author-thumbnail'>
        <img src={author.thumbnails.default.url} alt={'Profile picture of ' + author.title}></img>
      </div>
      <div class='message-text-fields'>
        <p class='message-author'>
          {author.title}
        </p>
        <p class='message-content'>
          {this.props.message.snippet.displayMessage}
        </p>
      </div>
    </div>)
  }
}

export default Message;
