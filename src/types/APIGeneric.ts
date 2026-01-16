export interface ImageSrc { height: number, url: string, width: number }
export interface ColorValue {
    alpha: number
    blue: number
    green: number
    red: number
}

export interface ColorPalette {
    backgroundBase: ColorValue
    backgroundTintedBase: ColorValue
    textBase: ColorValue
    textBrightAccent: ColorValue
    textSubdued: ColorValue
}
export interface Playability { "playable": boolean, "reason": string }
export interface AddLibraryItemsResponse { "data": { "addLibraryItems": { "__typename": "AddLibraryItemsResponse" } } }
export interface RemoveLibraryItemsResponse { "data": { "removeLibraryItems": { "__typename": "RemoveLibraryItemsResponse" } } }
export type datePrecision = "DAY" | "MONTH" | "YEAR"
export interface APILookupResponse {
    "data": {
        "lookup": {
            "__typename": "AlbumResponseWrapper" | "UnknownTypeWrapper",
            "data"?: {
                "__typename": "Album",
                "saved": boolean | "GenericError"
            }
        }[]
    }
}
export interface APIChange {
    "revision": string
    "syncResult": { "fromRevision": string, "toRevision": string },
    "resultingRevisions": string[],
    "multipleHeads": boolean,
    "changesRequireResync": boolean
}