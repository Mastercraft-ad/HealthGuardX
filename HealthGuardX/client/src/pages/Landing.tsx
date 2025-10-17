import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  QrCode, 
  Lock, 
  Activity, 
  FileText, 
  Zap,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Landing() {
  const { connectWallet, isConnected, account, isAdmin, loading } = useWeb3();

  // Fetch live activity feed from contract events
  const { data: activityFeed } = useQuery({
    queryKey: ["/api/activity-feed"],
    refetchInterval: 5000, // Real-time updates every 5s
  });

  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "Emergency QR",
      description: "Instant access to critical medical information via QR code scan, even offline."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Encrypted Records",
      description: "Client-side AES-256 encryption ensures your health data stays private and secure."
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Role-Based Dashboards",
      description: "Custom interfaces for patients, doctors, hospitals, insurers, and emergency responders."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Insurance Automation",
      description: "Smart contract-powered claim verification and instant payouts with fraud detection."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Immutable Audit Logs",
      description: "Every access and action recorded on-chain for complete transparency and compliance."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Offline-Ready QR/NFC",
      description: "Download QR cards and NFC tags for emergency access without internet connectivity."
    }
  ];

  const workflowSteps = [
    { step: 1, title: "Connect & Onboard", description: "Connect your wallet and register as a patient or healthcare provider" },
    { step: 2, title: "Complete KYC", description: "Upload encrypted identity documents for admin verification" },
    { step: 3, title: "Generate Health ID", description: "Receive your unique UID and downloadable QR code" },
    { step: 4, title: "Emergency Scan", description: "First responders scan QR to access critical medical summary" },
    { step: 5, title: "Treatment & Claims", description: "Doctors submit encrypted records, insurers approve claims automatically" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-heading font-bold">HealthGuardX</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">About</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
              <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition">Workflow</a>
              <a href="#activity" className="text-sm text-muted-foreground hover:text-foreground transition">Live Activity</a>
            </nav>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/40">
                  ADMIN MODE
                </Badge>
              )}
              {!isConnected ? (
                <Button 
                  onClick={connectWallet} 
                  disabled={loading}
                  className="bg-gradient-to-r from-accent to-orange-600 hover:from-accent/90 hover:to-orange-700 text-white"
                  data-testid="button-connect-wallet"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <Link href={isAdmin ? "/admin" : "/patient"}>
                  <Button variant="default" data-testid="button-dashboard">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card opacity-50" />
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-heading font-bold leading-tight">
                HealthGuardX — Your Life-Saving <span className="text-primary">Decentralized</span> Medical Identity
              </h2>
              
              <p className="text-xl text-muted-foreground">
                Instant, secure medical access. Tamper-proof treatment logs. Fraud-resistant insurance payouts.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={connectWallet}
                  disabled={loading || isConnected}
                  className="bg-gradient-to-r from-accent to-orange-600 hover:from-accent/90 hover:to-orange-700 text-white hover-elevate active-elevate-2 text-base"
                  data-testid="button-hero-connect"
                >
                  {isConnected ? "Connected" : "Connect Wallet & Generate Health ID"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {isConnected && account && (
                <Card className="p-4 bg-card/50 backdrop-blur border-border">
                  <p className="text-sm text-muted-foreground">Connected Wallet</p>
                  <p className="font-mono text-sm mt-1 text-foreground" data-testid="text-wallet-address">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </Card>
              )}
            </div>

            <div className="relative">
              <Card className="p-8 bg-card/50 backdrop-blur-lg border-border shadow-2xl shadow-primary/10">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Activity className="w-16 h-16 mx-auto text-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">Dashboard Preview</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-4xl font-heading font-semibold">Mission-Critical Healthcare Infrastructure</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              HealthGuardX delivers production-quality decentralized medical identity and insurance systems built on blockchain. Designed for low-connectivity contexts, our platform ensures instant emergency access, tamper-proof audit trails, and fraud-resistant insurance automation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Badge variant="outline" className="text-sm">NIST/ISO Compliant</Badge>
              <Badge variant="outline" className="text-sm">BlockDAG Compatible</Badge>
              <Badge variant="outline" className="text-sm">Zero-Knowledge Proofs</Badge>
              <Badge variant="outline" className="text-sm">Immutable Audit Logs</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-heading font-semibold text-center mb-16">Platform Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 bg-card/50 backdrop-blur border-border hover-elevate transition-all duration-300"
                data-testid={`card-feature-${index}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-heading font-semibold text-center mb-16">User Journey</h3>
          
          <div className="relative">
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-primary/20 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {workflowSteps.map((item, index) => (
                <div key={index} className="relative" data-testid={`workflow-step-${index}`}>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold relative z-10">
                      {item.step}
                    </div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section id="activity" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-heading font-semibold text-center mb-16">Live Network Activity</h3>
          
          <Card className="p-6 bg-card/50 backdrop-blur border-border">
            <div className="space-y-4 h-96 overflow-y-auto" data-testid="activity-feed">
              {activityFeed && activityFeed.length > 0 ? (
                activityFeed.map((event: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 hover-elevate">
                    <Activity className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Waiting for network activity...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-heading font-semibold">HealthGuardX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HealthGuardX. Decentralized Medical Identity Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
