import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Users, BookOpen, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AttendQR
            </h1>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Modern QR Code Attendance Management
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Streamline attendance tracking with secure QR codes. Perfect for educational institutions 
            with real-time tracking and comprehensive reporting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="text-primary mb-4">
                <QrCode className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QR Code Generation</h3>
              <p className="text-muted-foreground">
                Generate unlimited QR codes for different sessions and events
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="text-primary mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Student Management</h3>
              <p className="text-muted-foreground">
                Comprehensive student profiles with course and semester tracking
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300 border-0">
              <div className="text-primary mb-4">
                <CheckCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Tracking</h3>
              <p className="text-muted-foreground">
                Instant attendance marking with detailed analytics and reports
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-secondary/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 AttendQR. Built for modern educational institutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;