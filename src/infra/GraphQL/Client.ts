import { host, Spotify } from "../../Spotify";
import { APIAlbum, APIAlbumsWrapper, APIError, APIWhatsNewFeedItems } from "../../domain/Album/Album.types";
import * as operatonHashes from "./persistantQueries.json"
import { APICurrentUser, APIUserTop } from "../../domain/User/User.types";
import { AddLibraryItemsResponse, APILibraryPage, APILookupResponse, RemoveLibraryItemsResponse } from "../api_types"
import { APIArtist } from "../../domain/Artist/Artist.types";
import { APIPlaylist, APIPlaylistAddItems, APIPlaylistError, type APIPlaylistContent, type APIPlaylistRemoveItems } from "../../domain/Playlist/Playlist.types";
import { APICheckSavedTracks, APISavedTracks, APITracks } from "../../domain/Track/Track.types";
import { APICanvas } from "../../domain/Track/Track";
import { APISearch } from "../../domain/Search/Search.types";
import { APIPodcastWrapper, APIShow } from "../../domain/Podcast/Podcast.types";

export class GraphQL {
    spotify: Spotify
    constructor(spotify: Spotify) {
        this.spotify = spotify
    }

    async #query(operationName: keyof typeof operatonHashes, variables: any) {
        const operationReq = await this.spotify.request(`${host.partner}/pathfinder/v2/query`, {
            method: "POST",
            body: JSON.stringify({
                "variables": variables,
                "operationName": operationName,
                "extensions": { "persistedQuery": { "version": 1, "sha256Hash": operatonHashes[operationName] } }
            })
        })
        if ((operationReq as APIError)?.errors) { throw Error((operationReq as APIError).errors?.[0].message) }
        return operationReq
    }
    async userTopContent(
        {
            isArtist,
            options,
            timeRange
        }: {
            isArtist: boolean,
            timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM",
            options?: { offset?: number, limit?: number }
        }
    ) {
        interface Option { offset: number, limit: number, sortBy: "AFFINITY", timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM" }
        const defaultOption: Option = { "limit": 0, "offset": 0, "sortBy": "AFFINITY", "timeRange": "SHORT_TERM" }
        const mainOption: Option = { limit: options?.limit || 50, offset: options?.offset || 0, sortBy: "AFFINITY", timeRange: timeRange }
        const option: { topArtistsInput?: Option, topTracksInput?: Option } =
            { topArtistsInput: isArtist ? mainOption : defaultOption, topTracksInput: !isArtist ? mainOption : defaultOption }

        const topRes = await this.#query("userTopContent", {
            "includeTopArtists": isArtist,
            "topArtistsInput": option.topArtistsInput,
            "includeTopTracks": !isArtist,
            "topTracksInput": option.topTracksInput
        }) as APIUserTop
        return topRes
    }
    async getAlbum(uri: string, options?: { offset: number, limit: number }) {
        const variables = { uri, "locale": "", "offset": options?.offset || 0, "limit": options?.limit || 50 }
        const req = (await this.#query("getAlbum", variables)) as { data: { albumUnion: APIAlbum }, errors?: APIError["errors"] }
        if (!req.data) throw new Error("Empty Response")
        if (req.errors) throw new Error(req.errors.map(err => err.message).join("\n"))
        return req
    }
    async getCanvas(uri: string) {
        return this.#query("canvas", { uri }) as Promise<APICanvas>
    }
    async libraryV3<T>(variables: {
        filters: ("Playlists" | "Albums" | "Podcasts & Shows")[]
        order?: string /* "Alphabetical" */
        textFilter?: string
        limit?: number, offset?: number
    }) {
        const req = await this.#query("libraryV3", {
            "filters": variables.filters,
            "order": variables.order || "Alphabetical",
            "textFilter": variables.textFilter,
            "features": [],
            "limit": variables.limit || 50,
            "offset": variables.offset || 0,
            "flatten": true,
            "expandedFolders": [],
            "folderUri": null,
            "includeFoldersWhenFlattening": false
        }) as APILibraryPage<T>
        return req
    }
    async areEntitiesInLibrary(uris: string[]) {
        const req = (await this.#query("areEntitiesInLibrary", { uris })) as APILookupResponse
        return req.data.lookup.map((entry) => entry.data?.saved || false)
    }
    async queryWhatsNewFeed(includedContentTypes: string[], options?: { limit?: number, offset?: number }) {
        const queryWhatsNewFeed = await this.#query("queryWhatsNewFeed", {
            includedContentTypes,
            "limit": options?.limit || 50,
            "offset": options?.offset || 0,
            "onlyUnPlayedItems": false
        }) as APIWhatsNewFeedItems

        return queryWhatsNewFeed
    }
    async fetchPlaylist(uri: string, options?: { offset: number, limit: number }) {
        const playlist = await this.#query("fetchPlaylist", {
            "enableWatchFeedEntrypoint": false,
            "limit": options?.limit || 25,
            "offset": options?.offset || 0,
            uri
        }) as APIPlaylist | APIPlaylistError

        if (playlist.data.playlistV2.__typename == "GenericError") {
            throw new Error((playlist as unknown as APIPlaylistError).data.playlistV2.message)
        }
        return playlist as APIPlaylist
    }
    async fetchPlaylistContents(uri: string, options?: { offset: number, limit: number }) {
        const playlist = await this.#query("fetchPlaylistContents", {
            "limit": options?.limit || 25,
            "offset": options?.offset || 0,
            "uri": uri
        }) as APIPlaylistContent | APIPlaylistError

        if (playlist.data.playlistV2.__typename == "GenericError") {
            throw new Error((playlist as unknown as APIPlaylistError).data.playlistV2.message)
        }

        return (playlist as unknown as APIPlaylistContent).data.playlistV2.content
    }
    async addToPlaylist(playlistUri: string, { tracksUris, moveType, fromUid }: { tracksUris: string[], moveType?: "AFTER_UID" | "BOTTOM_OF_PLAYLIST", fromUid?: string }) {
        return this.#query("addToPlaylist", {
            "newPosition": {
                "fromUid": fromUid || null,
                "moveType": moveType || "BOTTOM_OF_PLAYLIST"
            },
            "playlistItemUris": tracksUris,
            "playlistUri": playlistUri
        }) as Promise<APIPlaylistAddItems>
    }
    async search(
        searchType: "desktop" | "playlists" | "tracks" | "podcasts" | "genres" | "artists" | "albums" | "users",
        q: string,
        options?: { offset?: number, limit?: number, numberOfTopResults?: number }) {
        const queryName = {
            desktop: "searchDesktop",
            playlists: "searchPlaylists",
            tracks: "searchTracks",
            podcasts: "searchPodcasts",
            genres: "searchGenres",
            artists: "searchArtists",
            albums: "searchAlbums",
            users: "searchUsers"
        }[searchType]

        return this.#query(queryName as keyof typeof operatonHashes, {
            "searchTerm": q,
            "limit": options?.limit || 10,
            "offset": options?.offset || 0,
            "numberOfTopResults": options?.numberOfTopResults || 5,
            "includeAudiobooks": true
        }) as Promise<APISearch>
    }

    async getEpisodeOrChapters(uri: string) { return this.#query("getEpisodeOrChapter", { uri }) }
    async queryPodcastEpisodes(uri: string, option?: { limit: number, offset: number }) { return this.#query("queryPodcastEpisodes", { limit: option?.limit || 50, offset: option?.offset || 0, uri }) }
    async queryShowMetadataV2(uri: string) { return this.#query("queryShowMetadataV2", { uri }) as Promise<APIShow> }
    async addToLibrary(libraryItemUris: string[]) { return this.#query("addToLibrary", { libraryItemUris }) as Promise<AddLibraryItemsResponse> }
    async removeFromLibrary(libraryItemUris: string[]) { return this.#query("removeFromLibrary", { libraryItemUris }) as Promise<RemoveLibraryItemsResponse> }
    async queryArtistOverview(uri: string) { return this.#query("queryArtistOverview", { "locale": "", uri }) as Promise<APIArtist> }
    async removeFromPlaylist(playlistUri: string, uids: string[]) { return this.#query("removeFromPlaylist", { playlistUri, uids }) as Promise<APIPlaylistRemoveItems> }
    async decorateContextTracks(uris: string[]) { return this.#query("decorateContextTracks", { uris }) as Promise<APITracks> }
    async fetchLibraryTracks(option?: { limit: number, offset: number }) { return this.#query("fetchLibraryTracks", { limit: option?.limit || 25, offset: option?.offset || 0 }) as Promise<APISavedTracks> }
    async isCurated(uris: string[]) { return this.#query("isCurated", { "uris": uris }) as Promise<APICheckSavedTracks> }
    async profileAttributes() { return this.#query("profileAttributes", {}) as Promise<APICurrentUser> }
    async followUsers(usernames: string[]) { return this.#query("followUsers", { usernames }) }
    async unfollowUsers(usernames: string[]) { return this.#query("unfollowUsers", { usernames }) }
    async isFollowingUsers(uris: string[]) {
        const req = await this.#query("isFollowingUsers", { uri: uris }) as any
        return req.data.users.map((user: any) => ({ "uri": user.uri, "following": user.following })) as { "uri": string, "following"?: string }[]
    }
}