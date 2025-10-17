import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  QrCode, 
  Upload, 
  Download, 
  Shield, 
  FileText, 
  Users, 
  Activity,
  Plus,
  X,
  Check
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { prepareFileForUpload, uploadToIPFS, encodeKey } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";

export default function PatientDashboard() {
  const { account, isConnected } = useWeb3();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordPurpose, setRecordPurpose] = useState("");
  const { toast } = useToast();

  // Fetch patient data
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["/api/patient", account],
    enabled: !!account,
  });

  // Fetch medical records
  const { data: records } = useQuery({
    queryKey: ["/api/patient/records", account],
    enabled: !!account,
  });

  // Fetch access grants
  const { data: accessGrants } = useQuery({
    queryKey: ["/api/patient/access-grants", account],
    enabled: !!account,
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ["/api/patient/audit-logs", account],
    enabled: !!account,
  });

  // Upload mutation with encryption
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !account) throw new Error("Missing file or account");
      
      // 1. Encrypt file client-side
      const encryptedPackage = await prepareFileForUpload(selectedFile);
      
      // 2. Upload encrypted file to IPFS (mock for now)
      const cid = await uploadToIPFS(encryptedPackage.encryptedData);
      
      // 3. Store metadata in database
      await apiRequest("/api/records/upload", {
        method: "POST",
        body: JSON.stringify({
          patientWallet: account,
          cid,
          fileHash: encryptedPackage.fileHash,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          purpose: recordPurpose,
          uploaderWallet: account,
          uploaderRole: "patient",
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Record uploaded",
        description: "Your medical record has been encrypted and uploaded securely",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/records", account] });
      setSelectedFile(null);
      setRecordPurpose("");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `healthguardx-qr-${patient?.uid}.png`;
      link.href = url;
      link.click();
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-heading font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to access the patient dashboard</p>
        </Card>
      </div>
    );
  }

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <Activity className="w-12 h-12 mx-auto text-primary mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Patient Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your medical identity and records</p>
          </div>
        </div>

        {/* UID Card with QR */}
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur border-border">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Health ID</p>
                  <h2 className="text-4xl font-heading font-bold text-primary" data-testid="text-patient-uid">
                    {patient?.uid || "HX-XXXXX"}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-32">KYC Status:</span>
                    <StatusBadge status={patient?.kycStatus || "pending"} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-32">Insurance:</span>
                    <StatusBadge status={patient?.isInsured ? "Active" : "Inactive"} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-32">Blood Type:</span>
                    <span className="font-mono text-sm">{patient?.bloodType || "Not set"}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={downloadQR} variant="outline" data-testid="button-download-qr">
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                  <Button variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-6 bg-white rounded-xl">
                  <QRCodeSVG 
                    id="qr-code"
                    value={patient?.qrHash || "HEALTH-ID"}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-total-records">{records?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Access Grants</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-access-grants">{accessGrants?.length || 0}</p>
                </div>
                <Users className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Audit Events</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-audit-events">{auditLogs?.length || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security</p>
                  <p className="text-2xl font-bold mt-1">Protected</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Medical Records</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-upload-record">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Medical Record</DialogTitle>
                  <DialogDescription>
                    Your file will be encrypted client-side before upload
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select File</label>
                    <Input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      data-testid="input-file"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Purpose</label>
                    <Textarea
                      placeholder="e.g., Lab results, X-ray scan, Prescription"
                      value={recordPurpose}
                      onChange={(e) => setRecordPurpose(e.target.value)}
                      data-testid="input-purpose"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    data-testid="button-upload-submit"
                    onClick={() => uploadMutation.mutate()}
                    disabled={!selectedFile || !recordPurpose || uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? "Encrypting..." : "Encrypt & Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {records && records.length > 0 ? (
                records.map((record: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border hover-elevate"
                    data-testid={`record-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{record.fileName}</p>
                        <p className="text-sm text-muted-foreground">{record.purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Encrypted</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No medical records uploaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Access Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border"
                    data-testid={`audit-log-${index}`}
                  >
                    <Activity className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{log.actionType}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No access events recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
