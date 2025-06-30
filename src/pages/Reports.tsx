import { useState, useEffect } from "react"
import { Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"

const months = [
  { name: "January", value: 1 },
  { name: "February", value: 2 },
  { name: "March", value: 3 },
  { name: "April", value: 4 },
  { name: "May", value: 5 },
  { name: "June", value: 6 },
  { name: "July", value: 7 },
  { name: "August", value: 8 },
  { name: "September", value: 9 },
  { name: "October", value: 10 },
  { name: "November", value: 11 },
  { name: "December", value: 12 },
]

const years = [2023, 2024, 2025, 2026]

export default function Reports() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [centerName, setCenterName] = useState("")

  useEffect(() => {
    // Set default center name from user's centers
    if (user?.centers?.length > 0) {
      setCenterName(user.centers[0])
    }
  }, [user])

  const handleDownload = () => {
    const url = `https://diagnostics.olivaclinic.com/backend/monthly-bookings/excel?month=${selectedMonth}&year=${selectedYear}&center=${encodeURIComponent(centerName)}`
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `monthly_guest_summary_${selectedMonth}_${selectedYear}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Guest Summary</CardTitle>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  {user?.centers?.map((center) => (
                    <option key={center} value={center}>{center}</option>
                  )) || []}
                </select>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Type: Excel</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleDownload}
                    disabled={!centerName}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
