import { Spotify } from "./Spotify";
import { SpotifyIdentifier } from "./lib/helpers";
import { expect, test } from "bun:test";

const client = new Spotify({})
client.login("")
await new Promise((res) => client.onReady(() => res("")))

test("fetch Album", async () => {
    const album = await client.albums.fetch(new SpotifyIdentifier("3RSNgE3fCjBWiycwqjHwdv", "album"))
    expect(album.name).toBe("TVアニメ「世話やきキツネの仙狐さん」OPテーマ「今宵mofumofu!!」/EDテーマ「もっふもふ DE よいのじゃよ」")
})

test("fetch Saved Albums", async () => {
    const album = await client.albums.fetchSaved()
    expect(album.filter(al => al.uri.includes("3RSNgE3fCjBWiycwqjHwdv"))[0].name).toBe("TVアニメ「世話やきキツネの仙狐さん」OPテーマ「今宵mofumofu!!」/EDテーマ「もっふもふ DE よいのじゃよ」")
})

test("check Saved Album", async () => {
    const album = await client.albums.checkSaved([new SpotifyIdentifier("3RSNgE3fCjBWiycwqjHwdv", "album")])
    expect(album[0]).toBe(true)
})

test("add Album to library", async () => {
    await client.albums.addToLibrary([new SpotifyIdentifier("7pmuSRFBvY0D0tce5dpqdY", "album")])
    const album = await client.albums.checkSaved([new SpotifyIdentifier("7pmuSRFBvY0D0tce5dpqdY", "album")])
    expect(album[0]).toBe(true)
})

test("remove Album to library", async () => {
    await client.albums.removeFromLibrary([new SpotifyIdentifier("7pmuSRFBvY0D0tce5dpqdY", "album")])
    const album = await client.albums.checkSaved([new SpotifyIdentifier("7pmuSRFBvY0D0tce5dpqdY", "album")])
    expect(album[0]).toBe(false)
})