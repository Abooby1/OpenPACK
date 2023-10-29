import fetch from "node-fetch"
import FormData from "form-data"
import SimpleSocket from "simple-socket-js"
import fs from 'fs'
import sleep from "es7-sleep"
import JSONdb from "simple-json-db"
import {ClientAuth} from './photopclient.js'

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