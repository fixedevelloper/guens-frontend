"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Landmark, Loader2, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { MerchantCodeResponse } from "@/lib/api/types";
import {
    useCreateMerchantCodeMutation,
    useDeleteMerchantCodeMutation,
    useMerchantCodesQuery,
    useUpdateMerchantCodeMutation,
} from "@/hooks/use-admin";

interface FormState {
    countryCode: string;
    operatorName: string;
    code: string;
    instructions: string;
}

const EMPTY_FORM: FormState = { countryCode: "", operatorName: "", code: "", instructions: "" };

/**
 * Merchant codes shown to customers on the manual-payment page (see
 * ManualPaymentGateway/PaymentForm) - independent of payment-provider routing: a country's codes
 * can be prepared here before (or after) an admin actually flips its routes to MANUAL on the
 * "Fournisseurs de paiement" page.
 */
export default function AdminMerchantCodesPage() {
    const t = useTranslations("Dashboard");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const { data: merchantCodes, isLoading, isError } = useMerchantCodesQuery();
    const createMutation = useCreateMerchantCodeMutation();
    const updateMutation = useUpdateMerchantCodeMutation();
    const deleteMutation = useDeleteMerchantCodeMutation();

    function openCreateDialog() {
        setForm(EMPTY_FORM);
        setIsDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        createMutation.mutate(
            {
                countryCode: form.countryCode.trim().toUpperCase(),
                operatorName: form.operatorName.trim(),
                code: form.code.trim(),
                instructions: form.instructions.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast.success(t("merchantCodesAddedToast"));
                    setIsDialogOpen(false);
                },
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    function toggleActive(merchantCode: MerchantCodeResponse) {
        updateMutation.mutate(
            { id: merchantCode.id, payload: { active: !merchantCode.active } },
            {
                onSuccess: () => toast.success(merchantCode.active ? t("merchantCodesDeactivatedToast") : t("merchantCodesReactivatedToast")),
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    function handleDelete(merchantCode: MerchantCodeResponse) {
        deleteMutation.mutate(merchantCode.id, {
            onSuccess: () => toast.success(t("merchantCodesDeletedToast")),
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">{t("systemAdminEyebrow")}</span>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Landmark className="size-6 text-primary" />
                        {t("merchantCodesTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        {t("merchantCodesSubtitle")}
                    </p>
                </div>

                <Button onClick={openCreateDialog} className="rounded-xl font-bold text-xs gap-2 h-9 shrink-0">
                    <Plus className="size-4" />
                    {t("merchantCodesAddAction")}
                </Button>
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
                        {t("merchantCodesLoadError")}
                    </div>
                ) : !merchantCodes || merchantCodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <Landmark className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{t("merchantCodesEmptyTitle")}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            {t("merchantCodesEmptyDescription")}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("merchantCodesColumnCountry")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("merchantCodesColumnOperator")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("merchantCodesColumnCode")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("merchantCodesColumnStatus")}</TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                    {t("merchantCodesColumnActions")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {merchantCodes.map((merchantCode) => {
                                const isToggling =
                                    updateMutation.isPending && updateMutation.variables?.id === merchantCode.id;
                                const isDeleting = deleteMutation.isPending && deleteMutation.variables === merchantCode.id;
                                return (
                                    <TableRow key={merchantCode.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="text-sm font-semibold">{merchantCode.countryCode}</TableCell>
                                        <TableCell className="text-sm">{merchantCode.operatorName}</TableCell>
                                        <TableCell className="text-sm font-mono font-semibold">{merchantCode.code}</TableCell>
                                        <TableCell>
                                            <Badge variant={merchantCode.active ? "success" : "outline"} className="rounded-full">
                                                {merchantCode.active ? t("merchantCodesStatusActive") : t("merchantCodesStatusInactive")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isToggling}
                                                    onClick={() => toggleActive(merchantCode)}
                                                    className={
                                                        merchantCode.active
                                                            ? "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                                            : "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                    }
                                                >
                                                    {isToggling ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Power className="size-3.5" />
                                                    )}
                                                    {merchantCode.active ? t("merchantCodesDeactivateAction") : t("merchantCodesReactivateAction")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isDeleting}
                                                    onClick={() => handleDelete(merchantCode)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-3.5" />
                                                    )}
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("merchantCodesDialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="countryCode">{t("merchantCodesCountryLabel")}</Label>
                            <Input
                                id="countryCode"
                                maxLength={2}
                                required
                                value={form.countryCode}
                                onChange={(e) => setForm((prev) => ({ ...prev, countryCode: e.target.value }))}
                                placeholder="ex: CM"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operatorName">{t("merchantCodesOperatorLabel")}</Label>
                            <Input
                                id="operatorName"
                                required
                                value={form.operatorName}
                                onChange={(e) => setForm((prev) => ({ ...prev, operatorName: e.target.value }))}
                                placeholder="ex: MTN Mobile Money"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">{t("merchantCodesCodeLabel")}</Label>
                            <Input
                                id="code"
                                required
                                value={form.code}
                                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                                placeholder="ex: *126*1*123456#"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instructions">{t("merchantCodesInstructionsLabel")}</Label>
                            <Textarea
                                id="instructions"
                                value={form.instructions}
                                onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
                                placeholder="ex: Composez ce code, validez avec votre code PIN MoMo"
                                rows={3}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                {t("merchantCodesCancelAction")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || !form.countryCode || !form.operatorName || !form.code}
                                className="rounded-xl gap-2"
                            >
                                {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                                {t("merchantCodesAddSubmitAction")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
