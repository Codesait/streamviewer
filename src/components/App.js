import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import config from '../config';
import './App.css';

import Auth from '../services/auth';
import Main from './main';
import Stream from './stream';
import StreamList from './stream-list';

class App extends Component {
  constructor(props) {
    super(props);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.state = {isSignedIn: false, isInitializing: true};
  }

  componentDidMount() {
    Auth.observeSignInStatus(this.updateSigninStatus);
  }

  updateSigninStatus(isSignedIn) {
    this.setState({'isSignedIn': isSignedIn, 'isInitializing': false});
  }

  render() {
    return (
      <div className='App'>
        <Switch>
          <Route exact path='/' render={props => <Main isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
          <Route path='/home' render={props => <StreamList isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
          <Route path='/stream/:id' render={props => <Stream isSignedIn={this.state.isSignedIn} isInitializing={this.state.isInitializing} {...props}/>}/>
        </Switch>
      </div>
    );
  }
}

export default App;
