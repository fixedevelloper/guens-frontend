"use client";

import { useTranslations } from "next-intl";
import { User } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";

type PartnerStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_STYLES: Record<PartnerStatus, string> = {
    PENDING_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

interface PartnerHeaderProps {
    companyName: string;
    status: PartnerStatus;
}

export function PartnerHeader({ companyName, status }: PartnerHeaderProps) {
    const t = useTranslations("Partner.header");
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/70 px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <h1 className="text-base font-semibold">{companyName}</h1>
                <Badge variant="outline" className={STATUS_STYLES[status]}>
                    {t(`status.${status}`)}
                </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4" />
                {user?.fullName}
            </div>
        </header>
    );
}