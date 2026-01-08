import { ImageSrc } from "../types/APIGeneric"
import { Spotify } from "../../Spotify"
import { ArtistSnippet } from "./Artist"
import { TrackSnippet } from "./Track"
import { albumType } from "../types/APIAlbum"
import { SpotifyIdentifier } from "../helpers"

export class BaseAlbum {
    spotify: Spotify
    saved?: boolean
    name: string
    uri: string
    type: albumType
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
        this.saved = album?.saved
        this.name = album?.name
        this.uri = album?.uri
        this.type = album.type
        this.artists = album.artists
        this.date = album.date
    }

    toJSON() {
        return {
            saved: this.saved,
            name: this.name,
            uri: this.uri,
            type: this.type,
            artists: this.artists.map(artist => artist.toJSON()),
            date: this.date,
        }
    }


    save() {
        return this.spotify.albums.addToLibrary([this.uri])
    }

    unsave() {
        return this.spotify.albums.removeFromLibrary([this.uri])
    }
}

export class AlbumSnippet extends BaseAlbum {
    getFullAlbum() { return this.spotify.albums.fetch(new SpotifyIdentifier(this.uri)) }
}

export class Album extends BaseAlbum {
    label: string
    copyright: { text: string, type: string }[]
    images: ImageSrc[]
    tracks: TrackSnippet[]

    constructor(spotify: Spotify, album: {
        saved: boolean
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
        images: ImageSrc[]
        tracks: TrackSnippet[]
    }) {
        super(spotify, album)
        this.label = album.label
        this.copyright = album.copyright
        this.images = album.images
        this.tracks = album.tracks
    }

    toJSON() {
        return {
            saved: this.saved,
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
