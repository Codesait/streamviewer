import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import StreamPreview from './stream-preview';

import './stream-list.css';

class StreamList extends Component {
  constructor(props) {
    super(props);
    this.getStreams = this.getStreams.bind(this);
    this.state = {streams: []};
  }

  getStreams(callback) {
    window.gapi.client.youtube.search.list({
      'part': 'snippet',
      'eventType': 'live',
      'videoEmbeddable': true,
      'maxResults': 25,
      'type': 'video',
    }).then(callback);
  }

  render() {
    const isSignedIn = this.props.isSignedIn;
    const isInitializing = this.props.isInitializing;
    let streams = this.state.streams;

    if (!isSignedIn) {
      if (!isInitializing) {
        return <Redirect to='/'/>;
      }
      // TODO: render a loading component
      return null;
    }
    else {
      // TODO: can spawn multiple requests at once
      if (streams.length === 0) {
        this.getStreams((response) => {
          this.setState({'streams':  response.result.items});
        });
      }
      console.log(streams);
      return (
        <div class='stream-list-container'>
          {streams.map(stream => <div><StreamPreview data={stream}/></div>)}
        </div>
      );
    }
  }
}

export default StreamList;
