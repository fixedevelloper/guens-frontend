"use client";

import React, { useState } from "react";
import { useApproveResellerMutation } from "@/hooks/use-admin";
import { Loader2, Percent, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApproveResellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resellerId: string;
  resellerName: string;
  onSuccess: () => void;
}

export const ApproveResellerModal: React.FC<ApproveResellerModalProps> = ({
  isOpen,
  onClose,
  resellerId,
  resellerName,
  onSuccess,
}) => {
  // 1. DÉCLARATION DE TOUS LES HOOKS EN HAUT DU COMPOSANT (Rules of Hooks)
  const [percentage, setPercentage] = useState<string>("10");
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: approveReseller, isPending } = useApproveResellerMutation();

  // 2. CONDITION DE SORTIE APRÈS LES HOOKS
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericValue = parseFloat(percentage);

    // Validation côté client
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      setError("Le taux doit être un pourcentage valide entre 0% et 100%");
      return;
    }

    try {
      const commissionRate = numericValue / 100;

      // Appel de la mutation TanStack Query
      await approveReseller({
        resellerId,
        payload: { commissionRate },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      // Interception de l'erreur renvoyée par Axios / Spring Boot
      setError(
        err?.response?.data?.message || "Une erreur est survenue lors de l'approbation."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl border border-border/60 transition-all">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <CheckCircle2 className="size-5" />
          <h3 className="text-lg font-black text-foreground">
            Approuver le revendeur
          </h3>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Définissez la commission accordée à{" "}
          <span className="font-extrabold text-foreground">{resellerName}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Taux de commission (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                disabled={isPending}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="10.00"
                className="pr-8 h-9 text-xs font-mono font-bold rounded-xl border-border/60"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Percent className="size-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground font-medium flex items-center justify-between">
              <span>Valeur envoyée à l'API :</span>
              <span className="font-mono font-extrabold text-foreground">
                {(parseFloat(percentage) / 100 || 0).toFixed(4)}
              </span>
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={onClose}
              className="rounded-xl font-bold text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Approbation...</span>
                </>
              ) : (
                <span>Confirmer l'approbation</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};