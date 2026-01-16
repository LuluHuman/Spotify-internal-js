import { ImageSrc, Playability } from "./APIGeneric"

export type ContentRating = "EXPLICIT" | "NONE"
export interface APITrack {
    "gid": string,
    "name": string,
    "album": {
        "gid": string,
        "name": string,
        "artist": {
            "gid": string,
            "name": string
        }[],
        "label": string,
        "date": {
            "year": number,
            "month": number,
            "day": number
        },
        "cover_group": {
            "image": {
                "file_id": string,
                "size": "DEFAULT" | "LARGE" | "SMALL",
                "width": 300 | 64 | 640,
                "height": 300 | 64 | 640
            }[]
        },
        "licensor": {
            "uuid": string
        }
    },
    "artist": { "gid": string, "name": string }[],
    "number": number,
    "disc_number": number,
    "duration": number,
    "popularity": number,
    "external_id": { "type": string, "id": string }[],
    "earliest_live_timestamp": number,
    "has_lyrics": boolean,
    "licensor": {
        "uuid": string
    },
    "language_of_performance": string[],
    "original_audio": { "uuid": string, "format": string },
    "original_title": string,
    "artist_with_role": { "artist_gid": string, "artist_name": string, "role": string }[],
    "canonical_uri": string,
    "content_authorization_attributes": string,
    "audio_formats": { "original_audio": { "uuid": string, "format": string } }[],
    "media_type": "AUDIO",
    "implementation_details": {
        "catalog_insertion_date": { "seconds": number, "nanos": number }
    }
}

export interface APITracks {
    "data": {
        "tracks": {
            "__typename": "Track",
            "albumOfTrack": { "coverArt": { "sources": ImageSrc[] }, "name": string, "uri": string },
            "artists": {
                "items": { "profile": { "name": string }, "uri": string }[]
            },
            "associations": { "associatedVideos": { "totalCount": number } },
            "contentRating": { "label": ContentRating },
            "duration": { "totalMilliseconds": number },
            "name": string,
            "uri": string
        }[]
    }
}

export interface APISavedTracks {
    "data": {
        "me": {
            "library": {
                "tracks": {
                    "__typename": "UserLibraryTrackPage",
                    "items": [
                        {
                            "__typename": "UserLibraryTrackResponse",
                            "addedAt": { "isoString": string },
                            "track": {
                                "_uri": string,
                                "data": {
                                    "__typename": "Track",
                                    "albumOfTrack": {
                                        "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
                                        "coverArt": { "sources": ImageSrc[] },
                                        "name": string,
                                        "uri": string
                                    },
                                    "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
                                    "associationsV3": {
                                        "audioAssociations": { "totalCount": number },
                                        "videoAssociations": { "totalCount": number }
                                    },
                                    "contentRating": { "label": ContentRating },
                                    "discNumber": number,
                                    "duration": { "totalMilliseconds": number },
                                    "mediaType": "AUDIO",
                                    "name": string,
                                    "playability": Playability
                                    "trackNumber": number
                                }
                            }
                        }
                    ],
                    "pagingInfo": { "limit": number, "offset": number },
                    "totalCount": number
                }
            }
        }
    }
}

export interface APICheckSavedTracks {
    "data": {
        "lookup": {
            "__typename": "TrackResponseWrapper",
            "data": { "__typename": "Track", "isCurated": boolean }
        }[]
    }
}