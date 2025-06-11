import { useRouter } from "next/navigation";

export function useLogout() {
    const router = useRouter();

    const logout = async () => {
        const response = await fetch("/api/auth/logout");
        if (response.ok) {
            router.push("/login");
        }
    }

    return { logout };
}