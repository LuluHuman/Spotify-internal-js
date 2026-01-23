import { Spotify } from "../Spotify";
import { Show } from "../classes";
import { Episode } from "../classes/Podcast";
import SpotifyIdentifier from "../helpers/SpotifyIdentifier";
import { APIPlaylistContent, APIShow } from "../types";
import { APILibraryPage } from "../types/APIGeneric";
import { APIEpisodeOrChapterResponseWrapper } from "../types/APIPlaylist";
import { APIPodcastWrapper, APIShowEpisode, APIShowEpisodes } from "../types/APIPodcast";

export function mapShow(spotify: Spotify, apiShow: APIShow) {
    return new Show(spotify, {
        saved: apiShow.data.podcastUnionV2.saved,
        description: apiShow.data.podcastUnionV2.description,
        html_description: apiShow.data.podcastUnionV2.htmlDescription,
        explicit: apiShow.data.podcastUnionV2.contentRatingV2?.labels.includes("EXPLICIT") || false,
        id: apiShow.data.podcastUnionV2.id,
        uri: apiShow.data.podcastUnionV2.uri,
        images: apiShow.data.podcastUnionV2.coverArt.sources,
        media_type: apiShow.data.podcastUnionV2.mediaType,
        name: apiShow.data.podcastUnionV2.name,
        publisher: apiShow.data.podcastUnionV2.publisher.name
    })
}

export function mapShowItems(spotify: Spotify, apiShowEpisodes: APIShowEpisodes) {
    const page = apiShowEpisodes.data.podcastUnionV2.episodesV2
    return {
        limit: 50,
        offset: page.pagingInfo.nextOffset,
        total: page.totalCount,
        items: page.items.map((item) => new Episode(spotify, {
            id: item.entity.data.id,
            uri: item.entity.data.uri,
            uid: item.uid,
            name: item.entity.data.name,
            description: item.entity.data.description,
            html_description: item.entity.data.htmlDescription,
            duration_ms: item.entity.data.duration.totalMilliseconds,
            explicit: item.entity.data.contentRating.label == "EXPLICIT",
            audio_preview_url: item.entity.data.previewPlayback.audioPreview.cdnUrl,
            images: item.entity.data.coverArt.sources,
            is_playable: item.entity.data.playability.playable,
            languages: item.entity.data.transcripts.items.map(transcript => transcript.language),
            release_date: new Date(item.entity.data.releaseDate.isoString),
            release_date_precision: item.entity.data.releaseDate.precision,
            resume_point: {
                //fully_played: 
                resume_position_ms: item.entity.data.playedState.playPositionMilliseconds
            },
        }))
    }
}

export function mapEpisode(spotify: Spotify, apiShowEpisode: APIShowEpisode) {
    return new Episode(spotify, {
        id: apiShowEpisode.data.episodeUnionV2.id,
        uri: apiShowEpisode.data.episodeUnionV2.uri,
        name: apiShowEpisode.data.episodeUnionV2.name,
        description: apiShowEpisode.data.episodeUnionV2.description,
        html_description: apiShowEpisode.data.episodeUnionV2.htmlDescription,
        duration_ms: apiShowEpisode.data.episodeUnionV2.duration.totalMilliseconds,
        explicit: apiShowEpisode.data.episodeUnionV2.contentRating.label == "EXPLICIT",
        audio_preview_url: apiShowEpisode.data.episodeUnionV2.previewPlayback.audioPreview.cdnUrl,
        images: apiShowEpisode.data.episodeUnionV2.coverArt.sources,
        is_playable: apiShowEpisode.data.episodeUnionV2.playability.playable,
        languages: apiShowEpisode.data.episodeUnionV2.transcripts.items.map(transcript => transcript.language),
        release_date: new Date(apiShowEpisode.data.episodeUnionV2.releaseDate.isoString),
        release_date_precision: apiShowEpisode.data.episodeUnionV2.releaseDate.precision,
        resume_point: {
            //fully_played: 
            resume_position_ms: apiShowEpisode.data.episodeUnionV2.playedState.playPositionMilliseconds
        },
    })
}

export function mapSavedPodcast(spotify: Spotify, apiAlbum: APILibraryPage<APIPodcastWrapper>) {
    return apiAlbum.data.me.libraryV3.items.map((show) => (
        new Show(spotify, {
            saved: true,
            description: show.item.data.description,
            html_description: show.item.data.description,
            id: new SpotifyIdentifier(show.item.data.uri).id,
            uri: show.item.data.uri,
            images: show.item.data.coverArt.sources,
            media_type: show.item.data.mediaType,
            name: show.item.data.name,
            publisher: show.item.data.publisher.name
        })
    ))
}

export function mapSavedEpisodes(spotify: Spotify, playlistItems: APIPlaylistContent["data"]["playlistV2"]["content"]) {
    return playlistItems.items.filter(i => i.itemV2.data.__typename == "Episode").map((episode) => {
        const itemV2 = episode.itemV2 as APIEpisodeOrChapterResponseWrapper
        return new Episode(spotify, {
            id: new SpotifyIdentifier(episode.itemV3.data.uri).id,
            uri: episode.itemV3.data.uri,
            uid: episode.uid,
            name: itemV2.data.name,
            description: itemV2.data.description,
            html_description: itemV2.data.description,
            duration_ms: itemV2.data.episodeDuration.totalMilliseconds,
            explicit: itemV2.data.contentRating.label == "EXPLICIT",
            audio_preview_url: "",
            images: itemV2.data.coverArt.sources,
            is_playable: itemV2.data.playability.playable,
            languages: [itemV2.data.language.code],
            release_date: new Date(itemV2.data.releaseDate.isoString),
            release_date_precision: itemV2.data.releaseDate.precision,
            resume_point: {
                resume_position_ms: itemV2.data.playedState.playPositionMilliseconds,
            },
        })
    })
}