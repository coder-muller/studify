export type User = {
    id: string
    name: string
    email: string
    password: string
    workSpaces: WorkSpace[]
}

export type WorkSpace = {
    id: string
    name: string
    ownerId: string
    owner: User
    folders: Folder[]
    files: File[]
}

export type Folder = {
    id: string
    name: string
    workSpaceId: string
    workSpace: WorkSpace
    files: File[]
}

export type File = {
    id: string
    title: string
    content: string
    workSpaceId: string
    workSpace: WorkSpace
    folderId: string | null
    folder: Folder | null
}