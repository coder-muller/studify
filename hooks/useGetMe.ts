import { useState } from "react";
import axios, { AxiosError } from "axios";

export const useGetMe = () => {
    const [user, setUser] = useState<{
        id: string
        name: string
        email: string
    } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const getMe = async () => {
        setLoading(true)

        try {
            const response = await axios.get("/api/me")
            setUser(response.data)
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.error)
            } else {
                setError("Erro ao buscar usuário")
            }
        } finally {
            setLoading(false)
        }
    }

    return { user, error, loading, getMe }
}