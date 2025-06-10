import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
    }

    if (!id) {
        return NextResponse.json({ error: "ID do arquivo não fornecido" }, { status: 400 });
    }

    const file = await prisma.file.findUnique({
        where: { id: id, workSpace: { ownerId: userId.value } },
        include: {
            workSpace: true,
            folder: true,
        }
    });

    if (!file) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(file);
}