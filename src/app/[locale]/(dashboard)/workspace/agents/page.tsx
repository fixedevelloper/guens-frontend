"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2, Plus, Power, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import type { AdminUserResponse } from "@/lib/api/types";
import {
    useAdminAgentsQuery,
    useCreateAgentMutation,
    useDeleteAgentMutation,
    useUpdateAgentMutation,
} from "@/hooks/use-admin";

interface CreateFormState {
    email: string;
    fullName: string;
    phone: string;
}

interface EditFormState {
    fullName: string;
    phone: string;
    email: string;
}

const EMPTY_CREATE_FORM: CreateFormState = { email: "", fullName: "", phone: "" };

/**
 * Admin CRUD for AGENT accounts (see AdminAgentController/AgentPaymentController) - the accounts
 * that validate manual payments from their own dashboard. Creating one here emails the account a
 * temporary password (see EmailAgentWelcomeNotifier); deactivating one locks it out immediately,
 * not just for future logins (see AppUserPrincipal#isEnabled).
 */
export default function AdminAgentsPage() {
    const t = useTranslations("Dashboard");
    const [page, setPage] = useState(0);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
    const [editingAgent, setEditingAgent] = useState<AdminUserResponse | null>(null);
    const [editForm, setEditForm] = useState<EditFormState>({ fullName: "", phone: "", email: "" });

    const agentsQuery = useAdminAgentsQuery(page);
    const createMutation = useCreateAgentMutation();
    const updateMutation = useUpdateAgentMutation();
    const deleteMutation = useDeleteAgentMutation();

    const agents = agentsQuery.data?.content ?? [];
    const totalElements = agentsQuery.data?.totalElements ?? 0;
    const totalPages = agentsQuery.data?.totalPages ?? 0;

    function openCreateDialog() {
        setCreateForm(EMPTY_CREATE_FORM);
        setIsCreateDialogOpen(true);
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        createMutation.mutate(
            {
                email: createForm.email.trim(),
                fullName: createForm.fullName.trim(),
                phone: createForm.phone.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast.success(t("agentsCreatedToast"));
                    setIsCreateDialogOpen(false);
                },
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    function openEditDialog(agent: AdminUserResponse) {
        setEditingAgent(agent);
        setEditForm({ fullName: agent.fullName, phone: agent.phone ?? "", email: agent.email });
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingAgent) return;
        updateMutation.mutate(
            {
                id: editingAgent.id,
                payload: {
                    fullName: editForm.fullName.trim(),
                    phone: editForm.phone.trim(),
                    email: editForm.email.trim(),
                },
            },
            {
                onSuccess: () => {
                    toast.success(t("agentsUpdatedToast"));
                    setEditingAgent(null);
                },
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    function toggleActive(agent: AdminUserResponse) {
        updateMutation.mutate(
            { id: agent.id, payload: { active: !agent.active } },
            {
                onSuccess: () => toast.success(agent.active ? t("agentsDeactivatedToast") : t("agentsReactivatedToast")),
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    function handleDelete(agent: AdminUserResponse) {
        deleteMutation.mutate(agent.id, {
            onSuccess: () => toast.success(t("agentsDeletedToast")),
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">{t("systemAdminEyebrow")}</span>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <UserCog className="size-6 text-primary" />
                        {t("agentsPageTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        {t("agentsPageSubtitle")}
                    </p>
                </div>

                <Button onClick={openCreateDialog} className="rounded-xl font-bold text-xs gap-2 h-9 shrink-0">
                    <Plus className="size-4" />
                    {t("agentsCreateAction")}
                </Button>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                {agentsQuery.isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 w-full bg-muted rounded-lg" />
                        ))}
                    </div>
                ) : agentsQuery.isError ? (
                    <div className="p-6 text-sm text-destructive font-medium">
                        {t("agentsLoadError")}
                    </div>
                ) : agents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <UserCog className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{t("agentsEmptyTitle")}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            {t("agentsEmptyDescription")}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("agentsColumnName")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("agentsColumnEmail")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("agentsColumnPhone")}</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">{t("agentsColumnStatus")}</TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                    {t("agentsColumnActions")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents.map((agent) => {
                                const isToggling = updateMutation.isPending && updateMutation.variables?.id === agent.id;
                                const isDeleting = deleteMutation.isPending && deleteMutation.variables === agent.id;
                                return (
                                    <TableRow key={agent.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="text-sm font-semibold">{agent.fullName}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{agent.email}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{agent.phone ?? "—"}</TableCell>
                                        <TableCell>
                                            <Badge variant={agent.active ? "success" : "outline"} className="rounded-full">
                                                {agent.active ? t("agentsStatusActive") : t("agentsStatusInactive")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(agent)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                                >
                                                    {t("agentsEditAction")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isToggling}
                                                    onClick={() => toggleActive(agent)}
                                                    className={
                                                        agent.active
                                                            ? "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                                            : "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                    }
                                                >
                                                    {isToggling ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : agent.active ? (
                                                        <Power className="size-3.5" />
                                                    ) : (
                                                        <ShieldCheck className="size-3.5" />
                                                    )}
                                                    {agent.active ? t("agentsDeactivateAction") : t("agentsReactivateAction")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isDeleting}
                                                    onClick={() => handleDelete(agent)}
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

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 text-xs text-muted-foreground">
                        <span>
                            {t("agentsPaginationSummary", { page: page + 1, totalPages, total: totalElements })}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="h-8 rounded-lg px-2.5"
                            >
                                <ChevronLeft className="size-4 mr-1" />
                                {t("agentsPreviousPage")}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="h-8 rounded-lg px-2.5"
                            >
                                {t("agentsNextPage")}
                                <ChevronRight className="size-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("agentsCreateDialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">{t("agentsFullNameLabel")}</Label>
                            <Input
                                id="fullName"
                                required
                                value={createForm.fullName}
                                onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                placeholder="ex: Jeanne Dupont"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t("agentsEmailLabel")}</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={createForm.email}
                                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="ex: jeanne@guentours.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t("agentsPhoneLabel")}</Label>
                            <Input
                                id="phone"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                                placeholder="ex: +33600000000"
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {t("agentsTempPasswordNotice")}
                        </p>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl">
                                {t("agentsCancelAction")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || !createForm.email || !createForm.fullName}
                                className="rounded-xl gap-2"
                            >
                                {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                                {t("agentsCreateSubmitAction")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={editingAgent !== null} onOpenChange={(open) => !open && setEditingAgent(null)}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("agentsEditDialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-fullName">{t("agentsEditFullNameLabel")}</Label>
                            <Input
                                id="edit-fullName"
                                required
                                value={editForm.fullName}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email">{t("agentsEditEmailLabel")}</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                required
                                value={editForm.email}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">{t("agentsEditPhoneLabel")}</Label>
                            <Input
                                id="edit-phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingAgent(null)} className="rounded-xl">
                                {t("agentsCancelAction")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending || !editForm.fullName || !editForm.email}
                                className="rounded-xl gap-2"
                            >
                                {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                                {t("agentsSaveAction")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
