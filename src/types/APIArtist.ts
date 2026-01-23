import { ImageObject, Playability } from "./APIGeneric"

export interface APIArtist {
    "data": {
        "artistUnion": {
            "__typename": "Artist",
            "uri": string,
            "id": string
            "saved": boolean,
            "headerImage"?: {
                "data": {
                    "__typename": "ImageV2",
                    "sources": { "maxHeight": number, "maxWidth": number, "url": string }[]
                }
            },
            "profile": ArtistUnionProfile,
            "visuals": {
                "avatarImage": {
                    "extractedColors": { "colorRaw": { "hex": string } },
                    "sources": ImageObject[]
                },
                "gallery": { "items": any[] }
            },
            "stats": {
                "followers": number,
                "monthlyListeners": number,
                "topCities": {
                    "items": {
                        "city": string
                        "country": string
                        "numberOfListeners": number,
                        "region": string
                    }[]
                },
                "worldRank": number
            },
            "discography": {
                "albums": {
                    "items": { "releases": { "items": AlbumArtistUnion[] } }[],
                    "totalCount": number
                },
                "compilations": {
                    "items": { "releases": { "items": AlbumArtistUnion[] } }[],
                    "totalCount": number
                },
                "latest": AlbumArtistUnion | null,
                "popularReleasesAlbums": { "items": AlbumArtistUnion[], "totalCount": number },
                "singles": { "items": { "releases": { "items": AlbumArtistUnion[] } }[], "totalCount": number },
                "topTracks": { "items": TrackArtistUnion[] }
            },


            "goods": {
                "concerts": {
                    "items": {
                        "data": {
                            "__typename": "ConcertV2",
                            "festival": boolean,
                            "location": { "city": string, "name": string },
                            "startDateIsoString": string
                            "title": string
                            "uri": string
                        }
                    }[],
                    "totalCount": number
                },
                "merch": {
                    "items": {
                        "description": string,
                        "image": { "sources": { "url": string }[] },
                        "nameV2": string
                        "price": string
                        "uri": string
                        "url": string
                    }[]
                }
            },
            "preRelease": null,
            "relatedContent": {
                "appearsOn": {
                    "items": any[],
                    "totalCount": 0
                },
                "discoveredOnV2": {
                    "items": [
                        {
                            "data": {
                                "__typename": "Playlist" | "GenericError",
                                "description": string
                                "id": string
                                "images": {
                                    "items": { "sources": { "height": null | number, "url": string, "width": null | number }[] }[],
                                    "totalCount": number
                                },
                                "name": string
                                "ownerV2": { "data": { "__typename": "User", "name": string } },
                                "uri": string
                            }
                        },
                    ],
                    "totalCount": number
                },
                "featuringV2": {
                    "items": [
                        {
                            "data": {
                                "__typename": "Playlist" | "GenericError",
                                "description": string
                                "id": string
                                "images": {
                                    "items": { "sources": { "height": null | number, "url": string, "width": null | number }[] }[],
                                    "totalCount": number
                                },
                                "name": string
                                "ownerV2": { "data": { "__typename": "User", "name": string } },
                                "uri": string
                            }
                        },
                    ],
                    "totalCount": number
                },
                "relatedArtists": {
                    "items": {
                        "id": "6p4Tw99DCzxDqV8JzqdDaM",
                        "profile": {
                            "name": "一里ぼっち(CV:森下千咲)"
                        },
                        "uri": "spotify:artist:6p4Tw99DCzxDqV8JzqdDaM",
                        "visuals": {
                            "avatarImage": {
                                "sources"?: [
                                    { "height": 640, "url": string, "width": 640 },
                                    { "height": 64, "url": string, "width": 64 },
                                    { "height": 300, "url": string, "width": 300 }
                                ]
                            }
                        }
                    }[]
                    "totalCount": number
                }
            },
            "sharingInfo": {
                "shareId": string
                "shareUrl": string
            },
            "relatedMusicVideos": {
                "__typename": "MusicVideosPage",
                "items": any[],
                "pagingInfo": {
                    "nextOffset": any
                },
                "totalCount": number
            },
            "unmappedMusicVideos": {
                "__typename": "MusicVideosPage",
                "items": any[],
                "pagingInfo": {
                    "nextOffset": any
                },
                "totalCount": number
            },
            "visualIdentity": { "wideFullBleedImage": any },
            "watchFeedEntrypoint": {
                "entrypointUri": string,
                "thumbnailImage": {
                    "data": {
                        "__typename": "ImageV2",
                        "imageId": string
                        "imageIdType": "IMAGE_URL",
                        "sources": [
                            {
                                "imageFormat": "WEBP",
                                "maxHeight": 640,
                                "maxWidth": 640,
                                "url": string,
                            },
                            {
                                "imageFormat": "WEBP",
                                "maxHeight": 64,
                                "maxWidth": 64,
                                "url": string,
                            },
                            {
                                "imageFormat": "WEBP",
                                "maxHeight": 300,
                                "maxWidth": 300,
                                "url": string,
                            }
                        ]
                    }
                },
                "video": null
            }
        }
    }
}

export interface ArtistUnionProfile {
    "biography": {
        "text": string | null,
        "type": "BIOGRAPHY" | "AUTOBIOGRAPHY"
    },
    "externalLinks": { "items": { "name": string, "url": string }[] },
    "name": string
    "pinnedItem"?: {
        "backgroundImageV2": any,
        "comment": string,
        "itemV2": {
            "__typename": string,
            "title": string,
            "subtitle": string,
            "type": string,
            "uri": string
            "data": {
                "__typename": string,
                "images": { "items": { "sources": [{ "height": null | number, "url": string, "width": null | number }] }[] },
                "name": string,
                "uri": string
            }
            "thumbnailImage": { "data": { "sources": { "url": string }[] } },
        },
    },
    "playlistsV2": {
        "items": {
            "data": {
                "__typename": "Playlist",
                "description": string,
                "images": {
                    "items": { "sources": [{ "height": null | number, "url": string, "width": null | number }] }[]
                },
                "name": string,
                "ownerV2": { "data": { "__typename": "User", "name": string } },
                "uri": string
            }
        }[],
        "totalCount": number
    },
    "verified": boolean
}

export interface AlbumArtistUnion {
    "copyright": { "items": { "text": string, "type": string }[] },
    "coverArt": { "sources": ImageObject[] },
    "date": {
        "day": number,
        "month": number,
        "precision": "DAY" | "MONTH" | "YEAR",
        "year": number
    },
    "id": string
    "label": string
    "name": string
    "playability": Playability
    "sharingInfo": { "shareId": string, "shareUrl": string },
    "tracks": { "totalCount": number },
    "type": "EP" | "SINGLE" | "ALBUM" | "COMPILATION",
    "uri": string
}

export interface TrackArtistUnion {
    "track": {
        "albumOfTrack": {
            "coverArt": {
                "sources": { "url": string }[]
            },
            "uri": string
        },
        "artists": {
            "items": { "profile": { "name": string }, "uri": string }[]
        },
        "associationsV3": { "videoAssociations": { "totalCount": number } },
        "contentRating": { "label": string },
        "discNumber": number,
        "duration": { "totalMilliseconds": number },
        "id": string
        "name": string
        "playability": Playability
        "playcount": string
        "uri": string
    },
    "uid": string
}