import axios from 'axios';
import FormData from "form-data";
import fs from 'fs';
import { sendRequest, socket } from './utils.js';
import * as Classes from './classes/index.js';

export var ClientAuth;
export var ClientConfig = {
	GroupConnecting: true,
	BetterPhotopConnection: false,
	OpenPACKStats: false
}

export var PostCache = new Object()
export var UserCache = new Object()

export class Client {
	constructor({userid, token, config}) {
		this.__auth = `${userid};${token}`;
		this.__userid = userid;
		if(config) {
			for(let configItem of Object.keys(config)) {
				ClientConfig[configItem] = config[configItem]
			}

			this.__config = ClientConfig;
		}

		this.__postListeners = new Array();
		ClientAuth = this.__auth;
	}

	async selfData() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest('me', 'GET')

			if(code == 200) {
				res(JSON.parse(response))
			} else {
				res(response)
			}
		})
	}
	async setUsername(name) {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest('me/settings', 'POST', {
				update: 'username',
				value: name
			})

			res(response)
		})
	}
	async setBio(bio) {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest('me/settings', 'POST', {
				update: 'description',
				value: bio
			})

			res(response)
		})
	}
	async setVisibility(vis) {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest('me/settings', 'POST', {
				update: 'visibility',
				value: vis
			})

			res(response)
		})
	}
	async setProfilePic(imagedir) {
		return new Promise(async (res, rej) => {
			let formData = new FormData()
			formData.append('image', fs.createReadStream(imagedir))
			
			axios.post('https://photop.exotek.co/me/new/picture', formData, {
				headers: {
					auth: ClientAuth
				}
			}).then(response => {
				res(response.data)
			}).catch(response => {
				res(response.response.data)
			})
		})
	}
	async setBanner(imagedir) {
		return new Promise(async (res, rej) => {
			let formData = new FormData()
			formData.append('image', fs.createReadStream(imagedir))

			axios.post('https://photop.exotek.co/me/new/banner', formData, {
				headers: {
					auth: ClientAuth
				}
			}).then(response => {
				res(response.data)
			}).catch(response => {
				res(response.response.data)
			})
		})
	}

	async blockedUsers() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest('me/blocked', 'GET')

			if(code == 200) {
				response = JSON.parse(response)

				res(response.map(async (a) => {
					let user = new Classes.User({
						data: a
					})

					await user.__redefineData()
					return user;
				}))
			}
		})
	}
	async getUsers(term) {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/search?term=${term}&amount=50`, 'GET')

			if(code == 200) {
				response = JSON.parse(response)

				res(response.map(data => {
					return new Classes.User({
						data
					})
				}))
			}
		})
	}
	async getUserById(userid) {
		if(UserCache[userid]) {
			return UserCache[userid];
		}
		
		return new Promise(async (res, rej) => {
			let user = new Classes.User({
				userid
			})

			await user.__redefineData()
			UserCache[userid] = user;
			UserCache[user.name] = user;
			
			res(user)
		})
	}
	async getUserByName(name) {
		if(UserCache[name]) {
			return UserCache[name];
		}
		
		return new Promise(async (res, rej) => {
			let user = new Classes.User({
				name
			})

			await user.__redefineData()
			UserCache[name] = user;
			UserCache[user.id] = user;
			
			res(user)
		})
	}
	async getUserProfile(userid) {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/profile?id=${userid}`, 'GET')

			if(code == 200) {
				res(JSON.parse(response))
			} else {
				res(response)
			}
		})
	}

	async getPost(id) {
		if(PostCache[id]) {
			return PostCache[id];
		}
		
		return new Promise(async (res, rej) => {
			let post = new Classes.Post(id)

			await post.__redefineData()
			PostCache[id] = post;
			
			res(post)
		})
	}

	async post(text, images=[], groupid) {
		if(!text)
			return 'Text is needed.';
		
		return new Promise(async (res, rej) => {
			let formData = new FormData()
			formData.append('data', JSON.stringify({ text }))
			for(let i=0;i<images.length;i++) {
				formData.append(`image${i}`, fs.createReadStream(images[i]))
			}

			axios.post(`https://photop.exotek.co/posts/new${groupid?`?group=${groupid}`:''}`, formData, {
				headers: {
					auth: ClientAuth
				}
			}).then(response => {
				res(response.data)
			}).catch(response => {
				res(response.response.data)
			})
		})
	}

	async onPost(callback, groupid) {
		if(groupid) {
			if(ClientConfig.GroupConnecting) {
				console.error('onPost with the "groupid" param is only available when the client configuration "GroupConnecting" is turned off.')
				return;
			}
			return;
		}
		
		this.__postListeners.push(callback)
		let postListeners = this.__postListeners;
		let query = {
			task: 'general',
			location: 'home',
			fullNew: true
		}
		
		if(ClientConfig.GroupConnecting) {
			let botData = await this.selfData()
			
			query.groups = Object.keys(botData.groups)
		}
    
		socket.subscribe(query, function(data) {
			if(data.type != 'newpost') return;
			
			postListeners.forEach(async (callback) => {
				let post = new Classes.Post(data.post._id, data.post.GroupID)

				await post.__redefineData()
				callback(post)
			})
		})
	}
}

export default Client;