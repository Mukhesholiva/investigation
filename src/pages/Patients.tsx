import { DashboardLayout } from "@/components/DashboardLayout"
import { BookingTable } from "@/components/BookingTable"

export default function Guests() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Bookings</h1>
        </div>
        <BookingTable />
      </div>
    </DashboardLayout>
  )
}
