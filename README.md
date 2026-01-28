# Spotify Internal API js

A Typescript library with nearly full coverage of the internal Spotitfy API within the developer documentation

## Installation

Clone the repo into your app

```bash
    git clone https://github.com/LuluHuman/Spotify-internal-js.git
```

## Example usage

```ts
import { Spotify, SpotifyIdentifier } from "./Spotify-internal-js";
const client = new Spotify({});
client.login("your sp_dc token");
client.onReady(async () => {
	// create a song Identifier from url
	const songIdentifier = new SpotifyIdentifier(
		"https://open.spotify.com/track/0laMYIfB9WohTEOTjG6RDz",
	);

	//fetch the song
	const song = await client.tracks.fetch(songIdentifier);

	//print the title
	console.log(song.name); //もっふもふ DE よいのじゃよ
});
```
