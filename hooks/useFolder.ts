import { useState } from "react"
import axios, { AxiosError } from "axios"
import { Folder } from "@/lib/types"

export function useFolder() {
    const [folders, setFolders] = useState<Folder[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const getFolders = async (workSpaceId: string) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/folders?workSpaceId=${workSpaceId}`)
            setFolders(response.data)
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao buscar as pastas')
            } else {
                setError('Ocorreu um erro ao buscar as pastas')
            }
        } finally {
            setLoading(false)
        }
    }

    const createFolder = async (name: string, workSpaceId: string) => {
        try {
            setLoading(true)
            const response = await axios.post("/api/folders", { name, workSpaceId })
            return response.data
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao criar a pasta')
                throw error
            } else {
                setError('Ocorreu um erro ao criar a pasta')
                throw error
            }
        } finally {
            setLoading(false)
        }
    }

    const updateFolder = async (id: string, name: string) => {
        try {
            setLoading(true)
            const response = await axios.put(`/api/folders/${id}`, { name })
            return response.data
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao atualizar a pasta')
                throw error
            } else {
                setError('Ocorreu um erro ao atualizar a pasta')
                throw error
            }
        } finally {
            setLoading(false)
        }
    }

    const deleteFolder = async (id: string) => {
        try {
            setLoading(true)
            await axios.delete(`/api/folders/${id}`)
            return true
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao deletar a pasta')
                throw error
            } else {
                setError('Ocorreu um erro ao deletar a pasta')
                throw error
            }
        } finally {
            setLoading(false)
        }
    }

    const clearError = () => setError(null)

    return { 
        folders, 
        loading, 
        error, 
        getFolders, 
        createFolder, 
        updateFolder, 
        deleteFolder,
        clearError
    }
} 