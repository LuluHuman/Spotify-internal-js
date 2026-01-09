import axios, { type AxiosRequestConfig } from "axios"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { getToken } from "./lib/secretGenerator"
import { SpotifyIdentifier } from "./lib/helpers"

import { Album, AlbumSnippet, CurrentUser, User, Artist, ArtistSnippet, Playlist, Track, TrackSnippet, Operation } from "./lib/classes"
import {
    SpotifyWebhook, APIPlaylistAddItems, APIPlaylistContent, APIPlaylistPermissionChange, APIPlaylistRemoveItems, PlaylistPermission,
    APIAlbumsWrapper, AddLibraryItemsResponse, APIChange, RemoveLibraryItemsResponse,
    APIPlaylistChange, APITrack, APIUser, APIUserFollowers, APIUserFollowing, APIUserPlaylists,
} from "./lib/types"
import {
    mapSavedAlbum, mapArtist, mapPlaylist,
    mapCheckSaveTracks, mapSavedTracks, mapTrack, mapTracks,
    fileTypeFromBuffer, mapAlbum, mapNewAlbums,
    mapCurrentUser, mapTopArtists, mapTopTracks, mapUser, mapUserFollowers, mapUserFollowing, mapUserPlaylists,
} from "./lib/mappers"
import { APIPlaylistDeltaAdd, APIPlaylistDeltaRemove } from "./lib/types/APIPlaylist"
import { mapTrackCanvas } from "./lib/mappers/trackMapper"
import { APILyrics } from "./lib/classes/Track"
import { Cluster, Payload, SpotifyState } from "./lib/types/Websocket"
import { mapCluster } from "./lib/mappers/websockerClusterMapper"


const logs = new Array()

export const host = {
    "pub": "https://api.spotify.com/v1",
    "internal": "https://spclient.wg.spotify.com",
    "partner": "https://api-partner.spotify.com",
    "gae": "https://gae2-spclient.spotify.com",
    "imageUpload": "https://image-upload.spotify.com/v4"
}

export class Spotify {
    useProxy: boolean
    session: {
        accessToken: string,
        accessTokenExpirationTimestampMs: number,
        isAnonymous: boolean,
        clientId: string,
        err?: any,
        localDeviceId: string,
        activeDeviceId: string
    }
    user?: CurrentUser
    isReady: boolean
    ready: (() => any)[]
    operation: Operation
    ws?: WebSocket
    eventListeners: { [type: string]: ((state: SpotifyState) => void)[] }

    #internal: {
        playlistDeltaBuilder: (newAttributes: {
            values: {
                name?: string | undefined;
                description?: string | undefined;
                picture?: string | undefined;
            };
            noValue?: "LIST_PICTURE"[] | undefined;
        }) => {
            deltas: {
                ops: {
                    kind: string;
                    updateListAttributes: {
                        newAttributes: {
                            values: { name?: string; description?: string; picture?: string; };
                            noValue?: "LIST_PICTURE"[] | undefined;
                        }
                    };
                }[];
                info: { source: { client: string; }; };
            }[];
        }

        applyChangesPlaylist: (
            playlistId: string,
            newAttributes: {
                values: { name?: string | undefined; description?: string | undefined; picture?: string | undefined; };
                noValue?: "LIST_PICTURE"[];
            }) => Promise<APIPlaylistChange>
        changeFollowingPlaylist: ({ following, playlistUris }: { following: boolean, playlistUris: string[] }) => Promise<APIChange>

    }

    albums: {
        fetch: (albumIdentifier: SpotifyIdentifier, options?: { offset: number, limit: number }) => Promise<Album>
        //fetchMany
        //fetchTracks
        fetchSaved: (options?: { offset: number, limit: number }) => Promise<AlbumSnippet[]>
        addToLibrary: (albumIdentifiers: SpotifyIdentifier[]) => Promise<AddLibraryItemsResponse>
        removeFromLibrary: (albumIdentifiers: SpotifyIdentifier[]) => Promise<RemoveLibraryItemsResponse>
        checkSaved: (albumIdentifiers: SpotifyIdentifier[]) => Promise<(boolean | "GenericError")[]>
        fetchNewReleases: (options?: { limit: number, offset: number }) => Promise<{
            items: AlbumSnippet[];
            pagingInfo: {
                limit: number;
                nextOffset: null;
                offset: number;
            };
            totalCount: number;
        }>
    }
    artists: {
        fetch: (artistIdentifiers: SpotifyIdentifier) => Promise<Artist>
        follow: (artistIdentifiers: SpotifyIdentifier[]) => Promise<AddLibraryItemsResponse>
        unfollow: (artistIdentifiers: SpotifyIdentifier[]) => Promise<RemoveLibraryItemsResponse>
        checkFollowing: (artistIdentifiers: SpotifyIdentifier[]) => Promise<(boolean | "GenericError")[]>
        //fetchMany
        //fetchAlbums
        //fetchTop
        //fetchRelated
    }
    player: {
        data: SpotifyState | null
        addEventListener: (type: string, callback: (arg?: SpotifyState | undefined) => void) => void,
        dispatchEvent: (event: { type: string; state: SpotifyState; }) => void,
        removeEventListener: (type: string, callback: (arg?: SpotifyState | undefined) => void) => void,
        pause: () => Promise<{ ack_id: string; } | void>
        resume: () => Promise<{ ack_id: string; } | void>
        next: () => Promise<{ ack_id: string; } | void>
        back: () => Promise<{ ack_id: string; } | void>
        seek: (position: number) => Promise<{ ack_id: string; } | void>
        //TODO: setRepeat 0 for no repeat .1 for repeat all.2 for repeat one.
        //TODO: setShuffle
        setVolume: (position: number) => Promise<{ ack_id: string; } | void>
    }
    playlists: {
        fetch: (playlistIdentifiers: SpotifyIdentifier, options?: { limit: number; offset: number; } | undefined) => Promise<Playlist>
        update: (playlistIdentifier: SpotifyIdentifier, newAttributes: { name?: string; description?: string; }) => Promise<APIPlaylistChange>
        setVisability: (playlistIdentifier: SpotifyIdentifier, isPublic: boolean) => Promise<APIPlaylistPermissionChange>
        setCover: (playlistIdentifier: SpotifyIdentifier, image: Buffer) => Promise<APIPlaylistChange>
        removeCover: (playlistIdentifier: SpotifyIdentifier) => Promise<APIPlaylistChange>
        fetchItems: (playlistIdentifiers: SpotifyIdentifier[], options?: { offset: number, limit: number }) => Promise<APIPlaylistContent["data"]["playlistV2"]["content"]>
        addItems: (playlistIdentifier: SpotifyIdentifier, tracksPos: { tracksUris: string[]; moveType?: "AFTER_UID" | "BOTTOM_OF_PLAYLIST" | undefined; fromUid?: string | undefined; }) => Promise<APIPlaylistAddItems>
        removeItems: (playlistIdentifier: SpotifyIdentifier, trackUIds: string[]) => Promise<APIPlaylistRemoveItems>
        fetchOwned: (options?: { offset: number, limit: number }) => Promise<APIAlbumsWrapper[]>
        create: ({ name, description }: { name?: string | undefined; description?: string | undefined }) => Promise<{ uri: string; revision: string; }>
        followMany: (playlistIdentifiers: SpotifyIdentifier[]) => Promise<APIChange>
        unfollowMany: (playlistIdentifiers: SpotifyIdentifier[]) => Promise<APIChange>
    }
    tracks: {
        fetch: (trackIdentifier: SpotifyIdentifier) => Promise<Track>
        fetchMany: (trackIdentifiers: SpotifyIdentifier[]) => Promise<TrackSnippet[]>
        fetchSaved: (option?: { limit: number; offset: number; } | undefined) => Promise<{
            totalCount: number;
            pagingInfo: { limit: number; offset: number; };
            tracks: { addedAt: Date; track: TrackSnippet; }[];
        }>
        addToLibrary: (trackIdentifiers: SpotifyIdentifier[]) => Promise<AddLibraryItemsResponse>
        removeFromLibrary: (trackIdentifiers: SpotifyIdentifier[]) => Promise<RemoveLibraryItemsResponse>
        checkSaved: (trackIdentifiers: SpotifyIdentifier[]) => Promise<boolean[]>
        fetchCanvasURL: (trackIdentifiers: SpotifyIdentifier) => Promise<string>
        fetchLyrics: (trackIdentifiers: SpotifyIdentifier) => Promise<APILyrics>
    }
    users: {
        me: () => Promise<CurrentUser>
        topArtists: ({ options, timeRange }: {
            timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM";
            options?: { offset?: number; limit?: number; }
        }) => Promise<{ totalCount: number; items: ArtistSnippet[]; }>
        topTracks: ({ options, timeRange }: {
            timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM";
            options?: { offset?: number; limit?: number; }
        }) => Promise<{ totalCount: number; items: TrackSnippet[]; }>


        checkFollowing: (userIdentifiers: SpotifyIdentifier[]) => Promise<{ uri: string; following?: string; }[]>
        fetch: (userIdentifier: SpotifyIdentifier, options?: { playlist_limit: number; artist_limit: number; episode_limit: number; }) => Promise<User>
        fetchFollowers: (userIdentifier: SpotifyIdentifier) => Promise<User[]>
        fetchFollowing: (userIdentifier: SpotifyIdentifier) => Promise<(User | ArtistSnippet | undefined)[]>
        fetchPlaylists: (userIdentifier: SpotifyIdentifier, options?: { offset?: number | undefined; limit?: number | undefined; } | undefined) => Promise<{ totalCount: number; items: Playlist[]; }>
        follow: (userIdentifiers: SpotifyIdentifier[]) => Promise<unknown>
        unfollow: (userIdentifiers: SpotifyIdentifier[]) => Promise<unknown>
    }
    constructor({ useProxy }: { useProxy?: boolean }) {
        this.useProxy = useProxy || false
        this.session = {
            accessToken: "",
            accessTokenExpirationTimestampMs: 0,
            isAnonymous: false,
            clientId: "",
            localDeviceId: "",
            activeDeviceId: ""
        };
        this.ready = []
        this.isReady = false
        this.operation = new Operation(this)
        this.eventListeners = {}

        this.#internal = {
            playlistDeltaBuilder: (newAttributes: {
                "values": { name?: string, description?: string, picture?: string },
                "noValue"?: ("LIST_PICTURE")[]
            }) => {
                return {
                    "deltas": [{
                        "ops": [{ "kind": "UPDATE_LIST_ATTRIBUTES", "updateListAttributes": { newAttributes } }],
                        "info": { "source": { "client": "WEBPLAYER" } }
                    }]
                }
            },

            applyChangesPlaylist: async (playlistId: string, newAttributes: {
                "values": { name?: string, description?: string, picture?: string },
                "noValue"?: ("LIST_PICTURE")[]
            }) => {
                const req = await this.request(`${host.internal}/playlist/v2/playlist/${playlistId}/changes`, {
                    method: "POST",
                    body: JSON.stringify(this.#internal.playlistDeltaBuilder(newAttributes))
                })
                return req as APIPlaylistChange
            },

            changeFollowingPlaylist: ({ following, playlistUris }: { following: boolean, playlistUris: string[] }) => {
                const timestamp = new Date().getTime()
                const delta: APIPlaylistDeltaAdd | APIPlaylistDeltaRemove = following ?
                    {
                        "kind": "ADD",
                        "add": {
                            "addFirst": true,
                            "items": playlistUris.map(uri => ({ "attributes": { timestamp }, "uri": uri }))
                        }
                    } : {
                        "kind": "REM",
                        "rem": {
                            "itemsAsKey": true,
                            "items": playlistUris.map(uri => ({ "uri": uri }))
                        }
                    }


                return this.request(`${host.internal}/playlist/v2/user/${this.user?.username}/rootlist/changes`,
                    { method: "POST", body: JSON.stringify({ "deltas": [delta] }) }
                ) as Promise<APIChange>
            }
        }
        this.albums = {
            fetch: async (albumIdentifier: SpotifyIdentifier, options?: { offset: number, limit: number }) => {
                const album = await this.operation.getAlbum(albumIdentifier.uri, options)
                return mapAlbum(this, album.data.albumUnion)
            },
            fetchSaved: async (options?: { offset: number, limit: number }) => {
                const req = await this.operation.libraryV3({ filters: ["Albums"], limit: options?.limit, offset: options?.offset })
                return mapSavedAlbum(this, req)
            },
            checkSaved: async (albumIdentifiers: SpotifyIdentifier[]) => {
                return this.operation.areEntitiesInLibrary(albumIdentifiers.map(id => id.uri))
            },
            addToLibrary: async (albumIdentifiers: SpotifyIdentifier[]) => {
                return this.operation.addToLibrary(albumIdentifiers.map(id => id.uri))
            },
            removeFromLibrary: async (albumIdentifiers: SpotifyIdentifier[]) => {
                return this.operation.removeFromLibrary(albumIdentifiers.map(id => id.uri))
            },
            fetchNewReleases: async (options?: { limit: number, offset: number }) => {
                const queryWhatsNewFeed = await this.operation.queryWhatsNewFeed(["ALBUM"], { limit: options?.limit, offset: options?.offset, })
                return mapNewAlbums(this, queryWhatsNewFeed)
            }
        }
        this.artists = {
            fetch: async (artistIdentifier: SpotifyIdentifier) => {
                const req = await this.operation.queryArtistOverview(artistIdentifier.uri)
                return mapArtist(this, req)
            },
            follow: (artistIdentifiers: SpotifyIdentifier[]) => {
                return this.operation.addToLibrary(artistIdentifiers.map(id => id.uri))
            },
            unfollow: (artistIdentifiers: SpotifyIdentifier[]) => {
                return this.operation.removeFromLibrary(artistIdentifiers.map(id => id.uri))
            },
            checkFollowing: async (artistIdentifiers: SpotifyIdentifier[]) => {
                return this.operation.areEntitiesInLibrary(artistIdentifiers.map(id => id.uri))
            }
        }

        this.player = {
            data: null,
            addEventListener: (type: string, callback: (arg?: SpotifyState) => void) => {
                if (!(type in this.eventListeners)) {
                    this.eventListeners[type] = [];
                }
                this.eventListeners[type].push(callback);
            },
            dispatchEvent: (event: { type: string, state: SpotifyState }) => {
                if (!(event.type in this.eventListeners)) return
                const stack = this.eventListeners[event.type];
                for (let i = 0; i < stack.length; i++) {
                    if (typeof stack[i] === "function") stack[i](event.state);
                }
                return
            },
            removeEventListener: (type: string, callback: (arg?: SpotifyState) => void) => {
                if (!(type in this.eventListeners)) return;
                const stack = this.eventListeners[type];
                for (let i = 0; i < stack.length; i++) {
                    if (stack[i] === callback) {
                        stack.splice(i, 1);
                        return;
                    }
                }
            },
            pause: () => this.#playback("pause"),
            resume: () => this.#playback("resume"),
            next: () => this.#playback("skip_next"),
            back: () => this.#playback("skip_prev"),
            seek: (position: number) => this.#playback("seek_to", position),
            setVolume: async (position: number) => {
                const activeDeviceId = this.player.data?.devices.find(device => device.isActive)?.deviceId
                const thisDeviceId = this.session.localDeviceId
                if (!thisDeviceId || !activeDeviceId) return
                const raw = JSON.stringify({ "volume": Math.floor(position * 65535) });
                return this.request(host.gae + `/connect-state/v1/connect/volume/from/${thisDeviceId}/to/${activeDeviceId}`, { method: "PUT", body: raw }) as Promise<{ ack_id: string; }>
            }
        }
        this.playlists = {
            fetch: async (playlistIdentifier: SpotifyIdentifier, options?: { limit: number, offset: number }) => {
                const playlist = await this.operation.fetchPlaylist(playlistIdentifier.uri, options)
                return mapPlaylist(this, playlist)
            },
            fetchOwned: async (options?: { offset: number, limit: number }) => {
                const req = await this.operation.libraryV3({ filters: ["Playlists"], limit: options?.limit, offset: options?.offset })
                return req.data.me.libraryV3.items
            },
            fetchItems: async (playlistIdentifiers: SpotifyIdentifier[], options?: { offset: number, limit: number }) => {
                const playlist = await this.operation.fetchPlaylistContents(playlistIdentifiers.map(id => id.uri), options)
                return playlist
            },
            update: async (playlistIdentifier: SpotifyIdentifier, newAttributes: { name?: string, description?: string }) => {
                const req = await this.#internal.applyChangesPlaylist(playlistIdentifier.id, { values: newAttributes })
                return req as APIPlaylistChange
            },
            setVisability: async (playlistIdentifier: SpotifyIdentifier, isPublic: boolean) => {
                const basePermission = await this.request(`${host.internal}/playlist-permission/v1/playlist/${playlistIdentifier.id}/permission/base`) as
                    { revision: string, permissionLevel: PlaylistPermission, }

                const req = await this.request(`${host.internal}/playlist-permission/v1/playlist/${playlistIdentifier.id}/permission/base`, {
                    method: "POST",
                    body: JSON.stringify({ "revision": basePermission.revision, "permissionLevel": isPublic ? "VIEWER" : "BLOCKED" })
                })
                return req as APIPlaylistPermissionChange
            },
            setCover: async (playlistIdentifier: SpotifyIdentifier, image: Buffer) => {
                let dataType = await fileTypeFromBuffer(image)
                let uploadedImage = await this.request(host.imageUpload + "/playlist", {
                    method: "POST", body: image,
                    headers: { "Content-Type": dataType?.mime, "Content-Length": image.length, }
                })

                const registeredImage = await this.request(`${host.internal}/playlist/v2/playlist/${playlistIdentifier.id}/register-image`, {
                    method: "post", body: uploadedImage
                }) as { picture: string }

                const change = await this.#internal.applyChangesPlaylist(playlistIdentifier.id, { values: registeredImage })
                return change as APIPlaylistChange
            },
            removeCover: async (playlistIdentifier: SpotifyIdentifier) => {
                const change = await this.#internal.applyChangesPlaylist(playlistIdentifier.id, { values: {}, noValue: ["LIST_PICTURE"] })
                return change as APIPlaylistChange
            },
            addItems: async (playlistIdentifier: SpotifyIdentifier, tracksPos: { tracksUris: string[], moveType?: "AFTER_UID" | "BOTTOM_OF_PLAYLIST", fromUid?: string }) => {
                return this.operation.addToPlaylist(playlistIdentifier.uri, tracksPos)
            },
            removeItems: async (playlistIdentifier: SpotifyIdentifier, trackUIds: string[]) => {
                return this.operation.removeFromPlaylist(playlistIdentifier.uri, trackUIds)
            },
            followMany: async (playlistIdentifiers: SpotifyIdentifier[]) => {
                return this.#internal.changeFollowingPlaylist({ following: true, playlistUris: playlistIdentifiers.map(id => id.uri) })
            },
            unfollowMany: async (playlistIdentifiers: SpotifyIdentifier[]) => {
                return this.#internal.changeFollowingPlaylist({ following: false, playlistUris: playlistIdentifiers.map(id => id.uri) })
            },
            create: async ({ name, description }: { name?: string, description?: string }) => {
                const create = await this.request(host.internal + "/playlist/v2/playlist", {
                    method: "POST",
                    body: JSON.stringify(this.#internal.playlistDeltaBuilder({ values: { "name": name, "description": description } }))
                }) as { "uri": string, "revision": string }

                this.playlists.followMany([new SpotifyIdentifier(create.uri)])
                return create
            }
        }
        this.tracks = {
            fetch: async (trackIdentifier: SpotifyIdentifier) => {
                const url = `${host.internal}/metadata/4/track/${trackIdentifier.gid}`
                const req = await this.request(url) as APITrack
                return mapTrack(this, req)
            },
            fetchMany: async (trackIdentifiers: SpotifyIdentifier[]) => {
                const tracks = await this.operation.decorateContextTracks(trackIdentifiers.map(id => id.uri))
                return mapTracks(this, tracks)
            },
            fetchSaved: async (option?: { limit: number, offset: number }) => {
                const savedTracks = await this.operation.fetchLibraryTracks(option)
                return mapSavedTracks(this, savedTracks)
            },
            checkSaved: async (trackIdentifiers: SpotifyIdentifier[]) => {
                const isCurated = await this.operation.isCurated(trackIdentifiers.map(id => id.uri))
                return mapCheckSaveTracks(isCurated)
            },
            addToLibrary: async (trackIdentifiers: SpotifyIdentifier[]) => this.operation.addToLibrary(trackIdentifiers.map(id => id.uri)),
            removeFromLibrary: async (trackIdentifiers: SpotifyIdentifier[]) => this.operation.removeFromLibrary(trackIdentifiers.map(id => id.uri)),
            fetchCanvasURL: async (trackIdentifiers: SpotifyIdentifier) => mapTrackCanvas(await this.operation.getCanvas(trackIdentifiers.uri)),
            fetchLyrics: async (trackIdentifiers: SpotifyIdentifier) => {
                const url = `${host.internal}/color-lyrics/v2/track/${trackIdentifiers.id}/image/noimagejustlyrics?format=json`;
                return this.request(url) as Promise<APILyrics>
            }
        }
        this.users = {
            me: async (): Promise<CurrentUser> => {
                const user = await this.operation.profileAttributes()
                return mapCurrentUser(this, user)
            },
            topArtists: async ({ options, timeRange }: {
                timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM"
                options?: { offset?: number, limit?: number }
            }) => {
                const topRes = await this.operation.userTopContent({ isArtist: true, timeRange, options })
                return mapTopArtists(this, topRes)
            },
            topTracks: async ({ options, timeRange }: {
                timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM"
                options?: { offset?: number, limit?: number }
            }) => {
                const topRes = await this.operation.userTopContent({ isArtist: false, timeRange, options })
                return mapTopTracks(this, topRes)
            },
            fetch: async (userIdentifier: SpotifyIdentifier, options?: { playlist_limit?: number; artist_limit?: number; episode_limit?: number; }) => {
                const params = {
                    playlist_limit: options?.playlist_limit || 10,
                    artist_limit: options?.artist_limit || 10,
                    episode_limit: options?.episode_limit || 10
                }
                const userUrl = host.internal + `/user-profile-view/v3/profile/${userIdentifier.id}?${Object.entries(params).map(p => `${p[0]}=${encodeURIComponent(p[1])}`).join("&")}`
                const userReq = await this.request(userUrl) as APIUser
                return mapUser(this, userReq)
            },
            fetchFollowers: async (userIdentifier: SpotifyIdentifier) => {
                const followersReq = await this.request(host.internal + `/user-profile-view/v3/profile/${userIdentifier.id}/followers`) as APIUserFollowers
                return mapUserFollowers(this, followersReq)
            },
            fetchFollowing: async (userIdentifier: SpotifyIdentifier) => {
                const followersRes = await this.request(host.internal + `/user-profile-view/v3/profile/${userIdentifier.id}/following`) as APIUserFollowing
                return mapUserFollowing(this, followersRes)
            },
            fetchPlaylists: async (userIdentifier: SpotifyIdentifier, options?: { offset?: number, limit?: number }) => {
                const userPlaylists = await this.request(host.internal + `/user-profile-view/v3/profile/${userIdentifier.id}/playlists?offset=${options?.offset || 0}&limit=${options?.limit || 200}`) as APIUserPlaylists
                return mapUserPlaylists(this, userPlaylists)
            },
            follow: async (userIdentifiers: SpotifyIdentifier[]) => this.operation.followUsers(userIdentifiers.map(id => id.uri)),
            unfollow: async (userIdentifiers: SpotifyIdentifier[]) => this.operation.unfollowUsers(userIdentifiers.map(id => id.uri)),
            checkFollowing: async (userIdentifiers: SpotifyIdentifier[]) => this.operation.isFollowingUsers(userIdentifiers.map(id => id.uri))
        }
    }

    request(url: string, options?: {
        method?: AxiosRequestConfig["method"];
        withProxy?: boolean,
        body?: AxiosRequestConfig["data"],
        headers?: AxiosRequestConfig["headers"]
    }) {
        if (!this.session.accessToken) return { err: "Not Ready" };
        if (options?.withProxy) url = "/api/proxy/" + encodeURIComponent(url)
        return new Promise((resp) => {
            let config: AxiosRequestConfig = {
                url: url,
                method: options?.method || "GET",
                headers: {
                    "app-platform": "WebPlayer",
                    authorization: `Bearer ${this.session.accessToken}`,
                    Accept: "application/json",
                    "Content-Type": (options?.body && !options?.headers?.["Content-Type"]) ? "application/json" : undefined,
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
                    ...(options?.headers || {})
                },
                params: { format: "json" },
                data: options?.body,
                maxBodyLength: Infinity,
                validateStatus: () => true
            };

            axios.request(config)
                .then((resApi) => {
                    logs.push({ req: config, res: { status: resApi.status, data: resApi.data } })
                    writeFileSync(path.join(__dirname, "log.json"), JSON.stringify(logs))
                    resp(resApi.data)
                })
                .catch((err) => {
                    console.log(err);
                    if (!err.response) return resp(undefined);
                    if (err.response.status == 404) return resp({ err: "Not Found" });
                    if (err.response.status !== 401) return resp({ err: "Token Expired" });
                    resp({ err });
                });
        });
    }

    login(sp_dc: string) {
        return new Promise((resp) => {
            const init = async (res: any) => {
                if (res.offline) return alert("Offline");
                if (res.accessToken == "") return alert("Error No Access Token");
                console.info("Spotify session generated. Token: ", res.accessToken);

                this.isReady = true
                this.session = res;

                const me = await this.users.me()
                this.user = me
                console.log("Logged in as: " + me.name);

                this.#initWs()
                this.ready.forEach(f => f());
                console.info(`fired ${this.ready.length} ready events`)

                return resp(res);
            }

            if (this.useProxy) {
                axios.get("/api/session")
                    .then((res) => init(res.data))
                    .catch((err) => {
                        alert("err");
                        console.log(err);
                    });
            } else {
                getToken(sp_dc)
                    .then(init)
                    .catch((err) => {
                        alert("err");
                        console.log(err);
                    });
            }
        });
    }

    onReady(func: () => any) {
        if (this.isReady) func()
        this.ready.push(func)
    }

    async #initWs() {
        const fn = (state?: SpotifyState) => {
            this.player.data = state || null
            if (!state) return
            if (state.player.playbackId != this.player.data?.player.playbackId) this.player.dispatchEvent({ type: "songchange", state: state })
            if (state.player.isPaused != this.player.data?.player.isPaused) this.player.dispatchEvent({ type: "onplaypause", state: state })
        }
        if (typeof WebSocket == "undefined") throw Error("WebSocket object is undefined")
        const wsDealer = "dealer.spotify.com";
        const wsUrl = `wss://${wsDealer}/?access_token=${this.session.accessToken}`;
        const spWs = new WebSocket(wsUrl);
        spWs.onmessage = async (event) => {
            const data = JSON.parse(event.data) as SpotifyWebhook
            if (!data.headers) return;

            const connectionId = data.headers["Spotify-Connection-Id"];
            if (!connectionId) return fn(await mapCluster(this, data.payloads[0]?.cluster))

            const devReady = await this.#registerDevice(connectionId)
            console.log(devReady);

            this.session.localDeviceId = devReady
            this.#connectWs(connectionId).then(async (state) => {
                console.info("Successfully connect to websocket");
                fn(await mapCluster(this, state as Cluster));
            });
        };
    }

    async #registerDevice(connection_id: string) {
        const devId = [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const req = await this.request("https://gae2-spclient.spotify.com/track-playback/v1/devices", {
            method: "POST",
            body: JSON.stringify({
                "device": {
                    "brand": "spotify",
                    "capabilities": {
                        "change_volume": false,
                        "enable_play_token": false,
                        "supports_file_media_type": false,
                        "play_token_lost_behavior": "pause",
                        "disable_connect": true,
                        "audio_podcasts": false,
                        "video_playback": false,
                        "manifest_formats": [],
                        "supports_preferred_media_type": false,
                        "supports_playback_offsets": false,
                        "supports_playback_speed": false,
                    },
                    "device_id": devId,
                    "device_type": "computer",
                    "metadata": {},
                    "model": "web_player",
                    "name": "Lulu.js",
                    "platform_identifier": "web_player linux undefined;firefox 140.0;desktop",
                    "is_group": false
                },
                "outro_endcontent_snooping": false,
                "connection_id": connection_id,
                "client_version": "harmony:4.62.4-06fd55545",
                "volume": 0
            })
        }) as {
            initial_seq_num: number,
            device_keep_alive_update_seconds: number,
            endsongs: null,
            file_format_filter: number,
            supports_observing: boolean,
            effective_license: "premium" | "free",
        }
        if (req.supports_observing) return devId
        return ""
    }

    async #connectWs(connection_id: string) {
        function randomID() {
            const digits = function (length: number) {
                const bytes = crypto.getRandomValues(new Uint8Array(length));
                let str = "";
                for (let i = 0; i < bytes.length; i++) { str += bytes[i]?.toString(16) }
                return str;
            };
            return (digits(4) + "-" + digits(2) + "-" + digits(2) + "-" + digits(2) + "-" + digits(6));
        }

        const deviceID = randomID();

        const accessToken = this.session.accessToken
        const headersList = {
            "x-spotify-connection-id": connection_id,
            authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        const bodyContent = JSON.stringify({
            member_type: "CONNECT_STATE",
            device: { device_info: { capabilities: { can_be_player: false, hidden: true, needs_full_player_state: true } } },
        });

        const reqOptions: AxiosRequestConfig = {
            url: `${host.internal}/connect-state/v1/devices/hobs_${deviceID}`,
            method: "PUT",
            headers: headersList,
            data: bodyContent,
        }
        const request = await axios.request(reqOptions)
        return request.data;
    }

    async #playback(mode: "resume" | "pause" | "play" | "skip_next" | "skip_prev" | "shuffle" | "repeat" | "seek_to", value?: string | number) {
        const raw = JSON.stringify({
            "command": {
                "logging_params": {
                    "page_instance_ids": [],
                    "interaction_ids": [],
                    "command_id": "1e7f04122f19e1674d823e689d0d1e95"
                },
                "endpoint": mode,
                value,
            }
        });

        const activeDeviceId = this.player.data?.devices.find(device => device.isActive)?.deviceId
        const thisDeviceId = this.session.localDeviceId
        if (!thisDeviceId || !activeDeviceId) return

        const url = `${host.gae}/connect-state/v1/player/command/from/${thisDeviceId}/to/${activeDeviceId}`
        return this.request(url, { method: "POST", body: raw, }) as Promise<{ ack_id: string }>
    }
    async addToQueue({ active_device_id, trackId }: { active_device_id?: string, trackId: string }) {
        const raw = JSON.stringify({
            "command": {
                "endpoint": "add_to_queue",
                "track": {
                    "uri": "spotify:track:" + trackId,
                    "metadata": { "is_queued": "true" },
                    "provider": "queue"
                },
                "logging_params": { "command_id": "b5030d49025b1d12b646812a44951a09" }
            }
        });
        return this.request(host.gae + `/connect-state/v1/player/command/from/0/to/${active_device_id}`, { method: "POST", body: raw });
    }
};