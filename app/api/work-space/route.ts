import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET() {
    const cookieStore = await cookies()

    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const workSpaces = await prisma.workSpace.findMany({
        where: {
            ownerId: userId
        },
        include: {
            files: true,
            folders: true
        }
    })

    return NextResponse.json(workSpaces, { status: 200 })
}


export async function POST(request: NextRequest) {
    const cookieStore = await cookies()

    const userId = cookieStore.get("userId")?.value

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    const workSpace = await prisma.workSpace.create({
        data: {
            name,
            ownerId: userId
        }
    })

    return NextResponse.json(workSpace, { status: 201 })

}