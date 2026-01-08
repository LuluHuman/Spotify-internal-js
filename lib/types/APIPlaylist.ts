import { APIChange, ColorPalette, ColorValue, ImageSrc } from "./APIGeneric"


export type PlaylistPermission = "CONTRIBUTOR" | "VIEWER" | "BLOCKED"
export interface APIPlaylistError {
    "data": {
        "playlistV2": {
            "__typename": "GenericError",
            "message": string
        }
    }
}

export interface APIPlaylist {
    "data": {
        "playlistV2": {
            "__typename": "Playlist",
            "following": boolean,
            "followers": number,
            "uri": string,
            "name": string,
            "description": string,
            "ownerV2": APIPlaylistUser,
            "members": {
                "items": {
                    "isOwner": boolean,
                    "permissionLevel": "CONTRIBUTOR" | "VIEWER",
                    "user": APIPlaylistUser
                }[],
                "totalCount": number
            },
            "images": { "items": [{ "sources": ImageSrc[] }] },
            "content": {
                "__typename": "PlaylistItemsPage",
                "items": APIPlaylistItem[],
                "pagingInfo": {
                    "limit": number,
                    "offset": number
                },
                "totalCount": number
            },


            "basePermission": PlaylistPermission,
            "revisionId": string,
            "attributes": any[],
            "currentUserCapabilities": {
                "canAdministratePermissions": boolean,
                "canCancelMembership": boolean,
                "canEditItems": boolean,
                "canView": boolean
            },
            "format": string,
            "sharingInfo": { "shareId": string, "shareUrl": string },
            "visualIdentity": {
                "squareCoverImage": {
                    "__typename": "VisualIdentityImage",
                    "extractedColorSet": {
                        "encoreBaseSetTextColor": ColorValue,
                        "highContrast": ColorPalette,
                        "higherContrast": ColorPalette,
                        "minContrast": ColorPalette
                    }
                }
            }
        }
    }
}

interface APIPlaylistItem {
    "addedAt": { "isoString": string },
    "addedBy": APIPlaylistUser,
    "attributes": any[],
    "itemV2": APIPlaylistTrackResponseWrapper,
    "itemV3": APIPlaylistEntityResponseWrapper,
    "uid": string
}

interface APIPlaylistUser {
    "data": {
        "__typename": "User",
        "avatar": { "sources": ImageSrc[] },
        "name": string
        "uri": string
        "username": string
    }
}

interface APIPlaylistTrackResponseWrapper {
    "__typename": "TrackResponseWrapper",
    "data": {
        "__typename": "Track",
        "albumOfTrack": {
            "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
            "coverArt": { "sources": ImageSrc },
            "name": string,
            "uri": string
        },
        "artists": { "items": { "profile": { "name": string }, "uri": string }[] },
        "associationsV3": any, //TODO
        "contentRating": { "label": string },
        "discNumber": number,
        "trackDuration": { "totalMilliseconds": number },
        "mediaType": string//"AUDIO",
        "name": string,
        "playability": { playable: boolean, reason: "PLAYABLE" | "MARKET" | "PRODUCT" | "T" }
        "playcount": string,
        "trackNumber": number,
        "uri": string
    }
}

interface APIPlaylistEntityResponseWrapper {
    "__typename": "EntityResponseWrapper",
    "data": {
        "__typename": "Entity",
        "consumptionExperienceTrait": {
            "__typename": "ConsumptionExperienceTrait",
            "contentRatings": any[],
            "duration": { "nanoSeconds": number, "seconds": number }
        },
        "identityTrait": {
            "__typename": "IdentityTrait",
            "contentHierarchyParent": {
                "__typename": "Entity",
                "identityTrait": { "__typename": "IdentityTrait", "name": string },
                "uri": string
            },
            "contributors": {
                "items": { "name": string, "uri": string }[],
                "totalCount": number
            },
            "description": string,
            "name": string,
            "type": "Song"
        },
        "uri": string,
        "visualIdentityTrait": {
            "__typename": "VisualIdentityTrait",
            "squareCoverImage": {
                "image": {
                    "data": {
                        "__typename": "ImageV2",
                        "sources": [
                            {
                                "imageFormat": "WEBP",
                                "maxHeight": 640,
                                "maxWidth": 640,
                                "url": string
                            },
                            {
                                "imageFormat": "WEBP",
                                "maxHeight": 64,
                                "maxWidth": 64,
                                "url": string
                            },
                            {
                                "imageFormat": "WEBP",
                                "maxHeight": 300,
                                "maxWidth": 300,
                                "url": string
                            }
                        ]
                    }
                }
            }
        }
    }
}

export interface APIPlaylistContent {
    "data": {
        "playlistV2": {
            "__typename": "Playlist",
            "content": {
                "__typename": "PlaylistItemsPage",
                "items": APIPlaylistItem[]
                "pagingInfo": { "limit": number, "offset": number },
                "totalCount": number
            }
        }
    }
}

export interface APIPlaylistChange extends APIChange {
    "capabilities": {
        "canView": boolean,
        "canAdministratePermissions": boolean,
        "grantableLevel": PlaylistPermission[],
        "canEditMetadata": boolean,
        "canEditItems": boolean,
        "canCancelMembership": boolean,
        "grantableLevels": {
            "base": PlaylistPermission[],
            "member": PlaylistPermission[],
        },
        "listAttributeCapabilities": {
            "name": { "canEdit": boolean },
            "description": { "canEdit": boolean },
            "picture": { "canEdit": boolean },
            "collaborative": { "canEdit": boolean },
            "deletedByOwner": { "canEdit": boolean },
            "aiCurationReferenceId": { "canEdit": boolean }
        }
    },
}
export interface APIPlaylistPermissionChange {
    "resultingPermission": {
        "revision": string,
        "permissionLevel": PlaylistPermission
    }
}
export interface APIPlaylistAddItems {
    "addItemsToPlaylist": { "__typename": "AddItemsToPlaylistPayload" }
}
export interface APIPlaylistRemoveItems {
    "removeItemsToPlaylist": { "__typename": "RemoveItemsToPlaylistPayload" }
}


export interface EditablePlaylist {
    "data": {
        "me": {
            "editablePlaylists": {
                "__typename": "EditablePlaylistPage",
                "items":
                {
                    "curates": boolean,
                    "item": {
                        "__typename": "PlaylistResponseWrapper" | "LibraryPseudoPlaylistResponseWrapper",
                        "_uri": string,
                        "data": {
                            "__typename": "Playlist" | "PseudoPlaylist" | "Folder",
                            "images": {
                                "items": [
                                    {
                                        "extractedColors": {
                                            "colorDark": {
                                                "hex": string,
                                                "isFallback": boolean
                                            }
                                        },
                                        "sources": [
                                            {
                                                "height": number,
                                                "url": string,
                                                "width": number
                                            }
                                        ]
                                    }
                                ]
                            },
                            "image": {
                                "extractedColors": {
                                    "colorDark": {
                                        "hex": string,
                                        "isFallback": boolean
                                    }
                                },
                                "sources": [
                                    {
                                        "height": number,
                                        "url": string,
                                        "width": number
                                    }
                                ]
                            },
                            "name": string,
                            "uri": string
                        }
                    },
                    "pinned": boolean
                }[],
                "pagingInfo": {
                    "limit": number,
                    "offset": number
                },
                "totalCount": number
            }
        }
    },
    "extensions": object
}

export interface APIPlaylistDeltaAdd {
    "kind": "ADD"
    "add": {
        "addFirst": boolean,
        "items": { "attributes": { "timestamp": number }, "uri": string }[]
    },
}

export interface APIPlaylistDeltaRemove {
    "kind": "REM"
    "rem": {
        "itemsAsKey": boolean
        "items": { "uri": string }[],
    }
}