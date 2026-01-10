import { host, Spotify } from "../../src/Spotify";
import { ImageSrc } from "../types/APIGeneric";

export class User {
    spotify: Spotify
    uri: string
    username: string
    name: string
    avatarBackgroundColor?: number
    avatar?: ImageSrc[]
    constructor(spotify: Spotify, apiUser: {
        uri: string,
        username: string,
        name: string,
        avatarBackgroundColor?: number,
        avatar?: ImageSrc[],
    }) {
        this.spotify = spotify
        this.uri = apiUser.uri
        this.username = apiUser.username
        this.name = apiUser.name
        this.avatarBackgroundColor = apiUser.avatarBackgroundColor
        this.avatar = apiUser.avatar
    }

    toJSON() {
        return {
            uri: this.uri,
            username: this.username,
            name: this.name,
            avatarBackgroundColor: this.avatarBackgroundColor,
            avatar: this.avatar,
        }
    }

}

export class CurrentUser extends User { }