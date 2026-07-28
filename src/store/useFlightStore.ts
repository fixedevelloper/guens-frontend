// store/use-flight-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    FlightSearchParams,
    MultiCityFlightSearchParams,
    MultiCityItinerary,
    SeatMapResponse,
} from "@/lib/api/types";
import { RESERVATION_FEE_AMOUNT, RESERVATION_FEE_CURRENCY } from "@/lib/api/reservation-fee";

/**
 * ⚠️ HarmonizedFlightOffer n'a pas été fourni explicitement — supposé symétrique à
 * HarmonizedHotelOffer (mêmes conventions bestOfferId/quotes). À confirmer/ajuster
 * si sa forme réelle diffère dans @/lib/api/types.
 */
import type { HarmonizedFlightOffer } from "@/lib/api/types";

export type PaymentPlan = "PAY_NOW" | "PAY_LATER";

export interface FlightCartItem {
    /** Identifiant unique de la ligne panier : bestOfferId (simple) ou un id généré pour l'itinéraire multi-city. */
    itemId: string;
    kind: "OFFER" | "ITINERARY";
    summary: string; // ex: "Douala → Paris" ou "Douala → Paris → Rome" pour affichage rapide
    unitPrice: number; // prix total de l'offre/itinéraire pour tous les passagers déjà comptés dans searchParams
    currency: string;
    quantity: number; // nombre de fois où cette même offre/itinéraire est réservée (cas multi-groupes)
}

// --- État du Store ---
interface FlightState {
    // --- Recherche simple / aller-retour ---
    searchParams: FlightSearchParams | null;
    searchResults: HarmonizedFlightOffer[];
    selectedOffer: HarmonizedFlightOffer | null;

    // --- Recherche multi-city ---
    multiCitySearchParams: MultiCityFlightSearchParams | null;
    multiCityResults: MultiCityItinerary[];
    selectedItinerary: MultiCityItinerary | null;

    // --- Plan de cabine / sélection de sièges ---
    seatMapsByLeg: Record<number, SeatMapResponse | null>;
    selectedSeatsByLeg: Record<number, string[]>;

    // --- États UI ---
    isLoading: boolean;
    error: string | null;

    // --- Panier ---
    cartItems: FlightCartItem[];
    paymentPlan: PaymentPlan;

    // --- Actions recherche simple ---
    setSearchParams: (params: FlightSearchParams) => void;
    setSearchResults: (offers: HarmonizedFlightOffer[]) => void;
    selectOffer: (offer: HarmonizedFlightOffer) => void;

    // --- Actions multi-city ---
    setMultiCitySearchParams: (params: MultiCityFlightSearchParams) => void;
    setMultiCityResults: (itineraries: MultiCityItinerary[]) => void;
    selectItinerary: (itinerary: MultiCityItinerary) => void;

    // --- Actions sièges ---
    setSeatMap: (legIndex: number, seatMap: SeatMapResponse | null) => void;
    toggleSeat: (legIndex: number, seatNumber: string, maxSeats: number) => void;
    clearSeatsForLeg: (legIndex: number) => void;

    // --- États UI ---
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // --- Actions panier ---
    addToCart: (item: Omit<FlightCartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateCartQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    setPaymentPlan: (plan: PaymentPlan) => void;

    // --- Reset ---
    resetSelection: () => void;
    resetAll: () => void;

    // --- Sélecteurs dérivés ---
    getTotalPassengers: () => number;
    getSelectedSeatsFlat: () => string[];
    getCartRealTotal: () => { amount: number; currency: string } | null;
    getCartDisplayTotal: () => { amount: number; currency: string };
    getCartItemCount: () => number;
}

// --- Implémentation du Store avec Persistance ---
export const useFlightStore = create<FlightState>()(
    persist(
        (set, get) => ({
            // Valeurs initiales
            searchParams: null,
            searchResults: [],
            selectedOffer: null,

            multiCitySearchParams: null,
            multiCityResults: [],
            selectedItinerary: null,

            seatMapsByLeg: {},
            selectedSeatsByLeg: {},

            isLoading: false,
            error: null,

            // --- Panier ---
            cartItems: [],
            paymentPlan: "PAY_NOW",

            // --- Actions recherche simple ---
            setSearchParams: (searchParams) => set({ searchParams }),
            setSearchResults: (searchResults) => set({ searchResults, error: null }),
            selectOffer: (selectedOffer) =>
                set({
                    selectedOffer,
                    selectedItinerary: null,
                    seatMapsByLeg: {},
                    selectedSeatsByLeg: {},
                    error: null,
                }),

            // --- Actions multi-city ---
            setMultiCitySearchParams: (multiCitySearchParams) => set({ multiCitySearchParams }),
            setMultiCityResults: (multiCityResults) => set({ multiCityResults, error: null }),
            selectItinerary: (selectedItinerary) =>
                set({
                    selectedItinerary,
                    selectedOffer: null,
                    seatMapsByLeg: {},
                    selectedSeatsByLeg: {},
                    error: null,
                }),

            // --- Actions sièges ---
            setSeatMap: (legIndex, seatMap) =>
                set((state) => ({
                    seatMapsByLeg: { ...state.seatMapsByLeg, [legIndex]: seatMap },
                })),

            toggleSeat: (legIndex, seatNumber, maxSeats) =>
                set((state) => {
                    const current = state.selectedSeatsByLeg[legIndex] ?? [];
                    const isSelected = current.includes(seatNumber);

                    let next: string[];
                    if (isSelected) {
                        next = current.filter((s) => s !== seatNumber);
                    } else if (current.length < maxSeats) {
                        next = [...current, seatNumber];
                    } else {
                        next = current;
                    }

                    return {
                        selectedSeatsByLeg: { ...state.selectedSeatsByLeg, [legIndex]: next },
                    };
                }),

            clearSeatsForLeg: (legIndex) =>
                set((state) => {
                    const next = { ...state.selectedSeatsByLeg };
                    delete next[legIndex];
                    return { selectedSeatsByLeg: next };
                }),

            // --- États UI ---
            setLoading: (isLoading) => set({ isLoading, error: null }),
            setError: (error) => set({ error, isLoading: false }),

            // --- Actions panier ---
            // Remplace uniquement addToCart dans store/use-flight-store.ts

            addToCart: (item, quantity = 1) =>
                set((state) => {
                    const existing = state.cartItems.find((i) => i.itemId === item.itemId);
                    if (existing) {
                        return {
                            cartItems: [{ ...existing, quantity: existing.quantity + quantity }],
                        };
                    }
                    return {
                        cartItems: [{ ...item, quantity }],
                    };
                }),

            removeFromCart: (itemId) =>
                set((state) => ({
                    cartItems: state.cartItems.filter((i) => i.itemId !== itemId),
                })),

            updateCartQuantity: (itemId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return { cartItems: state.cartItems.filter((i) => i.itemId !== itemId) };
                    }
                    return {
                        cartItems: state.cartItems.map((i) =>
                            i.itemId === itemId ? { ...i, quantity } : i
                        ),
                    };
                }),

            clearCart: () => set({ cartItems: [] }),

            setPaymentPlan: (paymentPlan) => set({ paymentPlan }),

            // --- Reset ---
            resetSelection: () =>
                set({
                    selectedOffer: null,
                    selectedItinerary: null,
                    seatMapsByLeg: {},
                    selectedSeatsByLeg: {},
                    error: null,
                }),

            resetAll: () =>
                set({
                    searchParams: null,
                    searchResults: [],
                    selectedOffer: null,
                    multiCitySearchParams: null,
                    multiCityResults: [],
                    selectedItinerary: null,
                    seatMapsByLeg: {},
                    selectedSeatsByLeg: {},
                    isLoading: false,
                    error: null,
                    cartItems: [],
                    paymentPlan: "PAY_NOW",
                }),

            // --- Sélecteurs dérivés ---
            getTotalPassengers: () => {
                const { searchParams, multiCitySearchParams } = get();
                const params = searchParams ?? multiCitySearchParams;
                if (!params) return 1;
                return (params.adults ?? 1) + (params.children ?? 0) + (params.infants ?? 0);
            },

            getSelectedSeatsFlat: () => {
                const { selectedSeatsByLeg } = get();
                return Object.values(selectedSeatsByLeg).flat();
            },

            getCartRealTotal: () => {
                const items = get().cartItems;
                if (items.length === 0) return null;

                // ⚠️ Suppose une seule devise par panier (cas normal : une recherche = une devise).
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
            name: 'guentours-flight-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);