import React, { Component } from 'react';

import './stream-preview.css';

class StreamPreview extends Component {
  constructor(props) {
    super(props);
  }

  // TODO: Handle choosing of image size based on window.innerWidth/window.innerHeight
  render() {
    return (
      <div class='stream-preview'>
        <a href={'./stream/' + this.props.data.id.videoId}>
          <img src={this.props.data.snippet.thumbnails.medium.url}></img>
        </a>
      </div>
    );
  }
}

export default StreamPreview;
