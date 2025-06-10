import { useState } from "react"
import axios, { AxiosError } from "axios"
import { WorkSpace } from "@/lib/types"

export function useWorkSpace() {
    const [workSpaces, setWorkSpaces] = useState<WorkSpace[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const getWorkSpaces = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/work-space")
            console.log(response.data)
            setWorkSpaces(response.data)
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao buscar os workspaces')
            } else {
                setError('Ocorreu um erro ao buscar os workspaces')
            }
        } finally {
            setLoading(false)
        }
    }

    const createWorkSpace = async (name: string) => {
        try {
            setLoading(true)
            await axios.post("/api/work-space", { name })
            getWorkSpaces()
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao criar o workspace')
            } else {
                setError('Ocorreu um erro ao criar o workspace')
            }
        } finally {
            setLoading(false)
        }
    }

    const updateWorkSpace = async (id: string, name: string) => {
        try {
            setLoading(true)
            await axios.put(`/api/work-space/${id}`, { name })
            getWorkSpaces()
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao atualizar o workspace')
            } else {
                setError('Ocorreu um erro ao atualizar o workspace')
            }
        } finally {
            setLoading(false)
        }
    }

    const deleteWorkSpace = async (id: string) => {
        try {
            setLoading(true)
            await axios.delete(`/api/work-space/${id}`)
            getWorkSpaces()
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error || 'Ocorreu um erro ao deletar o workspace')
            } else {
                setError('Ocorreu um erro ao deletar o workspace')
            }
        } finally {
            setLoading(false)
        }
    }

    return { workSpaces, loading, error, getWorkSpaces, createWorkSpace, updateWorkSpace, deleteWorkSpace }
}