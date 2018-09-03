import axios from 'axios';

import Auth from './auth';

class StreamViewerAPI {

  constructor() {
    this.sendMessageToChat = this.sendMessageToChat.bind(this);

    Auth.isInitialized.then(() => {
      this.securityHeaders = {
        'Authorization': 'Bearer ' + Auth.getLocalAPIToken(),
      }
    });
  }

  async sendMessageToChat(message, videoId) {
    console.log(this.securityHeaders);
    let response = await axios.post('/api/streams/' + videoId + '/message', {
      'message': message
    }, this.securityHeaders);
  }
}

const API = new StreamViewerAPI();

export default API;
