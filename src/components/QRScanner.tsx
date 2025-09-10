import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, X, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onAttendanceMarked?: () => void;
}

const QRScanner = ({ onAttendanceMarked }: QRScannerProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementId = "qr-scanner";

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "Please log in to scan QR codes",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    scannerRef.current = new Html5QrcodeScanner(
      scannerElementId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(
      async (decodedText) => {
        // Stop scanning immediately
        if (scannerRef.current) {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
        
        await handleScanSuccess(decodedText);
        setIsScanning(false);
      },
      (errorMessage) => {
        // Handle scan errors silently or log them
        console.log("QR Code scanning error:", errorMessage);
      }
    );
  };

  const handleScanSuccess = async (qrData: string) => {
    try {
      // Validate QR code format
      if (!qrData.startsWith('ATTENDQR_')) {
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not for attendance",
          variant: "destructive",
        });
        return;
      }

      // Check if QR code exists and is active
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('qr_data', qrData)
        .eq('is_active', true)
        .single();

      if (qrError || !qrCode) {
        toast({
          title: "Invalid QR Code",
          description: "QR code not found or expired",
          variant: "destructive",
        });
        return;
      }

      // Check if attendance already marked
      const { data: existingAttendance } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('qr_code_id', qrCode.id)
        .eq('student_id', user!.id)
        .single();

      if (existingAttendance) {
        toast({
          title: "Already Marked",
          description: "Your attendance is already recorded for this session",
          variant: "destructive",
        });
        return;
      }

      // Mark attendance
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .insert({
          qr_code_id: qrCode.id,
          student_id: user!.id,
          student_name: profile!.full_name,
          enrollment_no: profile!.enrollment_no || '',
          semester: profile!.semester || '',
          branch: profile!.branch || '',
          course: profile!.course || '',
          status: 'Present'
        });

      if (attendanceError) throw attendanceError;

      setScanResult(`Attendance marked successfully for ${qrCode.session_name}!`);
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      });
      
      onAttendanceMarked?.();

      // Clear result after 3 seconds
      setTimeout(() => setScanResult(null), 3000);

    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
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
      <CardContent className="space-y-4">
        {scanResult && (
          <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium text-sm">{scanResult}</span>
          </div>
        )}

        {isScanning ? (
          <div className="space-y-4">
            <div id={scannerElementId} className="w-full"></div>
            <Button onClick={stopScanning} variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
              <QrCode className="h-16 w-16 text-white" />
            </div>
            
            <Button 
              onClick={startScanning}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start QR Scan
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Point your camera at the QR code provided by your instructor
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;