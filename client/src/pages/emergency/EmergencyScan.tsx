import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { QrCode, AlertTriangle, Heart, User, Camera, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyScan() {
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerInitializedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const initScanner = async () => {
      if (scanning && !scannerInitializedRef.current) {
        scannerInitializedRef.current = true;
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCodeRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              try {
                const response: any = await apiRequest("POST", "/api/emergency/verify-qr", {
                  qrData: decodedText,
                });

                if (response?.success) {
                  setScannedData(response.data);
                  toast({
                    title: "QR Code Scanned",
                    description: "Patient information loaded successfully",
                  });
                  stopScanning();
                }
              } catch (error: any) {
                toast({
                  title: "Verification Failed",
                  description: error.message || "Failed to verify QR code",
                  variant: "destructive",
                });
              }
            },
            (errorMessage) => {
              console.log("QR scan error:", errorMessage);
            }
          );
        } catch (err: any) {
          console.error("Camera error:", err);
          setCameraError(err.message || "Failed to access camera");
          setScanning(false);
          scannerInitializedRef.current = false;
          toast({
            title: "Camera Error",
            description: "Unable to access camera. Please ensure camera permissions are granted.",
            variant: "destructive",
          });
        }
      }
    };

    initScanner();

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
        scannerInitializedRef.current = false;
      }
    };
  }, [scanning, toast]);

  const startScanning = () => {
    setScanning(true);
    setCameraError(null);
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Stop scanning error:", err);
      }
    }
    setScanning(false);
    scannerInitializedRef.current = false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emergency QR Scanner</h1>
        <p className="text-muted-foreground">Scan patient QR codes for instant emergency access</p>
      </div>

      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Emergency access is logged and audited. Only scan QR codes in genuine emergency situations.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
            <CardDescription>Point camera at patient's emergency QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!scanning && !scannedData && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                  <QrCode className="h-24 w-24 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-6">Ready to scan QR code</p>
                  <Button 
                    onClick={startScanning}
                    size="lg"
                    className="gap-2"
                    data-testid="button-start-scan"
                  >
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </Button>
                </div>
              )}

              {scanning && (
                <div className="space-y-4">
                  <div 
                    id="qr-reader" 
                    className="w-full rounded-lg overflow-hidden"
                    data-testid="qr-reader"
                  />
                  <Button 
                    onClick={stopScanning}
                    variant="destructive"
                    className="w-full gap-2"
                    data-testid="button-stop-scan"
                  >
                    <X className="h-4 w-4" />
                    Stop Scanning
                  </Button>
                </div>
              )}

              {cameraError && !scanning && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              {scannedData && !scanning && (
                <div className="text-center py-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-4">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <p className="font-medium">QR Code Scanned Successfully</p>
                  <p className="text-sm text-muted-foreground">Patient information displayed on the right</p>
                  <Button 
                    onClick={() => {
                      setScannedData(null);
                      setCameraError(null);
                    }}
                    className="mt-4"
                    data-testid="button-scan-another"
                  >
                    Scan Another QR Code
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Emergency medical details</CardDescription>
          </CardHeader>
          <CardContent>
            {!scannedData ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4" />
                <p>Scan a QR code to view patient information</p>
              </div>
            ) : (
              <div className="space-y-4" data-testid="patient-info">
                {scannedData.profilePicture && (
                  <div className="flex justify-center pb-4 border-b">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={scannedData.profilePicture} alt={scannedData.username} />
                      <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Patient UID</p>
                  <p className="font-mono font-semibold" data-testid="text-patient-uid">{scannedData.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium" data-testid="text-patient-username">{scannedData.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <p className="font-mono text-sm" data-testid="text-wallet-address">{scannedData.walletAddress}</p>
                </div>
                {scannedData.emergencyDetails && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-destructive" />
                        <p className="font-semibold">Critical Information</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blood Type</p>
                      <p className="text-lg font-bold text-destructive" data-testid="text-blood-type">
                        {scannedData.emergencyDetails.bloodType || "Not specified"}
                      </p>
                    </div>
                    {scannedData.emergencyDetails.allergies && scannedData.emergencyDetails.allergies.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Allergies</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scannedData.emergencyDetails.allergies.map((allergy: string, i: number) => (
                            <Badge key={i} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {scannedData.emergencyDetails.chronicConditions && scannedData.emergencyDetails.chronicConditions.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Chronic Conditions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scannedData.emergencyDetails.chronicConditions.map((condition: string, i: number) => (
                            <Badge key={i} variant="outline">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {scannedData.emergencyDetails.currentMedications && scannedData.emergencyDetails.currentMedications.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Current Medications</p>
                        <ul className="list-disc list-inside mt-1 text-sm">
                          {scannedData.emergencyDetails.currentMedications.map((med: string, i: number) => (
                            <li key={i}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scannedData.emergencyDetails.emergencyContact && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-medium" data-testid="text-emergency-contact">
                          {scannedData.emergencyDetails.emergencyContact}
                        </p>
                        {scannedData.emergencyDetails.emergencyPhone && (
                          <p className="text-sm font-mono" data-testid="text-emergency-phone">
                            {scannedData.emergencyDetails.emergencyPhone}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    setScannedData(null);
                    setCameraError(null);
                  }}
                  data-testid="button-clear-scan"
                >
                  Clear & Scan Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
