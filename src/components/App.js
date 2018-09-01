import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import config from '../config';
import './App.css';

import Main from './main';
import Stream from './stream';
import StreamList from './stream-list';

class App extends Component {
  constructor(props) {
    super(props);
    this.initClient = this.initClient.bind(this);
    this.load = this.load.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.state = {isSignedIn: false, isInitializing: true};
  }

  componentDidMount() {
    window.gapi.load('client:auth2', this.initClient);
  }

  initClient() {
    window.gapi.client.init({
      discoveryDocs: config.DISCOVERY_DOCS,
      clientId: config.CLIENT_ID,
      scope: config.SCOPES
    }).then(this.load);
  }

  load(callback) {
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

    // Handle the initial sign-in state.
    this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
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
