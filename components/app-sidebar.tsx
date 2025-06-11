"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, Folder, FileText, MoreHorizontal, FolderOpen, Search, Sprout, Loader2, Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
    Sidebar,
    SidebarContent,
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
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { useWorkSpace } from "@/hooks/useWorkSpace"
import { File, WorkSpace } from "@/lib/types"

// Schema para validação do formulário de workspace
const workspaceSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
})

type WorkspaceFormData = z.infer<typeof workspaceSchema>

// Função para gerar a estrutura de arquivos baseada no workspace selecionado
const generateFileStructure = (workspace: WorkSpace | null): { items: FileItem[], filesMap: Map<string, File> } => {
    if (!workspace) return { items: [], filesMap: new Map() }

    const structure: FileItem[] = []
    const filesMap = new Map<string, File>()

    // Adicionar pastas com seus arquivos
    workspace.folders.forEach(folder => {
        const folderFiles = workspace.files
            .filter(file => file.folderId === folder.id)
            .map(file => {
                // Garantir que o arquivo tenha as relações populadas
                const enrichedFile: File = {
                    ...file,
                    workSpace: workspace,
                    folder: folder
                }
                filesMap.set(file.id, enrichedFile)
                return {
                    id: file.id,
                    name: file.title,
                    type: "file" as const
                }
            })

        structure.push({
            id: folder.id,
            name: folder.name,
            type: "folder" as const,
            children: folderFiles
        })
    })

    // Adicionar arquivos soltos (sem pasta)
    const looseFiles = workspace.files
        .filter(file => file.folderId === null)
        .map(file => {
            // Garantir que o arquivo tenha as relações populadas
            const enrichedFile: File = {
                ...file,
                workSpace: workspace,
                folder: null
            }
            filesMap.set(file.id, enrichedFile)
            return {
                id: file.id,
                name: file.title,
                type: "file" as const
            }
        })

    structure.push(...looseFiles)

    return { items: structure, filesMap }
}

interface FileItem {
    id: string
    name: string
    type: "file" | "folder"
    children?: FileItem[]
}

interface FileTreeProps {
    items: FileItem[]
    filesMap: Map<string, File>
    selectedFile: File | null
    setSelectedFile: (file: File | null) => void
}

function FileTree({ items, filesMap, selectedFile, setSelectedFile }: FileTreeProps) {
    const handleFileClick = (item: FileItem) => {
        if (item.type === "file") {
            const file = filesMap.get(item.id)
            if (file) {
                setSelectedFile(file)
            }
        }
    }

    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                    {item.type === "folder" ? (
                        <Collapsible defaultOpen={true}>
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
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Renomear
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.children && item.children.length > 0 ? (
                                        item.children.map((child) => (
                                            <SidebarMenuSubItem key={child.id}>
                                                <SidebarMenuSubButton asChild>
                                                    <p
                                                        className={`flex items-center gap-2 cursor-pointer ${selectedFile?.id === child.id ? 'bg-accent text-accent-foreground' : ''}`}
                                                        onClick={() => handleFileClick(child)}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>{child.name}</span>
                                                    </p>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))
                                    ) : (
                                        <SidebarMenuSubItem>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground italic">
                                                <div className="w-4 h-4" /> {/* Espaço para alinhar com ícones */}
                                                <span>Pasta vazia</span>
                                            </div>
                                        </SidebarMenuSubItem>
                                    )}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    ) : (
                        <SidebarMenuButton asChild>
                            <p
                                className={`flex items-center gap-2 cursor-pointer ${selectedFile?.id === item.id ? 'bg-accent text-accent-foreground' : ''}`}
                                onClick={() => handleFileClick(item)}
                            >
                                <FileText className="h-4 w-4" />
                                <span>{item.name}</span>
                            </p>
                        </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}

// Componente para formulário de criação de workspace
function CreateWorkspaceDialog({ onWorkspaceCreated }: { onWorkspaceCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const { createWorkSpace, loading } = useWorkSpace()

    const form = useForm<WorkspaceFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: "",
        },
    })

    const onSubmit = async (data: WorkspaceFormData) => {
        await createWorkSpace(data.name)
        setOpen(false)
        form.reset()
        onWorkspaceCreated()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    className="gap-2 p-2"
                    onSelect={(e) => {
                        e.preventDefault()
                        setOpen(true)
                    }}
                >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                        <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">Novo Workspace</div>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Workspace</DialogTitle>
                    <DialogDescription>
                        Digite o nome do seu novo workspace.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Workspace</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o nome..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    "Criar Workspace"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false)
                                    form.reset()
                                }}
                            >
                                Cancelar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

// Componente para formulário de edição de workspace
function EditWorkspaceDialog({ workspace, onWorkspaceUpdated }: { workspace: WorkSpace; onWorkspaceUpdated: () => void }) {
    const [open, setOpen] = useState(false)
    const { updateWorkSpace, loading } = useWorkSpace()

    const form = useForm<WorkspaceFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: workspace.name,
        },
    })

    const onSubmit = async (data: WorkspaceFormData) => {
        await updateWorkSpace(workspace.id, data.name)
        setOpen(false)
        form.reset({ name: data.name })
        onWorkspaceUpdated()
    }

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.reset({ name: workspace.name })
                    setOpen(true)
                }}
            >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Workspace</DialogTitle>
                        <DialogDescription>
                            Altere o nome do workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Workspace</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Digite o nome..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Salvar Alterações"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false)
                                        form.reset({ name: workspace.name })
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}

// Componente para confirmação de exclusão de workspace
function DeleteWorkspaceAlert({ workspace, onWorkspaceDeleted, canDelete }: { workspace: WorkSpace; onWorkspaceDeleted: () => void; canDelete: boolean }) {
    const [open, setOpen] = useState(false)
    const { deleteWorkSpace, loading } = useWorkSpace()

    const handleDelete = async () => {
        if (!canDelete) return

        await deleteWorkSpace(workspace.id)
        setOpen(false)
        onWorkspaceDeleted()
    }

    if (!canDelete) {
        return null
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setOpen(true)
                    }}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Workspace</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir o workspace &quot;{workspace.name}&quot;?
                        <br />
                        <br />
                        <strong>⚠️ Esta ação é irreversível!</strong>
                        <br />
                        Todos os arquivos, pastas e conteúdos associados a este workspace serão permanentemente removidos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            "Excluir Workspace"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function AppSidebar({ onFileSelect, ...props }: React.ComponentProps<typeof Sidebar> & { onFileSelect?: (file: File | null) => void, selectedFile: File | null }) {
    const { workSpaces, loading, error, getWorkSpaces } = useWorkSpace()
    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkSpace | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Função para atualizar a lista de workspaces e garantir que sempre tenha um selecionado
    const handleWorkspacesUpdate = async () => {
        await getWorkSpaces()
    }

    // Função para lidar com seleção de arquivo
    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file)
        if (onFileSelect) {
            onFileSelect(file)
        }
    }

    useEffect(() => {
        getWorkSpaces()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sempre selecionar o primeiro workspace quando a lista mudar
    useEffect(() => {
        if (workSpaces.length > 0 && (!selectedWorkspace || !workSpaces.find(ws => ws.id === selectedWorkspace.id))) {
            setSelectedWorkspace(workSpaces[0])
        }
    }, [workSpaces, selectedWorkspace])

    const { items: fileStructure, filesMap } = generateFileStructure(selectedWorkspace)

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
                                        <span className="text-xs text-sidebar-foreground/70 flex items-center gap-1">
                                            {selectedWorkspace ? (
                                                selectedWorkspace.name
                                            ) : (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Carregando...
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                                <CreateWorkspaceDialog onWorkspaceCreated={handleWorkspacesUpdate} />
                                <DropdownMenuSeparator />
                                {loading ? (
                                    <DropdownMenuItem>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Carregando...
                                    </DropdownMenuItem>
                                ) : error ? (
                                    <DropdownMenuItem>
                                        <span className="text-destructive">Erro ao carregar workspaces</span>
                                    </DropdownMenuItem>
                                ) : workSpaces.length > 0 ? (
                                    workSpaces.map((workspace) => (
                                        <div key={workspace.id} className="flex items-center w-full">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedWorkspace(workspace)
                                                }}
                                                className="gap-2 p-2 flex-1 flex items-center"
                                            >
                                                <div className="font-medium">{workspace.name}</div>
                                            </DropdownMenuItem>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 mr-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                        }}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="right" align="start">
                                                    <EditWorkspaceDialog
                                                        workspace={workspace}
                                                        onWorkspaceUpdated={handleWorkspacesUpdate}
                                                    />
                                                    {workSpaces.length > 1 && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DeleteWorkspaceAlert
                                                                workspace={workspace}
                                                                onWorkspaceDeleted={handleWorkspacesUpdate}
                                                                canDelete={workSpaces.length > 1}
                                                            />
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <FileTree
                            items={fileStructure}
                            filesMap={filesMap}
                            selectedFile={selectedFile}
                            setSelectedFile={handleFileSelect}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
