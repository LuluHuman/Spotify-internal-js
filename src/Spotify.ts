import axios, { type AxiosRequestConfig } from "axios"
import { getToken } from "./infra/Auth/secretGenerator"
import { fileTypeFromBuffer } from 'file-type';
import { APIPlaylistAddItems, APIPlaylistChange, APIPlaylistContent, APIPlaylistDeltaAdd, APIPlaylistDeltaRemove, APIPlaylistPermissionChange, APIPlaylistRemoveItems, PlaylistPermission } from "./domain/Playlist/Playlist.types"
import { mapCheckSaveTracks, mapSavedTracks, mapTrack, mapTrackCanvas, mapTracks } from "./domain/Track/Track.mapper"
import { APILyrics, Track, TrackSnippet } from "./domain/Track/Track"
import SpotifyPlayer from "./domain/Player/Player"
import { mapSearchByType } from "./domain/Search/Search.mapper"
import { GraphQL } from "./infra/GraphQL/Client"
import { mapEpisode, mapSavedEpisodes, mapSavedPodcast, mapShow, mapShowItems } from "./domain/Podcast/Podcast.mapper"
import { APIPodcastWrapper, APIShow, APIShowEpisode, APIShowEpisodes } from "./domain/Podcast/Podcast.types"
import { Episode, Show } from "./domain/Podcast/Podcast"
import { Album, AlbumSnippet } from "./domain/Album/Album"
import { mapAlbum, mapNewAlbums, mapSavedAlbum } from "./domain/Album/Album.mapper"
import { APIAlbumsWrapper } from "./domain/Album/Album.types"
import { Artist, ArtistSnippet } from "./domain/Artist/Artist"
import { mapArtist } from "./domain/Artist/Artist.mapper"
import { Playlist } from "./domain/Playlist/Playlist"
import { APITrack } from "./domain/Track/Track.types"
import { CurrentUser, User } from "./domain/User/User"
import { mapCurrentUser, mapTopArtists, mapTopTracks, mapUser, mapUserFollowers, mapUserFollowing, mapUserPlaylists } from "./domain/User/User.mapper"
import { APIUser, APIUserFollowers, APIUserFollowing, APIUserPlaylists } from "./domain/User/User.types"
import { APIChange, AddLibraryItemsResponse, RemoveLibraryItemsResponse } from "./infra/api_types"
import { mapPlaylist } from "./domain/Playlist/Playlist.mapper"
import SpotifyIdentifier from "./infra/Identifier/SpotifyIdentifier";
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
    }
    user?: CurrentUser
    isReady: boolean
    ready: (() => any)[]
    graphQL: GraphQL

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
        //fetchAlbums artists.discography
        //fetchTop artists.discography.popularReleasesAlbums
        //fetchRelated
    }
    //TODO categoties
    episodes: {
        fetch: (episodeIdentifyer: SpotifyIdentifier) => Promise<Episode>
        //fetchMany
        fetchSaved: (options?: { offset: number, limit: number }) => Promise<Episode[]>
        addToLibrary: (showIdentifiers: SpotifyIdentifier[]) => Promise<AddLibraryItemsResponse>
        removeFromLibrary: (showIdentifiers: SpotifyIdentifier[]) => Promise<RemoveLibraryItemsResponse>
        checkSaved: (episodeIdentifiers: SpotifyIdentifier[]) => Promise<(boolean | "GenericError")[]>
    }
    player?: SpotifyPlayer
    playlists: {
        fetch: (playlistIdentifiers: SpotifyIdentifier, options?: { limit: number; offset: number; } | undefined) => Promise<Playlist>
        update: (playlistIdentifier: SpotifyIdentifier, newAttributes: { name?: string; description?: string; }) => Promise<APIPlaylistChange>
        setVisability: (playlistIdentifier: SpotifyIdentifier, isPublic: boolean) => Promise<APIPlaylistPermissionChange>
        setCover: (playlistIdentifier: SpotifyIdentifier, image: Buffer) => Promise<APIPlaylistChange>
        removeCover: (playlistIdentifier: SpotifyIdentifier) => Promise<APIPlaylistChange>
        fetchItems: (playlistIdentifier: SpotifyIdentifier, options?: { offset: number, limit: number }) => Promise<APIPlaylistContent["data"]["playlistV2"]["content"]>
        addItems: (playlistIdentifier: SpotifyIdentifier, tracksPos: { tracksUris: string[]; moveType?: "AFTER_UID" | "BOTTOM_OF_PLAYLIST" | undefined; fromUid?: string | undefined; }) => Promise<APIPlaylistAddItems>
        removeItems: (playlistIdentifier: SpotifyIdentifier, trackUIds: string[]) => Promise<APIPlaylistRemoveItems>
        fetchOwned: (options?: { offset: number, limit: number }) => Promise<unknown[]>
        create: ({ name, description }: { name?: string | undefined; description?: string | undefined }) => Promise<{ uri: string; revision: string; }>
        followMany: (playlistIdentifiers: SpotifyIdentifier[]) => Promise<APIChange>
        unfollowMany: (playlistIdentifiers: SpotifyIdentifier[]) => Promise<APIChange>
    }
    show: {
        fetch: (showIdentifier: SpotifyIdentifier) => Promise<Show>
        //fetchMany
        fetchSaved: (options?: { offset: number, limit: number }) => Promise<Show[]>
        fetchEpisodes: (playlistIdentifier: SpotifyIdentifier, options?: { offset: number, limit: number }) => Promise<{
            limit: number;
            offset: number | null;
            total: number;
            items: Episode[];
        }>
        addToLibrary: (showIdentifiers: SpotifyIdentifier[]) => Promise<AddLibraryItemsResponse>
        removeFromLibrary: (showIdentifiers: SpotifyIdentifier[]) => Promise<RemoveLibraryItemsResponse>
        checkSaved: (showIdentifiers: SpotifyIdentifier[]) => Promise<(boolean | "GenericError")[]>
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
        fetchTopArtists: ({ options, timeRange }: {
            timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM";
            options?: { offset?: number; limit?: number; }
        }) => Promise<{ totalCount: number; items: ArtistSnippet[]; }>
        fetchTopTracks: ({ options, timeRange }: {
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
        };
        this.ready = []
        this.isReady = false
        this.graphQL = new GraphQL(this)

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
                const album = await this.graphQL.getAlbum(albumIdentifier.uri, options)
                return mapAlbum(this, album.data.albumUnion)
            },
            fetchSaved: async (options?: { offset: number, limit: number }) => {
                const req = await this.graphQL.libraryV3<APIAlbumsWrapper>({ filters: ["Albums"], limit: options?.limit, offset: options?.offset })
                return mapSavedAlbum(this, req)
            },
            checkSaved: async (albumIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.areEntitiesInLibrary(albumIdentifiers.map(id => id.uri))
            },
            addToLibrary: async (albumIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.addToLibrary(albumIdentifiers.map(id => id.uri))
            },
            removeFromLibrary: async (albumIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.removeFromLibrary(albumIdentifiers.map(id => id.uri))
            },
            fetchNewReleases: async (options?: { limit: number, offset: number }) => {
                const queryWhatsNewFeed = await this.graphQL.queryWhatsNewFeed(["ALBUM"], { limit: options?.limit, offset: options?.offset, })
                return mapNewAlbums(this, queryWhatsNewFeed)
            }
        }
        this.artists = {
            fetch: async (artistIdentifier: SpotifyIdentifier) => {
                const req = await this.graphQL.queryArtistOverview(artistIdentifier.uri)
                return mapArtist(this, req)
            },
            follow: (artistIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.addToLibrary(artistIdentifiers.map(id => id.uri))
            },
            unfollow: (artistIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.removeFromLibrary(artistIdentifiers.map(id => id.uri))
            },
            checkFollowing: async (artistIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.areEntitiesInLibrary(artistIdentifiers.map(id => id.uri))
            }
        }
        this.episodes = {
            fetch: async (episodeIdentifyer: SpotifyIdentifier) => {
                const req = await this.graphQL.getEpisodeOrChapters(episodeIdentifyer.uri) as APIShowEpisode
                return mapEpisode(this, req)
            },
            fetchSaved: async (options?: { offset: number, limit: number }) => {
                const req = await this.playlists.fetchItems(new SpotifyIdentifier("spotify:playlist:37i9dQZF1FgnTBfUlzkeKt"), options)
                return mapSavedEpisodes(this, req)
            },
            addToLibrary: async (episodeIdentifiers: SpotifyIdentifier[]) => this.graphQL.addToLibrary(episodeIdentifiers.map(id => id.uri)),
            removeFromLibrary: async (episodeIdentifiers: SpotifyIdentifier[]) => this.graphQL.removeFromLibrary(episodeIdentifiers.map(id => id.uri)),
            checkSaved: async (episodeIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.areEntitiesInLibrary(episodeIdentifiers.map(id => id.uri))
            },
        }
        this.playlists = {
            fetch: async (playlistIdentifier: SpotifyIdentifier, options?: { limit: number, offset: number }) => {
                const playlist = await this.graphQL.fetchPlaylist(playlistIdentifier.uri, options)
                return mapPlaylist(this, playlist)
            },
            fetchOwned: async (options?: { offset: number, limit: number }) => {
                const req = await this.graphQL.libraryV3<unknown>({ filters: ["Playlists"], limit: options?.limit, offset: options?.offset })
                return req.data.me.libraryV3.items
            },
            fetchItems: async (playlistIdentifier: SpotifyIdentifier, options?: { offset: number, limit: number }) => {
                const playlist = await this.graphQL.fetchPlaylistContents(playlistIdentifier.uri, options)
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
                return this.graphQL.addToPlaylist(playlistIdentifier.uri, tracksPos)
            },
            removeItems: async (playlistIdentifier: SpotifyIdentifier, trackUIds: string[]) => {
                return this.graphQL.removeFromPlaylist(playlistIdentifier.uri, trackUIds)
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
        this.show = {
            fetch: async (showIdentifyer: SpotifyIdentifier) => {
                const req = await this.graphQL.queryShowMetadataV2(showIdentifyer.uri) as APIShow
                return mapShow(this, req)
            },
            fetchEpisodes: async (showIdentifyer: SpotifyIdentifier, options?: { offset: number, limit: number }) => {
                const req = await this.graphQL.queryPodcastEpisodes(showIdentifyer.uri, options) as APIShowEpisodes
                return mapShowItems(this, req)
            },
            fetchSaved: async (options?: { offset: number, limit: number }) => {
                const req = await this.graphQL.libraryV3<APIPodcastWrapper>({ filters: ["Podcasts & Shows"], limit: options?.limit, offset: options?.offset })
                return mapSavedPodcast(this, req)
            },
            checkSaved: async (showIdentifiers: SpotifyIdentifier[]) => {
                return this.graphQL.areEntitiesInLibrary(showIdentifiers.map(id => id.uri))
            },
            addToLibrary: async (showIdentifiers: SpotifyIdentifier[]) => this.graphQL.addToLibrary(showIdentifiers.map(id => id.uri)),
            removeFromLibrary: async (showIdentifiers: SpotifyIdentifier[]) => this.graphQL.removeFromLibrary(showIdentifiers.map(id => id.uri)),
        }
        this.tracks = {
            fetch: async (trackIdentifier: SpotifyIdentifier) => {
                const url = `${host.internal}/metadata/4/track/${trackIdentifier.gid}`
                const req = await this.request(url) as APITrack
                return mapTrack(this, req)
            },
            fetchMany: async (trackIdentifiers: SpotifyIdentifier[]) => {
                const tracks = await this.graphQL.decorateContextTracks(trackIdentifiers.map(id => id.uri))
                return mapTracks(this, tracks)
            },
            fetchSaved: async (option?: { limit: number, offset: number }) => {
                const savedTracks = await this.graphQL.fetchLibraryTracks(option)
                return mapSavedTracks(this, savedTracks)
            },
            checkSaved: async (trackIdentifiers: SpotifyIdentifier[]) => {
                const isCurated = await this.graphQL.isCurated(trackIdentifiers.map(id => id.uri))
                return mapCheckSaveTracks(isCurated)
            },
            addToLibrary: async (trackIdentifiers: SpotifyIdentifier[]) => this.graphQL.addToLibrary(trackIdentifiers.map(id => id.uri)),
            removeFromLibrary: async (trackIdentifiers: SpotifyIdentifier[]) => this.graphQL.removeFromLibrary(trackIdentifiers.map(id => id.uri)),
            fetchCanvasURL: async (trackIdentifiers: SpotifyIdentifier) => mapTrackCanvas(await this.graphQL.getCanvas(trackIdentifiers.uri)),
            fetchLyrics: async (trackIdentifiers: SpotifyIdentifier) => {
                const url = `${host.internal}/color-lyrics/v2/track/${trackIdentifiers.id}/image/noimagejustlyrics?format=json`;
                return this.request(url) as Promise<APILyrics>
            }
        }
        this.users = {
            me: async (): Promise<CurrentUser> => {
                const user = await this.graphQL.profileAttributes()
                return mapCurrentUser(this, user)
            },
            fetchTopArtists: async ({ options, timeRange }: {
                timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM"
                options?: { offset?: number, limit?: number }
            }) => {
                const topRes = await this.graphQL.userTopContent({ isArtist: true, timeRange, options })
                return mapTopArtists(this, topRes)
            },
            fetchTopTracks: async ({ options, timeRange }: {
                timeRange: "SHORT_TERM" | "MID_TERM" | "LONG_TERM"
                options?: { offset?: number, limit?: number }
            }) => {
                const topRes = await this.graphQL.userTopContent({ isArtist: false, timeRange, options })
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
            follow: async (userIdentifiers: SpotifyIdentifier[]) => this.graphQL.followUsers(userIdentifiers.map(id => id.uri)),
            unfollow: async (userIdentifiers: SpotifyIdentifier[]) => this.graphQL.unfollowUsers(userIdentifiers.map(id => id.uri)),
            checkFollowing: async (userIdentifiers: SpotifyIdentifier[]) => this.graphQL.isFollowingUsers(userIdentifiers.map(id => id.uri))
        }
    }

    async searchByType(
        type: "playlists" | "tracks" | /* "podcasts" | */ "genres" | "artists" | "albums" | "users",
        query: string,
        options?: { limit?: number, offset?: number }
    ) {
        const req = await this.graphQL.search(type, query, {
            limit: options?.limit,
            offset: options?.offset,
        })

        return mapSearchByType(this, req, type)
    }
    async searchAll(
        query: string,
        options: { limit?: number, offset?: number, numberOfTop?: number }
    ) {
        const req = await this.graphQL.search("desktop", query, {
            limit: options?.limit,
            offset: options?.offset,
            numberOfTopResults: options?.numberOfTop
        })

        return req
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
                if (res.offline) throw new Error("Offline");
                if (res.accessToken == "") throw new Error("Error No Access Token");
                this.session = res;

                const me = await this.users.me()
                this.user = me
                this.player = new SpotifyPlayer(this, () => {
                    this.isReady = true
                    this.ready.forEach(f => f());
                })
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
};