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

    const folders = await prisma.folder.findMany({
        where: {
            workSpaceId: workSpaceId
        },
        include: {
            files: true
        }
    })

    return NextResponse.json(folders, { status: 200 })
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, workSpaceId } = await request.json()

    if (!name || !workSpaceId) {
        return NextResponse.json({ error: "Name and WorkSpace ID are required" }, { status: 400 })
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

    const folder = await prisma.folder.create({
        data: {
            name,
            workSpaceId
        },
        include: {
            files: true,
            workSpace: true
        }
    })

    return NextResponse.json(folder, { status: 201 })
} 