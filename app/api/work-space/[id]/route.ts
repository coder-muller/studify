import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const cookieStore = await cookies()

    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workSpace = await prisma.workSpace.findUnique({
        where: { id, ownerId: userId }
    })

    if (!workSpace) {
        return NextResponse.json({ error: "Work space not found" }, { status: 404 })
    }

    const { name } = await request.json()

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const updatedWorkSpace = await prisma.workSpace.update({
        where: { id, ownerId: userId },
        data: { name }
    })

    return NextResponse.json(updatedWorkSpace, { status: 200 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const cookieStore = await cookies()

    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workSpace = await prisma.workSpace.findUnique({
        where: { id, ownerId: userId }
    })

    if (!workSpace) {
        return NextResponse.json({ error: "Work space not found" }, { status: 404 })
    }

    await prisma.workSpace.delete({
        where: { id, ownerId: userId }
    })

    return NextResponse.json({ message: "Work space deleted" }, { status: 200 })
}