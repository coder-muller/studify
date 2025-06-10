"use client"

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider className="w-full h-screen">
            <AppSidebar />
            <div className="flex flex-col items-center justify-center w-screen h-screen antialiased">
                <Header />
                <div className="flex-1 w-full p-2 sm:px-6 sm:py-4 overflow-y-auto">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    );
}