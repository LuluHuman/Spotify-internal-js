import { Spotify } from "../../..";
import { datePrecision, ImageObject } from "../../infra/api_types";

export class Show {
    spotify: Spotify
    #saved?: boolean
    description: string
    html_description: string
    explicit?: boolean
    id: string
    uri: string
    images: ImageObject[]
    media_type: string | "MIXED"
    name: string
    publisher: string
    //rating
    constructor(spotify: Spotify, show: {
        saved?: boolean,
        description: string,
        html_description: string
        explicit?: boolean
        id: string
        uri: string
        images: ImageObject[]
        media_type: string | "MIXED"
        name: string
        publisher: string
    }) {
        this.spotify = spotify
        this.#saved = show.saved
        this.description = show.description
        this.html_description = show.html_description
        this.explicit = show.explicit
        this.id = show.id
        this.uri = show.uri
        this.images = show.images
        this.media_type = show.media_type
        this.name = show.name
        this.publisher = show.publisher
    }
}

export class Episode {
    spotify: Spotify
    id: string
    uri: string
    uid?: string
    name: string
    description: string
    html_description: string
    duration_ms: number
    explicit: boolean
    audio_preview_url: string | null
    images: ImageObject[]
    is_playable: boolean
    languages: string[]
    release_date: Date
    release_date_precision: datePrecision
    resume_point: {
        resume_position_ms: number
    }
    constructor(spotify: Spotify, episode: {
        id: string
        uri: string
        uid?: string
        name: string
        description: string
        html_description: string
        duration_ms: number
        explicit: boolean
        audio_preview_url: string | null
        images: ImageObject[]
        is_playable: boolean
        languages: string[]
        release_date: Date
        release_date_precision: datePrecision
        resume_point: {
            resume_position_ms: number
        }
    }) {
        this.spotify = spotify
        this.id = episode.id
        this.uri = episode.uri
        this.uid = episode.uid
        this.name = episode.name
        this.description = episode.description
        this.html_description = episode.html_description
        this.duration_ms = episode.duration_ms
        this.explicit = episode.explicit
        this.audio_preview_url = episode.audio_preview_url
        this.images = episode.images
        this.is_playable = episode.is_playable
        this.languages = episode.languages
        this.release_date = episode.release_date
        this.release_date_precision = episode.release_date_precision
        this.resume_point = episode.resume_point
    }
}