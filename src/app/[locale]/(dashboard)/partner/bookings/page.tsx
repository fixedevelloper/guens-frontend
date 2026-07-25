"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface PartnerBooking {
    id: string;
    contactEmail: string;
    status: string;
    amount: number;
    currency: string;
}

export default function PartnerBookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<PartnerBooking[]>([]);

    useEffect(() => {
        if (!user?.partnerId) return;
        // Endpoint à créer côté backend : GET /api/partners/{partnerId}/bookings
        fetch(`/api/partners/${user.partnerId}/bookings`)
            .then((res) => res.json())
            .then((data) => setBookings(data.content ?? []));
    }, [user]);

    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold">Réservations</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Montant</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((b) => (
                        <TableRow key={b.id}>
                            <TableCell>{b.contactEmail}</TableCell>
                            <TableCell>{b.status}</TableCell>
                            <TableCell>{b.amount} {b.currency}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}