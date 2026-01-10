import { url } from "node:inspector";
import { Spotify } from "../../";
import { ArtistSnippet } from "../classes/Artist";
import { TrackSnippet } from "../classes/Track";
import { CurrentUser, User } from "../classes/User";
import { APICurrentUser, APIUser, APIUserFollowers, APIUserFollowing, APIUserPlaylists, APIUserTop } from "../types/APIUsers";
import { Playlist } from "../classes/Playlist";
import SpotifyIdentifier from "../helpers/SpotifyIdentifier";

export function mapCurrentUser(spotify: Spotify, apiUser: APICurrentUser) {
    return new CurrentUser(spotify, {
        uri: apiUser.data.me.profile.uri,
        username: apiUser.data.me.profile.username,
        name: apiUser.data.me.profile.name,
        avatarBackgroundColor: apiUser.data.me.profile.avatarBackgroundColor,
        avatar: apiUser.data.me.profile.avatar.sources,
    })
}

export function mapUser(spotify: Spotify, apiUser: APIUser) {
    return new User(spotify, {
        uri: apiUser.uri,
        username: apiUser.uri.split(":")[2],
        name: apiUser.name,
        avatarBackgroundColor: apiUser.color,
        avatar: [{ height: 300, width: 300, url: apiUser.image_url }],
    })
}

export function mapTopArtists(spotify: Spotify, apiTop: APIUserTop) {
    return {
        totalCount: apiTop.data.me.profile.topArtists?.totalCount || 0,
        items: apiTop.data.me.profile.topArtists?.items.map(artist => new ArtistSnippet(spotify, {
            uri: artist.data.uri,
            name: artist.data.profile.name,
            images: artist.data.visuals.avatarImage.sources,
        })) || []
    }
}

export function mapTopTracks(spotify: Spotify, apiTop: APIUserTop) {
    return {
        totalCount: apiTop.data.me.profile.topTracks?.totalCount || 0,
        items: apiTop.data.me.profile.topTracks?.items.map(track => new TrackSnippet(spotify, {
            saved: track.data.saved,
            uri: track.data.uri,
            name: track.data.name,
            artists: track.data.artists.items.map(artist => new ArtistSnippet(spotify, { uri: artist.uri, name: artist.profile.name })),
            duration: track.data.duration.totalMilliseconds,
            contentRating: track.data.contentRating.label,
        })) || []
    }
}

export function mapUserFollowers(spotify: Spotify, apiUserFollowers: APIUserFollowers) {
    return apiUserFollowers.profiles.map(user => new User(spotify, {
        uri: user.uri,
        username: user.uri.split(":")[2],
        name: user.name,
        avatarBackgroundColor: user.color,
        avatar: [{ height: 300, width: 300, url: user.image_url }],
    }))
}

export function mapUserFollowing(spotify: Spotify, apiUserFollowers: APIUserFollowing) {
    return apiUserFollowers.profiles.map(user => {
        const regex = /spotify:(.+):(.+)/gm;
        const uriRegex = regex.exec(user.uri)
        if (uriRegex == null) throw new Error(`URI ${user.uri} is invalid`)
        if (uriRegex[1] == "user") return new User(spotify, {
            uri: user.uri,
            username: uriRegex[2],
            name: user.name,
            avatarBackgroundColor: user.color || 0,
            avatar: [{ height: 300, width: 300, url: user.image_url }],
        })
        if (uriRegex[1] == "artist") return new ArtistSnippet(spotify, {
            uri: user.uri,
            name: user.name,
            images: [{ height: 300, width: 300, url: user.image_url }],
        })

    })
}

export function mapUserPlaylists(spotify: Spotify, apiUserPlaylists: APIUserPlaylists) {
    return {
        totalCount: apiUserPlaylists.total_public_playlists_count,
        items: apiUserPlaylists.public_playlists.map(playlist => new Playlist(spotify, {
            following: playlist.is_following || false,
            uri: playlist.uri,
            name: playlist.name,
            description: "",
            owner: new User(spotify, { uri: playlist.owner_uri, name: playlist.owner_name, username: playlist.owner_uri.split(":")[2] }),
            members: [{
                user: new User(spotify, { uri: playlist.owner_uri, name: playlist.owner_name, username: playlist.owner_uri.split(":")[2] }),
                "isOwner": true,
                "permissionLevel": "CONTRIBUTOR"
            }],
            images: [{ width: 300, height: 300, url: playlist.image_url.startsWith("spotify:mosaic") ? new SpotifyIdentifier(playlist.image_url).url : playlist.image_url }]
        }))
    }
}