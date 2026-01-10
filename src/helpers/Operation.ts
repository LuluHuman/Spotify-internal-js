import { host, Spotify } from "../../src/Spotify";
import { APIAlbum, APIError, APISavedAlbums, APIWhatsNewFeedItems } from "../types/APIAlbum";
import * as operatonHashes from "../operationHashes.json"
import { APICurrentUser, APIUserTop } from "../types/APIUsers";
import { AddLibraryItemsResponse, APILookupResponse, RemoveLibraryItemsResponse } from "../types/APIGeneric";
import { APIArtist } from "../types/APIArtist";
import { APIPlaylist, APIPlaylistAddItems, APIPlaylistError, type APIPlaylistContent, type APIPlaylistRemoveItems } from "../types/APIPlaylist";
import { APICheckSavedTracks, APISavedTracks, APITracks } from "../types/APITrack";
import { APICanvas } from "../classes/Track";

export class Operation {
    spotify: Spotify
    constructor(spotify: Spotify) {
        this.spotify = spotify
    }

    async #request(operationName: keyof typeof operatonHashes, variables: any) {
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

        const topRes = await this.#request("userTopContent", {
            "includeTopArtists": isArtist,
            "topArtistsInput": option.topArtistsInput,
            "includeTopTracks": !isArtist,
            "topTracksInput": option.topTracksInput
        }) as APIUserTop
        return topRes
    }

    async getAlbum(uri: string, options?: { offset: number, limit: number }) {
        const variables = { uri, "locale": "", "offset": options?.offset || 0, "limit": options?.limit || 50 }
        const req = (await this.#request("getAlbum", variables)) as { data: { albumUnion: APIAlbum }, errors?: APIError["errors"] }
        if (!req.data) throw new Error("Empty Response")
        if (req.errors) throw new Error(req.errors.map(err => err.message).join("\n"))
        return req
    }

    async getCanvas(uri: string) {
        return this.#request("canvas", { uri }) as Promise<APICanvas>
    }
    async libraryV3(variables: {
        filters: ("Playlists" | "Albums")[]
        order?: string /* "Alphabetical" */
        textFilter?: string
        limit?: number, offset?: number
    }) {
        const req = await this.#request("libraryV3", {
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
        }) as APISavedAlbums
        return req
    }

    async areEntitiesInLibrary(uris: string[]) {
        const req = (await this.#request("areEntitiesInLibrary", { uris })) as APILookupResponse
        return req.data.lookup.map((entry) => entry.data?.saved || false)
    }

    async addToLibrary(libraryItemUris: string[]) { return this.#request("addToLibrary", { libraryItemUris }) as Promise<AddLibraryItemsResponse> }
    async removeFromLibrary(libraryItemUris: string[]) { return this.#request("removeFromLibrary", { libraryItemUris }) as Promise<RemoveLibraryItemsResponse> }

    async queryWhatsNewFeed(includedContentTypes: string[], options?: { limit?: number, offset?: number }) {
        const queryWhatsNewFeed = await this.#request("queryWhatsNewFeed", {
            includedContentTypes,
            "limit": options?.limit || 50,
            "offset": options?.offset || 0,
            "onlyUnPlayedItems": false
        }) as APIWhatsNewFeedItems

        return queryWhatsNewFeed
    }

    async queryArtistOverview(uri: string) { return this.#request("queryArtistOverview", { "locale": "", uri }) as Promise<APIArtist> }

    async fetchPlaylist(uri: string, options?: { offset: number, limit: number }) {
        const playlist = await this.#request("fetchPlaylist", {
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

    async fetchPlaylistContents(uris: string[], options?: { offset: number, limit: number }) {
        const playlist = await this.#request("fetchPlaylistContents", {
            "limit": options?.limit || 25,
            "offset": options?.offset || 0,
            "uri": uris
        }) as APIPlaylistContent | APIPlaylistError

        if (playlist.data.playlistV2.__typename == "GenericError") {
            throw new Error((playlist as unknown as APIPlaylistError).data.playlistV2.message)
        }

        return (playlist as unknown as APIPlaylistContent).data.playlistV2.content
    }


    async addToPlaylist(playlistUri: string, { tracksUris, moveType, fromUid }: { tracksUris: string[], moveType?: "AFTER_UID" | "BOTTOM_OF_PLAYLIST", fromUid?: string }) {
        return this.#request("addToPlaylist", {
            "newPosition": {
                "fromUid": fromUid || null,
                "moveType": moveType || "BOTTOM_OF_PLAYLIST"
            },
            "playlistItemUris": tracksUris,
            "playlistUri": playlistUri
        }) as Promise<APIPlaylistAddItems>
    }

    async removeFromPlaylist(playlistUri: string, uids: string[]) { return this.#request("removeFromPlaylist", { playlistUri, uids }) as Promise<APIPlaylistRemoveItems> }
    async decorateContextTracks(uris: string[]) { return this.#request("decorateContextTracks", { uris }) as Promise<APITracks> }
    async fetchLibraryTracks(option?: { limit: number, offset: number }) { return this.#request("fetchLibraryTracks", { limit: option?.limit || 25, offset: option?.offset || 0 }) as Promise<APISavedTracks> }
    async isCurated(uris: string[]) { return this.#request("isCurated", { "uris": uris }) as Promise<APICheckSavedTracks> }
    async profileAttributes() { return this.#request("profileAttributes", {}) as Promise<APICurrentUser> }
    async followUsers(usernames: string[]) { return this.#request("followUsers", { usernames }) }
    async unfollowUsers(usernames: string[]) { return this.#request("unfollowUsers", { usernames }) }
    async isFollowingUsers(uris: string[]) {
        const req = await this.#request("isFollowingUsers", { uri: uris }) as any
        return req.data.users.map((user: any) => ({ "uri": user.uri, "following": user.following })) as { "uri": string, "following"?: string }[]
    }
}