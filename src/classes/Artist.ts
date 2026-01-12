import { Spotify } from "../../"
import SpotifyIdentifier from "../helpers/SpotifyIdentifier"
import { ImageSrc } from "../types/APIGeneric"
import { AlbumSnippet } from "./Album"

export class BaseArtist {
    following?: boolean
    spotify: Spotify
    uri: string
    name: string
    images?: ImageSrc[]

    constructor(spotify: Spotify,
        { following: saved, uri, name, images }: {
            following?: boolean
            uri: string
            name: string
            images?: ImageSrc[]
        }
    ) {
        this.following = saved
        this.spotify = spotify
        this.uri = uri
        this.name = name
        this.images = images
    }

    async checkFollowing() {
        if (this.following) return this.following
        const isSavedRes = await this.spotify.artists.checkFollowing([new SpotifyIdentifier(this.uri)])
        return isSavedRes[0] || false
    }
    async follow() {
        return this.spotify.artists.follow([new SpotifyIdentifier(this.uri)])
    }
    async unfollow() {
        return this.spotify.artists.unfollow([new SpotifyIdentifier(this.uri)])
    }

    async toJSON() {
        const following = await this.checkFollowing()
        return {
            following,
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
        following: boolean,
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
        this.images = artist.images
        this.imageHeader = artist.imageHeader
        this.imageAvatar = artist.imageAvatar
        this.externalLinks = artist.externalLinks
        this.verified = artist.verified
        this.stats = artist.stats
        this.discography = artist.discography
    }

    async toJSON() {
        const following = await this.checkFollowing()
        return {
            uri: this.uri,
            name: this.name,
            images: this.images,
            following,
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