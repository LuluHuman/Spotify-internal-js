import { Spotify } from "../../";
import { AlbumSnippet } from "../classes/Album";
import { ArtistSnippet } from "../classes/Artist";
import { APIAlbumsWrapper } from "../types/APIAlbum";
import { APILibraryPage } from "../types/APIGeneric";

export function mapSavedAlbum(spotify: Spotify, apiAlbum: APILibraryPage<APIAlbumsWrapper>) {
    return apiAlbum.data.me.libraryV3.items.map((album) => (
        new AlbumSnippet(spotify, {
            saved: true,
            name: album.item.data.name,
            uri: album.item.data.uri,
            type: album.item.data.type,
            artists: album.item.data.artists.items.map(art => new ArtistSnippet(spotify, { uri: art.uri, name: art.profile.name })),
            date: {
                dateObject: new Date(album.item.data.date.isoString),
                precision: album.item.data.date.precision
            }
        })
    ))
}
