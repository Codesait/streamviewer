import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';

class Main extends Component {

  render() {
    const isSignedIn = this.props.isSignedIn;

    if (isSignedIn) {
      return <Redirect to='/home' />
    }

    return null;
  }
}

export default Main;
