import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';

import config from '../config';

class Main extends Component {

  handleProfileError(error) {
    console.error(error);
  }

  handleProfileSuccess(googleUser) {
    console.log(googleUser);
  }

  render() {
    const isSignedIn = this.props.isSignedIn;
    const isInitializing = this.props.isInitializing;

    if (isSignedIn) {
      return <Redirect to='/home' />
    }
    
    return null;
  }
}

export default Main;
