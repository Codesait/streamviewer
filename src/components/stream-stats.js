import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Auth from '../services/api';
import StreamViewerAPI from '../services/api';

import './errors.css';
import './stream-stats.css';

class StreamStats extends Component {

  constructor(props) {
    super(props)

    this.getStats = this.getStats.bind(this);
    this.handleTextInputChange = this.handleTextInputChange.bind(this);
    this.searchMessagesByUser = this.searchMessagesByUser.bind(this);

    this.state = {
      'stats': [],
      'messages': [],
      'columns': ['Username', '# messages sent'],
      'orderBy': 'message_count',
      'direction': '-',
      'error': false
    }
  }

  async getStats(videoId) {
    await Auth.isInitialized;
    try {
      let stats = await StreamViewerAPI.getVideoChannelStats(videoId, this.state.orderBy, this.state.direction);
      this.setState({'stats': stats, 'statsRetrieved': true});
    } catch(err) {
      console.error('Error retrieving channel statistics by video.');
      this.setState({'error': err, 'statsRetrieved': true});
    }
  }

  renderFoundMessage(message) {
    return (
      <div>
        <div>{message.author_name}</div>
        <div>{message.created_at}</div>
        <div>{message.text}</div>
      </div>
    )
  }

  handleTextInputChange(event) {
    this.setState({value: event.target.value});
    this.searchMessagesByUser();
  }

  searchMessagesByUser() {
    const videoId = this.props.match.params.id;

    clearTimeout(this.timer);

    this.timer = setTimeout(async() => {
      try {
        let messages = await StreamViewerAPI.searchVideoChannelUsersMessages(videoId, this.state.value);
        this.setState({'messages': messages, 'error': false});
      } catch(err) {
        console.error('Error retrieving messages by username.', err);
        this.setState({'error': err, 'statsRetrieved': true});
      }
    }, 300);

  }

  render() {
    const videoId = this.props.match.params.id;
    const isSignedIn = this.props.isSignedIn;
    const isInitializing = this.props.isInitializing;
    const messages = this.state.messages;
    const columns = this.state.columns;
    const stats = this.state.stats;

    if (!isSignedIn) {
      if (!isInitializing) {
        return <Redirect to='/'/>
      }
      return null;
    }

    if (!this.state.statsRetrieved) {
      this.getStats(videoId);
      return null;
    }

    if (this.state.error) {
      return renderStatsError();
    }

    return (
      <div class='stats-container'>
        <StatsTable state={this.state}/>
        <div class='search-by-user'>
          <input type='text' value={this.state.value} placeholder='Filter messages by username' onChange={this.handleTextInputChange}></input>
          <div>
            {messages.map(message => {
                return this.renderFoundMessage(message)
            })}
          </div>
        </div>
      </div>
    )
  }
}

const renderStatsError = function(props) {
  return (
    <div class='error-container'>
      <i class="error-icon-lg material-icons">help_outline</i>
      <div>{"We don't have any stats for this channel yet."}</div>
    </div>
  )
}

const StatsTable = function(props) {
  const stats = props.state.stats;
  const orderBy = props.state.orderBy;
  const direction = props.state.direction;
  const columns = props.state.columns;

  const tableHeader = StatsTableHeader(orderBy, direction, columns);
  const tableRows = StatsTableRows(stats);

  return (
    <table class='stats-table'>
      <thead>
        {tableHeader}
      </thead>
      <tbody>
        {tableRows}
      </tbody>
    </table>
  )
}

const mapColumnToKey = {
  '# messages sent':'message_count',
  'Username':'username'
}

const StatsTableHeader = function(orderBy, direction, columns) {
  let arrow;
  let tableColum;

  if (direction === '+') {
    arrow = (<i class="material-icons">keyboard_arrow_up</i>)
  }
  else {
    arrow = (<i class="material-icons">keyboard_arrow_down</i>)
  }

  const tableColumns = columns.map(column => {
    let inner = [
      <div>{column}</div>
    ];

    if (mapColumnToKey[column] === orderBy) {
      inner.push(<div>{arrow}</div>)
    }

    return <td>{inner}</td>
  });

  return (
    <tr>
      {tableColumns}
    </tr>
  )
}

const StatsTableRows = function(stats) {
  let rows = stats.map((stat) => {
    return (
      <tr>
        <td>{stat.username}</td>
        <td>{stat.message_count}</td>
      </tr>
    )
  });

  return rows;
}

export default StreamStats;
