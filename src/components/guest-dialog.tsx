// components/GuestDetailDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/utils/api";
import { format } from 'date-fns';

export function GuestDetailDialog({ open, onClose, guestCode, phoneNumber }: {
    open: boolean;
    onClose: () => void;
    guestCode: string;
    phoneNumber: string;
}) {
    const [slots, setSlots] = useState([]);
    const [items, setItems] = useState([]);
    const { toast } = useToast();
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [rescheduleSlot, setRescheduleSlot] = useState<any>(null);
    const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [slotLoading, setSlotLoading] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleOpenReschedule = (slot: any) => {
        setRescheduleSlot(slot);
        setRescheduleDate(new Date(slot.Date));
        setSelectedTimeSlot("");
        setAvailableSlots([]);
        setRescheduleDialogOpen(true);
    };

    const fetchAvailableSlots = async () => {
        if (!rescheduleSlot?.Pincode || !rescheduleDate) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Enter pin code and date to fetch slots.",
            });
            return;
        }
        try {
            setSlotLoading(true);
            toast({ title: "Loading", description: "Fetching available slots..." });
            const response = await apiService.getAvailableSlots(rescheduleSlot.Pincode, format(rescheduleDate, "yyyy-MM-dd"));
            if (response.status && response.slots.length > 0) {
                setAvailableSlots(response.slots);
                toast({ title: "Success", description: "Slots fetched successfully." });
            } else {
                setAvailableSlots([]);
                toast({ variant: "destructive", title: "No Slots", description: "No slots available for this date and pin." });
            }
        } catch (error) {
            setAvailableSlots([]);
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch slots." });
        } finally {
            setSlotLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleSlot?.BookingID || !rescheduleDate || !selectedTimeSlot) return;
        setLoading(true);
        try {
            const payload = {
                guest_code: guestCode,
                confirmed_date: format(rescheduleDate, "yyyy-MM-dd"),
                confirmed_time_slot: selectedTimeSlot,
                booking_id: rescheduleSlot.BookingID,
            };
            await apiService.rescheduleBooking(payload);
            toast({ title: "Success", description: "Booking rescheduled successfully!" });
            setRescheduleDialogOpen(false);
            // Optionally, refresh slots
            // fetchSlots();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to reschedule booking." });
        } finally {
            setLoading(false);
        }
    };

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
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {slots.map((slot, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2">{slot.Date}</td>
                                        <td className="p-2">{slot.Age?.split("-").map(t => t.trim().slice(0, 5)).join(" - ")}</td>
                                        <td className="p-2">{slot.Address}</td>
                                        <td className="p-2">
                                            {slot.BookingID && (
                                                <Button size="sm" variant="outline" onClick={() => handleOpenReschedule(slot)}>
                                                    Reschedule
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
            {rescheduleDialogOpen && (
                <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reschedule Booking</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label>Date</label>
                                <DatePicker
                                    selected={rescheduleDate}
                                    onChange={(date: Date | null) => date && setRescheduleDate(date)}
                                    dateFormat="dd-MM-yyyy"
                                    className="w-full rounded-md border p-2"
                                    minDate={new Date()}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600" onClick={fetchAvailableSlots} disabled={slotLoading}>
                                    {slotLoading ? "Fetching..." : "Fetch Available Slots"}
                                </Button>
                            </div>
                            <div className="grid gap-2">
                                <label>Time Slot</label>
                                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.map((timeRange, idx) => (
                                            <SelectItem key={idx} value={timeRange}>
                                                {timeRange}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)} className="bg-red-500 text-white hover:bg-red-600">
                                Cancel
                            </Button>
                            <Button onClick={handleReschedule} disabled={loading || !selectedTimeSlot} className="bg-blue-500 text-white hover:bg-blue-600">
                                {loading ? "Rescheduling..." : "Submit"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
}
