"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Wallet, Check, X, Loader2, Eye, History } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { normalizeApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import {
    useConfirmManualPaymentMutation,
    useConfirmedManualPaymentsQuery,
    usePendingManualPaymentsQuery,
    useRejectManualPaymentMutation,
} from "@/hooks/use-agent";
import type { AgentPendingPaymentResponse } from "@/lib/api/types";

/**
 * Manual-payment queue an agent works through: match each row's customerReference against the
 * mobile money operator's own statement, then confirm or reject - see
 * AgentPaymentController/ManualPaymentGateway for the pipeline this drives.
 */
export default function AgentPendingPaymentsPage() {
    const t = useTranslations("Agent");
    const locale = useLocale();
    const { data: payments, isLoading, isError } = usePendingManualPaymentsQuery();
    const { data: confirmedPayments, isLoading: isLoadingConfirmed } = useConfirmedManualPaymentsQuery();
    const confirmMutation = useConfirmManualPaymentMutation();
    const rejectMutation = useRejectManualPaymentMutation();
    const [rejecting, setRejecting] = useState<AgentPendingPaymentResponse | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    function handleConfirm(payment: AgentPendingPaymentResponse) {
        confirmMutation.mutate(payment.paymentId, {
            onSuccess: () => toast.success(t("confirmSuccess", { id: payment.paymentId.slice(0, 8) })),
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    }

    function openRejectDialog(payment: AgentPendingPaymentResponse) {
        setRejecting(payment);
        setRejectReason("");
    }

    function handleReject() {
        if (!rejecting) return;
        rejectMutation.mutate(
            { paymentId: rejecting.paymentId, reason: rejectReason.trim() || t("defaultRejectReason") },
            {
                onSuccess: () => {
                    toast.success(t("rejectSuccess"));
                    setRejecting(null);
                },
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="border-b border-border/60 pb-5 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">{t("eyebrow")}</span>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Wallet className="size-6 text-primary" />
                    {t("pendingTitle")}
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    {t("pendingSubtitle")}
                </p>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 w-full bg-muted rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="p-6 text-sm text-destructive font-medium">
                        {t("loadErrorPending")}
                    </div>
                ) : !payments || payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <Wallet className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{t("emptyPendingTitle")}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            {t("emptyPendingDescription")}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnClient")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnAmount")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnCountry")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                    {t("columnReference")}
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnNumber")}</TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                    {t("columnActions")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => {
                                const isConfirming =
                                    confirmMutation.isPending && confirmMutation.variables === payment.paymentId;
                                return (
                                    <TableRow key={payment.paymentId} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="text-sm">
                                            <div className="font-semibold">{payment.contactEmail}</div>
                                            <div className="text-[11px] text-muted-foreground font-mono">
                                                {payment.bookingId.slice(0, 8)}...
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-bold">
                                            {formatMoney(payment.amount, locale)}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono">{payment.countryCode}</TableCell>
                                        <TableCell className="text-sm font-mono font-semibold">
                                            {payment.customerReference ?? (
                                                <span className="text-muted-foreground italic font-normal">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono text-muted-foreground">
                                            {payment.payerReferenceLast4 ?? "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                                >
                                                    <Link href={`/agent/payments/${payment.paymentId}`}>
                                                        <Eye className="size-3.5" />
                                                        {t("viewAction")}
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isConfirming || rejectMutation.isPending}
                                                    onClick={() => openRejectDialog(payment)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                                >
                                                    <X className="size-3.5" />
                                                    {t("rejectAction")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={isConfirming || rejectMutation.isPending}
                                                    onClick={() => handleConfirm(payment)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                                                >
                                                    {isConfirming ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="size-3.5" />
                                                    )}
                                                    {t("confirmAction")}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* HISTORIQUE : PAIEMENTS CONFIRMÉS PAR MOI */}
            <div className="space-y-3 pt-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                    <History className="size-4" />
                    {t("historyTitle")}
                </h2>
                <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                    {isLoadingConfirmed ? (
                        <div className="p-6 space-y-4 animate-pulse">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-10 w-full bg-muted rounded-lg" />
                            ))}
                        </div>
                    ) : !confirmedPayments || confirmedPayments.length === 0 ? (
                        <div className="py-10 px-4 text-center text-sm text-muted-foreground">
                            {t("historyEmpty")}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnClient")}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnAmount")}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("columnCountry")}</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                        {t("columnReference")}
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                        {t("columnDetail")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {confirmedPayments.map((payment) => (
                                    <TableRow key={payment.paymentId} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="text-sm">
                                            <div className="font-semibold">{payment.contactEmail}</div>
                                            <div className="text-[11px] text-muted-foreground font-mono">
                                                {payment.bookingId.slice(0, 8)}...
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-bold">
                                            {formatMoney(payment.amount, locale)}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono">{payment.countryCode}</TableCell>
                                        <TableCell className="text-sm font-mono font-semibold">
                                            {payment.customerReference ?? (
                                                <span className="text-muted-foreground italic font-normal">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                            >
                                                <Link href={`/agent/payments/${payment.paymentId}`}>
                                                    <Eye className="size-3.5" />
                                                    {t("viewAction")}
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t("rejectDialogDescription")}
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason">{t("rejectReasonLabel")}</Label>
                            <Input
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t("rejectReasonPlaceholder")}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setRejecting(null)} className="rounded-xl">
                            {t("cancelAction")}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={rejectMutation.isPending}
                            onClick={handleReject}
                            className="rounded-xl gap-2"
                        >
                            {rejectMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                            {t("rejectAction")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
