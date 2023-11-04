import fetch from "node-fetch"
import FormData from "form-data"
import SimpleSocket from "simple-socket-js"
import fs from 'fs'
import sleep from "es7-sleep"
import JSONdb from "simple-json-db"
import {ClientAuth} from './OpenPACK.js'
import * as Classes from './classes/index.js'

export var chatListeners = new Object()
export const PhotopConfig = {
	assets: 'https://photop-content.s3.amazonaws.com/',
	server: 'https://photop.exotek.co/'
}
export const socket = new SimpleSocket({
		project_id: "61b9724ea70f1912d5e0eb11",
		project_token: "client_a05cd40e9f0d2b814249f06fbf97fe0f1d5"
});

export async function sendRequest(url, method, body, auth, contentType = "application/json", stringify = true, useJson = false) {
	return new Promise(async (resolve, reject) => {
		let data = {
			method: method,
			headers: {
				"cache": "no-cache",
				"Content-Type": contentType,
				"auth": auth || ClientAuth
			}
		}

		if(body) {
			if (typeof body == "object" && body instanceof FormData == false) {
				body = JSON.stringify(body);
			}
			data.body = body;
		}

		let response = await fetch(PhotopConfig.server + url, data)
		resolve([response.status, await response.text()])
	})
}

let roleTypes = {
	"Owner": "👑",
	"Admin": "🔨",
	"Moderator": "🛡️",
	"Trial Moderator": "🛡️",
	"Developer": "👨‍💻",
	"Contributor": "🔧",
	"Bug Hunter": "🐛",
	"Verified": "📢",
	"Partner": "📷",
	"Tester": "🧪",
	"Bot": "🤖",
	"Premium": "⭐"
};
export function formatRoles(roleArr) {
	let returnValue = new Array();
	for(let role of roleArr) {
		returnValue.push({
			name: role,
			emoji: roleTypes[role]
		})
	}

	return returnValue;
}
export function getImage(postid, imageNum) {
  return `${PhotopConfig.assets}PostImages/${postid}${imageNum}`;
}

export var connectedPosts = {
	normal: new Array(),
	postListen: {
		listen: null,
		posts: new Array()
	},
	group: new Object()
}
export async function initListener(type, data) {
	if(type == 'chat') {
		chatListeners[data.postid] = data.callback;
		
		if(data.groupid) {
			if(connectedPosts.group[data.groupid]) {
				connectedPosts.group[data.groupid].push(data.postid)
			} else {
				connectedPosts.group[data.groupid] = [data.postid];
			}

			if(connectedPosts.group[data.groupid].length == 25) {
				connectedPosts.group[data.groupid].splice(0,1)
			}

			let [code, response] = await sendRequest(`chats/connect?groupid=${data.groupid}`, 'POST', {
				ssid: socket.secureID,
				connect: connectedPosts.group[data.groupid]
			})
			return;
		}

		connectedPosts.normal.push(data.postid)
		if(connectedPosts.normal.length == 25) {
			connectedPosts.normal.splice(0,1)
		}

		let [code, response] = await sendRequest('chats/connect', 'POST', {
			ssid: socket.secureID,
			connect: connectedPosts.normal
		})
	} else if(type == 'post') {
		if(connectedPosts.postListen.listen) {
			connectedPosts.postListen.listen.edit(query)
		} else {
			connectedPosts.postListen.listen = socket.subscribe({
				task: 'post',
				_id: connectedPosts.postListen.posts
			}, function(data) {
				//
			})
		}
	}
}

socket.remotes.stream = async function(response) {
	switch(response.type) {
		case 'chat':
			let chat = response.chat;

			if(chatListeners[chat.PostID]) {
				let chatClass = new Classes.Chat(chat._id, chat.PostID, chat.GroupID)

				await chatClass.__redefineData()
				chatListeners[chat.PostID](chatClass)
			}
			break;
	}
}