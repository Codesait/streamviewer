import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';

import Chat from './chat';

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
      return (
        <div>
          <iframe width="560" height="315" src={"https://www.youtube.com/embed/" + videoId + "?autoplay=1"} frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          <Chat isSignedIn={this.props.isSignedIn} videoId={videoId}/>
        </div>
      );
    }
  }
}

export default Stream;
