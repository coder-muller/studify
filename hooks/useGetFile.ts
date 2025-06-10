import { useState } from "react";
import axios, { AxiosError } from "axios";
import { File } from "@/lib/types";

export const useGetFile = () => {
    const [file, setFile] = useState<File | null>();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getFile = async (fileId: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/files/${fileId}`);
            setFile(response.data);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message as string);
            } else {
                setError("Erro ao buscar arquivo");
            }
        } finally {
            setLoading(false);
        }
    }

    return { file, error, loading, getFile };
}