import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

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
  }).then((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
  if (!newUser) {
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
  const findUser = await prisma.user.findUnique({
    where: { email }
  })

  if (!findUser) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const secret = process.env.JWT_SECRET as string
  if (!secret) {
    return NextResponse.json({ error: "JWT_SECRET não está definido" }, { status: 500 })
  }

  const token = sign({ id: findUser.id }, secret, { expiresIn: "1h" })

  const cookieStore = await cookies()

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    sameSite: "strict",
    path: "/"
  })

  cookieStore.set("userId", findUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    sameSite: "strict",
    path: "/"
  })

  return NextResponse.json(newUser, { status: 201 })
}
