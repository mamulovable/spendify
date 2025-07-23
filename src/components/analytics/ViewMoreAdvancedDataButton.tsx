import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ViewMoreAdvancedDataButtonProps {
  className?: string;
}

export const ViewMoreAdvancedDataButton = ({ className }: ViewMoreAdvancedDataButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard/more-analytics");
  };

  return (
    <Button 
      onClick={handleClick}
      variant="default"
      className={`gap-2 ${className}`}
    >
      <BarChart2 className="w-4 h-4" />
      View More Advanced Data
    </Button>
  );
};