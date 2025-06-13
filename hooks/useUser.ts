import { useState } from "react";
import axios, { AxiosError } from "axios";
import { User } from "@/lib/types";
import { useWorkSpace } from "./useWorkSpace";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const { createWorkSpace } = useWorkSpace()

  const getUser = async (id: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/user/${id}`)
      setUser(response.data)
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.error || "Erro ao buscar usuário")
      } else {
        throw new Error("Erro ao buscar usuário")
      }
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const response = await axios.post("/api/user", { name, email, password })
      setUser(response.data)
      await createWorkSpace("Pessoal")
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.error || "Erro ao criar usuário")
      } else {
        throw new Error("Erro ao criar usuário")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (id: string, name: string, email: string, password: string, oldPassword: string) => {
    setLoading(true)
    try {
      const response = await axios.put(`/api/user/${id}`, { name, email, password, oldPassword })
      setUser(response.data)
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.error || "Erro ao atualizar usuário")
      } else {
        throw new Error("Erro ao atualizar usuário")
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    setLoading(true)
    try {
      await axios.delete(`/api/user/${id}`)
      setUser(null)
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.error || "Erro ao deletar usuário")
      } else {
        throw new Error("Erro ao deletar usuário")
      }
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, getUser, createUser, updateUser, deleteUser }
}
