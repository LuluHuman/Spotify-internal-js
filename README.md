# Spotify Internal API js

A Typescript library that has full coverage of the internal Spotitfy API within the developer documentation

## Get started

```ts
import { Spotify } from "./Spotify";
const client = new Spotify({})
client.login("sp_dc token")
client.onReady(() => {
    // some stuff here
})
```
