import { Spotify } from "../../Spotify";
import { AlbumSnippet } from "../classes/Album";
import { ArtistSnippet } from "../classes/Artist";
import { APISavedAlbums } from "../types/APIAlbum";

export function mapSavedAlbum(spotify: Spotify, apiAlbum: APISavedAlbums) {
    return apiAlbum.data.me.libraryV3.items.map((album) => (
        new AlbumSnippet(spotify, {
            saved: true,
            name: album.item.data.name,
            uri: album.item.data.uri,
            type: album.item.data.type,
            artists: album.item.data.artists.items.map(art => new ArtistSnippet(spotify, { uri: art.uri, name: art.profile.name})),
            date: {
                dateObject: new Date(album.item.data.date.isoString),
                precision: album.item.data.date.precision
            }
        })
    ))
}
