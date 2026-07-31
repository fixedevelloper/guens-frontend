"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCardAuthorizationMutation } from "@/hooks/use-payment";
import { normalizeApiError } from "@/lib/api/client";
import type { PaymentResponse } from "@/lib/api/types";

interface CardPinDialogProps {
  paymentId: string;
  onSuccess: (payment: PaymentResponse) => void;
  onCancel: () => void;
}

/**
 * Flutterwave asks some cards for a PIN before a card charge can settle - without this step the
 * payment stays PENDING_AUTHORIZATION forever, since no webhook ever resolves it. Shown as soon as
 * the initial charge comes back requiring one.
 */
export function CardPinDialog({ paymentId, onSuccess, onCancel }: CardPinDialogProps) {
  const [pin, setPin] = useState("");
  const mutation = useCardAuthorizationMutation();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate(
        { paymentId, pin },
        {
          onSuccess: (payment) => {
            if (payment.status === "SUCCEEDED" || payment.status === "PENDING") {
              onSuccess(payment);
            } else if (payment.status === "PENDING_AUTHORIZATION") {
              // La banque redemande un code (pas forcément que le précédent était faux - certaines
              // cartes enchaînent plusieurs vérifications) : on garde le dialogue ouvert plutôt que
              // d'afficher un message d'échec qui ne s'applique pas ici.
              toast.info("Un nouveau code est requis pour confirmer le paiement.");
              setPin("");
            } else {
              toast.error(payment.failureReason ?? "Code PIN incorrect, veuillez réessayer.");
              setPin("");
            }
          },
          onError: (error) => toast.error(normalizeApiError(error).message),
        }
    );
  }

  return (
      <Dialog open onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <KeyRound className="size-4 text-primary" />
              Code PIN de votre carte
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Votre banque demande le code PIN associé à cette carte pour confirmer le paiement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="card-pin" className="text-xs font-bold">Code PIN</Label>
              <Input
                  id="card-pin"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="rounded-xl text-center tracking-[0.5em] font-bold"
                  autoFocus
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl font-semibold"
                  onClick={onCancel}
                  disabled={mutation.isPending}
              >
                Annuler
              </Button>
              <Button
                  type="submit"
                  className="rounded-xl font-bold gap-1.5"
                  disabled={pin.length < 4 || mutation.isPending}
              >
                {mutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Valider
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
