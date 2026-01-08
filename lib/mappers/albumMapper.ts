import { APIAlbumTrack, APIWhatsNewFeedItems } from "../types/APIAlbum";
import { Spotify } from "../../Spotify";
import { Album, AlbumSnippet } from "../classes/Album";
import { ArtistSnippet } from "../classes/Artist";
import { TrackSnippet } from "../classes/Track";
import { APIAlbum } from "../types/APIAlbum";
import { APILookupResponse } from "../types/APIGeneric";

function mapTracks(spotify: Spotify, track: APIAlbumTrack) {
    return new TrackSnippet(spotify, {
        saved: track.saved,
        uri: track.uri,
        name: track.name,
        artists: track.artists.items.map(artist => new ArtistSnippet(spotify, { uri: artist.uri, name: artist.profile.name })),
        duration: track.duration.totalMilliseconds,
        contentRating: track.contentRating.label,
    })
}
export function mapAlbum(spotify: Spotify, apiAlbum: APIAlbum) {
    return new Album(spotify, {
        saved: apiAlbum.saved,
        name: apiAlbum.name,
        uri: apiAlbum.uri,
        type: apiAlbum.type,
        artists: apiAlbum.artists.items.map(art => new ArtistSnippet(spotify, { uri: art.uri, name: art.profile.name, images: art.visuals.avatarImage.sources })),
        date: {
            dateObject: new Date(apiAlbum.date.isoString),
            precision: apiAlbum.date.precision
        },
        label: apiAlbum.label,
        copyright: apiAlbum.copyright.items,
        images: apiAlbum.coverArt.sources,
        tracks: apiAlbum.tracksV2.items.map(t => mapTracks(spotify, t.track)),
    })
}

export function mapNewAlbums(spotify: Spotify, whatsNewFeedRes: APIWhatsNewFeedItems) {
    return {
        "items": whatsNewFeedRes.items.map((album) => (
            new AlbumSnippet(spotify, {
                name: album.content.data.name,
                uri: album.content.data.uri,
                type: album.content.data.albumType,
                artists: album.content.data.artists.items.map(art => new ArtistSnippet(spotify, { uri: art.uri, name: art.profile.name })),
                date: {
                    dateObject: new Date(album.content.data.date.isoString),
                    precision: album.content.data.date.precision,
                }
            })
        )),
        "pagingInfo": whatsNewFeedRes.pagingInfo,
        "totalCount": whatsNewFeedRes.totalCount
    }
}