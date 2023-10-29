import axios from 'axios'
import FormData from "form-data"
import {sendRequest} from './utils.js'
import * as Classes from './classes/index.js'

export var ClientAuth;
export var ClientConfig = {
	GroupConnecting: true,
	BetterPhotopConnection: false,
	OpenPACKStats: false
}

export class Client {
	constructor({userid, token, config}) {
		this.auth = `${userid};${token}`;
		this.userid = userid;
		this.config = config;

		ClientConfig = config;
		ClientAuth = this.auth;
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
	async setProfilePic

	async getUser(term) {
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
		return new Promise(async (res, rej) => {
			let user = new Classes.User({
				userid
			})

			await user.__redefineData()
			res(user)
		})
	}
	async getUserByName(name) {
		return new Promise(async (res, rej) => {
			let user = new Classes.User({
				name
			})

			await user.__redefineData()
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
		return new Promise(async (res, rej) => {
			let post = new Classes.Post(id)

			await post.__redefineData()
			res(post)
		})
	}
}

export default Client;