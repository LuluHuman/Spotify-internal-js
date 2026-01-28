import { Cluster, PlayerState, WsTrack } from "./Player.types";
import { Spotify } from "../../..";
import SpotifyIdentifier from "../../infra/Identifier/SpotifyIdentifier";
import { TrackSnippet } from "../Track/Track";


export async function mapCluster(spotify: Spotify, cluster: Cluster) {
    if (!cluster) return
    const curTrack = await spotify.tracks.fetch(new SpotifyIdentifier(cluster?.player_state.track.uri))
    const urisToFetch = [...cluster.player_state.next_tracks || [], ...cluster.player_state.prev_tracks || []]
        .filter((track, index, array) => array.indexOf(track) === index && track.uri.startsWith("spotify:track:"))
    const trackDetails = urisToFetch.length > 0
        ? await spotify.tracks.fetchMany(urisToFetch.map(track => new SpotifyIdentifier(track.uri)))
        : []

    const nextTracks = cluster.player_state.next_tracks?.map((wsTrack) => mapQueue(wsTrack, trackDetails))
    const prevTracks = cluster.player_state.prev_tracks?.map((wsTrack) => mapQueue(wsTrack, trackDetails))
    const isDj = cluster.player_state.track.metadata?.station_title == "DJ"

    const state = {
        player: {
            playbackId: cluster.player_state.playback_id,
            isPaused: cluster.player_state.is_paused,
            position: parseInt(cluster.player_state.position_as_of_timestamp),
            duration: parseInt(cluster.player_state.duration),
            contextUri: cluster.player_state.context_uri,
            track: curTrack,
            nextTracks: nextTracks,//cluster.player_state.next_tracks
            prevTracks: prevTracks,//cluster.player_state.prev_tracks
            dj: isDj ? {
                transcript: mapDJTranscript(cluster.player_state),
                source: cluster.player_state.track.metadata?.["source-loader"] || "Unknown",
                subtitle: cluster.player_state.track.metadata?.station_subtitle || ""
            } : undefined
        },
        devices: cluster.devices ? Object.values(cluster.devices)
            .map(device => ({
                deviceId: device.device_id,
                clientId: device.client_id,
                isActive: device.device_id == cluster.active_device_id,
                name: device.name,
                type: device.device_type,
                brand: device.brand,
                model: device.model,
                volume: Math.floor(device.volume / 65535),
                outputDevice: {
                    type: device.audio_output_device_info?.audio_output_device_type,
                    //known: UNKNOWN_AUDIO_OUTPUT_DEVICE_TYPE, BUILT_IN_SPEAKER
                    name: device.audio_output_device_info?.device_name
                }
            })) : null
    }

    return state
}



function mapQueue(wsTrack: WsTrack, trackDetails: TrackSnippet[]) {
    return {
        track: trackDetails.find(track => track.uri == wsTrack.uri),
        uid: wsTrack.uid,
        context: wsTrack.provider, //delimiter0, q1, 0e85bfb5ad7f44e0
        hidden: wsTrack.metadata?.hidden_in_queue == "true"
    }
}

function filterTags(speak: string) {
    const speakTagPattern = /<speak[^>]*>([\s\S]*?)<\/speak>/;
    const match = speak.match(speakTagPattern);
    return match ? match[1].replace(/<entity[^>]*>(.*?)<\/entity>/g, "$1") : undefined;
}

function decodeBase64(base64: string) {
    const binary = atob(base64); // Decode base64 into Latin-1 binary string
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0)); // Convert to bytes
    const decoder = new TextDecoder("utf-8"); // Use UTF-8 decoder
    return decoder.decode(bytes); // Decode bytes properly as UTF-8 string
}

function mapDJTranscript(player_state: PlayerState) {
    if (!player_state.track.metadata?.["media.manifest"]) return []
    const transcript: string[] = [];

    const outro = decodeBase64(player_state.track.metadata["media.manifest"]);
    transcript.push(filterTags(outro) || "");

    const nextSong = player_state.next_tracks?.[0];
    if (nextSong?.metadata) {
        const nextSongMeta = nextSong?.metadata;
        if (nextSongMeta["media.manifest"]) {
            const intro = decodeBase64(nextSongMeta["media.manifest"]);
            transcript.push(filterTags(intro) || "");
        }

        if (nextSongMeta["narration.intro.ssml"]) {
            const intro = nextSongMeta["narration.intro.ssml"];
            transcript.push(filterTags(intro) || "");
        }
    }
    return transcript
}