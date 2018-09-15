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
    this.getCurrentUserChannelInfo = this.getCurrentUserChannelInfo.bind(this);
    this.notifyObservers = this.notifyObservers.bind(this);
    this.getLocalAPIToken = this.getLocalAPIToken.bind(this);
    this.logout = this.logout.bind(this);
    this.revokeToken = this.revokeToken.bind(this);

    this.listeners = [];
    this.isSignedIn = false;
    this.apiToken = this.channelInfo = this.refreshToken = null;
    this.clientId = 'gJFOzyJyjtq4BPpSoWuTcvJYDxV7nXb2fN9ue4zo';
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
    window.gapi.signin2.render('my-signin2', {
      'scope': config.SCOPES,
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': console.log,
      'onfailure': console.error
    });
    this.updateSigninStatus(isSignedIn);
  }

  observeSignInStatus(callback) {
    this.listeners.push(callback);
  }

  async updateSigninStatus(isSignedIn) {
    this.isSignedIn = isSignedIn;

    if (!this.isSignedIn) {
      document.getElementById('my-signin2').style.display = 'block';
    }

    else {
      document.getElementById('my-signin2').style.display = 'none';

      if (this.apiToken == null) {
        await this.exchangeToken();
      }

      if (this.channelInfo == null) {
        await this.getCurrentUserChannelInfo();
      }

      this.isInitialized.resolve();
    }

    this.notifyObservers();
  }

  async exchangeToken() {
    try {
      const token = window.gapi.auth.getToken();
      const response = await axios.post('/auth/convert-token/', {
        'grant_type': 'convert_token',
        'client_id': this.clientId,
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

  async getCurrentUserChannelInfo() {
    try {
      const response = await window.gapi.client.youtube.channels.list({
        'part': 'snippet',
        'mine': true,
      });

      if (response.result.items.length > 0) {
        this.channelInfo = response.result.items[0];
      }
    } catch (err) {
      console.error('Error retrieving Youtube channel information.', err);
    }
  }

  async logout() {
    await this.revokeToken();
    window.gapi.auth2.getAuthInstance().signOut();
  }

  async revokeToken() {
    try {
      const token = window.gapi.auth.getToken();
      const response = await axios.post('/auth/revoke-token', {
        'client_id': this.clientId,
        'token': token.access_token,
      });
    } catch(err) {
      console.error('Error revoking OAuth2 token.', err);
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
