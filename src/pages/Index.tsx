
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, Users, FileText } from "lucide-react"
import { Link } from "react-router-dom"

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to Oliva Diagnostics Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive medical diagnostics management system for healthcare professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <CardTitle>Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View comprehensive analytics, Guest counts, and revenue insights.
              </p>
              <Link to="/dashboard">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <CardTitle>Guests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage Guest records, appointments, and test results efficiently.
              </p>
              <Link to="/Guests">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Manage Guests
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-purple-500" />
                <CardTitle>Reports</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generate and download comprehensive reports for analysis.
              </p>
              <Link to="/reports">
                <Button className="w-full bg-purple-500 hover:bg-purple-600">
                  View Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Start Managing Your Diagnostics Today</h2>
          <p className="text-lg mb-6">
            Access powerful tools for Guest management, analytics, and reporting
          </p>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
