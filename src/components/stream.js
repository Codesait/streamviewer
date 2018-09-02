import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';

import Chat from './chat';

import './stream.css';

class Stream extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const videoId = this.props.match.params.id;
    const isSignedIn = this.props.isSignedIn;
    const isInitializing = this.props.isInitializing;

    if (!isSignedIn) {
      if (!isInitializing) {
        return <Redirect to='/'/>
      }
      return null;
    }
    else {
      // TODO: change iframe width and height based on browser width/height
      // and controls shown on iframe
      return (
        <div class='stream-flex-container'>
          <div class='stream-flex-left'></div>
          <div class='stream-flex-center'>
            <iframe width="480" height="385" src={"https://www.youtube.com/embed/" + videoId + "?autoplay=1"} frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
          <div class='stream-flex-right'>
            <Chat isSignedIn={this.props.isSignedIn} videoId={videoId}/>
          </div>
        </div>
      );
    }
  }
}

export default Stream;
