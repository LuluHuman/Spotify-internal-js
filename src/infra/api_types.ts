export interface ImageObject { height: number, url: string, width: number }
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

export interface APILibraryPage<T> {
    "data": {
        "me": {
            "libraryV3": {
                "__typename": "LibraryPage"
                "availableFilters": []
                "availableSortOrders": { "id": string, "name": string }[]
                "breadcrumbs": [],
                "items": T[]
                "pagingInfo": { "limit": number, "offset": number },
                "selectedFilters": [{ "id": "Albums", "name": "Albums" }],
                "selectedSortOrder": { "id": "Alphabetical", "name": "Alphabetical" },
                "totalCount": number
            }
        }
    }
}