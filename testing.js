// FOR TESTING PURPOSES (uses aboobybot as a test bot)

import { Client } from './OpenPACK.js'

const client = new Client({
	userid: '63824e52d62f9d79c6459b40',
	token: process.env['token']
});

client.onPost(async (post) => {
  post.onChat((chat) => {
		console.log(chat)
	});
})