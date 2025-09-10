import { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QRGeneratorProps {
  onQRGenerated?: () => void;
}

const QRGenerator = ({ onQRGenerated }: QRGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionName, setSessionName] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrId, setQrId] = useState('');

  const generateQRCode = async () => {
    if (!sessionName.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter a session name",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate unique QR data
      const timestamp = Date.now();
      const qrData = `ATTENDQR_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store QR code in database
      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          admin_id: user.id,
          session_name: sessionName.trim(),
          qr_data: qrData,
          is_active: true,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        })
        .select()
        .single();

      if (error) throw error;

      // Generate QR code image
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrDataUrl(qrImageUrl);
      setQrId(data.id);
      
      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully!",
      });
      
      onQRGenerated?.();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${sessionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const resetGenerator = () => {
    setSessionName('');
    setQrDataUrl('');
    setQrId('');
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Generate QR Code</span>
        </CardTitle>
        <CardDescription>
          Create a QR code for attendance session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="session-name">Session Name</Label>
          <Input
            id="session-name"
            placeholder="e.g., Morning Lecture - CS101"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        {qrDataUrl ? (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
              <img src={qrDataUrl} alt="Generated QR Code" className="w-64 h-64" />
            </div>
            <div className="text-sm text-muted-foreground">
              QR Code ID: {qrId}
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={downloadQR} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={resetGenerator} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;