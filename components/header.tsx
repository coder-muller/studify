"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, Loader2, AlertCircle, LogOut, Settings, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useGetMe } from "@/hooks/useGetMe"
import { useEffect } from "react"
import { File } from "@/lib/types"

export default function Header({ selectedFile, setSelectedFile }: { selectedFile: File | null, setSelectedFile: (file: File | null) => void }) {
    const { theme, setTheme } = useTheme()
    const { user, error, loading, getMe } = useGetMe()

    useEffect(() => {
        getMe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex items-center justify-between w-full p-4 border-b border-border">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Breadcrumb>
                    <BreadcrumbList>
                        {selectedFile ? (
                            <>
                                <p className="cursor-pointer" onClick={() => setSelectedFile(null)}>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{selectedFile.workSpace?.name || "Workspace"}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </p>
                                <BreadcrumbSeparator className="hidden md:block" />
                                {selectedFile.folder ? (
                                    <>
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{selectedFile.folder.name}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{selectedFile.title}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                ) : (
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{selectedFile.title}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                )}
                            </>
                        ) : (
                            <BreadcrumbItem>
                                <BreadcrumbLink>Selecione um arquivo</BreadcrumbLink>
                            </BreadcrumbItem>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"}>
                            <User className="w-4 h-4" />
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : error ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                    {error}
                                </>
                            ) : (
                                user?.name
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="w-4 h-4" />
                            Configurações
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <LogOut className="w-4 h-4 text-destructive" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div >
    )

}