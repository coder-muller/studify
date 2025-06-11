import { useState } from "react"
import axios, { AxiosError } from "axios"
import { File } from "@/lib/types"

export function useFiles() {
    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const getFiles = async (workSpaceId: string) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/files?workSpaceId=${workSpaceId}`)
            setFiles(response.data)
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao buscar os arquivos')
            } else {
                setError('Ocorreu um erro ao buscar os arquivos')
            }
        } finally {
            setLoading(false)
        }
    }

    const createFile = async (title: string, workSpaceId: string, folderId?: string | null, content?: string) => {
        try {
            setLoading(true)
            const response = await axios.post("/api/files", { 
                title, 
                workSpaceId, 
                folderId: folderId || null,
                content: content || ""
            })
            return response.data
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao criar o arquivo')
                throw error
            } else {
                setError('Ocorreu um erro ao criar o arquivo')
                throw error
            }
        } finally {
            setLoading(false)
        }
    }

    const updateFile = async (id: string, data: { title?: string; content?: string; folderId?: string | null }) => {
        try {
            setLoading(true)
            const response = await axios.put(`/api/files/${id}`, data)
            return response.data
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao atualizar o arquivo')
                throw error
            } else {
                setError('Ocorreu um erro ao atualizar o arquivo')
                throw error
            }
        } finally {
            setLoading(false)
        }
    }

    const deleteFile = async (id: string) => {
        try {
            setLoading(true)
            await axios.delete(`/api/files/${id}`)
            return true
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao deletar o arquivo')
                throw error
            } else {
                setError('Ocorreu um erro ao deletar o arquivo')
                throw error
            }
        } finally {
            setLoading(false)
        }
    }

    const moveFile = async (id: string, folderId: string | null) => {
        return updateFile(id, { folderId })
    }

    const clearError = () => setError(null)

    return { 
        files, 
        loading, 
        error, 
        getFiles, 
        createFile, 
        updateFile, 
        deleteFile,
        moveFile,
        clearError
    }
} 