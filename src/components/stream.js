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
          <div class='stream-flex-center'>
            <div class='video-container'>
              <div class='video-buttons-container'>
                <a href={'/home'} class='video-button'>
                  <i class="material-icons">home</i>
                  <div class='video-buttons-text'>home</div>
                </a>
                <a href={'/streams/' + videoId + '/stats'} class='video-button'>
                  <i class="material-icons">bar_chart</i>
                  <div class='video-buttons-text'>stats</div>
                </a>
              </div>
              <iframe width="480" height="385" src={"https://www.youtube.com/embed/" + videoId + "?autoplay=1"} frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
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
