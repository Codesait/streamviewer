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

  async getStreams() {
    this.retrievingStreams = true;
    let response = await window.gapi.client.youtube.search.list({
      'part': 'snippet',
      'eventType': 'live',
      'videoEmbeddable': true,
      'maxResults': 25,
      'type': 'video',
    });
    this.retrievingStreams = false;
    this.setState({'streams': response.result.items});
    return response
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
      if (streams.length === 0 && !this.retrievingStreams) {
        this.getStreams();
      }
      return (
        <div class='stream-list-container'>
          {streams.map(stream => <div><StreamPreview data={stream}/></div>)}
        </div>
      );
    }
  }
}

export default StreamList;
