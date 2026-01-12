import { Spotify } from "../../";
import SpotifyIdentifier from "../helpers/SpotifyIdentifier";
import { ImageSrc } from "../types/APIGeneric";
import { Track, TrackSnippet } from "./Track";
import { User } from "./User";

export class Playlist {
    spotify: Spotify
    following: boolean
    uri: string
    name: string
    description: string
    owner: User
    members: { user: User, "isOwner": boolean, "permissionLevel": "CONTRIBUTOR" | "VIEWER" }[]
    images: ImageSrc[]
    constructor(spotify: Spotify, playlist: {
        following: boolean
        uri: string
        name: string
        description: string
        owner: User
        members: { user: User, "isOwner": boolean, "permissionLevel": "CONTRIBUTOR" | "VIEWER" }[]
        images: ImageSrc[]
        content?: { [key: number]: { track?: TrackSnippet, uid: string, addedAt: Date } }

    }) {
        this.spotify = spotify
        this.following = playlist.following
        this.uri = playlist.uri
        this.name = playlist.name
        this.description = playlist.description
        this.owner = playlist.owner
        this.members = playlist.members
        this.images = playlist.images
    }



    async update(newAttributes: { name?: string, description?: string }) {
        if (this.owner.uri != this.spotify.user?.uri) throw new Error("You dont own this playlist")
        return this.spotify.playlists.update(new SpotifyIdentifier(this.uri), newAttributes)
    }

    async setVisability(isPublic: boolean) {
        if (this.owner.uri != this.spotify.user?.uri) throw new Error("You dont own this playlist")
        return this.spotify.playlists.setVisability(new SpotifyIdentifier(this.uri), isPublic)
    }

    async setCover(image: Buffer) {
        if (this.owner.uri != this.spotify.user?.uri) throw new Error("You dont own this playlist")
        return this.spotify.playlists.setCover(new SpotifyIdentifier(this.uri), image)
    }

    async removeCover() {
        if (this.owner.uri != this.spotify.user?.uri) throw new Error("You dont own this playlist")
        return this.spotify.playlists.removeCover(new SpotifyIdentifier(this.uri))
    }

    async fetchItems(options?: { limit: number, offset: number }) {
        return this.spotify.playlists.fetchItems(new SpotifyIdentifier(this.uri), options)
    }

    async addItems(addArgs: { tracksUris: string[], moveType?: "AFTER_UID" | "BOTTOM_OF_PLAYLIST", fromUid?: string }) {
        const hasUser = this.spotify.user && typeof this.spotify.user.uri != "undefined"
        if (!hasUser) throw new Error("You are not logged in")
        const isContributor = this.members
            .filter(mem => mem.permissionLevel == "CONTRIBUTOR")
            .map(mem => mem.user.uri)
            .includes(this.spotify.user?.uri || "")
        if (!isContributor) throw new Error("You can't edit this playlist")

        return this.spotify.playlists.addItems(new SpotifyIdentifier(this.uri), addArgs)
    }

    async removeItems(trackUIds: string[]) {
        const hasUser = this.spotify.user && typeof this.spotify.user.uri != "undefined"
        if (!hasUser) throw new Error("You are not logged in")
        const isContributor = this.members
            .filter(mem => mem.permissionLevel == "CONTRIBUTOR")
            .map(mem => mem.user.uri)
            .includes(this.spotify.user?.uri || "")
        if (!isContributor) throw new Error("You can't edit this playlist")


        return this.spotify.playlists.removeItems(new SpotifyIdentifier(this.uri), trackUIds)
    }

    async follow() { return this.spotify.playlists.followMany([new SpotifyIdentifier(this.uri)]) }
    async unfollow() { return this.spotify.playlists.unfollowMany([new SpotifyIdentifier(this.uri)]) }


    toJSON() {
        return {
            following: this.following,
            uri: this.uri,
            name: this.name,
            description: this.description,
            owner: this.owner.toJSON(),
            members: this.members.map(member => ({ user: member.user.toJSON(), isOwner: member.isOwner, permissionLevel: member.permissionLevel })),
            images: this.images,
        }
    }
}