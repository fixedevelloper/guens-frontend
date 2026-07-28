// store/use-property-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HarmonizedPropertyOffer, PropertySearchParams } from "@/lib/api/types";
import { RESERVATION_FEE_AMOUNT, RESERVATION_FEE_CURRENCY } from "@/lib/api/reservation-fee";

export type PaymentPlan = "PAY_NOW" | "PAY_LATER";

export interface PropertyCartItem {
    itemId: string; // offerId de l'offre choisie (une des quotes)
    title: string;
    propertyType: string;
    city: string;
    checkIn: string;
    checkOut: string;
    unitPrice: number;
    currency: string;
    quantity: number;
}

interface PropertyState {
    searchParams: PropertySearchParams | null;
    searchResults: HarmonizedPropertyOffer[];
    selectedOffer: HarmonizedPropertyOffer | null;

    isLoading: boolean;
    error: string | null;

    cartItems: PropertyCartItem[];
    paymentPlan: PaymentPlan;

    setSearchParams: (params: PropertySearchParams) => void;
    setSearchResults: (offers: HarmonizedPropertyOffer[]) => void;
    selectOffer: (offer: HarmonizedPropertyOffer) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    addToCart: (item: Omit<PropertyCartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateCartQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    setPaymentPlan: (plan: PaymentPlan) => void;

    resetSelection: () => void;
    resetAll: () => void;

    getCartRealTotal: () => { amount: number; currency: string } | null;
    getCartDisplayTotal: () => { amount: number; currency: string };
}

export const usePropertyStore = create<PropertyState>()(
    persist(
        (set, get) => ({
            searchParams: null,
            searchResults: [],
            selectedOffer: null,

            isLoading: false,
            error: null,

            cartItems: [],
            paymentPlan: "PAY_NOW",

            setSearchParams: (searchParams) => set({ searchParams }),
            setSearchResults: (searchResults) => set({ searchResults, error: null }),
            selectOffer: (selectedOffer) => set({ selectedOffer, error: null }),

            setLoading: (isLoading) => set({ isLoading, error: null }),
            setError: (error) => set({ error, isLoading: false }),

            addToCart: (item, quantity = 1) =>
                set((state) => {
                    const existing = state.cartItems.find((i) => i.itemId === item.itemId);
                    if (existing) {
                        return { cartItems: [{ ...existing, quantity: existing.quantity + quantity }] };
                    }
                    // Un seul article à la fois : un nouvel ajout remplace le panier.
                    return { cartItems: [{ ...item, quantity }] };
                }),

            removeFromCart: (itemId) =>
                set((state) => ({ cartItems: state.cartItems.filter((i) => i.itemId !== itemId) })),

            updateCartQuantity: (itemId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return { cartItems: state.cartItems.filter((i) => i.itemId !== itemId) };
                    }
                    return {
                        cartItems: state.cartItems.map((i) => (i.itemId === itemId ? { ...i, quantity } : i)),
                    };
                }),

            clearCart: () => set({ cartItems: [] }),
            setPaymentPlan: (paymentPlan) => set({ paymentPlan }),

            resetSelection: () => set({ selectedOffer: null, error: null }),

            resetAll: () =>
                set({
                    searchParams: null,
                    searchResults: [],
                    selectedOffer: null,
                    isLoading: false,
                    error: null,
                    cartItems: [],
                    paymentPlan: "PAY_NOW",
                }),

            getCartRealTotal: () => {
                const items = get().cartItems;
                if (items.length === 0) return null;
                const currency = items[0].currency;
                const amount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
                return { amount, currency };
            },

            getCartDisplayTotal: () => {
                const { paymentPlan } = get();
                if (paymentPlan === "PAY_LATER") {
                    return { amount: RESERVATION_FEE_AMOUNT, currency: RESERVATION_FEE_CURRENCY };
                }
                const realTotal = get().getCartRealTotal();
                return realTotal ?? { amount: 0, currency: RESERVATION_FEE_CURRENCY };
            },
        }),
        {
            name: 'guentours-property-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);