import axios from 'axios';

import Auth from './auth';

class StreamViewerAPI {

  constructor() {
    this.sendMessageToChat = this.sendMessageToChat.bind(this);

    Auth.isInitialized.then(() => {
      this.securityHeaders = {
        'Authorization': 'Bearer ' + Auth.getLocalAPIToken(),
      }
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + Auth.getLocalAPIToken();
    });
  }

  async sendMessageToChat(message, videoId) {
  //  this.searchVideoChannelUsersMessages(videoId, 'tmanbrock')
    this.getVideoChannelStats(videoId)
    let response = await axios.post('/api/streams/' + videoId + '/message', {
      'message': message
    }, this.securityHeaders);
  }

  async searchVideoChannelUsersMessages(videoId, username) {
    let response = await axios.post('/api/streams/' + videoId + '/search?username-starts-with=' + username, {}, this.securityHeaders);

  }

  async getVideoChannelStats(videoId) {
    let response = await axios.get('/api/streams/' + videoId + '/stats', {}, this.securityHeaders);
  }
}

const API = new StreamViewerAPI();

export default API;
