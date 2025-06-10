import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET as string))

        if (!payload) {
            return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id as string },
            select: {
                name: true,
                email: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        return NextResponse.json(user, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
    }
}