import * as Classes from './index.js'

export class Group {
	constructor(groupid) {
		this.__groupid = groupid;

		this.__group = sendRequest(`groups?groupid=${groupid}`, 'GET')
	}

	async __redefineData() {
		let data = await this.__group;
		
		try {
			data = JSON.parse(data[1]);
			let authorID = data.Owner;
			this.__owner = new User({ userid: authorID });
			this.__group = data.groups[0];

			await this.__owner.__redefineData();

			this.__init = true;
			return this.__group;
		}catch(err) {
			console.error(`Group ${this.__groupid} has given an error: ${data[1]}`)
		}
	}
	get id() {
		if(!this.__init) return 'Data isnt initialized.';
		return this.__groupid;
	}
	get name() {
		if(!this.__init) return 'Data isnt initialized.';
		return this.__group.Name;
	}
	get owner() {
		if(!this.__init) return 'Data isnt initialized.';
		return this.__owner;
	}
	get invite() {
		if(!this.__init) return 'Data isnt initialized.';
		return this.__group.Invite;
	}
	get created() {
		if(!this.__init) return 'Data isnt initialized.';
		return this.__group.Timestamp;
	}
	get image() {
		if(!this.__init) return 'Data isnt initialized.';
		return `${PhotopConfig.assets}GroupImages/${this.__group.Icon}`;
	}

	async members() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`groups/members?groupid=${this.__groupid}`, 'GET');
			if(code == 200) {
				response = JSON.parse(response).Members;

				response = response.map(async(a) => {
					let user = new Classes.User({
						userid: a._id
					})

					await user.__redefinedData()
					return user;
				})
			}

			res(response)
		})
	}
	async moderators() {
		return new Promise(async (res, rej) => {
			let [code, response] = await sendRequest(`groups/members?groupid=${this.__groupid}`, 'GET');
			if(code == 200) {
				response = JSON.parse(response).Moderators || new Array();

				response = response.map(async(a) => {
					let user = new Classes.User({
						userid: a._id
					})

					await user.__redefinedData()
					return user;
				})
			}

			res(response)
		})
	}

	async edit() {
		//
	}

	async invites() {
		//
	}
	async invite(userid) {
		//
	}
}
export class GroupInvite {
	constructor(inviteid) {
		this.__inviteid = inviteid;
	}

	async accept() {
		//
	}
	async deny() {
		//
	}
}