import moment from 'moment'
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import StreamViewerAPI from '../services/api';
import Auth from '../services/auth';

import './errors.css';
import './stream-stats.css';

const mapColumnToKey = {
  '# messages sent':'message_count',
  'Username':'username'
}

class StreamStats extends Component {

  constructor(props) {
    super(props)

    this.getStats = this.getStats.bind(this);
    this.handleTextInputChange = this.handleTextInputChange.bind(this);
    this.searchMessagesByUser = this.searchMessagesByUser.bind(this);
    this.clickColumn = this.clickColumn.bind(this);

    this.state = {
      'stats': [],
      'messages': [],
      'columns': ['Username', '# messages sent'],
      'orderBy': 'message_count',
      'direction': '-',
      'error': false,
      'value': ''
    }
  }

  async componentDidMount() {
   await Auth.isInitialized;
   this.searchMessagesByUser();
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

  handleTextInputChange(event) {
    this.setState({value: event.target.value}, this.searchMessagesByUser);
  }

  clickColumn(column) {
    let direction = this.state.direction;
    let orderBy = this.state.orderBy;

    if (column === orderBy) {
      direction = (direction === '-') ? '' : '-';
    }
    else {
      orderBy = column;
    }
    this.setState({
      'direction': direction,
      'orderBy': orderBy,
    }, () => {
      this.getStats(this.props.match.params.id);
    });
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
      return renderStatsError(videoId);
    }

    return (
      <div class='stats-container'>
        <table>
          <tbody>
            <tr>
              <td>
                <StatsButtons videoId={videoId}/>
              </td>
              <td>
                <input class='search-input' type='text' value={this.state.value} placeholder='Search messages by username' onChange={this.handleTextInputChange} />
              </td>
            </tr>
            <tr>
              <td class='stats-table-container'>
                <StatsTable state={this.state} clickColumn={this.clickColumn}/>
              </td>
              <td class='stat-message-container'>
                <StatsMessages messages={messages}/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

const renderStatsError = function(videoId) {
  return (
    <div class='error-container'>
      <i class='error-icon-lg material-icons'>help_outline</i>
      <div>{'We don\'t have any stats for this channel yet.'}</div>
      <a href={'/streams/' + videoId} class='back-button video-button'>
        <i class='material-icons'>arrow_back</i>
        <div>back</div>
      </a>
    </div>
  )
}

const StatsButtons = function(props) {
  const videoId = props.videoId;
  return (
    <div class='video-buttons-container'>
      <a href={'/home'} class='video-button'>
        <i class='material-icons'>home</i>
        <div class='video-buttons-text'>home</div>
      </a>
      <a href={'/streams/' + videoId} class='video-button'>
        <i class='material-icons'>play_circle_outline</i>
        <div class='video-buttons-text'>video</div>
      </a>
    </div>
  )
}

const StatsMessages = function(props) {
  let messages = props.messages.map(message => {
    const created_at = moment(message.created_at);
    // TODO: create special relative date formatting,
    // i.e don't include year if time delta < 365 days
    // print 'yesterday, hh:mm' if posted yesterday
    // and other similar things
    return (
      <div class='stat-message'>
        <div class='stat-message-details'>
          <div>{message.author_name}</div>
          <div>{created_at.format('MMM D, h:mm a')}</div>
        </div>
        <div>{message.text}</div>
      </div>
    )
  });

  return (<div class='stat-messages'>{messages}</div>)
}

const StatsTable = function(props) {
  const tableHeader = StatsTableHeader(props);
  const tableRows = StatsTableRows(props);

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

const StatsTableHeader = function(props) {
  const orderBy = props.state.orderBy;
  const direction = props.state.direction;
  const columns = props.state.columns;
  const clickColumn = props.clickColumn;
  let arrow;

  if (direction === '') {
    arrow = (<i class='material-icons'>keyboard_arrow_up</i>)
  }
  else {
    arrow = (<i class='material-icons'>keyboard_arrow_down</i>)
  }

  const tableColumns = columns.map(column => {
    let inner = [
      <div>{column}</div>
    ];

    if (mapColumnToKey[column] === orderBy) {
      inner.push(<div>{arrow}</div>)
    }

    return <td onClick={() => clickColumn(mapColumnToKey[column])}>{inner}</td>
  });

  return (
    <tr>
      {tableColumns}
    </tr>
  )
}

const StatsTableRows = function(props) {
  const stats = props.state.stats;

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
