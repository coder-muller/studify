import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
        return NextResponse.json({ error: "Senha inválida" }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET as string

    if (!secret) {
        return NextResponse.json({ error: "JWT_SECRET não está definido" }, { status: 500 })
    }

    const token = sign({ id: user.id }, secret, { expiresIn: "1h" })

    const cookieStore = await cookies()

    cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600,
        sameSite: "strict",
        path: "/"
    })

    return NextResponse.json({ message: "Login realizado com sucesso" }, { status: 200 })
}