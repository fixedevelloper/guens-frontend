// store/use-hotel-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HarmonizedHotelOffer, HotelDescription, HotelDetail, HotelImage, RoomOffer } from "@/lib/api/types";

// --- Panier ---

/** Frais de réservation fixe affiché en mode "paiement plus tard", indépendant du prix réel/quantité. */
export const RESERVATION_FEE_AMOUNT = 5000;
export const RESERVATION_FEE_CURRENCY = "XAF";

export type PaymentPlan = "PAY_NOW" | "PAY_LATER";

export interface CartItem {
    /** Identifiant unique de la ligne panier : room.productId ?? room.roomCode. */
    roomCode: string;
    roomType: string;
    offerId: string;
    hotelName: string;
    unitPrice: number;
    currency: string;
    quantity: number;
    nights: number;
}

// --- État du Store ---
interface HotelState {
    // Résultats de recherche
    searchResults: HarmonizedHotelOffer[];
    selectedOffer: HarmonizedHotelOffer | null;
    // Détails de l'hôtel sélectionné
    hotelDetail: HotelDetail | null;
    // Chambres disponibles et sélectionnée
    roomOffers: RoomOffer[];
    selectedRoomOffer: RoomOffer | null;
    // États UI
    isLoading: boolean;
    error: string | null;

    // --- Panier ---
    cartItems: CartItem[];
    paymentPlan: PaymentPlan;

    // Actions
    setSearchResults: (offers: HarmonizedHotelOffer[]) => void;
    selectOffer: (offer: HarmonizedHotelOffer) => void;
    setHotelDetail: (detail: HotelDetail | null) => void;
    setRoomOffers: (offers: RoomOffer[]) => void;
    setSelectedRoomOffer: (room: RoomOffer | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetSelection: () => void;
    resetAll: () => void;

    // --- Actions panier ---
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (roomCode: string) => void;
    updateCartQuantity: (roomCode: string, quantity: number) => void;
    clearCart: () => void;
    setPaymentPlan: (plan: PaymentPlan) => void;

    // --- Sélecteurs dérivés (prix réel vs prix affiché) ---
    /** Total réel (prix unitaire × quantité, toutes lignes confondues), toujours calculé quelle que soit le mode. */
    getCartRealTotal: () => { amount: number; currency: string } | null;
    /** Total à AFFICHER selon le mode choisi : réel+quantités en PAY_NOW, frais fixe en PAY_LATER. */
    getCartDisplayTotal: () => { amount: number; currency: string };
    getCartItemCount: () => number;
}

// --- Implémentation du Store avec Persistance ---
export const useHotelStore = create<HotelState>()(
    persist(
        (set, get) => ({
            // Valeurs initiales
            searchResults: [],
            selectedOffer: null,
            hotelDetail: null,
            roomOffers: [],
            selectedRoomOffer: null,
            isLoading: false,
            error: null,

            // --- Panier ---
            cartItems: [],
            paymentPlan: "PAY_NOW",

            // Actions
            setSearchResults: (searchResults) => set({ searchResults, error: null }),
            selectOffer: (selectedOffer) =>
                set({
                    selectedOffer,
                    hotelDetail: null,
                    roomOffers: [],
                    selectedRoomOffer: null,
                    error: null,
                }),
            setHotelDetail: (hotelDetail) => set({ hotelDetail }),
            setRoomOffers: (roomOffers) => set({ roomOffers }),
            setSelectedRoomOffer: (selectedRoomOffer) => set({ selectedRoomOffer }),
            setLoading: (isLoading) => set({ isLoading, error: null }),
            setError: (error) => set({ error, isLoading: false }),
            resetSelection: () =>
                set({
                    selectedOffer: null,
                    hotelDetail: null,
                    roomOffers: [],
                    selectedRoomOffer: null,
                    error: null,
                }),
            resetAll: () =>
                set({
                    searchResults: [],
                    selectedOffer: null,
                    hotelDetail: null,
                    roomOffers: [],
                    selectedRoomOffer: null,
                    isLoading: false,
                    error: null,
                    cartItems: [],
                    paymentPlan: "PAY_NOW",
                }),

            // --- Actions panier ---
            // Remplace uniquement addToCart dans store/use-hotel-store.ts

            addToCart: (item, quantity = 1) =>
                set((state) => {
                    const existing = state.cartItems.find((i) => i.roomCode === item.roomCode);
                    if (existing) {
                        return {
                            cartItems: [{ ...existing, quantity: existing.quantity + quantity }],
                        };
                    }
                    // Un article différent remplace le panier plutôt que de s'y ajouter :
                    // le panier ne porte jamais plus d'une ligne à la fois.
                    return {
                        cartItems: [{ ...item, quantity }],
                    };
                }),

            removeFromCart: (roomCode) =>
                set((state) => ({
                    cartItems: state.cartItems.filter((i) => i.roomCode !== roomCode),
                })),

            updateCartQuantity: (roomCode, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return { cartItems: state.cartItems.filter((i) => i.roomCode !== roomCode) };
                    }
                    return {
                        cartItems: state.cartItems.map((i) =>
                            i.roomCode === roomCode ? { ...i, quantity } : i
                        ),
                    };
                }),

            clearCart: () => set({ cartItems: [] }),

            setPaymentPlan: (paymentPlan) => set({ paymentPlan }),

            // --- Sélecteurs dérivés ---
            getCartRealTotal: () => {
                const items = get().cartItems;
                if (items.length === 0) return null;

                // ⚠️ Suppose une seule devise par panier (cas normal : un seul hôtel à la fois).
                // Si plusieurs devises coexistent un jour, ce total n'est plus fiable tel quel.
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

            getCartItemCount: () =>
                get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
        }),
        {
            name: 'guentours-hotel-storage',
            storage: createJSONStorage(() => sessionStorage), // Garde l'état actif durant la navigation mais s'efface à la fermeture de l'onglet
        }
    )
);