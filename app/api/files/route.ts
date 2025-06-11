import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workSpaceId = searchParams.get('workSpaceId')

    if (!workSpaceId) {
        return NextResponse.json({ error: "WorkSpace ID is required" }, { status: 400 })
    }

    // Verificar se o workspace pertence ao usuário
    const workSpace = await prisma.workSpace.findUnique({
        where: {
            id: workSpaceId,
            ownerId: userId
        }
    })

    if (!workSpace) {
        return NextResponse.json({ error: "WorkSpace not found" }, { status: 404 })
    }

    const files = await prisma.file.findMany({
        where: {
            workSpaceId: workSpaceId
        },
        include: {
            folder: true,
            workSpace: true
        }
    })

    return NextResponse.json(files, { status: 200 })
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, workSpaceId, folderId = null, content = "" } = await request.json()

    if (!title || !workSpaceId) {
        return NextResponse.json({ error: "Title and WorkSpace ID are required" }, { status: 400 })
    }

    // Verificar se o workspace pertence ao usuário
    const workSpace = await prisma.workSpace.findUnique({
        where: {
            id: workSpaceId,
            ownerId: userId
        }
    })

    if (!workSpace) {
        return NextResponse.json({ error: "WorkSpace not found" }, { status: 404 })
    }

    // Se folderId foi fornecido, verificar se a pasta existe e pertence ao workspace
    if (folderId) {
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
                workSpaceId: workSpaceId
            }
        })

        if (!folder) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 })
        }
    }

    const file = await prisma.file.create({
        data: {
            title,
            content,
            workSpaceId,
            folderId
        },
        include: {
            folder: true,
            workSpace: true
        }
    })

    return NextResponse.json(file, { status: 201 })
} 