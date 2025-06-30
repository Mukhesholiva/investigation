// components/GuestDetailDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import axios from "axios";

export function GuestDetailDialog({ open, onClose, guestCode, phoneNumber }: {
    open: boolean;
    onClose: () => void;
    guestCode: string;
    phoneNumber: string;
}) {
    const [slots, setSlots] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!guestCode) return;

        const fetchSlots = async () => {
            try {
                const res = await axios.get(`https://diagnostics.olivaclinic.com/backend/get-slot-bookings?guestCode=${guestCode}`);
                setSlots(res.data.data || []);
                console.log("slots fetched");
            } catch (err) {
                console.error("Error fetching slots:", err);
            }
        };

        const fetchItems = async () => {
            try {
                const res = await axios.get(`https://diagnostics.olivaclinic.com/backend/items-by-center?center=${phoneNumber}`);
                setItems(res.data || []);
                console.log("items fetched");
            } catch (err) {
                console.error("Error fetching items:", err);
            }
        };

        fetchSlots();
        fetchItems();
    }, [guestCode]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Guest Code: {guestCode}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="items" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="items">Item Details</TabsTrigger>
                        <TabsTrigger value="slots">Slot Bookings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="items">
                        <div className="overflow-auto max-h-[300px] mt-4">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left p-2">Item</th>
                                    <th className="text-left p-2">Item Code</th>
                                    <th className="text-left p-2">Item Name</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2">{item.Item}</td>
                                        <td className="p-2">{item.ItemCode}</td>
                                        <td className="p-2">{item.ItemName}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="slots">
                        <div className="overflow-auto max-h-[300px] mt-4">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left p-2">Date</th>
                                    <th className="text-left p-2">Time Slot</th>
                                    <th className="text-left p-2">Address</th>
                                </tr>
                                </thead>
                                <tbody>
                                {slots.map((slot, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2">{slot.Date}</td>
                                        <td className="p-2">{slot.Age?.split("-").map(t => t.trim().slice(0, 5)).join(" - ")}</td>
                                        <td className="p-2">{slot.Address}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
