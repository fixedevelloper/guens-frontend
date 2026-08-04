import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function MobileDialogSheet({
                         title,
                         open,
                         onOpenChange,
                         children,
                     }: {
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="fixed inset-x-0 bottom-0 top-auto left-0 z-50 flex max-h-[88dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-t-3xl rounded-b-none border-t p-0 shadow-2xl duration-300 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom lg:hidden"
            >
                <DialogHeader className="flex h-14 shrink-0 flex-row items-center justify-between space-y-0 border-b bg-muted/30 px-5">
                    <DialogTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                        {title}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="size-4" />
                    </Button>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}