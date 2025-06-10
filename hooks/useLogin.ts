import { useState } from "react"
import axios, { AxiosError } from "axios"

export const useLogin = () => {
    const [loading, setLoading] = useState(false)

    const login = async (email: string, password: string) => {
        setLoading(true)
        try {
            const response = await axios.post("/api/auth", { email, password })
            return response.data
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                throw new Error(error.response?.data.error || "Erro ao fazer login")
            } else {
                throw new Error("Erro ao fazer login")
            }
        } finally {
            setLoading(false)
        }
    }

    return { login, loading }
}