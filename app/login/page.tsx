"use client"

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
})

export default function LoginPage() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const router = useRouter()

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
    toast.success("Login realizado com sucesso")
    router.push("/profile")
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant={"outline"}>
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-xs md:max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Bem-vindo de volta ao Studify</CardTitle>
          <CardDescription>
            Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-4">
                Entrar
              </Button>
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta? <Link href="/signup" className="text-primary hover:underline">Criar conta</Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
