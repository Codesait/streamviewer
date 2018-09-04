import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';

class Main extends Component {
  constructor(props) {
    super(props);
    
    this.handleAuthClick = this.handleAuthClick.bind(this);
  }

  handleAuthClick(event) {
    window.gapi.auth2.getAuthInstance().signIn().then(this.handleProfileSuccess, this.handleProfileError);
  }

  handleProfileError(error) {
    console.error(error);
  }

  handleProfileSuccess(googleUser) {
    console.log(googleUser);
  }

  render() {
    const isSignedIn = this.props.isSignedIn;

    if (isSignedIn) {
      return <Redirect to='/home' />
    }

    return (
      <LoginButton onClick={this.handleAuthClick} />
    )
  }
}

const LoginButton = function(props) {
  return (
    <button onClick={props.onClick}>
      Login
    </button>
  );
}

export default Main;
