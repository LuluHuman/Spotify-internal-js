import { datePrecision, ImageObject } from "../../infra/api_types"
import { Spotify } from "../../.."
import { ArtistSnippet } from "../Artist/Artist"
import { TrackSnippet } from "../Track/Track"
import { AlbumType } from "../Album/Album.types"
import SpotifyIdentifier from "../../infra/Identifier/SpotifyIdentifier"

export class BaseAlbum {
    spotify: Spotify
    album_type: AlbumType
    //total_tracks: number
    //id:string
    uri: string
    #saved?: boolean
    name: string
    date: {
        dateObject: Date,
        precision: datePrecision
    }
    artists: ArtistSnippet[]
    constructor(spotify: Spotify, album: {
        saved?: boolean
        name: string
        uri: string
        album_type: AlbumType
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
        this.album_type = album.album_type
        this.artists = album.artists
        this.date = album.date
    }

    async toJSON() {
        const saved = await this.checkSaved()
        return {
            album_type: this.album_type,
            saved,
            name: this.name,
            uri: this.uri,
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
    total_tracks: number
    images: ImageObject[]
    tracks: TrackSnippet[]
    copyrights: { text: string, type: string }[]
    label: string
    constructor(spotify: Spotify, album: {
        album_type: AlbumType
        total_tracks: number
        saved?: boolean
        name: string
        uri: string
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
        this.total_tracks = album.total_tracks
        this.label = album.label
        this.copyrights = album.copyright
        this.images = album.images
        this.tracks = album.tracks
    }

    async toJSON() {
        const saved = await this.checkSaved()
        return {
            album_type: this.album_type,
            total_tracks: this.total_tracks,
            uri: this.uri,
            images: this.images,
            name: this.name,
            date: this.date,
            saved,
            artists: this.artists.map(artist => artist.toJSON()),
            label: this.label,
            copyright: this.copyrights,
            tracks: this.tracks.map(track => track.toJSON()),
        }
    }
}
