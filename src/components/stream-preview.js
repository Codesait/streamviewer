import React, { Component } from 'react';

import './stream-preview.css';

class StreamPreview extends Component {
  // TODO: Handle choosing of image size based on window.innerWidth/window.innerHeight
  render() {
    return (
      <div class='stream-preview'>
        <a href={'/streams/' + this.props.data.id.videoId + '/'}>
          <img src={this.props.data.snippet.thumbnails.medium.url} alt={this.props.data.snippet.title}></img>
          <div class='live-stream-title'>{this.props.data.snippet.title}</div>
          <div class='live-stream-channel'>{this.props.data.snippet.channelTitle}</div>
        </a>
      </div>
    );
  }
}

export default StreamPreview;
