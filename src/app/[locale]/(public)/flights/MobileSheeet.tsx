import {
    Dialog,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dialog as DialogPrimitive } from "radix-ui";
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
            <DialogPortal>
                {/* DialogContent's own overlay has no responsive class, so it stays fixed inset-0
                    even on desktop/tablet (lg+) where the panel below is display:none - blocking
                    clicks into the desktop inline search form that's supposed to be usable
                    instead. Composing Portal/Overlay/Content by hand here (rather than the
                    DialogContent wrapper) so the overlay itself can carry lg:hidden too. */}
                <DialogOverlay className="lg:hidden" />
                <DialogPrimitive.Content
                    className="fixed inset-x-0 bottom-0 top-auto left-0 z-50 flex max-h-[88dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-t-3xl rounded-b-none border-t bg-background p-0 shadow-2xl duration-300 outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom lg:hidden"
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
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}