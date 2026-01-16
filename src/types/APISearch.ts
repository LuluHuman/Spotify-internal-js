import { albumType } from "./APIAlbum"
import { ColorPalette, ColorValue, ImageSrc, Playability } from "./APIGeneric"
import { ContentRating } from "./APITrack"

export interface APISearch {
    "data": {
        "searchV2": {
            "albumsV2"?: APIAlbumSearch,
            "artists"?: APIArtistSearch,
            "audiobooks"?: { "items": unknown[], "totalCount": number },
            "chipOrder"?: { "items": { "typeName": "TRACKS" | "PLAYLISTS" | "ALBUMS" | "ARTISTS" | "EPISODES" | "USERS" | "AUTHORS" | "AUDIOBOOKS" | "GENRES" | "PODCASTS" }[] },
            "episodes"?: APISearchEpisodes,
            "genres"?: APISearchGenres,
            "playlists"?: APISearchPlaylists,
            "podcasts"?: APISearchPodcasts,
            "topResultsV2"?: APISearchTop,
            "tracksV2"?: APISearchTracks,
            "users"?: APISearchUsers
        },
        "extensions": {
            "requestIds": {
                "/searchV2": { "search-api": string },
                "/searchV2/topResultsV2": { "search-api": string }
            }
        }
    }
}

interface APIAlbumSearch {
    "__typename": "AlbumOrPrereleasePage",
    "items": {
        "__typename": "AlbumResponseWrapper",
        "data": {
            "__typename": "Album",
            "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
            "coverArt": {
                "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                "sources": ImageSrc[]
            },
            "date": { "year": number },
            "name": string,
            "playability": Playability,
            "type": albumType,
            "uri": string,
            "visualIdentity": {
                "squareCoverImage": {
                    "__typename": "VisualIdentityImage",
                    "extractedColorSet": {
                        "encoreBaseSetTextColor": ColorValue,
                        "highContrast": ColorPalette
                        "higherContrast": ColorPalette
                        "minContrast": ColorPalette
                    }
                }
            }
        }
    }[],
    "totalCount": number
}

interface APIArtistSearch {
    "items": [
        {
            "__typename": "ArtistResponseWrapper",
            "data": {
                "__typename": "Artist",
                "profile": { "name": string, "verified": boolean },
                "uri": string
                "visualIdentity": {
                    "squareCoverImage": {
                        "__typename": "VisualIdentityImage",
                        "extractedColorSet": {
                            "encoreBaseSetTextColor": ColorValue,
                            "highContrast": ColorPalette
                            "higherContrast": ColorPalette
                            "minContrast": ColorPalette
                        }
                    }
                },
                "visuals": {
                    "avatarImage": {
                        "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                        "sources": ImageSrc[]
                    }
                }
            }
        }
    ],
    "totalCount": 801
}

interface APISearchEpisodes {
    "items": [
        {
            "__typename": "EpisodeResponseWrapper",
            "data": {
                "__typename": "Episode",
                "contentRating": { "label": ContentRating },
                "coverArt": {
                    "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                    "sources": ImageSrc[]
                },
                "description": string,
                "duration": { "totalMilliseconds": number },
                "gatedEntityRelations": unknown[],
                "mediaTypes": ("VIDEO" | "AUDIO")[],
                "name": string,
                "playability": Playability,
                "playedState": { "playPositionMilliseconds": number, "state": string },
                "podcastV2": {
                    "__typename": "PodcastResponseWrapper",
                    "data": {
                        "__typename": "Podcast",
                        "coverArt": { "sources": ImageSrc[] },
                        "mediaType": string,
                        "name": string,
                        "publisher": { "name": string },
                        "uri": string
                    }
                },
                "releaseDate": { "isoString": string, "precision": "DAY" | "MONTH" | "YEAR" },
                "restrictions": { "paywallContent": boolean },
                "uri": string,
                "videoPreviewThumbnail": {
                    "__typename": "VideoThumbnailImage",
                    "imagePreview": {
                        "data": {
                            "__typename": "ImageV2",
                            "sources": {
                                "maxHeight": number,
                                "maxWidth": number,
                                "url": string
                            }[]
                        }
                    }
                },
                "visualIdentity": {
                    "squareCoverImage": {
                        "__typename": "VisualIdentityImage",
                        "extractedColorSet": {
                            "encoreBaseSetTextColor": ColorValue,
                            "highContrast": ColorPalette
                            "higherContrast": ColorPalette
                            "minContrast": ColorPalette
                        }
                    }
                }
            }
        }
    ],
    "totalCount": 393
}

interface APISearchGenres {
    "items": [
        {
            "__typename": "GenreResponseWrapper",
            "data": {
                "__typename": "Genre",
                "image": {
                    "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                    "sources": ImageSrc[]
                },
                "name": string,
                "uri": string
            }
        }
    ],
    "totalCount": number
}

interface APISearchPlaylists {
    "items": [
        {
            "__typename": "PlaylistResponseWrapper",
            "data": {
                "__typename": "Playlist",
                "attributes": [],
                "description": "&lt;33",
                "format": "",
                "images": {
                    "items": {
                        "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                        "sources": ImageSrc[]
                    }[]
                },
                "name": string,
                "ownerV2": {
                    "__typename": "UserResponseWrapper",
                    "data": {
                        "__typename": "User",
                        "avatar": { "sources": ImageSrc[] },
                        "name": string,
                        "uri": string,
                        "username": string
                    }
                },
                "uri": string,
                "visualIdentity": {
                    "squareCoverImage": {
                        "__typename": "VisualIdentityImage",
                        "extractedColorSet": {
                            "encoreBaseSetTextColor": ColorValue,
                            "highContrast": ColorPalette
                            "higherContrast": ColorPalette
                            "minContrast": ColorPalette
                        }
                    }
                },
            }
        }
    ],
    "totalCount": number
}

interface APISearchPodcasts {
    "items": [
        {
            "__typename": "PodcastResponseWrapper",
            "data": {
                "__typename": "Podcast",
                "coverArt": {
                    "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                    "sources": ImageSrc[]
                },
                "mediaType": "AUDIO" | "VIDEO",
                "name": string,
                "publisher": { "name": string },
                "topics": { "items": { "__typename": "PodcastTopic", "title": string, "uri": string }[] },
                "uri": string,
                "visualIdentity": {
                    "squareCoverImage": {
                        "__typename": "VisualIdentityImage",
                        "extractedColorSet": {
                            "encoreBaseSetTextColor": ColorValue,
                            "highContrast": ColorPalette
                            "higherContrast": ColorPalette
                            "minContrast": ColorPalette
                        }
                    }
                },
            }
        }
    ],
    "totalCount": number
}

interface APISearchTop {
    "featured": [],
    "itemsV2": (APIAlbumSearch | APIArtistSearch | APISearchEpisodes | APISearchGenres | APISearchPlaylists | APISearchPodcasts | APISearchTracks | APISearchUsers)["items"]
}

interface APISearchTracks {
    "items": [
        {
            "item": {
                "__typename": "TrackResponseWrapper",
                "data": {
                    "__typename": "Track",
                    "albumOfTrack": {
                        "coverArt": {
                            "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                            "sources": ImageSrc[]
                        },
                        "id": string,
                        "name": string,
                        "uri": string,
                        "visualIdentity": {
                            "squareCoverImage": {
                                "__typename": "VisualIdentityImage",
                                "extractedColorSet": {
                                    "encoreBaseSetTextColor": ColorValue,
                                    "highContrast": ColorPalette
                                    "higherContrast": ColorPalette
                                    "minContrast": ColorPalette
                                }
                            }
                        },
                    },
                    "artists": {
                        "items": { "profile": { "name": string }, "uri": string }[]
                    },
                    "associationsV3": {
                        "audioAssociations": { "totalCount": number },
                        "videoAssociations": { "totalCount": number }
                    },
                    "contentRating": { "label": ContentRating },
                    "duration": { "totalMilliseconds": number },
                    "id": string
                    "trackMediaType": "AUDIO" | "VIDEO",
                    "name": string
                    "playability": Playability,
                    "uri": string
                }
            },
            "matchedFields": []
        }
    ],
    "totalCount": number
}

interface APISearchUsers {
    "items": [
        {
            "__typename": "UserResponseWrapper",
            "data": {
                "__typename": "User",
                "avatar": {
                    "extractedColors": { "colorDark": { "hex": string, "isFallback": boolean } },
                    "sources": ImageSrc[]
                },
                "id": string
                "displayName": string
                "uri": string
                "username": string
            }
        }
    ],
    "totalCount": number
}
