import axios from 'axios';

import Auth from './auth';

class StreamViewerAPI {

  constructor() {
    this.getCookie = this.getCookie.bind(this);
    this.sendMessageToChat = this.sendMessageToChat.bind(this);

    Auth.isInitialized.then(() => {
      this.csrfToken = this.getCookie('csrftoken');
      this.securityHeaders = {
        'Authorization': 'Bearer ' + Auth.getLocalAPIToken(),
        'X-CSRFToken': this.csrfToken,
      }
    });
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  async sendMessageToChat(message, videoId) {
    let response = await axios.post('/api/stream/' + videoId + '/message', {
      'message': message
    }, this.securityHeaders);
  }
}

const API = new StreamViewerAPI();

export default API;
