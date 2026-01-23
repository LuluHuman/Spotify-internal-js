import { ImageObject } from "../types/APIGeneric"
import { Spotify } from "../../"
import { ArtistSnippet } from "./Artist"
import { TrackSnippet } from "./Track"
import { albumType } from "../types/APIAlbum"
import SpotifyIdentifier from "../helpers/SpotifyIdentifier"

export class BaseAlbum {
    type: albumType
    #saved?: boolean
    spotify: Spotify
    name: string
    uri: string
    artists: ArtistSnippet[]
    date: {
        dateObject: Date,
        precision: "DAY" | "MONTH" | "YEAR"
    }
    constructor(spotify: Spotify, album: {
        saved?: boolean
        name: string
        uri: string
        type: albumType
        artists: ArtistSnippet[]
        date: {
            dateObject: Date,
            precision: "DAY" | "MONTH" | "YEAR"
        }
    }) {
        this.spotify = spotify
        this.#saved = album?.saved
        this.name = album?.name
        this.uri = album?.uri
        this.type = album.type
        this.artists = album.artists
        this.date = album.date
    }

    async toJSON() {
        const saved = await this.checkSaved()
        return {
            saved,
            name: this.name,
            uri: this.uri,
            type: this.type,
            artists: this.artists.map(artist => artist.toJSON()),
            date: this.date,
        }
    }

    async checkSaved() {
        if (this.#saved) return this.#saved
        const isSavedRes = await this.spotify.albums.checkSaved([new SpotifyIdentifier(this.uri)])
        return isSavedRes[0] || false
    }

    addToLibrary() {
        return this.spotify.albums.addToLibrary([new SpotifyIdentifier(this.uri)])
    }

    removeFromLibrary() {
        return this.spotify.albums.removeFromLibrary([new SpotifyIdentifier(this.uri)])
    }
}

export class AlbumSnippet extends BaseAlbum {
    getFullAlbum() { return this.spotify.albums.fetch(new SpotifyIdentifier(this.uri)) }
}

export class Album extends BaseAlbum {
    label: string
    copyright: { text: string, type: string }[]
    images: ImageObject[]
    tracks: TrackSnippet[]

    constructor(spotify: Spotify, album: {
        saved?: boolean
        name: string
        uri: string
        type: albumType
        artists: ArtistSnippet[]
        date: {
            dateObject: Date,
            precision: "DAY" | "MONTH" | "YEAR"
        }
        label: string
        copyright: { text: string, type: string }[]
        images: ImageObject[]
        tracks: TrackSnippet[]
    }) {
        super(spotify, album)
        this.label = album.label
        this.copyright = album.copyright
        this.images = album.images
        this.tracks = album.tracks
    }

    async toJSON() {
        const saved = await this.checkSaved()
        return {
            saved,
            name: this.name,
            uri: this.uri,
            type: this.type,
            artists: this.artists.map(artist => artist.toJSON()),
            date: this.date,
            label: this.label,
            copyright: this.copyright,
            images: this.images,
            tracks: this.tracks.map(track => track.toJSON()),
        }
    }
}
