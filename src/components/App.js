import Loader from 'react-loader-spinner'
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import config from '../config';
import './App.css';

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
    Auth.observeSignInStatus(this.updateSigninStatus);
    Auth.initialize();
  }

  logout() {
    Auth.logout();
  }

  updateSigninStatus(isSignedIn) {
    this.setState({'isSignedIn': isSignedIn, 'isInitializing': false});
  }

  render() {
    return (
      <div className='App'>
        <LogoutButton onClick={this.logout} />
        {this.state.isInitializing  &&
          <div class='loader'>
            <Loader
               type="Puff"
               color="#ccc"
               height="50"
               width="50"
               className="loader"
            />
          </div>
        }
        <Switch>
          <Route exact path='/' render={props => <Main isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
          <Route path='/home/' render={props => <StreamList isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
          <Route path='/streams/:id/stats/' render={props => <StreamStats isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
          <Route path='/streams/:id/' render={props => <Stream isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
        </Switch>
      </div>
    );
  }
}

const LogoutButton = function(props) {
  return (
    <button onClick={props.onClick}>
      Logout
    </button>
  );
}

export default App;
