import { ImageObject } from "../../infra/api_types"
import { ContentRating } from "../Track/Track.types"

export interface APICurrentUser {
    "data": {
        "me": {
            "profile": {
                "name": string
                "uri": string
                "username": string
                "avatar": {
                    "sources": ImageObject[]
                },
                "avatarBackgroundColor": number,
            }
        }
    }
}

export interface APIUser {
    "uri": string;
    "name": string;
    "image_url": string;
    "followers_count": number,
    "following_count": number,
    "is_following": boolean,
    "public_playlists": {
        "uri": string,
        "name": string,
        "image_url": string,
        "owner_name": string,
        "owner_uri": string,
    }[],
    "total_public_playlists_count": number,
    "has_spotify_name": boolean,
    "has_spotify_image": boolean,
    "color": number,
    "allow_follows": boolean,
    "show_follows": boolean
}

export interface APIUserFollowers {
    profiles: {
        uri: string,
        name: string,
        image_url: string,
        followers_count: number,
        color: number,
    }[]
}
export interface APIUserFollowing {
    profiles: {
        uri: string,
        name: string,
        image_url: string,
        followers_count: number,
        color?: number,
        is_following?: boolean
    }[]
}

export interface APIUserTop {
    "data": {
        "me": {
            "profile": {
                "topArtists"?: APIUserTopArtists,
                "topTracks"?: APIUserTopTracks
            }
        }
    }
}

interface APIUserTopArtists {
    "__typename": "ArtistPageV2",
    "items": {
        "data": {
            "__typename": "Artist",
            "profile": { "name": string },
            "uri": string,
            "visuals": { "avatarImage": { "sources": ImageObject[] } }
        }
    }[],
    "totalCount": number
}

interface APIUserTopTracks {
    "__typename": "TrackPageV2",
    "items": [
        {
            "data": {
                "__typename": "Track",
                "albumOfTrack": { "coverArt": { "sources": ImageObject[] }, "name": string, "uri": string },
                "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
                "contentRating": { "label": ContentRating },
                "duration": { "totalMilliseconds": number },
                "name": string,
                "saved": boolean,
                "uri": string
            }
        }
    ],
    "totalCount": number
}

export interface APIUserPlaylists {
    public_playlists: {
        uri: string;
        name: string;
        image_url: string;
        owner_name: string;
        owner_uri: string;
        followers_count?: number,
        is_following?: boolean
    }[],
    total_public_playlists_count: 3,
}
export type APICheckFollowingUser = { uri: string, following: boolean }[]