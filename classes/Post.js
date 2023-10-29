import { sendRequest, getImage } from "../utils.js";
import { User } from "./User.js";

class Post {
  constructor(postid) {
    this.__id = postid;

		/*
			Do this for simplicity in the code

			do this in every param:
	 		let post = await this.__post; :)

			or (for this case) do:
	 		class.__redefineData() when you instantiate the class
    */
    
		this.__post = sendRequest(`posts?postid=${postid}`, 'GET')
  }

	async __redefineData() {
		let data = await this.__post;
		this.__post = {
			status: data[0],
			data: JSON.parse(data[1])
		};

		this.init = true;
		return this.__post;
	}
  
  get content() {
    let data = this.__post;

    return data.Text;
  }

  get createdAt() {
    let data = this.__post;

    return data.Timestamp;
  }

  get chatCount() {
    let data = this.__post;

    return data.Chats;
  }

  get quoteCount() {
    return this.__post.Quotes;
  }

  get likeCount() {
    return this.__post.Likes;
  }

  get imageCount() {
    return this.__post.Media;
  }

  get media() {
    let data = this.__post;
    let media = [];

    if (data.Media.ImageCount == 1) {
      media.push(getImage(data._id, 0));
    } else if (data.Media.ImageCount == 0) {
      return null;
    } else if (data.Media.ImageCount > 1) {
      while (let i=1;i<data.Media.ImageCount;i++) {
        media.push(getImage(data._id, i - 1));
      }
    }

    return media;
  }

  async author() {
    let authorID = this.__post.UserID;
    let userObject = new User(authorID);

		await userObject.__redefineData()
    return userObject;
  }
}