"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, Folder, FileText, MoreHorizontal, FolderOpen, Settings, Search, Sprout, Loader2 } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { useWorkSpace } from "@/hooks/useWorkSpace"
import { WorkSpace } from "@/lib/types"

const fileStructure = [
    {
        id: "1",
        name: "Anotações Gerais",
        type: "folder",
        children: [
            { id: "1-1", name: "Resumo Capítulo 1.md", type: "file" },
            { id: "1-2", name: "Exercícios Resolvidos.pdf", type: "file" },
            { id: "1-3", name: "Dúvidas.txt", type: "file" },
        ],
    },
    {
        id: "2",
        name: "Projetos",
        type: "folder",
        children: [
            {
                id: "2-1",
                name: "Projeto A",
                type: "folder",
                children: [
                    { id: "2-1-1", name: "README.md", type: "file" },
                    { id: "2-1-2", name: "main.py", type: "file" },
                ],
            },
            { id: "2-2", name: "Projeto B.zip", type: "file" },
        ],
    },
    {
        id: "3",
        name: "Bibliografia.pdf",
        type: "file",
    },
    {
        id: "4",
        name: "Cronograma.xlsx",
        type: "file",
    },
]

interface FileItem {
    id: string
    name: string
    type: "file" | "folder"
    children?: FileItem[]
}

interface FileTreeProps {
    items: FileItem[]
    level?: number
}

function FileTree({ items, level = 0 }: FileTreeProps) {
    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                    {item.type === "folder" ? (
                        <Collapsible defaultOpen={level === 0}>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton className="w-full">
                                    <FolderOpen className="h-4 w-4" />
                                    <span>{item.name}</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" align="start">
                                    <DropdownMenuItem>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Novo Arquivo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Folder className="h-4 w-4 mr-2" />
                                        Nova Pasta
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Excluir Pasta</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {item.children && (
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.children.map((child) => (
                                            <SidebarMenuSubItem key={child.id}>
                                                {child.type === "folder" ? (
                                                    <div className="w-full">
                                                        <FileTree items={[child]} level={level + 1} />
                                                    </div>
                                                ) : (
                                                    <SidebarMenuSubButton asChild>
                                                        <a href="#" className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4" />
                                                            <span>{child.name}</span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                )}
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            )}
                        </Collapsible>
                    ) : (
                        <>
                            <SidebarMenuButton asChild>
                                <a href="#" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" align="start">
                                    <DropdownMenuItem>Abrir</DropdownMenuItem>
                                    <DropdownMenuItem>Renomear</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { workSpaces, loading, error, getWorkSpaces, createWorkSpace, updateWorkSpace, deleteWorkSpace } = useWorkSpace()

    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkSpace>(workSpaces[0])

    useEffect(() => {
        getWorkSpaces()
        if (workSpaces.length > 0) {
            setSelectedWorkspace(workSpaces[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-secondary">
                                        <Sprout className="size-5" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-semibold">Studify</span>
                                        <span className="text-xs text-sidebar-foreground/70">{selectedWorkspace?.name || "Selecione um workspace"}</span>
                                    </div>
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                                <DropdownMenuItem className="gap-2 p-2">
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium text-muted-foreground">Novo Workspace</div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {loading ? (
                                    <DropdownMenuItem>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </DropdownMenuItem>
                                ) : workSpaces.length > 0 || error ? (
                                    workSpaces.map((workspace) => (
                                        <DropdownMenuItem
                                            key={workspace.id}
                                            onClick={() => setSelectedWorkspace(workspace)}
                                            className="gap-2 p-2"
                                        >
                                            <div className="flex size-6 items-center justify-center rounded-sm border">
                                                <Sprout className="size-4" />
                                            </div>
                                            <div className="font-medium">{workspace.name}</div>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem>
                                        <span>Nenhum workspace encontrado</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Buscar</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <SidebarInput placeholder="Buscar arquivos..." className="pl-8" />
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Plus className="h-4 w-4" />
                                        <span>Novo Arquivo</span>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Folder className="h-4 w-4" />
                                        <span>Nova Pasta</span>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel>Arquivos e Pastas</SidebarGroupLabel>
                    <SidebarGroupAction title="Adicionar Projeto">
                        <Plus />
                        <span className="sr-only">Adicionar Projeto</span>
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <FileTree items={fileStructure as FileItem[]} />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Settings className="h-4 w-4" />
                                    <span>Configurações</span>
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>
                                    <span>Preferências</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Sobre o Studify</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <span>Sair</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
