export default class SpotifyIdentifier {
    type: string // image
    id: string
    constructor(identifier: string, type?: "track" | "album" | "artist" | "playlist" | "user" | "image" | "mosaic") {
        const isUrl = identifier.startsWith("http") || identifier.includes("spotify.com") || identifier.includes("scdn.co")
        if (isUrl) {
            const urlRegex = /https:\/\/(?:[a-zA-z]|\.)+\/([a-zA-z]+)\/((?:[a-zA-Z]|\d)+)/gm;
            const res = urlRegex.exec(identifier)
            if (res == null) throw new Error("Invalid detected Url " + identifier)

            this.type = res[1]
            this.id = res[2]
            return this
        }

        const isUri = identifier.startsWith("spotify:")
        if (isUri) {
            const uriRegex = /spotify:([a-zA-Z]+):(.+)/gm;
            const res = uriRegex.exec(identifier)
            if (res == null) throw new Error("Invalid detected Uri " + identifier)

            this.type = res[1]
            this.id = res[1] == "mosaic" ? res[2].replaceAll(":", "") : res[2]
            return this
        }

        const idRegex = /^(?:[a-zA-Z]|\d){22}$/gm;
        const isId = idRegex.exec(identifier) != null
        if (isId) {
            if (!type) throw new Error(`Id ${identifier} needs a type`)

            this.id = identifier
            this.type = type
            return this
        }
        const gidRegex = /^(?:[a-zA-Z]|\d){32}$/gm
        const isGid = gidRegex.exec(identifier) != null
        if (isGid) {
            if (!type) throw new Error(`Id ${identifier} needs a type`)
            this.type = type

            const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let val = BigInt("0x" + identifier); // parse hex string into BigInt
            if (val === 0n) {
                this.id = alphabet[0];
                return this
            }
            let trackId = "";

            while (val > 0n) {
                const remainder = val % 62n;
                trackId = alphabet[Number(remainder)] + trackId;
                val = val / 62n;
            }

            this.id = trackId
            return this
        }

        throw new Error(`Id ${identifier} cannot be identified`)
    }

    get uri() { return `spotify:${this.type}:${this.id}` }
    get url() {
        if (this.type == "image") return `https://i.scdn.co/image/${this.id}`
        if (this.type == "mosaic") return `https://mosaic.scdn.co/300/${this.id}`
        return `https://open.spotify.com/${this.type}/${this.id}`
    }
    get gid() {
        const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let val = BigInt("0");
        for (let i = 0; i < this.id.length; i++) {
            const digit = alphabet.indexOf(this.id.charAt(i));
            val = val * BigInt("62") + BigInt(digit);
        }
        const gid = val.toString(16).padStart(32, "0");
        return gid
    }
}