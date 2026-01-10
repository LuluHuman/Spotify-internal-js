import { AlbumSnippet } from "../classes/Album";
import { Artist, ArtistSnippet } from "../classes/Artist";
import { Spotify } from "../../";
import { AlbumArtistUnion, APIArtist } from "../types/APIArtist";

export function mapArtist(spotify: Spotify, apiAlbum: APIArtist) {

    const mapDate = (date?: { day: number, month: number, year: number }) => {
        const day = (date?.day ? date?.day - 2 : 0) * 8.64e+7
        const month = (date?.month ? date?.month - 1 : 0) * 2.6298e+9
        const year = (date?.year || 0) * 3.15576e+10
        console.log(date, day + month + year - 6.216847e+13, new Date(day + month + year - 6.216847e+13).toDateString());

        return day + month + year - 6.216847e+13
    }

    console.log(new Date(mapDate(apiAlbum.data.artistUnion.discography.latest?.date)));


    const mapAlbum = (album: { "releases": { "items": AlbumArtistUnion[] } }[]) => {
        return album.map(x => x.releases.items.map(alb => new AlbumSnippet(spotify, {
            saved: undefined,
            name: alb.name,
            uri: alb.uri,
            type: alb.type,
            artists: [new ArtistSnippet(spotify, { uri: apiAlbum.data.artistUnion.uri, name: apiAlbum.data.artistUnion.profile.name, images: apiAlbum.data.artistUnion.visuals.avatarImage.sources })],
            date: {
                dateObject: new Date(mapDate(alb.date)),
                precision: alb.date.precision
            }
        }))).flat()
    }

    const artist = new ArtistSnippet(spotify, { uri: apiAlbum.data.artistUnion.uri, name: apiAlbum.data.artistUnion.profile.name, images: apiAlbum.data.artistUnion.visuals.avatarImage.sources })

    return new Artist(spotify, {
        uri: apiAlbum.data.artistUnion.uri,
        name: apiAlbum.data.artistUnion.profile.name,
        images: apiAlbum.data.artistUnion.visuals.gallery.items,
        saved: apiAlbum.data.artistUnion.saved,
        imageHeader: apiAlbum.data.artistUnion.headerImage?.data.sources.map(im => ({ height: im.maxHeight, url: im.url, width: im.maxWidth })) || [],
        imageAvatar: apiAlbum.data.artistUnion.visuals.avatarImage.sources,
        externalLinks: apiAlbum.data.artistUnion.profile.externalLinks.items,
        verified: apiAlbum.data.artistUnion.profile.verified,
        stats: {
            "followers": apiAlbum.data.artistUnion.stats.followers,
            "monthlyListeners": apiAlbum.data.artistUnion.stats.monthlyListeners,
            "topCities": apiAlbum.data.artistUnion.stats.topCities.items,
            "worldRank": apiAlbum.data.artistUnion.stats.worldRank
        },
        discography: {
            albums: mapAlbum(apiAlbum.data.artistUnion.discography.albums.items),
            compilations: mapAlbum(apiAlbum.data.artistUnion.discography.compilations.items),
            latest: apiAlbum.data.artistUnion.discography.latest ? new AlbumSnippet(spotify, {
                saved: undefined,
                name: apiAlbum.data.artistUnion.discography.latest.name,
                uri: apiAlbum.data.artistUnion.discography.latest.uri,
                type: apiAlbum.data.artistUnion.discography.latest.type,
                artists: [artist],
                date: {
                    dateObject: new Date(mapDate(apiAlbum.data.artistUnion.discography.latest.date)),
                    precision: apiAlbum.data.artistUnion.discography.latest.date.precision
                }
            }) : undefined,
            popularReleasesAlbums: apiAlbum.data.artistUnion.discography.popularReleasesAlbums.items
                .map(alb => new AlbumSnippet(spotify, {
                    saved: undefined,
                    name: alb.name,
                    uri: alb.uri,
                    type: alb.type,
                    artists: [artist],
                    date: {
                        dateObject: new Date(mapDate(apiAlbum.data.artistUnion.discography.latest?.date)),
                        precision: alb.date.precision
                    }
                })),
            singles: mapAlbum(apiAlbum.data.artistUnion.discography.singles.items)
        }
    })
}