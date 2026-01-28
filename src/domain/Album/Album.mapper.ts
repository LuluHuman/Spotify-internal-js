import { APIAlbumsWrapper, APIAlbumTrack, APIWhatsNewFeedItems } from "../Album/Album.types"
import { Spotify } from "../../..";
import { Album, AlbumSnippet } from "../Album/Album";
import { ArtistSnippet } from "../Artist/Artist";
import { TrackSnippet } from "../Track/Track";
import { APIAlbum } from "../Album/Album.types";
import { APILibraryPage } from "../../infra/api_types";

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
    var total_tracks = 0
    apiAlbum.discs.items.forEach(d => total_tracks += d.tracks.totalCount)
    return new Album(spotify, {
        total_tracks,
        saved: apiAlbum.saved,
        name: apiAlbum.name,
        uri: apiAlbum.uri,
        album_type: apiAlbum.type,
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
                album_type: album.content.data.albumType,
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

export function mapSavedAlbum(spotify: Spotify, apiAlbum: APILibraryPage<APIAlbumsWrapper>) {
    return apiAlbum.data.me.libraryV3.items.map((album) => (
        new AlbumSnippet(spotify, {
            saved: true,
            name: album.item.data.name,
            uri: album.item.data.uri,
            album_type: album.item.data.type,
            artists: album.item.data.artists.items.map(art => new ArtistSnippet(spotify, { uri: art.uri, name: art.profile.name })),
            date: {
                dateObject: new Date(album.item.data.date.isoString),
                precision: album.item.data.date.precision
            }
        })
    ))
}