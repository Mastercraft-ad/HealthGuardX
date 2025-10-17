import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  QrCode, 
  FileText, 
  Upload, 
  Users,
  Activity,
  Stethoscope
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function DoctorDashboard() {
  const { isConnected, account } = useWeb3();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Fetch doctor stats
  const { data: stats } = useQuery({
    queryKey: ["/api/doctor/stats", account],
    enabled: !!account,
  });

  // Fetch recent patients
  const { data: recentPatients } = useQuery({
    queryKey: ["/api/doctor/patients", account],
    enabled: !!account,
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Patient care and treatment records</p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-qr-scanner">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Scanner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scan Patient QR</DialogTitle>
                  <DialogDescription>
                    Scan the patient's QR code to access their medical records
                  </DialogDescription>
                </DialogHeader>
                <div className="py-8">
                  <div className="aspect-square bg-card/50 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Camera feed will appear here</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by UID or patient name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-patient"
                />
              </div>
              <Button data-testid="button-search">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-total-patients">{stats?.totalPatients || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consultations</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-consultations">{stats?.consultations || 0}</p>
                </div>
                <Stethoscope className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Treatment Records</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-treatments">{stats?.treatments || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold mt-1" data-testid="text-active-cases">{stats?.activeCases || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Patients</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-add-treatment">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Treatment Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Treatment Record</DialogTitle>
                  <DialogDescription>
                    Record will be encrypted and signed with your wallet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Patient UID</label>
                    <Input placeholder="HX-XXXXX" data-testid="input-patient-uid" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Diagnosis</label>
                    <Input placeholder="e.g., Type 2 Diabetes" data-testid="input-diagnosis" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Treatment Summary</label>
                    <Textarea
                      placeholder="Detailed treatment notes..."
                      rows={4}
                      data-testid="input-treatment-summary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Attach Files</label>
                    <Input type="file" multiple data-testid="input-treatment-files" />
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1" data-testid="button-submit-treatment">
                      Sign & Submit
                    </Button>
                    <Button variant="outline" className="flex-1" data-testid="button-submit-claim">
                      Submit with Insurance Claim
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients && recentPatients.length > 0 ? (
                recentPatients.map((patient: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border hover-elevate cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                    data-testid={`patient-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{patient.uid}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={patient.lastVisit ? "Active" : "New"} />
                      <Button size="sm" variant="outline">View Records</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No patients yet. Search for a patient or scan their QR code.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
