import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { hash } from "bcrypt"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            workSpaces: {
                select: {
                    id: true,
                    name: true,
                    folders: true,
                    files: true
                }
            }
        }
    })

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { name, email, password, oldPassword } = await req.json()

    if (!name || !email || !password || !oldPassword) {
        return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { id }
    })

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isPasswordValid = await compare(oldPassword, user.password)

    if (!isPasswordValid) {
        return NextResponse.json({ error: "Senha inválida" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { name, email, password: hashedPassword }
    })

    return NextResponse.json(updatedUser, { status: 200 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id }
    })

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    await prisma.user.delete({
        where: { id }
    })

    return NextResponse.json({ message: "Usuário deletado com sucesso" }, { status: 200 })
}