"use client";

import { useParams } from "next/navigation";
import { useGetFile } from "@/hooks/useGetFile";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export default function FilePage() {
    const { fileId } = useParams();
    const { file, error, loading, getFile } = useGetFile();

    useEffect(() => {
        getFile(fileId as string);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-start justify-start h-full">
            {loading ? (
                <Label className="w-full flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando arquivo...
                </Label>
            ) : error ? (
                <Label className="w-full flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error || "Erro ao carregar arquivo"}
                </Label>
            ) : (
                <Label>{file?.content}</Label>
            )}
        </div>
    );
}