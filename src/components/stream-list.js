import Loader from 'react-loader-spinner'
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import StreamPreview from './stream-preview';

import './loader.css';
import './stream-list.css';

class StreamList extends Component {
  constructor(props) {
    super(props);
    this.getStreams = this.getStreams.bind(this);
    this.streamsRef = React.createRef();
    this.nextPageToken = null;
    this.noMoreStreams = false;
    this.state = {streams: []};
  }

  isBottom(el) {
    return el.getBoundingClientRect().bottom - 10 <= window.innerHeight ;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
  }

  // https://stackoverflow.com/questions/45585542/detecting-when-user-scrolls-to-bottom-of-div-with-react-js
  // by user: ewwink
  trackScrolling = () => {
    if (this.isBottom(this.streamsRef.current)) {
      // store retrievingStreams in regular member because we need it to lock immediately
      // store noMoreStreams in a state variable so we can use it to render a notification
      // of no more streams to load
      if (!this.retrievingStreams && !this.state.noMoreStreams) {
        this.getStreams();
      }
    }
  };

  async getStreams() {
    const params = {
      'part': 'snippet',
      'eventType': 'live',
      'videoEmbeddable': true,
      'maxResults': 25,
      'type': 'video',
      'regionCode': 'CA',
      'relevanceLanguage': 'EN',
    }
    this.retrievingStreams = true;

    if (this.nextPageToken) {
      params.pageToken = this.nextPageToken;
    }

    let response = await window.gapi.client.youtube.search.list(params);

    this.nextPageToken = response.result.nextPageToken;

    this.setState(prevState => ({
      streams: [...prevState.streams, ...response.result.items],
      noMoreStreams: response.result.items.length == 0,
    }), () => {
      this.retrievingStreams = false;
    });

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
      return null;
    }
    else {
      if (streams.length === 0 && !this.retrievingStreams) {
        this.getStreams();
        return streamLoader();
      }

      return (
        <div ref={this.streamsRef} class='stream-list-container'>
          {streams.map(stream => <div><StreamPreview data={stream}/></div>)}
        </div>
      );
    }
  }
}

const streamLoader = function(props) {
  return (
    <div class='loader'>
      <Loader
         type="Puff"
         color="#ccc"
         height="50"
         width="50"
      />
    </div>
  )
}

export default StreamList;
