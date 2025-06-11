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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, folderId } = await request.json();

    // Verificar se o arquivo pertence ao usuário
    const file = await prisma.file.findUnique({
        where: { id },
        include: {
            workSpace: true
        }
    });

    if (!file || file.workSpace.ownerId !== userId) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Se folderId foi fornecido, verificar se a pasta existe e pertence ao workspace
    if (folderId) {
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
                workSpaceId: file.workSpaceId
            }
        });

        if (!folder) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }
    }

    const updatedFile = await prisma.file.update({
        where: { id },
        data: {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(folderId !== undefined && { folderId })
        },
        include: {
            folder: true,
            workSpace: true
        }
    });

    return NextResponse.json(updatedFile, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se o arquivo pertence ao usuário
    const file = await prisma.file.findUnique({
        where: { id },
        include: {
            workSpace: true
        }
    });

    if (!file || file.workSpace.ownerId !== userId) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await prisma.file.delete({
        where: { id }
    });

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
}