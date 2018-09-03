import axios from 'axios';
import config from '../config';
import deferred from '../util/deferred';

// TODO: make all components that rely on this use it as an injected dependency
// to allow easier testing

class Auth {
  constructor() {
    this.initClient = this.initClient.bind(this);
    this.load = this.load.bind(this);
    this.observeSignInStatus = this.observeSignInStatus.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.exchangeToken = this.exchangeToken.bind(this);
    this.notifyObservers = this.notifyObservers.bind(this);
    this.getLocalAPIToken = this.getLocalAPIToken.bind(this);

    this.listeners = [];
    this.isSignedIn = false;
    this.apiToken = null;
    this.refreshToken = null;
    this.isInitialized = deferred();
  }

  initialize() {
    window.gapi.load('client:auth2', this.initClient);
  }

  initClient() {
    window.gapi.client.init({
      discoveryDocs: config.DISCOVERY_DOCS,
      clientId: config.CLIENT_ID,
      scope: config.SCOPES
    }).then(this.load);
  }

  load() {
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);
    let isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
    this.updateSigninStatus(isSignedIn);
  }

  observeSignInStatus(callback) {
    this.listeners.push(callback);
  }

  async updateSigninStatus(isSignedIn) {
    this.isSignedIn = isSignedIn;

    if (isSignedIn && this.apiToken == null) {
      await this.exchangeToken();
      this.isInitialized.resolve();
    }

    this.notifyObservers();
  }

  async exchangeToken() {
    if (this.isSignedIn && this.apiToken == null) {
      try {
        const token = window.gapi.auth.getToken();
        const response = await axios.post('/auth/convert-token/', {
          'grant_type': 'convert_token',
          'client_id': 'gJFOzyJyjtq4BPpSoWuTcvJYDxV7nXb2fN9ue4zo',
          'token': token.access_token,
          'backend': 'google-oauth2'
        });
        const data = response.data;
        this.apiToken = data.access_token;
        this.refreshToken = data.refresh_token;
      } catch (err) {
        console.error('Error converting Google token.', err);
      }
    }
  }

  notifyObservers() {
    for (let i = 0; i < this.listeners.length; i++) {
      let listener = this.listeners[i];
      listener(this.isSignedIn);
    }
  }

  getLocalAPIToken() {
    return this.apiToken;
  }
}

const authClient = new Auth();

export default authClient;
