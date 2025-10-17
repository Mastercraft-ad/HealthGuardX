import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, QrCode, Activity, AlertCircle } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

export default function EmergencyScanner() {
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    setScanning(true);
    // Simulate scan
    setTimeout(() => {
      setScannedData({
        uid: "HX-12345",
        bloodType: "O+",
        allergies: "Penicillin, Peanuts",
        isInsured: true,
        emergencyContact: "+1-234-567-8900",
        criticalFlags: "Diabetic, Heart Condition"
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-4xl font-heading font-bold">Emergency QR Scanner</h1>
          <p className="text-lg text-muted-foreground">
            Scan patient QR code for instant access to critical medical information
          </p>
        </div>

        {/* Privacy Notice */}
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>Limited Data Policy:</strong> This scanner provides emergency-only medical summary. 
            Full medical records require authenticated healthcare provider access.
          </AlertDescription>
        </Alert>

        {/* Scanner */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <QrCode className="w-6 h-6" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-square bg-background/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              {scanning ? (
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                  <p className="text-muted-foreground">Scanning QR code...</p>
                </div>
              ) : scannedData ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-green-500 font-medium">QR Code Scanned Successfully</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Position QR code in frame</p>
                </div>
              )}
            </div>

            <Button 
              className="w-full"
              onClick={startScan}
              disabled={scanning}
              data-testid="button-start-scan"
            >
              {scanning ? "Scanning..." : scannedData ? "Scan Another" : "Start Scan"}
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Summary */}
        {scannedData && (
          <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                Emergency Medical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Patient UID</p>
                  <p className="font-mono text-lg font-bold" data-testid="text-emergency-uid">
                    {scannedData.uid}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blood Type</p>
                  <p className="text-lg font-bold text-destructive" data-testid="text-blood-type">
                    {scannedData.bloodType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Known Allergies</p>
                  <p className="text-sm font-medium" data-testid="text-allergies">
                    {scannedData.allergies}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Insurance Status</p>
                  <StatusBadge status={scannedData.isInsured ? "Active" : "Inactive"} />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
                  <p className="text-sm font-medium font-mono" data-testid="text-emergency-contact">
                    {scannedData.emergencyContact}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Critical Flags</p>
                  <p className="text-sm font-medium text-destructive" data-testid="text-critical-flags">
                    {scannedData.criticalFlags}
                  </p>
                </div>
              </div>

              <Alert className="border-blue-500/50 bg-blue-500/10 mt-6">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <AlertDescription className="text-blue-200">
                  For full medical records and treatment history, please authenticate as a verified healthcare provider.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Start Scan" and position the patient's HealthGuardX QR code in the camera frame
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Review the emergency summary including blood type, allergies, and critical medical flags
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For extended access, connect your healthcare provider wallet to request full medical records
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
