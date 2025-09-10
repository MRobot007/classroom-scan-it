import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, User, Calendar, Clock, LogOut, CheckCircle, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import QRScanner from "@/components/QRScanner";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const studentData = {
    name: "John Doe",
    email: "john@example.com",
    enrollment: "EN2024001",
    branch: "Computer Engineering",
    course: "B.E",
    semester: "6"
  };

  const attendanceHistory = [
    {
      id: 1,
      subject: "Data Structures",
      date: "2024-01-15",
      time: "09:30 AM",
      status: "Present"
    },
    {
      id: 2,
      subject: "Computer Networks",
      date: "2024-01-14",
      time: "11:00 AM",
      status: "Present"
    },
    {
      id: 3,
      subject: "Database Management",
      date: "2024-01-13",
      time: "02:00 PM",
      status: "Present"
    },
  ];

  const startScanning = () => {
    setIsScanning(true);
    // Simulate QR scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Attendance marked successfully!");
      setTimeout(() => setScanResult(null), 3000);
    }, 2000);
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
                AttendQR Student
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {studentData.name}!</h2>
          <p className="text-muted-foreground">Ready to mark your attendance?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Info & QR Scanner */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Profile Card */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Student Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment No</p>
                  <p className="font-medium">{studentData.enrollment}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{studentData.branch}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium">{studentData.course}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <Badge variant="secondary">{studentData.semester}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Scanner Card */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>QR Scanner</span>
                </CardTitle>
                <CardDescription>
                  Scan QR code to mark your attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="w-32 h-32 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  {isScanning ? (
                    <div className="animate-spin">
                      <Camera className="h-16 w-16 text-white" />
                    </div>
                  ) : (
                    <QrCode className="h-16 w-16 text-white" />
                  )}
                </div>
                
                {scanResult && (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{scanResult}</span>
                  </div>
                )}

                <Button 
                  onClick={startScanning}
                  disabled={isScanning}
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  {isScanning ? "Scanning..." : "Start QR Scan"}
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Point your camera at the QR code provided by your instructor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Attendance History */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0 h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Attendance History</span>
                </CardTitle>
                <CardDescription>
                  Your recent attendance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceHistory.map((record) => (
                    <div 
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{record.subject}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{record.date}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{record.time}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {attendanceHistory.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No attendance records yet.</p>
                    <p className="text-sm">Start scanning QR codes to build your attendance history!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;