import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, FileText, Calendar, DollarSign, Download, Eye } from "lucide-react";

export default function BillingSettings() {
  // Sample payment and billing data
  const [enrollments] = useState([
    {
      id: 1,
      courseName: "React Complete Course",
      instructor: "John Doe",
      price: 99.99,
      enrolledAt: "2025-07-15",
      status: "active",
      progress: 75,
      paymentMethod: "Credit Card",
      nextBilling: "2025-08-15"
    },
    {
      id: 2,
      courseName: "Node.js Backend Development",
      instructor: "Jane Smith",
      price: 129.99,
      enrolledAt: "2025-07-10",
      status: "active",
      progress: 45,
      paymentMethod: "PayPal",
      nextBilling: "2025-08-10"
    },
    {
      id: 3,
      courseName: "Python for Data Science",
      instructor: "Mike Johnson",
      price: 89.99,
      enrolledAt: "2025-07-05",
      status: "completed",
      progress: 100,
      paymentMethod: "Credit Card",
      nextBilling: null
    }
  ]);

  const [invoices] = useState([
    {
      id: "INV-2025-001",
      date: "2025-07-15",
      amount: 99.99,
      course: "React Complete Course",
      status: "paid"
    },
    {
      id: "INV-2025-002",
      date: "2025-07-10", 
      amount: 129.99,
      course: "Node.js Backend Development",
      status: "paid"
    },
    {
      id: "INV-2025-003",
      date: "2025-07-05",
      amount: 89.99,
      course: "Python for Data Science", 
      status: "paid"
    }
  ]);

  const totalSpent = enrollments.reduce((sum, enrollment) => sum + enrollment.price, 0);
  const activeSubscriptions = enrollments.filter(e => e.status === "active").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your course subscriptions, payments, and billing information
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Course Enrollments
              </CardTitle>
              <CardDescription>
                Your enrolled courses and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{enrollment.courseName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">by {enrollment.instructor}</p>
                    </div>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Price:</span>
                      <span className="font-medium">${enrollment.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Progress:</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Payment Method:</span>
                      <span className="font-medium">{enrollment.paymentMethod}</span>
                    </div>
                    {enrollment.nextBilling && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Next Billing:</span>
                        <span className="font-medium">{enrollment.nextBilling}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Enrolled: {enrollment.enrolledAt}</span>
                    {enrollment.status === "active" && (
                      <Button variant="outline" size="sm">
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Billing History
              </CardTitle>
              <CardDescription>
                Your payment history and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Invoice {invoice.id}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.course}</p>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                      <span className="font-bold text-green-600">${invoice.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Date:</span>
                      <span className="font-medium">{invoice.date}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment methods and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Expires 12/28</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Remove</Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-600 rounded mr-3 flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <p className="font-medium">PayPal Account</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">user@example.com</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Remove</Button>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                + Add New Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}