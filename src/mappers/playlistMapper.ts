import { Spotify } from "../../";
import { ArtistSnippet } from "../classes/Artist";
import { Playlist } from "../classes/Playlist";
import { TrackSnippet } from "../classes/Track";
import { User } from "../classes/User";
import { APIPlaylist } from "../types/APIPlaylist";

export function mapPlaylist(spotify: Spotify, apiPlaylist: APIPlaylist) {
    const content: { [key: number]: { track?: TrackSnippet, uid: string, addedAt: Date } } = {}
    const start_i = apiPlaylist.data.playlistV2.content.pagingInfo.offset
    apiPlaylist.data.playlistV2.content.items.forEach((track, i) => {
        console.log(track.itemV2);

        content[i + start_i] = {
            addedAt: new Date(track.addedAt.isoString),
            //TODO fix USER
            uid: track.uid,
            track: track.itemV2.__typename == "TrackResponseWrapper" ? new TrackSnippet(spotify, {
                uri: track.itemV2.data.uri,
                name: track.itemV2.data.name,
                artists: track.itemV2?.data?.artists.items
                    .map(a => new ArtistSnippet(spotify, { uri: a.uri, name: a.profile.name })),
                duration: track.itemV2.data.trackDuration.totalMilliseconds,
                contentRating: track.itemV2.data.contentRating.label
            }) : undefined
        }
    });

    return new Playlist(spotify, {
        following: apiPlaylist.data.playlistV2.following,
        uri: apiPlaylist.data.playlistV2.uri,
        name: apiPlaylist.data.playlistV2.name,
        description: apiPlaylist.data.playlistV2.description,
        owner: new User(spotify, {
            uri: apiPlaylist.data.playlistV2.ownerV2.data.uri,
            username: apiPlaylist.data.playlistV2.ownerV2.data.username,
            name: apiPlaylist.data.playlistV2.ownerV2.data.name,
            avatar: apiPlaylist.data.playlistV2.ownerV2.data.avatar.sources,
            "avatarBackgroundColor": 0,
        }),
        members: apiPlaylist.data.playlistV2.members.items.map(m => ({
            user: new User(spotify, {
                "uri": m.user.data.uri,
                "username": m.user.data.username,
                "name": m.user.data.name,
                "avatar": m.user.data.avatar.sources,
                "avatarBackgroundColor": 0,
            }),
            "isOwner": m.isOwner,
            "permissionLevel": m.permissionLevel
        })),
        images: apiPlaylist.data.playlistV2.images.items.map(i => i.sources).flat(),
        content: content
    })
}


