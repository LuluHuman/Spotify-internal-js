import { ColorPalette, ColorValue, ImageObject, Playability } from "./APIGeneric"
import { ContentRating } from "./APITrack"

export interface APIShow {
    "data": {
        "podcastUnionV2": {
            "__typename": "Podcast",
            "accessInfo": null,
            "consumptionOrderV2": "EPISODIC",
            "contentRatingV2": null | {
                labels: ("EXPLICIT" | string)[]
            },
            "contentType": "CONTENT_TYPE_PODCAST",
            "coverArt": { "sources": ImageObject[] },
            "description": string,
            "episodesV2": {
                "__typename": "ContextEpisodePage",
                "items": {
                    "entity": {
                        "__typename": "EpisodeResponseWrapper",
                        "data": { "__typename": "Episode", "creator": null, "uri": string }
                    }
                }[]
            },
            "gatedEntityRelations": unknown[],
            "htmlDescription": string,
            "id": string,
            "mediaType": "MIXED" | string,
            "musicAndTalk": boolean,
            "name": string,
            "playability": Playability,
            "publisher": { "name": string },
            "rating": {
                "averageRating": { "average": number, "showAverage": boolean, "totalRatings": number },
                "canRate": boolean,
                "rating": { "rating": number }
            },
            "saved": boolean,
            "sharingInfo": { "shareId": string, "shareUrl": string },
            "showTypes": unknown[],
            "topics": { "items": { "__typename": "PodcastTopic", "title": string, "uri": string }[] },
            "trailerV2": unknown | null,
            "uri": "spotify:show:696emFDcbZ6SJWcOMT6Gem"
            "visualIdentity": {
                "sixteenByNineCoverImage": unknown | null,
                "squareCoverImage": {
                    "__typename": "VisualIdentityImage",
                    "extractedColorSet": {
                        "encoreBaseSetTextColor": ColorValue,
                        "highContrast": ColorPalette,
                        "higherContrast": ColorPalette,
                        "minContrast": ColorPalette
                    }
                }
            }
        }
    }
}


export interface APIShowSimple {
    "data": {
        "__typename": "Podcast",
        "coverArt": { "sources": ImageObject },
        "name": string,
        "showTypes": unknown[],
        "trailerV2": unknown | null,
        "uri": string,
        "accessInfo": null
    }
}


export interface APIShowEpisode {

    "data": {
        "episodeUnionV2": {

            "__typename": "Episode",
            "accessInfo": null,
            "audio": {
                "items": {
                    "fileId": string,
                    "format": "MP4_128" | "OGG_VORBIS_96" | "MP4_128_DUAL" | "MP4_128_CBCS" | "AAC_24" | string,
                    "url": string
                }[]
            },
            "contentInformation": null | unknown,
            "contentRating": {
                "label": ContentRating
            },
            "contents": unknown[] | [],
            "coverArt": { "sources": ImageObject[] },
            "creator": null,
            "description": string,
            "duration": { "totalMilliseconds": number },
            "gatedEntityRelations": unknown[] | [],
            "htmlDescription": string,
            "id": string,
            "mediaTypes": ("AUDIO" | "VIDEO")[],
            "name": string,
            "playability": Playability,
            "playedState": {
                "playPositionMilliseconds": number,
                "state": "NOT_STARTED" | string
            },
            "podcastV2": APIShowSimple,
            "previewPlayback": { "audioPreview": { "cdnUrl": string } },
            "releaseDate": { "isoString": string, "precision": "DAY" | "MONTH" | "YEAR" },
            "restrictions": { "paywallContent": boolean },
            "segments": { "segments": { "totalCount": number } },
            "sharingInfo": { "shareId": string, "shareUrl": string },
            "transcripts": {
                "items": {
                    "cdnUrl": "https://episode-transcripts.spotifycdn.com/1.0/spotify:transcript:5yOJ4ktXUEW0eWHpPW3IbE",
                    "isStatic": false,
                    "language": "en-us",
                    "readAlongUrlV2": "https://spclient.wg.spotify.com/transcript-read-along/v2/episode/3jnpV28K0ZJapYJaHPub2s",
                    "uri": "spotify:transcript:5yOJ4ktXUEW0eWHpPW3IbE"
                }[]
            },
            "type": "PODCAST_EPISODE",
            "uri": string,
            "visualIdentity": {
                "sixteenByNineCoverImage": { "image": { "data": { "__typename": "ImageV2", "sources": ImageObject } } },
                "squareCoverImage": {
                    "__typename": "VisualIdentityImage",
                    "extractedColorSet": {
                        "encoreBaseSetTextColor": ColorValue,
                        "highContrast": ColorPalette,
                        "higherContrast": ColorPalette,
                        "minContrast": ColorPalette
                    }
                }
            }
        }
    }
}

export interface APIShowEpisodes {
    "data": {
        "podcastUnionV2": {
            "__typename": "Podcast",
            "episodesV2": {
                "__typename": "ContextEpisodePage",
                "items": {
                    "entity": {
                        "data": APIShowEpisode["data"]["episodeUnionV2"]
                        "_uri": string,
                    },
                    "uid": string
                }[],
                "pagingInfo": { "nextOffset": null | number },
                "totalCount": number
            },
            "id": string,
            "name": string,
            "uri": string
        }
    }
}

export interface APIPodcastWrapper {
    "addedAt": { "isoString": string },
    "depth": number,

    "item": {
        "__typename": "PodcastResponseWrapper",
        "_uri": string,
        "data": {
            "__typename": "Podcast",
            "coverArt": { "sources": ImageObject[] },
            "description": string,
            "language": { "code": string },
            "mediaType": "MIXED" | string,
            "name": string,
            "publisher": { "name": string },
            "uri": string,
        }
    }
    "pinnable": boolean,
    "pinned": boolean,
    "playedAt": { "isoString": string }
}