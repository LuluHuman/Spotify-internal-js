// newer version from chatgpt but i dont trust

export type PlayerLogEntry = {
    timestamp: string;
    active_device_id: string;
    player_state: PlayerState;
};

export type PlayerState = {
    timestamp: string;
    context_uri?: string;
    context_url?: string;

    play_origin?: { feature_identifier?: string; feature_version?: string; referrer_identifier?: string; };

    index?: { page?: number; track?: number; };

    track?: TrackLike;
    prev_tracks?: TrackLike[];
    next_tracks?: TrackLike[];

    playback_id?: string;
    playback_speed?: number;
    position_as_of_timestamp?: string;
    duration?: string;

    is_playing?: boolean;
    is_paused?: boolean;
    is_system_initiated?: boolean;

    options?: {
        shuffling_context?: boolean;
        repeating_context?: boolean;
        repeating_track?: boolean;
        modes?: Record<string, string>;
    };

    restrictions?: Record<string, unknown>;
    suppressions?: Record<string, unknown>;
};

export type TrackLike = {
    uri: string;
    uid: string;
    provider: Provider;
    metadata: Metadata;
};

export type Provider =
    | "context"
    | "narration/intro"
    | "narration/outro"
    | "narration/jump";

export type Metadata = {
    canonical_track_uri?: string;
    context_uri?: string;
    entity_uri?: string;

    title?: string;
    album_title?: string;
    artist_uri?: string;
    artist_name?: string;
    album_artist_name?: string;

    track_player?: "audio" | string;
    station_title?: string;
    station_subtitle?: string;
    station_uri?: string;

    album_image_small?: string;
    album_image_large?: string;
    image_url?: string;
    image_small_url?: string;
    image_large_url?: string;
    image_xlarge_url?: string;

    decision_id?: string;
    iteration?: string | number;
    view_index?: string | number;
    timestamp?: string;

    is_discovery?: "true" | "false",
    is_artist_discovery?: "true" | "false"
    hidden_in_queue?: string | boolean;

    "automix.talk_mode"?: "human_cuepoints_or_full_track",
    "automix.mode": "airbag",

    "is_queued"?: "true",
    "queued_by"?: string,

    "narration.intro.ssml.artist"?: string,
    "narration.intro.loudness"?: string,
    "narration.intro.custom_reporting_attribution"?: string,
    "narration.intro.true_peak"?: string,
    "narration.intro.tts_provider"?: string,
    "narration.intro.ssml"?: string,
    "narration.intro.voice"?: string,
    "narration.intro.decision_id"?: string,
    "narration.intro.image"?: string,
    "narration.intro.commentary_type"?: "NARRATION",
    "narration.intro.sample_rate"?: string,
    "narration.intro.ssml.title"?: string,
    "narration.intro.ssml.album_title"?: string,
    "narration.intro.commentary_id"?: string,

    "narration.jump.ssml.title"?: string,
    "narration.jump.image"?: string,
    "narration.jump.commentary_id"?: string,
    "narration.jump.ssml"?: string,
    "narration.jump.sample_rate"?: string,
    "narration.jump.voice"?: string,
    "narration.jump.custom_reporting_attribution"?: string,
    "narration.jump.true_peak"?: string,
    "narration.jump.tts_provider"?: string,
    "narration.jump.commentary_type"?: string,
    "narration.jump.ssml.artist"?: string,
    "narration.jump.decision_id"?: string,
    "narration.jump.loudness"?: string,
    "narration.jump.ssml.album_title"?: string,

    "narration.voice"?: string,

    [key: string]: unknown;
};
