import axios from 'axios';

import Auth from './auth';

class StreamViewerAPI {

  constructor() {
    this.sendMessageToChat = this.sendMessageToChat.bind(this);
    this.searchVideoChannelUsersMessages = this.searchVideoChannelUsersMessages.bind(this);
    this.getVideoChannelStats = this.getVideoChannelStats.bind(this);

    Auth.isInitialized.then(() => {
      this.securityHeaders = {
        'Authorization': 'Bearer ' + Auth.getLocalAPIToken(),
      }
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + Auth.getLocalAPIToken();
    });
  }

  async sendMessageToChat(message, videoId) {
    let response = await axios.post('/api/streams/' + videoId + '/message', {
      'message': message
    }, this.securityHeaders);
  }

  async searchVideoChannelUsersMessages(videoId, username) {
    let response = await axios.post('/api/streams/' + videoId +
                                    '/search?username-starts-with=' + username, {}, this.securityHeaders);
    return response.data
  }

  async getVideoChannelStats(videoId, orderBy, direction) {
    let response = await axios.get('/api/streams/' + videoId + '/stats', {
      headers: this.securityHeaders,
      params: {
        'order_by': direction + orderBy,
      }
    });
    return response.data
  }
}

const API = new StreamViewerAPI();

export default API;
