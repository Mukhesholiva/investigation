import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService, Guest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { format, isBefore, startOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {GuestDetailDialog} from "@/components/guest-dialog.tsx";

interface BookSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  guestCode: string;
  fetchGuests?: () => void;
}

function BookSlotDialog({ isOpen, onClose, guestCode, fetchGuests }: BookSlotDialogProps) {
  const [age, setAge] = useState("");
  const [locationType, setLocationType] = useState("Home");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [address, setAddress] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentDateTime, setPaymentDateTime] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    axios.get("https://diagnostics.olivaclinic.com/backend/centers").then((res) => setCenters(res.data));
  }, []);

  useEffect(() => {
    if (locationType === "Clinic" && selectedCenter) {
      axios
        .get(`https://diagnostics.olivaclinic.com/backend/center-details?center_name=${selectedCenter}`)
        .then((res) => {
          setDoorNumber(res.data.door_no);
          setAddress(res.data.address);
          setPinCode(res.data.pin_code);
        });
    }
  }, [locationType, selectedCenter]);

  const fetchAvailableSlots = async () => {
    if (!pinCode || !paymentDateTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Enter pin code and date to fetch slots.",
      });
      return;
    }

    try {
      setSlotLoading(true);
      toast({
        title: "Loading",
        description: "Fetching available slots...",
      });
      
      const response = await axios.post("https://diagnostics.olivaclinic.com/backend/get-available-slots", {
        pincode: pinCode,
        appointment_date: format(paymentDateTime, "yyyy-MM-dd"),
      });

      if (response.data.status && response.data.slots.length > 0) {
        setAvailableSlots(response.data.slots);
        toast({
          title: "Success",
          description: "Slots fetched successfully.",
        });
      } else {
        setAvailableSlots([]);
        toast({
          variant: "destructive",
          title: "No Slots",
          description: "No slots available for this date and pin.",
        });
      }
    } catch (error) {
      console.error(error);
      setAvailableSlots([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch slots.",
      });
    } finally {
      setSlotLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (loading || !selectedTimeSlot) return;
    setLoading(true);

    const confirmedDate = format(paymentDateTime, "yyyy-MM-dd");
    const [from_time, to_time] = selectedTimeSlot.split("-").map(s => s.trim());

    const payload = [
      {
        guest_code: guestCode,
        Date: confirmedDate,
        age: parseInt(age),
        address,
        door_no: doorNumber,
        pincode: pinCode,
        from_date: confirmedDate,
        time_slot: `${from_time} - ${to_time}`,
      },
    ];

    try {
      const res = await axios.post("https://diagnostics.olivaclinic.com/backend/slot-bookings", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Server response:", res.data);
      
      // First show success message
      toast({
        title: "Success",
        description: "Booking successful!",
      });

      // Wait for backend to complete all operations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the data
      if (fetchGuests) {
        await fetchGuests();
      }

      // Close the dialog
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.detail || "Error submitting booking.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book New Slot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Age</label>
            <Input
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label>Location Type</label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger>
                <SelectValue placeholder="Location Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Clinic">Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {locationType === "Clinic" && (
            <>
              <div className="grid gap-2">
                <label>Select Clinic</label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.name}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label>Door No</label>
                <Input value={doorNumber} readOnly />
              </div>
              <div className="grid gap-2">
                <label>Pin Code</label>
                <Input value={pinCode} readOnly />
              </div>
              <div className="grid gap-2">
                <label>Address</label>
                <Input value={address} readOnly />
              </div>
            </>
          )}

          {locationType === "Home" && (
            <>
              <div className="grid gap-2">
                <label>Door No</label>
                <Input
                  value={doorNumber}
                  onChange={(e) => setDoorNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label>Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label>Pin Code</label>
                <Input
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <label>Date</label>
            <DatePicker
              selected={paymentDateTime}
              onChange={(date: Date | null) => date && setPaymentDateTime(date)}
              dateFormat="dd-MM-yyyy"
              className="w-full rounded-md border p-2"
              minDate={new Date()}
            />
          </div>

          <div className="grid gap-2">
            <Button 
              variant="outline" 
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={fetchAvailableSlots}
              disabled={slotLoading}
            >
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-red-500 text-white hover:bg-red-600">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedTimeSlot}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {loading ? "Booking..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCenters, setSelectedCenters] = useState<string[]>(user?.centers || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedGuestCode, setSelectedGuestCode] = useState('');
  const [viewGuestDialogOpen, setViewGuestDialogOpen] = useState(false);
  const [viewGuestCode, setViewGuestCode] = useState('');
  const [viewGuestPhoneNumber, setViewGuestPhoneNumber] = useState('');
  const [allCenters, setAllCenters] = useState<string[]>([]);
  const isAdmin = user?.centers?.includes('admin');

  // Fetch all centers if user is admin
  useEffect(() => {
    if (isAdmin) {
      axios.get("https://diagnostics.olivaclinic.com/backend/centers")
        .then(res => {
          // Extract center names from the response objects
          const centerNames = res.data.map((center: { id: number; name: string } | string) => {
            // If center is an object with name property, use that, otherwise use the center string
            return typeof center === 'object' && center !== null ? center.name : center;
          });
          if (!centerNames.includes('admin')) {
            centerNames.push('admin');
          }
          setAllCenters(centerNames);
          setSelectedCenters(centerNames); // Set all centers as selected for admin
        })
        .catch(err => {
          console.error('Failed to fetch centers:', err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load centers"
          });
        });
    }
  }, [isAdmin]);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['guests', selectedCenters],
    queryFn: () => apiService.getGuests(selectedCenters),
    enabled: selectedCenters.length > 0,
  });

  useEffect(() => {
    if (user?.centers) {
      if (isAdmin) {
        // For admin, keep all centers selected or wait for them to be loaded
        if (allCenters.length > 0) {
          setSelectedCenters(allCenters);
        }
      } else {
        // For non-admin users, use their assigned centers
        setSelectedCenters(user.centers);
      }
    }
  }, [user, isAdmin, allCenters]);

  const filteredbookings = bookings.filter((Guest: Guest) => {
    const matchesSearch = Guest.GuestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         Guest.GuestCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'closed' && Guest.Status === 'Closed') ||
                         (statusFilter === 'pending' && Guest.Status !== 'Closed');
    
    let matchesDate = true;
    if (fromDate || toDate) {
      const GuestDate = new Date(Guest.Date);
      if (fromDate) matchesDate = matchesDate && GuestDate >= new Date(fromDate);
      if (toDate) matchesDate = matchesDate && GuestDate <= new Date(toDate);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredbookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentbookings = filteredbookings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate, statusFilter, selectedCenters]);

  const handleBookSlot = async (guestCode: string) => {
    setSelectedGuestCode(guestCode);
    setIsBookingDialogOpen(true);
  };


  const handleViewGuest = async (guestCode: string,phoneNumber:string) => {
    try {
      const slotBookings = await apiService.getSlotBookings(guestCode);
      // console.log('Slot bookings:', slotBookings);
      // toast({
      //   title: "Guest Details",
      //   description: `Found ${slotBookings.data.length} booking(s)`,
      // });
      setViewGuestCode(guestCode);
      setViewGuestPhoneNumber(phoneNumber);
      setViewGuestDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load Guest details",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">Error loading bookings</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#00B5B1]">Booking Records</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Input 
            placeholder="Search by name or code" 
            className="w-[200px] focus-visible:ring-[#00B5B1]" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input 
            type="date"
            placeholder="From Date" 
            className="w-[150px] focus-visible:ring-[#00B5B1]" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input 
            type="date"
            placeholder="To Date" 
            className="w-[150px] focus-visible:ring-[#00B5B1]" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Select 
            value={selectedCenters[0] || "all"}
            onValueChange={(value) => {
              if (value === "all" && isAdmin) {
                setSelectedCenters(allCenters);
              } else {
                setSelectedCenters([value]);
              }
            }}
          >
            <SelectTrigger className="w-[150px] focus-visible:ring-[#00B5B1]">
              <SelectValue placeholder="Center" />
            </SelectTrigger>
            <SelectContent>
              {isAdmin && <SelectItem value="all">All Centers</SelectItem>}
              {(isAdmin ? allCenters : user?.centers || []).map((center) => (
                <SelectItem key={center} value={center}>{center}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#00B5B1]">
            <TableRow className="border-none">
              <TableHead className="text-white w-[15%] font-medium">Name</TableHead>
              <TableHead className="text-white w-[8%] font-medium">Gender</TableHead>
              <TableHead className="text-white w-[10%] font-medium">Code</TableHead>
              <TableHead className="text-white w-[10%] font-medium">Date ↑</TableHead>
              <TableHead className="text-white w-[12%] font-medium">Center</TableHead>
              <TableHead className="text-white w-[12%] font-medium">Test Status</TableHead>
              <TableHead className="text-white w-[8%] font-medium p-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-white text-white bg-transparent h-8 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="text-white w-[15%] font-medium">Actions</TableHead>
              <TableHead className="text-white w-[5%] font-medium">Report</TableHead>
              <TableHead className="text-white w-[5%] font-medium">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentbookings.map((Guest: Guest, index: number) => (
              <TableRow key={index} className="hover:bg-[#E6F7F7]">
                <TableCell className="font-medium truncate">{Guest.GuestName}</TableCell>
                <TableCell className="truncate">{Guest.Gender}</TableCell>
                <TableCell className="truncate">{Guest.GuestCode}</TableCell>
                <TableCell className="truncate">
                    {(() => {
                      const date = new Date(Guest.Date);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    })()}
                  </TableCell>
                <TableCell className="truncate">{Guest.Center}</TableCell>
                <TableCell className="truncate">{Guest.TestStatus || '—'}</TableCell>
                <TableCell>
                  <Badge 
                    variant={Guest.Status === 'Closed' ? 'default' : 'secondary'}
                    className={Guest.Status === 'Closed' ? 'bg-[#00B5B1] hover:bg-[#00A19E]' : 'bg-[#E6F7F7] text-[#00B5B1] hover:bg-[#D1F1F1]'}
                  >
                    {Guest.Status === 'Closed' ? 'Closed' : Guest.Status || '—'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      className="bg-[#00B5B1] hover:bg-[#00A19E] text-white whitespace-nowrap px-2 h-8 flex-1"
                      onClick={() => handleBookSlot(Guest.GuestCode)}
                    >
                      Book Slot
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-[#00B5B1] text-[#00B5B1] hover:bg-[#E6F7F7] h-8 aspect-square p-0"
                      onClick={() => handleViewGuest(Guest.GuestCode,Guest.Phone)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {Guest.ReportURL ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 aspect-square p-0 mx-auto border-[#00B5B1] text-[#00B5B1] hover:bg-[#E6F7F7]" 
                      asChild
                    >
                      <a href={Guest.ReportURL} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="truncate">{Guest.BookingID || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-4 py-2 border-t flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredbookings.length)} of {filteredbookings.length} bookings
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={`hover:bg-[#E6F7F7] text-[#00B5B1] ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                  className={
                    currentPage === i + 1
                      ? 'bg-[#00B5B1] text-white hover:bg-[#00A19E]'
                      : 'hover:bg-[#E6F7F7] text-[#00B5B1]'
                  }
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={`hover:bg-[#E6F7F7] text-[#00B5B1] ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <BookSlotDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        guestCode={selectedGuestCode}
        fetchGuests={() => {
          // Implement the logic to fetch guests again
        }}
      />
      <GuestDetailDialog
          open={viewGuestDialogOpen}
          guestCode={viewGuestCode}
          phoneNumber={viewGuestPhoneNumber}
          onClose={() => setViewGuestDialogOpen(false)}
      />
    </div>
  );
}
