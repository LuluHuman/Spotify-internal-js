import { Spotify } from "../../";
import { AlbumSnippet } from "./Album";
import { ArtistSnippet } from "./Artist";
import { ImageSrc } from "../types/APIGeneric";
import SpotifyIdentifier from "../helpers/SpotifyIdentifier";


export class BaseTrack {
    spotify: Spotify
    uri: string
    name: string
    artists: ArtistSnippet[]
    duration: number
    contentRating: string

    #saved?: boolean


    constructor(spotify: Spotify, track: {
        saved?: boolean
        uri: string
        name: string
        artists: ArtistSnippet[]
        duration: number
        contentRating: string
    }) {

        this.#saved = track.saved
        this.spotify = spotify
        this.uri = track.uri
        this.name = track.name
        this.artists = track.artists
        this.duration = track.duration
        this.contentRating = track.contentRating
    }

    toJSON() {
        return {
            uri: this.uri,
            name: this.name,
            artists: this.artists.map(artist => artist.toJSON()),
            duration: this.duration,
            contentRating: this.contentRating,
        }
    }

    async checkSaved() {
        if (this.#saved) return this.#saved
        const res = await this.spotify.tracks.checkSaved([new SpotifyIdentifier(this.uri)])
        return res[0]
    }

    async addToLibrary() { return this.spotify.tracks.addToLibrary([new SpotifyIdentifier(this.uri)]) }
    async removeFromLibrary() { return this.spotify.tracks.removeFromLibrary([new SpotifyIdentifier(this.uri)]) }
    async fetchCanvasUrl() { return this.spotify.tracks.fetchCanvasURL(new SpotifyIdentifier(this.uri)) }
    async fetchLyrics() { return this.spotify.tracks.fetchLyrics(new SpotifyIdentifier(this.uri)) }
}

export class Track extends BaseTrack {
    gid: string
    language: string[]
    originalTitle: string
    trackNumber: number
    discNumber: number
    album: AlbumSnippet
    hasLyrics: boolean
    externalId: { "type": string, "id": string }[]
    licensor: { "uuid": string }
    addedAt: Date
    releasedOn: Date
    images: ImageSrc[]

    constructor(spotify: Spotify, track: {
        saved?: boolean
        uri: string
        name: string
        artists: ArtistSnippet[]
        trackNumber: number
        discNumber: number
        duration: number
        contentRating: string
        gid: string
        language: string[]
        original_title: string
        album: AlbumSnippet
        has_lyrics: boolean
        external_id: { "type": string, "id": string }[]
        licensor: { "uuid": string }
        addedAt: Date
        releasedOn: Date
        images: ImageSrc[]
    }) {
        super(spotify, track)
        this.gid = track.gid
        this.language = track.language
        this.originalTitle = track.original_title
        this.album = track.album
        this.hasLyrics = track.has_lyrics
        this.externalId = track.external_id
        this.licensor = track.licensor
        this.addedAt = track.addedAt
        this.releasedOn = track.releasedOn
        this.images = track.images
        this.trackNumber = track.trackNumber
        this.discNumber = track.discNumber
    }



    toJSON() {
        return {
            uri: this.uri,
            name: this.name,
            artists: this.artists.map(artist => artist.toJSON()),
            duration: this.duration,
            contentRating: this.contentRating,
            gid: this.gid,
            language: this.language,
            originalTitle: this.originalTitle,
            album: this.album.toJSON(),
            hasLyrics: this.hasLyrics,
            externalId: this.externalId,
            licensor: this.licensor,
            addedAt: this.addedAt,
            releasedOn: this.releasedOn,
            images: this.images,
            trackNumber: this.trackNumber,
            discNumber: this.discNumber,
        }
    }

}

export class TrackSnippet extends BaseTrack {
    constructor(spotify: Spotify, track: {
        saved?: boolean
        uri: string
        name: string
        artists: ArtistSnippet[]
        duration: number
        contentRating: string
    }) {
        super(spotify, track)
    }
}

export interface APICanvas {
    "data": {
        "trackUnion": {
            "__typename": "Track",
            "canvas": {
                "fileId": string,
                "type": string//"VIDEO_LOOPING_RANDOM",
                "uri": string
                "url": string
            },
            "uri": string
        }
    }
}

export interface APILyrics {
    "lyrics": {
        "syncType": "LINE_SYNCED" | "UNSYNCED",
        "lines": {
            "startTimeMs": string
            "words": string
            "syllables": [],
            "endTimeMs": "0"
            "transliteratedWords": ""
        }[],
        "provider": string,
        "providerLyricsId": string,
        "providerDisplayName": string,
        "syncLyricsUri": "",
        "isDenseTypeface": boolean,
        "alternatives": [],
        "language": string,
        "isRtlLanguage": false,
        "capStatus": any,
        "previewLines": {
            "startTimeMs": string
            "words": string
            "syllables": [],
            "endTimeMs": "0"
            "transliteratedWords": ""
        }[]
    },
    "colors": { "background": number, "text": number, "highlightText": number },
    "hasVocalRemoval": boolean
} 