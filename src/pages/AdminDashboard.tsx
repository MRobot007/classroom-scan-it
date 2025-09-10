import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { QrCode, Users, BarChart3, LogOut, Download, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import QRGenerator from "@/components/QRGenerator";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState([
    { id: 1, name: "Morning Session - CS101", created: "2024-01-15", scans: 45 },
    { id: 2, name: "Lab Session - IT302", created: "2024-01-14", scans: 32 },
  ]);

  const attendanceData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      enrollment: "EN2024001",
      branch: "Computer",
      course: "B.E",
      timestamp: "2024-01-15 09:30 AM",
      status: "Present"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      enrollment: "EN2024002",
      branch: "IT",
      course: "B.E",
      timestamp: "2024-01-15 09:32 AM",
      status: "Present"
    },
  ];

  const generateQRCode = () => {
    const newQR = {
      id: qrCodes.length + 1,
      name: `Session ${qrCodes.length + 1}`,
      created: new Date().toLocaleDateString(),
      scans: 0
    };
    setQrCodes([...qrCodes, newQR]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AttendQR Admin
              </h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total QR Codes</p>
                  <p className="text-3xl font-bold text-primary">{qrCodes.length}</p>
                </div>
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-primary">156</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Attendance</p>
                  <p className="text-3xl font-bold text-primary">89%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="qr-codes" className="space-y-6">
          <TabsList className="bg-card shadow-card border-0">
            <TabsTrigger value="qr-codes">QR Code Management</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
          </TabsList>

          <TabsContent value="qr-codes" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Generate QR Code</CardTitle>
                    <CardDescription>Create new QR codes for attendance sessions</CardDescription>
                  </div>
                  <Button 
                    onClick={generateQRCode}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate QR
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {qrCodes.map((qr) => (
                    <Card key={qr.id} className="p-4 border shadow-sm">
                      <div className="text-center space-y-2">
                        <div className="w-24 h-24 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="font-semibold">{qr.name}</h3>
                        <p className="text-sm text-muted-foreground">Created: {qr.created}</p>
                        <p className="text-sm text-primary font-medium">{qr.scans} scans</p>
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>View and export attendance data</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Enrollment</th>
                        <th className="text-left p-2">Branch</th>
                        <th className="text-left p-2">Course</th>
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-secondary/50">
                          <td className="p-2">{record.name}</td>
                          <td className="p-2">{record.enrollment}</td>
                          <td className="p-2">{record.branch}</td>
                          <td className="p-2">{record.course}</td>
                          <td className="p-2">{record.timestamp}</td>
                          <td className="p-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Manage registered students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Search students..." className="max-w-sm" />
                    <Button variant="outline">Search</Button>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Student management features coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;