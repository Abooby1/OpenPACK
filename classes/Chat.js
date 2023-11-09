import { sendRequest, socket } from "../utils.js";
import { User } from "./User.js";

export class Chat {
  constructor(id, postid, groupid) {
    this.__id = id;
    this.__postid = postid;
		this.__groupid = groupid;

    this.__chat = sendRequest(`chats?chatid=${this.__id}${groupid?`&groupid=${groupid}`:''}`, 'GET');
  }

  async __redefineData() {
    let data = await this.__chat;

    try {
			data = JSON.parse(data[1]).chats[0];
			if(!data) {
				data = 'Chat doesnt exist.';
				throw new Error('Chat doesnt exist.')
			}
			
			let authorID = data.UserID;
			this.__author = new User({ userid: authorID });
			this.__chat = data;

			await this.__author.__redefineData();

			this.__init = true;
			return this.__chat;
		} catch(err){
			console.log(`Chat ${this.__id} has given error: ${data}`)
		}
  }

  get id() {
		if(!this.__init) return 'Data isnt initialized.';
    return this.__id;
  }

  get content() {
		if(!this.__init) return 'Data isnt initialized.';
    return this.__chat.Text;
  }

  get author() {
		if(!this.__init) return 'Data isnt initialized.';
    return this.__author;
  }

  async delete() {
    let [code, response] = await sendRequest(`chats/delete?chatid=${this.__chat._id}`, "DELETE");

    if (code == 200) {
      return;
    } else {
      console.error("An unknown error has occurred.");
    }
  }
  
  async reply(text) {
		if(!this.__init) return 'Data isnt initialized.';
    return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`chats/new?postid=${this.__postid}`, 'POST', {
				text,
				replyID: this.__id
			});

			res(response)
		})
  }

	async report() {
		//
	}

	async onEdit(callback) {
		//
	}
	async onDelete(callback) {
		//
	}
}