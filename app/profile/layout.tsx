"use client"

import { Button } from "@/components/ui/button";
import { LogOut, Settings, Sprout, User, Moon, Sun, Loader2, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useGetMe } from "@/hooks/useGetMe";
import { useEffect } from "react";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, setTheme } = useTheme()
    const { user, error, loading, getMe } = useGetMe()

    useEffect(() => {
        getMe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="absolute top-0 flex items-center justify-between w-full px-6 py-4 bg-transparent border-b border-border z-10 backdrop-blur-xl">
                <div>
                    {/* Sidebar Trigger */}
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
                    <div className="w-9 h-9 flex items-center justify-center bg-primary rounded-lg">
                        <Sprout className="w-6 h-6 text-secondary" />
                    </div>
                </div>
            </div>
            <div className="w-full h-screen overflow-y-auto px-6">
                {children}
            </div>
        </div>
    );
}