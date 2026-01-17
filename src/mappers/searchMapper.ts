import { Playlist, User, TrackSnippet, ArtistSnippet, AlbumSnippet } from "../classes"
import { Spotify } from "../Spotify"
import { APISearch } from "../types/APISearch"

export function mapSearchByType(spotify: Spotify, req: APISearch, type: "playlists" | "tracks" | "podcasts" | "genres" | "artists" | "albums" | "users",) {
    switch (type) {
        case "playlists":
            return req.data.searchV2.playlists?.items.map((playlist) => new Playlist(spotify, {
                uri: playlist.data.uri,
                name: playlist.data.name,
                description: playlist.data.description,
                owner: new User(spotify, {
                    uri: playlist.data.ownerV2.data.uri,
                    username: playlist.data.ownerV2.data.username,
                    name: playlist.data.ownerV2.data.name,
                    avatar: playlist.data.ownerV2.data.avatar.sources
                }),
                images: playlist.data.images.items.map(img => img.sources).flat()
            }))

        case "tracks":
            return req.data.searchV2.tracksV2?.items.map((track) => new TrackSnippet(spotify, {
                uri: track.item.data.uri,
                name: track.item.data.name,
                artists: track.item.data.artists.items.map((artist) => new ArtistSnippet(spotify, {
                    uri: artist.uri,
                    name: artist.profile.name,
                })),
                duration: track.item.data.duration.totalMilliseconds,
                contentRating: track.item.data.contentRating.label
            }))

        // case "podcasts":
        //     return req.data.searchV2.podcasts?.items

        case "artists":
            return req.data.searchV2.artists?.items.map((artist) => new ArtistSnippet(spotify, {
                uri: artist.data.uri,
                name: artist.data.profile.name,
                images: artist.data.visuals.avatarImage?.sources || null
            }))

        case "albums":
            return req.data.searchV2.albumsV2?.items.map((album) => new AlbumSnippet(spotify, {
                name: album.data.name,
                uri: album.data.uri,
                type: album.data.type,
                artists: album.data.artists.items.map(artist => new ArtistSnippet(spotify, {
                    uri: artist.uri,
                    name: artist.profile.name
                })),
                date: {
                    dateObject: (() => {
                        const d = new Date(0)
                        d.setFullYear(album.data.date.year)
                        return d
                    })(),
                    precision: "YEAR"
                }
            }))

        case "users":
            return req.data.searchV2.users?.items.map(user => new User(spotify, {
                uri: user.data.uri,
                username: user.data.username,
                name: user.data.displayName,
                avatar: user.data.avatar.sources
            }))
        default:
            break;
    }
}