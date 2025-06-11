"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, Folder as FolderIcon, FileText, MoreHorizontal, FolderOpen, Search, Sprout, Loader2, Pencil, Trash2 } from "lucide-react"
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
import { useFolder } from "@/hooks/useFolder"
import { useFiles } from "@/hooks/useFiles"
import { File, WorkSpace, Folder } from "@/lib/types"

// Schemas para validação dos formulários
const workspaceSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
})

const folderSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
})

const fileSchema = z.object({
    title: z.string().min(1, "Título é obrigatório").min(2, "Título deve ter pelo menos 2 caracteres").max(100, "Título deve ter no máximo 100 caracteres"),
})

type WorkspaceFormData = z.infer<typeof workspaceSchema>
type FolderFormData = z.infer<typeof folderSchema>
type FileFormData = z.infer<typeof fileSchema>

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
    selectedWorkspace: WorkSpace | null
    onDataUpdate: () => void
}

function FileTree({ items, filesMap, selectedFile, setSelectedFile, selectedWorkspace, onDataUpdate }: FileTreeProps) {
    const { moveFile } = useFiles()
    
    const handleFileClick = (item: FileItem) => {
        if (item.type === "file") {
            const file = filesMap.get(item.id)
            if (file) {
                setSelectedFile(file)
            }
        }
    }

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, fileId: string) => {
        e.dataTransfer.setData('text/plain', fileId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
        e.preventDefault()
        const fileId = e.dataTransfer.getData('text/plain')
        
        // Verificar se o arquivo realmente existe
        const file = filesMap.get(fileId)
        if (!file) return

        // Verificar se não está sendo movido para a mesma pasta
        if (file.folderId === targetFolderId) return

        try {
            await moveFile(fileId, targetFolderId)
            onDataUpdate()
        } catch (error) {
            console.error('Erro ao mover arquivo:', error)
        }
    }

    // Função para encontrar dados da pasta pelos items
    const getFolderFromItems = (folderId: string): Folder | null => {
        if (!selectedWorkspace) return null
        return selectedWorkspace.folders.find(f => f.id === folderId) || null
    }

    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
            className="min-h-[200px]"
        >
            <SidebarMenu>
                {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                    {item.type === "folder" ? (
                        <Collapsible defaultOpen={false}>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton 
                                    className="w-full"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, item.id)}
                                >
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
                                {selectedWorkspace && (
                                    <>
                                        <CreateFileDialog
                                            workSpaceId={selectedWorkspace.id}
                                            folderId={item.id}
                                            onFileCreated={onDataUpdate}
                                        />
                                        <DropdownMenuSeparator />
                                        {(() => {
                                            const folder = getFolderFromItems(item.id)
                                            return folder ? (
                                                <>
                                                    <EditFolderDialog
                                                        folder={folder}
                                                        onFolderUpdated={onDataUpdate}
                                                    />
                                                    <DropdownMenuSeparator />
                                                    <DeleteFolderAlert
                                                        folder={folder}
                                                        onFolderDeleted={onDataUpdate}
                                                    />
                                                </>
                                            ) : null
                                        })()}
                                    </>
                                )}
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
                                                        draggable={true}
                                                        onDragStart={(e) => handleDragStart(e, child.id)}
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
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                            >
                                <FileText className="h-4 w-4" />
                                <span>{item.name}</span>
                            </p>
                        </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </div>
    )
}

// Componente para formulário de criação de pasta
function CreateFolderDialog({ workSpaceId, onFolderCreated }: { workSpaceId: string; onFolderCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const { createFolder, loading } = useFolder()

    const form = useForm<FolderFormData>({
        resolver: zodResolver(folderSchema),
        defaultValues: {
            name: "",
        },
    })

    const onSubmit = async (data: FolderFormData) => {
        try {
            await createFolder(data.name, workSpaceId)
            setOpen(false)
            form.reset()
            onFolderCreated()
        } catch {
            // Erro já tratado no hook
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                    <FolderIcon className="h-4 w-4" />
                    <span>Nova Pasta</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Pasta</DialogTitle>
                    <DialogDescription>
                        Digite o nome da sua nova pasta.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Pasta</FormLabel>
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
                                    "Criar Pasta"
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

// Componente para formulário de criação de arquivo
function CreateFileDialog({ workSpaceId, folderId = null, onFileCreated }: { workSpaceId: string; folderId?: string | null; onFileCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const { createFile, loading } = useFiles()

    const form = useForm<FileFormData>({
        resolver: zodResolver(fileSchema),
        defaultValues: {
            title: "",
        },
    })

    const onSubmit = async (data: FileFormData) => {
        try {
            await createFile(data.title, workSpaceId, folderId)
            setOpen(false)
            form.reset()
            onFileCreated()
        } catch {
            // Erro já tratado no hook
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Novo Arquivo</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Arquivo</DialogTitle>
                    <DialogDescription>
                        Digite o título do seu novo arquivo.
                        {folderId ? " O arquivo será criado na pasta selecionada." : " O arquivo será criado na raiz do workspace."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título do Arquivo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o título..." {...field} />
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
                                    "Criar Arquivo"
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

// Componente para formulário de edição de pasta
function EditFolderDialog({ folder, onFolderUpdated }: { folder: Folder; onFolderUpdated: () => void }) {
    const [open, setOpen] = useState(false)
    const { updateFolder, loading } = useFolder()

    const form = useForm<FolderFormData>({
        resolver: zodResolver(folderSchema),
        defaultValues: {
            name: folder.name,
        },
    })

    const onSubmit = async (data: FolderFormData) => {
        try {
            await updateFolder(folder.id, data.name)
            setOpen(false)
            form.reset({ name: data.name })
            onFolderUpdated()
        } catch {
            // Erro já tratado no hook
        }
    }

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.reset({ name: folder.name })
                    setOpen(true)
                }}
            >
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Pasta</DialogTitle>
                        <DialogDescription>
                            Altere o nome da pasta.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Pasta</FormLabel>
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
                                        form.reset({ name: folder.name })
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

// Componente para confirmação de exclusão de pasta
function DeleteFolderAlert({ folder, onFolderDeleted }: { folder: Folder; onFolderDeleted: () => void }) {
    const [open, setOpen] = useState(false)
    const { deleteFolder, loading } = useFolder()

    const handleDelete = async () => {
        try {
            await deleteFolder(folder.id)
            setOpen(false)
            onFolderDeleted()
        } catch {
            // Erro já tratado no hook
        }
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
                    <AlertDialogTitle>Excluir Pasta</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir a pasta &quot;{folder.name}&quot;?
                        <br />
                        <br />
                        <strong>⚠️ Esta ação só funcionará se a pasta estiver vazia!</strong>
                        <br />
                        Mova ou exclua os arquivos da pasta antes de excluí-la.
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
                            "Excluir Pasta"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
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

export function AppSidebar({ onFileSelect, selectedFile, ...props }: React.ComponentProps<typeof Sidebar> & { onFileSelect?: (file: File | null) => void, selectedFile: File | null }) {
    const { workSpaces, loading, error, getWorkSpaces } = useWorkSpace()
    const [selectedWorkspace, setSelectedWorkspace] = useState<WorkSpace | null>(null)

    // Função para atualizar a lista de workspaces e garantir que sempre tenha um selecionado
    const handleWorkspacesUpdate = async () => {
        await getWorkSpaces()
    }

    // Função para atualizar dados após mudanças em pastas/arquivos
    const handleDataUpdate = async () => {
        await getWorkSpaces() // Isso recarrega tudo incluindo pastas e arquivos
        // Forçar re-render do componente
        if (selectedWorkspace) {
            const updatedWorkspace = workSpaces.find(ws => ws.id === selectedWorkspace.id)
            if (updatedWorkspace) {
                setSelectedWorkspace(updatedWorkspace)
            }
        }
    }

    // Função para lidar com seleção de arquivo
    const handleFileSelect = (file: File | null) => {
        if (onFileSelect) {
            onFileSelect(file)
        }
    }

    // TODO: Implementar drag and drop

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

    // Sempre usar a versão mais atual do workspace dos workSpaces
    const currentWorkspace = selectedWorkspace ? workSpaces.find(ws => ws.id === selectedWorkspace.id) || null : null
    const { items: fileStructure, filesMap } = generateFileStructure(currentWorkspace)

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
                            {currentWorkspace && (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <CreateFileDialog 
                                                workSpaceId={currentWorkspace.id} 
                                                onFileCreated={handleDataUpdate}
                                            />
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <CreateFolderDialog 
                                                workSpaceId={currentWorkspace.id} 
                                                onFolderCreated={handleDataUpdate}
                                            />
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
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
                            selectedWorkspace={currentWorkspace}
                            onDataUpdate={handleDataUpdate}
                        />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
