import { ColorPalette, ColorValue, datePrecision, ImageSrc } from "./APIGeneric"

export type albumType = "EP" | "SINGLE" | "ALBUM" | "COMPILATION"
export interface APIError {
    "data": null,
    "errors": [
        {
            "message": string,
            "locations": [{ "line": number, "column": number }],
            "path": string[],
            "extensions": { "classification": string, "service": string }
        }
    ],
    "extensions": { "valueCompletion": [{ "message": string, "path": any[] }] }
}
export interface APIAlbum {
    __typename: "Album",
    saved: boolean
    name: string
    uri: string
    type: "EP" | "SINGLE" | "ALBUM" | "COMPILATION"
    artists: {
        items: {
            id: string
            profile: { name: string }
            sharingInfo: { shareUrl: string }
            uri: string
            visuals: { avatarImage: { sources: ImageSrc[] } }
        }[]
        totalCount: number
    }
    date: {
        isoString: string
        precision: "DAY" | "MONTH" | "YEAR"
    }
    label: string
    copyright: {
        items: {
            text: string
            type: string
        }[]
        totalCount: number
    }

    coverArt: {
        extractedColors: {
            colorDark: { hex: string }
            colorLight: { hex: string }
            colorRaw: { hex: string }
        }
        sources: {
            height: number
            url: string
            width: number
        }[]
    }

    courtesyLine: string
    isPreRelease: boolean
    playability: {
        playable: boolean
        reason: "PLAYABLE" | "MARKET" | "PRODUCT" | "EXPLICIT"
    }
    preReleaseEndDateTime: any
    sharingInfo: {
        shareId: string
        shareUrl: string
    }
    tracksV2: {
        items: { track: APIAlbumTrack, uid: string }[]
        totalCount: number
    }
    visualIdentity: {
        squareCoverImage: {
            __typename: string
            extractedColorSet: {
                encoreBaseSetTextColor: ColorValue
                highContrast: ColorPalette
                higherContrast: ColorPalette
                minContrast: ColorPalette
            }

        }
    }
    watchFeedEntrypoint: any
    discs: {
        items: {
            number: number
            tracks: { totalCount: number }
        }[]
        totalCount: number
    }
    releases: {
        items: any[]
        totalCount: number
    }
    moreAlbumsByArtist: {
        items: {
            discography: {
                popularReleasesAlbums: {
                    items: {
                        coverArt: {
                            sources: {
                                height: number
                                url: string
                                width: number
                            }[]
                        }
                        date: {
                            year: number
                        }
                        id: string
                        name: string
                        playability: {
                            playable: boolean
                            reason: string
                        }
                        sharingInfo: {
                            shareId: string
                            shareUrl: string
                        }
                        type: string
                        uri: string
                    }[]
                }
            }
        }[]
    }
}
export interface APIAlbumTrack {
    saved: boolean
    uri: string
    name: string
    artists: {
        items: {
            profile: { name: string }
            uri: string
        }[]
    }
    trackNumber: number
    discNumber: number
    duration: { totalMilliseconds: number }
    playcount: string
    contentRating: { label: string }

    associationsV3: { videoAssociations: { totalCount: number } }
    playability: { playable: boolean }
    relinkingInformation: any
}
export interface APIWhatsNewFeedItems {
    "items": {
        "content": {
            "__typename": "AlbumResponseWrapper",
            "data": {
                "__typename": "Album",
                "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
                "coverArt": { "sources": ImageSrc[] },
                "date": { "isoString": string, "precision": datePrecision },
                "name": string,
                "albumType": albumType,
                "uri": string
            }
        },
        "id": string,
        "state": { "state": string/* "SEEN"*/, "timestamp": { "isoString": string } },
        "timestamp": { "isoString": string }
    }[],
    "pagingInfo": {
        "limit": number,
        "nextOffset": null,
        "offset": number
    },
    "totalCount": number
}
export interface APIAlbumsWrapper {
    "addedAt": { "isoString": string },
    "depth": number,
    "item": {
        "__typename": "AlbumResponseWrapper",
        "_uri": string,
        "data": {
            "__typename": "Album",
            "artists": {
                "items": {
                    "profile": { "name": string },
                    "uri": string
                }[]
            },
            "coverArt": {
                "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                "sources": [
                    {
                        "height": 300,
                        "url": string
                        "width": 300
                    },
                    {
                        "height": 64,
                        "url": string
                        "width": 64
                    },
                    {
                        "height": 640,
                        "url": string
                        "width": 640
                    }
                ]
            },
            "date": {
                isoString: string
                precision: "DAY" | "MONTH" | "YEAR"
            }
            name: string
            playability: {
                playable: boolean
                reason: "PLAYABLE" | "MARKET" | "PRODUCT" | "EXPLICIT"
            }
            type: "EP" | "SINGLE" | "ALBUM" | "COMPILATION"
            "uri": string
        }
    },
    "pinnable": boolean,
    "pinned": boolean,
    "playedAt": { "isoString": string }
}
export interface APISavedAlbums {
    "data": {
        "me": {
            "libraryV3": {
                "__typename": "LibraryPage"
                "availableFilters": []
                "availableSortOrders": { "id": string, "name": string }[]
                "breadcrumbs": [],
                "items": APIAlbumsWrapper[]
                "pagingInfo": { "limit": number, "offset": number },
                "selectedFilters": [{ "id": "Albums", "name": "Albums" }],
                "selectedSortOrder": { "id": "Alphabetical", "name": "Alphabetical" },
                "totalCount": number
            }
        }
    }
}