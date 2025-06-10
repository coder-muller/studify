export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Profile Page</h1>
            <div className="flex flex-col items-center justify-center h-screen">
                {children}
            </div>
        </div>
    );
}