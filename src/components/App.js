import Loader from 'react-loader-spinner'
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import config from '../config';
import './App.css';
import './loader.css';

import Auth from '../services/auth';
import Main from './main';
import Stream from './stream';
import StreamList from './stream-list';
import StreamStats from './stream-stats';

class App extends Component {
  constructor(props) {
    super(props);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.state = {isSignedIn: false, isInitializing: true};
  }

  componentWillMount() {
    const script = document.createElement('script');
    script.onload = () => {
      this.loadGAPIClient(script);
    }
    script.src = 'https://apis.google.com/js/client.js';
    document.body.appendChild(script);

    Auth.observeSignInStatus(this.updateSigninStatus);
  }

  loadGAPIClient(script) {
    if (script.getAttribute('gapi_processed')) {
      Auth.initialize();
    }
    else {
      setTimeout(() => {this.loadGAPIClient(script)}, 100);
    }
  }

  logout() {
    Auth.logout();
  }

  updateSigninStatus(isSignedIn) {
    this.setState({'isSignedIn': isSignedIn, 'isInitializing': false});
  }

  render() {
    return (
      <div>
        <LogoutButton onClick={this.logout} />
        <div className='App'>
          {this.state.isInitializing  &&
            <div class='loader'>
              <Loader
                 type='Puff'
                 color='#ccc'
                 height='50'
                 width='50'
              />
            </div>
          }
          <Switch>
            <Route exact path='/' render={props => <Main isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
            <Route path='/streams/:id/stats/' render={props => <StreamStats isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
            <Route path='/streams/:id/' render={props => <Stream isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
            <Route path='/:path(home|streams)/' render={props => <StreamList isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
          </Switch>
        </div>
      </div>
    );
  }
}

const LogoutButton = function(props) {
  return (
    <div class='nav-area'>
      <div class='logout-button video-button' onClick={props.onClick}>
        <i class='material-icons'>power_settings_new</i>
        <div class='video-buttons-text'>Logout</div>
      </div>
    </div>
  );
}

export default App;
