import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';

class Main extends Component {
  constructor(props) {
    super(props);
    this.handleSignoutClick = this.handleSignoutClick.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
  }

  handleAuthClick(event) {
    window.gapi.auth2.getAuthInstance().signIn().then(this.handleProfileSuccess, this.handleProfileError);
  }

  handleSignoutClick(event) {
    window.gapi.auth2.getAuthInstance().signOut();
  }

  handleProfileError(error) {
    console.log(error);
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

const LogoutButton = function(props) {
  return (
    <button onClick={props.onClick}>
      Logout
    </button>
  );
}

export default Main;
