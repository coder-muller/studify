"use client"

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import { Label } from "@/components/ui/label";
import { SidebarProvider } from "@/components/ui/sidebar";
import { File } from "@/lib/types";
import { Sprout } from "lucide-react";

export default function NotesPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    return (
        <SidebarProvider className="w-full h-screen">
            <AppSidebar onFileSelect={setSelectedFile} selectedFile={selectedFile} />
            <div className="flex flex-col items-center justify-center w-screen h-screen antialiased p-2 bg-sidebar">
                <div className="flex flex-col items-center justify-center w-full h-full bg-background rounded-lg">
                    <Header selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
                    <div className="flex-1 w-full p-2 sm:px-6 sm:py-4 overflow-y-auto">
                        {selectedFile ? (
                            <div className="w-full h-full p-4">
                                <h1 className="text-2xl font-bold mb-4">{selectedFile.title}</h1>
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {selectedFile.content}
                                    </div>
                                </div>
                            </div>
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