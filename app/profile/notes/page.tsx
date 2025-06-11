"use client"

import { useState, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import { Label } from "@/components/ui/label";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { File } from "@/lib/types";
import { Sprout } from "lucide-react";

export default function NotesPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [hasChanges, setHasChanges] = useState(false);
    const sidebarUpdateRef = useRef<(() => void) | null>(null);

    // Função chamada quando o arquivo é salvo com sucesso
    const handleSaveSuccess = () => {
        setSaveStatus('saved');
        setHasChanges(false);
        // Atualizar sidebar usando o mesmo padrão das pastas/arquivos
        sidebarUpdateRef.current?.();
    };

    // Função chamada quando o status muda
    const handleStatusChange = (status: 'idle' | 'saving' | 'saved' | 'error', hasChanges: boolean) => {
        setSaveStatus(status);
        setHasChanges(hasChanges);
    };

    // Função para capturar a referência do update da sidebar
    const handleSidebarUpdate = () => {
        // Esta função será chamada pela sidebar quando houver updates
        // Não precisamos fazer nada aqui, pois a sidebar já se atualiza sozinha
    };

    // Função para registrar a função de update da sidebar
    const handleRegisterUpdate = (updateFn: () => void) => {
        sidebarUpdateRef.current = updateFn;
    };

    return (
        <SidebarProvider className="w-full h-screen">
            <AppSidebar
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onDataUpdate={handleSidebarUpdate}
                onRegisterUpdate={handleRegisterUpdate}
            />
            <div className="flex flex-col w-screen h-screen antialiased bg-sidebar p-2">
                <div className="flex flex-col items-center justify-center w-full h-full bg-background rounded-lg">
                    <Header
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        saveStatus={saveStatus}
                        hasChanges={hasChanges}
                    />
                    <div className="flex-1 w-4/5 mx-auto overflow-y-auto p-6">
                        {selectedFile ? (
                            <MarkdownEditor 
                                file={selectedFile} 
                                onSaveSuccess={handleSaveSuccess}
                                onStatusChange={handleStatusChange}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground">
                                        <Sprout className="size-5" />
                                    </div>
                                    <Label className="text-2xl font-bold">Studify</Label>
                                </div>
                                <Label className="text-sm text-muted-foreground">
                                    Selecione um arquivo para visualizar
                                </Label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}