import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Auth from '../services/api';
import StreamViewerAPI from '../services/api';

import './stream-stats.css';

class StreamStats extends Component {

  constructor(props) {
    super(props)

    this.getStats = this.getStats.bind(this);
    this.handleTextInputChange = this.handleTextInputChange.bind(this);
    this.searchMessagesByUser = this.searchMessagesByUser.bind(this);

    this.state = {
      'stats': [],
      'columns': ['Username', '# messages sent']
    }
  }

  async getStats(videoId) {
    await Auth.isInitialized;
    try {
      let stats = await StreamViewerAPI.getVideoChannelStats(videoId);
      this.statsRetrieved = true;
      this.setState({'stats': stats, 'messages':[]});
    } catch(err) {
      console.error('Error retrieving channel statistics by video.');
    }
  }

  renderTableRow(stat, index) {
    return (
      <tr>
        <td>{stat['name']}</td>
        <td>{stat['total']}</td>
      </tr>
    )
  }

  handleTextInputChange(event) {
    this.setState({value: event.target.value});
    this.searchMessagesByUser();
  }

  searchMessagesByUser() {
    const videoId = this.props.match.params.id;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(async() => {
      let messages = await StreamViewerAPI.searchVideoChannelUsersMessages(videoId, this.state.value);
      console.log(messages);
    }, 200);

  }

  render() {
    const videoId = this.props.match.params.id;
    const isSignedIn = this.props.isSignedIn;
    const isInitializing = this.props.isInitializing;
    const columns = this.state.columns;
    const stats = this.state.stats;

    if (!isSignedIn) {
      if (!isInitializing) {
        return <Redirect to='/'/>
      }
      return null;
    }
    else {
      if (!this.statsRetrieved) {
        this.getStats(videoId);
      }
    }

    return (
      <div class='stats-container'>
        <table class='stats-table'>
          <thead>
            <tr>
              {columns.map(column => <th scope='col'>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) =>
              this.renderTableRow(stat, index)
            )}
          </tbody>
        </table>
        <div>
          <input type='text' value={this.state.value} placeholder='Find all messages by user' onChange={this.handleTextInputChange}></input>
        </div>
      </div>
    )
  }
}

export default StreamStats;
