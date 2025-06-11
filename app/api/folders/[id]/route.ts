import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { name } = await request.json()

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Verificar se a pasta pertence ao usuário
    const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
            workSpace: true
        }
    })

    if (!folder || folder.workSpace.ownerId !== userId) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { name },
        include: {
            files: true,
            workSpace: true
        }
    })

    return NextResponse.json(updatedFolder, { status: 200 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verificar se a pasta pertence ao usuário
    const folder = await prisma.folder.findUnique({
        where: { id },
        include: {
            workSpace: true,
            files: true
        }
    })

    if (!folder || folder.workSpace.ownerId !== userId) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Verificar se a pasta tem arquivos
    if (folder.files.length > 0) {
        return NextResponse.json({ 
            error: "Cannot delete folder with files. Move or delete files first." 
        }, { status: 400 })
    }

    await prisma.folder.delete({
        where: { id }
    })

    return NextResponse.json({ message: "Folder deleted successfully" }, { status: 200 })
} 