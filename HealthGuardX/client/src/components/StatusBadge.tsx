import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusLower = status.toLowerCase();
  
  const getStatusStyles = () => {
    switch (statusLower) {
      case "approved":
      case "paid":
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "rejected":
      case "expired":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "emergency":
        return "bg-orange-500/30 text-orange-300 border-orange-500/50 animate-pulse";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "border font-medium text-xs",
        getStatusStyles(),
        className
      )}
      data-testid={`badge-status-${statusLower}`}
    >
      {status}
    </Badge>
  );
}
