import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"

export async function POST(req: NextRequest) {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
        return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (user) {
        return NextResponse.json({ error: "Usuário já existe" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })

    return NextResponse.json(newUser, { status: 201 })
}
