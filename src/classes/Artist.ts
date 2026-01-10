import { Spotify } from "../../"
import SpotifyIdentifier from "../helpers/SpotifyIdentifier"
import { ImageSrc } from "../types/APIGeneric"
import { AlbumSnippet } from "./Album"

export class BaseArtist {
    spotify: Spotify
    uri: string
    name: string
    images?: ImageSrc[]

    constructor(spotify: Spotify,
        { uri, name, images }: {
            uri: string
            name: string
            images?: ImageSrc[]
        }
    ) {
        this.spotify = spotify
        this.uri = uri
        this.name = name
        this.images = images
    }

    toJSON() {
        return {
            uri: this.uri,
            name: this.name,
            images: this.images
        }
    }
}

export class ArtistSnippet extends BaseArtist {
    getFullArtist() { return this.spotify.artists.fetch(new SpotifyIdentifier(this.uri)) }
}


export class Artist extends BaseArtist {
    saved: boolean
    imageHeader: ImageSrc[]
    imageAvatar: ImageSrc[]
    externalLinks: { "name": string, "url": string }[]
    verified: boolean
    stats: {
        "followers": number,
        "monthlyListeners": number,
        "topCities": {
            "city": string
            "country": string
            "numberOfListeners": number,
            "region": string
        }[]
        "worldRank": number
    }
    discography: {
        albums: AlbumSnippet[]
        compilations: AlbumSnippet[]
        latest?: AlbumSnippet
        popularReleasesAlbums: AlbumSnippet[]
        singles: AlbumSnippet[]
    }

    constructor(spotify: Spotify, artist: {
        uri: string,
        name: string,
        images: ImageSrc[],
        saved: boolean,
        imageHeader: ImageSrc[],
        imageAvatar: ImageSrc[],
        externalLinks: { "name": string, "url": string }[],
        verified: boolean,
        stats: {
            "followers": number,
            "monthlyListeners": number,
            "topCities": {
                "city": string
                "country": string
                "numberOfListeners": number,
                "region": string
            }[],
            "worldRank": number
        },
        discography: {
            albums: AlbumSnippet[],
            compilations: AlbumSnippet[],
            latest?: AlbumSnippet,
            popularReleasesAlbums: AlbumSnippet[],
            singles: AlbumSnippet[],
        }
    }) {
        super(spotify, artist)
        this.saved = artist.saved
        this.images = artist.images
        this.imageHeader = artist.imageHeader
        this.imageAvatar = artist.imageAvatar
        this.externalLinks = artist.externalLinks
        this.verified = artist.verified
        this.stats = artist.stats
        this.discography = artist.discography
    }



    toJSON() {
        return {
            uri: this.uri,
            name: this.name,
            images: this.images,
            saved: this.saved,
            imageHeader: this.imageHeader,
            imageAvatar: this.imageAvatar,
            externalLinks: this.externalLinks,
            verified: this.verified,
            stats: this.stats,
            discography: {
                albums: this.discography.albums.map(album => album.toJSON()),
                compilations: this.discography.compilations.map(album => album.toJSON()),
                latest: this.discography.latest?.toJSON(),
                popularReleasesAlbums: this.discography.popularReleasesAlbums.map(album => album.toJSON()),
                singles: this.discography.singles.map(album => album.toJSON()),
            }
        }
    }
}