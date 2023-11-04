import { sendRequest, getImage, initListener, socket } from "../utils.js";
import { User } from "./User.js";
import { Chat } from "./Chat.js";
import FormData from 'FormData';

export class Post {
  constructor(postid, groupid) {
    this.__id = postid;
		this.__groupId = groupid;
		
		this.__post = sendRequest(`posts?postid=${postid}${groupid?`&groupid=${groupid}`:''}`, 'GET');
  }

	async __redefineData() {
		let data = await this.__post;
    let authorID = data.UserID;
    this.__author = new User({ userid: authorID });
    this.__post = JSON.parse(data[1]).posts[0];

    await this.__author.__redefineData();

		this.__init = true;
		return this.__post;
	}

	get id() {
		if(!this.__init) return 'Data isnt initialized.';
		
		return this.__post._id;
	}
  get content() {
		if(!this.__init) return 'Data isnt initialized.';
    let data = this.__post;

    return data.Text;
  }
  get createdAt() {
		if(!this.__init) return 'Data isnt initialized.';
    let data = this.__post;

    return data.Timestamp;
  }
  get chatCount() {
		if(!this.__init) return 'Data isnt initialized.';
    let data = this.__post;

    return data.Chats;
  }
  get quoteCount() {
		if(!this.__init) return 'Data isnt initialized.';
    return this.__post.Quotes;
  }
  get likeCount() {
		if(!this.__init) return 'Data isnt initialized.';
    return this.__post.Likes;
  }
  get imageCount() {
		if(!this.__init) return 'Data isnt initialized.';
    return this.__post.Media;
  }
  get media() {
		if(!this.__init) return 'Data isnt initialized.';
    let data = this.__post;
    let media = [];

    if (data.Media.ImageCount == 1) {
      media.push(getImage(data._id, 0));
    } else if (data.Media.ImageCount == 0) {
      return null;
    } else if (data.Media.ImageCount > 1) {
      for (let i=0;i<data.Media.ImageCount;i++) {
        media.push(getImage(data._id, i));
      }
    }

    return media;
  }
  get author() {
		if(!this.__init) return 'Data isnt initialized.';
    const author = this.__author;

    return author;
  }

	async delete() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`posts/delete?postid=${this.__id}`, 'DELETE')
			res(response)
		})
	}
  
	async edit(text) {
		return new Promise((res, rej) => {
			let form = new FormData()
			form.append('data', JSON.stringify({text}))

			axios.post(serverURL + 'posts/edit?postid=' + this.postData._id, form, {
				headers: {
					"auth": client.auth
				}
			}).then(response => {
				res(response.data)
			}).catch(response => {
				if(!response.response) return;
				res(response.response.data)
			})
		})
	}

	async like() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`posts/like?postid=${this.__id}`, 'PUT')
			res(response)
		})
	}
	async unlike() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`posts/unlike?postid=${this.__id}`, 'DELETE')
			res(response)
		})
	}

	async pin() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`posts/pin?postid=${this.__id}`, 'PUT')
			res(response)
		})
	}
	async unpin() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`posts/unpin?postid=${this.__id}`, 'DELETE')
			res(response)
		})
	}
	
	async report() {
		//
	}

	async onChat(callback) {
		let returnValue = {
			postid: this.__id,
			callback
		}
		if(this.__groupId) {
			returnValue.groupid = this.__groupId;
		}
		
		initListener('chat', returnValue)
	}
	async onEdit(callback) {
		//
	}
	async onDelete(callback) {
		//
	}
}