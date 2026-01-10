import axios, { AxiosRequestConfig } from "axios"
import { mapCluster } from "../mappers/websockerClusterMapper"
import { host, Spotify } from "../Spotify"
import { Cluster, SpotifyState, SpotifyWebhook } from "../types/Websocket"
import SpotifyIdentifier from "./SpotifyIdentifier"

export default class SpotifyPlayer {
    #spotify: Spotify
    data: SpotifyState | null
    eventListeners: { [type: string]: ((state: SpotifyState | null) => void)[] }
    deviceId?: string

    constructor(spotify: Spotify, onReady: () => void) {
        this.#spotify = spotify
        this.data = null
        this.eventListeners = {}
        this.initWs(onReady)
    }
    private async playback(
        mode: "resume" | "pause" | "play" | "skip_next" | "skip_prev" | "shuffle" | "repeat" | "seek_to" | "set_options",
        values?: { [value: string]: any }
    ) {
        const raw = JSON.stringify({
            "command": {
                "logging_params": {
                    "page_instance_ids": [],
                    "interaction_ids": [],
                    "command_id": "1e7f04122f19e1674d823e689d0d1e95"
                },
                "endpoint": mode,
                ...values,
            }
        });

        const activeDeviceId = this.data?.devices?.find(device => device.isActive)?.deviceId
        const thisDeviceId = this.deviceId
        if (!thisDeviceId || !activeDeviceId) return


        const url = `${host.gae}/connect-state/v1/player/command/from/${thisDeviceId}/to/${activeDeviceId}`
        const req = await this.#spotify.request(url, { method: "POST", body: raw, }) as
            { ack_id: undefined, error_code: string, error_description: string, reasons: string[] } |
            { ack_id: string, error_code: undefined, error_description: undefined, reasons: undefined }
        if (req.error_code) throw new Error(`Error while executing command: ${req.error_description} - ${req.reasons.join(", ")}`)
        return req as { ack_id: string }
    }
    private async initWs(onReady: () => void) {
        const fn = (state?: SpotifyState) => {
            if (state?.player.playbackId != this.data?.player.playbackId) this.dispatchEvent({ type: "songchange", state: state || null })
            if (state?.player.isPaused != this.data?.player.isPaused) this.dispatchEvent({ type: "onplaypause", state: state || null })
            this.data = state || null
        }
        if (typeof WebSocket == "undefined") throw Error("WebSocket object is undefined")
        const wsDealer = "dealer.spotify.com";
        const wsUrl = `wss://${wsDealer}/?access_token=${this.#spotify.session.accessToken}`;
        const spWs = new WebSocket(wsUrl);
        spWs.onmessage = async (event) => {
            const data = JSON.parse(event.data) as SpotifyWebhook
            if (!data.headers) return;

            const connectionId = data.headers["Spotify-Connection-Id"];
            if (!connectionId) return fn(await mapCluster(this.#spotify, data.payloads[0]?.cluster))

            this.deviceId = await this.registerDevice(connectionId)
            this.connectWs(connectionId).then(async (state) => {
                onReady()
                fn(await mapCluster(this.#spotify, state as Cluster));
            });
        };
    }
    private async registerDevice(connection_id: string) {
        const devId = [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const req = await this.#spotify.request("https://gae2-spclient.spotify.com/track-playback/v1/devices", {
            method: "POST",
            body: JSON.stringify({
                "device": {
                    "brand": "spotify",
                    "capabilities": {
                        "change_volume": false,
                        "enable_play_token": false,
                        "supports_file_media_type": false,
                        "play_token_lost_behavior": "pause",
                        "disable_connect": true,
                        "audio_podcasts": false,
                        "video_playback": false,
                        "manifest_formats": [],
                        "supports_preferred_media_type": false,
                        "supports_playback_offsets": false,
                        "supports_playback_speed": false,
                    },
                    "device_id": devId,
                    "device_type": "computer",
                    "metadata": {},
                    "model": "web_player",
                    "name": "Spotify-Internal-Js",
                    "platform_identifier": "web_player linux undefined;firefox 140.0;desktop",
                    "is_group": false
                },
                "outro_endcontent_snooping": false,
                "connection_id": connection_id,
                "client_version": "harmony:4.62.4-06fd55545",
                "volume": 0
            })
        }) as {
            initial_seq_num: number,
            device_keep_alive_update_seconds: number,
            endsongs: null,
            file_format_filter: number,
            supports_observing: boolean,
            effective_license: "premium" | "free",
        }
        if (req.supports_observing) return devId
        return ""
    }
    private async connectWs(connection_id: string) {
        const digits = function (length: number) {
            const bytes = crypto.getRandomValues(new Uint8Array(length));
            let str = "";
            for (let i = 0; i < bytes.length; i++) { str += bytes[i]?.toString(16) }
            return str;
        };
        const deviceID = (digits(4) + "-" + digits(2) + "-" + digits(2) + "-" + digits(2) + "-" + digits(6));

        const accessToken = this.#spotify.session.accessToken
        const headersList = {
            "x-spotify-connection-id": connection_id,
            authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        const bodyContent = JSON.stringify({
            member_type: "CONNECT_STATE",
            device: { device_info: { capabilities: { can_be_player: false, hidden: true, needs_full_player_state: true } } },
        });

        const reqOptions: AxiosRequestConfig = {
            url: `${host.internal}/connect-state/v1/devices/hobs_${deviceID}`,
            method: "PUT",
            headers: headersList,
            data: bodyContent,
        }
        const request = await axios.request(reqOptions)
        return request.data;
    }

    addEventListener(type: string, callback: (arg?: SpotifyState | null) => void) {
        if (!(type in this.eventListeners)) {
            this.eventListeners[type] = [];
        }
        this.eventListeners[type].push(callback || null);
    }
    dispatchEvent(event: { type: string, state: SpotifyState | null }) {
        if (!(event.type in this.eventListeners)) return
        const stack = this.eventListeners[event.type];
        for (let i = 0; i < stack.length; i++) stack[i](event.state)
    }
    removeEventListener(type: string, callback: (arg?: SpotifyState | null) => void) {
        if (!(type in this.eventListeners)) return;
        const stack = this.eventListeners[type];
        for (let i = 0; i < stack.length; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    }

    pause() { this.playback("pause") }
    resume() { this.playback("resume") }
    next() { this.playback("skip_next") }
    back() { this.playback("skip_prev") }
    seek(position: number) { this.playback("seek_to", { value: position }) }
    setRepeat(mode: number) { this.playback("set_options", { "repeating_context": mode == 1, "repeating_track": mode == 2 }) }
    setShuffle(shuffling: boolean) { this.playback("set_options", { "shuffling_context": shuffling, }) }
    async play(track: SpotifyIdentifier, options?: { context: SpotifyIdentifier, trackUid?: string }) {
        return await this.playback("play", {
            "context": {
                "uri": options ? options.context.uri : track.uri,
                "url": "context://" + (options ? options.context.uri : track.uri),
                "metadata": {}
            },
            "options": {
                "license": "tft",
                "skip_to": options ? { "track_uid": options.trackUid, "track_uri": track.uri } : {},
                "player_options_override": {}
            },
        })
    }
    async setVolume(position: number) {
        const activeDeviceId = this.data?.devices?.find(device => device.isActive)?.deviceId
        const thisDeviceId = this.deviceId
        if (!thisDeviceId || !activeDeviceId) return
        const raw = JSON.stringify({ "volume": Math.floor(position * 65535) });
        return this.#spotify.request(host.gae + `/connect-state/v1/connect/volume/from/${thisDeviceId}/to/${activeDeviceId}`, { method: "PUT", body: raw }) as Promise<{ ack_id: string; }>
    }
    async addToQueue(track: SpotifyIdentifier) {
        const activeDeviceId = this.data?.devices?.find(device => device.isActive)?.deviceId
        const thisDeviceId = this.deviceId
        if (!thisDeviceId || !activeDeviceId) return

        const raw = JSON.stringify({
            "command": {
                "endpoint": "add_to_queue",
                "track": { "uri": track.uri, "metadata": { "is_queued": "true" }, "provider": "queue" },
                "logging_params": { "command_id": "b5030d49025b1d12b646812a44951a09" }
            }
        });
        return this.#spotify.request(host.gae + `/connect-state/v1/player/command/from/${thisDeviceId}/to/${activeDeviceId}`, { method: "POST", body: raw }) as Promise<{ ack_id: string }>
    }
}