import { sendRequest, formatRoles, PhotopConfig } from '../utils.js'

export class User {
	constructor({userid, name, data}) {
		this.__id = userid;
		this.__name = name;

		if(!data) {
			this.__user = sendRequest(`user${userid?`?id=${userid}`:`?name=${name}`}`, 'GET')
		} else {
			this.__user = data;
		}
	}

	async __redefineData() {
		let data = await this.__user;
		try {
			this.__user = {
				status: data[0],
				data: JSON.parse(data[1])
			};
			
			this.__init = true;
			return this.__user;
		} catch(err) {
			console.error(`User ${this.__id} has given an error: ${data[1]}`)
		}
	}
	get id() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user._id;
	}
	get name() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.User;
	}
	get created() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.CreationTime;
	}
	get picture() {
		if(!this.__init) return 'UserData isnt initialized.';

		return `${PhotopConfig.assets}ProfileImages/${this.__user.Settings.ProfilePic}`;
	}
	get banner() {
		if(!this.__init) return 'UserData isnt initialized.';

		return `${PhotopConfig.assets}ProfileBanners/${this.__user.Settings.ProfileBanner}`;
	}
	get followerCount() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.ProfileData.Followers;
	}
	get followingCount() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.ProfileData.Following;
	}
	get bio() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.ProfileData.Description;
	}
	get visibility() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.ProfileData.Visibility;
	}
	get pinnedPost() {
		if(!this.__init) return 'UserData isnt initialized.';

		return this.__user.ProfileData.PinnedPost;
	}
	get status() {
		if(!this.__init) return 'UserData isnt initialized.';

		return {
			raw: this.__user.Status,
			parsed: function() {
				switch(this.__user.Status) {
					case 0: return 'Offline';
					case 1: return 'Online';
					case 2: return 'In Group';
				}
			}
		}
	}
	get roles() {
		if(!this.__init) return 'UserData isnt initialized.';
		let roles = this.__user.Role;

		if(typeof roles == 'string') {
			return roles;
		} else {
			return roles.map(a => {
				return formatRoles(a)
			})
		}
	}

	async follow() {
		let userid = this.__id;
		
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/follow?userid=${userid}`, 'PUT')

			res(response)
		})
	}
	async unfollow() {
		let userid = this.__id;

		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/unfollow?userid=${userid}`, 'DELETE')

			res(response)
		})
	}

	async block() {
		let userid = this.__id;

		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/block?userid=${userid}`, 'PUT')

			res(response)
		})
	}
	async unblock() {
		let userid = this.__id;

		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/unblock?userid=${userid}`, 'PUT')

			res(response)
		})
	}

	async parsedFollowers() {
		let userid = this.__id;

		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/followers?userid=${userid}&amount=50`, 'GET')

			if(code == 200) {
				res(JSON.parse(response))
			} else {
				res(response)
			}
		})
	}
	async parsedFollowing() {
		let userid = this.__id;

		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`user/following?userid=${userid}&amount=50`, 'GET')

			if(code == 200) {
				res(JSON.parse(response))
			} else {
				res(response)
			}
		})
	}
}
export class GivenDataUser {
	constructor(data) {
		//
	}
}