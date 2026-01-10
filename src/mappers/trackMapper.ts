import { Spotify } from "../../";
import { AlbumSnippet } from "../classes/Album";
import { ArtistSnippet } from "../classes/Artist";
import { APICanvas, Track, TrackSnippet } from "../classes/Track";
import SpotifyIdentifier from "../helpers/SpotifyIdentifier";
import { APICheckSavedTracks, APISavedTracks, APITrack, APITracks } from "../types/APITrack";

export function mapTrack(spotify: Spotify, apiTrack: APITrack) {
    const mapDate = (date?: { day: number, month: number, year: number }) => {
        const day = (date?.day ? date?.day - 2 : 0) * 8.64e+7
        const month = (date?.month ? date?.month - 1 : 0) * 2.6298e+9
        const year = (date?.year || 0) * 3.15576e+10
        return day + month + year - 6.216847e+13
    }
    return new Track(spotify, {
        uri: apiTrack.canonical_uri,
        name: apiTrack.name,
        artists: apiTrack.artist.map(artist => new ArtistSnippet(spotify, { name: artist.name, uri: new SpotifyIdentifier(artist.gid, "artist").uri })),
        trackNumber: apiTrack.number,
        discNumber: apiTrack.disc_number,
        duration: apiTrack.duration,
        contentRating: "",
        gid: apiTrack.gid,
        language: apiTrack.language_of_performance,
        original_title: apiTrack.original_title,
        album: new AlbumSnippet(spotify, {
            name: apiTrack.album.name,
            uri: new SpotifyIdentifier(apiTrack.album.gid, "album").uri,
            type: "ALBUM",
            artists: apiTrack.album.artist.map(artist => new ArtistSnippet(spotify, { name: artist.name, uri: new SpotifyIdentifier(artist.gid, "artist").uri })),
            date: {
                dateObject: new Date(mapDate(apiTrack.album.date)),
                precision: "DAY"
            }
        }),
        has_lyrics: apiTrack.has_lyrics,
        external_id: apiTrack.external_id,
        licensor: apiTrack.licensor,
        addedAt: new Date(apiTrack.earliest_live_timestamp),
        releasedOn: new Date(apiTrack.implementation_details.catalog_insertion_date.seconds * 1000),
        images: apiTrack.album.cover_group.image.map(im => ({
            width: im.width, height: im.height, url: "https://i.scdn.co/image/" + im.file_id
        })),
    })
}
export function mapTracks(spotify: Spotify, apiTracks: APITracks) {
    return apiTracks.data.tracks?.map(track => (new TrackSnippet(spotify, {
        uri: track.uri,
        name: track.name,
        artists: track.artists.items.map(artist => new ArtistSnippet(spotify, { name: artist.profile.name, uri: artist.uri })),
        duration: track.duration.totalMilliseconds,
        contentRating: track.contentRating.label
    })))
}
export function mapSavedTracks(spotify: Spotify, apiTracks: APISavedTracks) {
    return {
        totalCount: apiTracks.data.me.library.tracks.totalCount,
        pagingInfo: apiTracks.data.me.library.tracks.pagingInfo,
        tracks: apiTracks.data.me.library.tracks.items.map((track) => ({
            addedAt: new Date(track.addedAt.isoString),
            track: new TrackSnippet(spotify, {
                uri: track.track._uri,
                name: track.track.data.name,
                artists: track.track.data.artists.items.map(artist => new ArtistSnippet(spotify, { name: artist.profile.name, uri: artist.uri })),
                duration: track.track.data.duration.totalMilliseconds,
                contentRating: track.track.data.contentRating.label
            })
        }))
    }
}
export function mapCheckSaveTracks(apiCheckSavedTracks: APICheckSavedTracks) {
    return apiCheckSavedTracks.data.lookup.map(track => track.data.isCurated)
}
export function mapTrackCanvas(apiCanvas: APICanvas) {
    return apiCanvas.data.trackUnion.canvas.url
}