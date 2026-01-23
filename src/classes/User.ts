import { host, Spotify } from "../../src/Spotify";
import SpotifyIdentifier from "../helpers/SpotifyIdentifier";
import { ImageObject } from "../types/APIGeneric";

export class BaseUser {
    spotify: Spotify
    uri: string
    username: string
    name: string
    avatarBackgroundColor?: number
    avatar?: ImageObject[]
    constructor(spotify: Spotify, apiUser: {
        uri: string,
        username: string,
        name: string,
        avatarBackgroundColor?: number,
        avatar?: ImageObject[],
    }) {
        this.spotify = spotify
        this.uri = apiUser.uri
        this.username = apiUser.username
        this.name = apiUser.name
        this.avatarBackgroundColor = apiUser.avatarBackgroundColor
        this.avatar = apiUser.avatar
    }

    async fetchFollowers() {
        return this.spotify.users.fetchFollowers(new SpotifyIdentifier(this.uri))
    }
    async fetchFollowing() {
        return this.spotify.users.fetchFollowing(new SpotifyIdentifier(this.uri))
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

export class User extends BaseUser {
    async checkFollowing() {
        return this.spotify.users.checkFollowing([new SpotifyIdentifier(this.uri)])
    }
    async fetchPlaylists(options?: { offset?: number | undefined; limit?: number | undefined; }) {
        return this.spotify.users.fetchPlaylists(new SpotifyIdentifier(this.uri), options)
    }
    async follow() {
        return this.spotify.users.follow([new SpotifyIdentifier(this.uri)])
    }
    async unfollow() {
        return this.spotify.users.unfollow([new SpotifyIdentifier(this.uri)])
    }
}

export class CurrentUser extends BaseUser {
    async fetchTopArtists({ options, timeRange }: {
        timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM";
        options?: { offset?: number; limit?: number; }
    }) {
        return this.spotify.users.fetchTopArtists({ options, timeRange })
    }

    async fetchTopTracks({ options, timeRange }: {
        timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM";
        options?: { offset?: number; limit?: number; }
    }) {
        return this.spotify.users.fetchTopTracks({ options, timeRange })
    }
}