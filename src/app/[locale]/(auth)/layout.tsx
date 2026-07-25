export default function AuthLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <>

            <main className="flex-1 flex flex-col w-full animate-fade-in h-full">
                {children}
            </main>

        </>
    );
}