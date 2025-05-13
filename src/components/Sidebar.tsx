import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Upload,
  Search,
  SaveAll,
  LineChart,
  GitCompare,
  CreditCard,
  TrendingUp,
  Target,
  Bot,
  Receipt,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeatureGate } from "@/components/FeatureGate";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="space-y-1">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/dashboard/upload">
                <Button variant="ghost" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <Link to="/dashboard/analyze">
                <Button variant="ghost" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </Link>
              <Link to="/dashboard/saved">
                <Button variant="ghost" className="w-full justify-start">
                  <SaveAll className="mr-2 h-4 w-4" />
                  Saved Analyses
                </Button>
              </Link>
              <Link to="/dashboard/charts">
                <Button variant="ghost" className="w-full justify-start">
                  <LineChart className="mr-2 h-4 w-4" />
                  Charts
                </Button>
              </Link>
              <Link to="/dashboard/compare">
                <Button variant="ghost" className="w-full justify-start">
                  <GitCompare className="mr-2 h-4 w-4" />
                  Compare
                </Button>
              </Link>
              <Link to="/dashboard/transactions">
                <Button variant="ghost" className="w-full justify-start">
                  <Receipt className="mr-2 h-4 w-4" />
                  Transactions
                </Button>
              </Link>
              <Link to="/expense-tracker">
                <Button variant="ghost" className="w-full justify-start">
                  <Receipt className="mr-2 h-4 w-4" />
                  Expense Tracker
                </Button>
              </Link>
              <FeatureGate feature="advancedAnalytics">
                <Link to="/dashboard/advanced-analytics">
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Advanced Analytics
                  </Button>
                </Link>
              </FeatureGate>
              <FeatureGate feature="financialGoals">
                <Link to="/dashboard/financial-goals">
                  <Button variant="ghost" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    Financial Goals
                  </Button>
                </Link>
              </FeatureGate>
              <FeatureGate feature="aiAdvisor">
                <Link to="/dashboard/ai-advisor">
                  <Button variant="ghost" className="w-full justify-start">
                    <Bot className="mr-2 h-4 w-4" />
                    AI Advisor
                  </Button>
                </Link>
              </FeatureGate>
              <FeatureGate feature="budgetPlanner">
                <Link to="/dashboard/budgets">
                  <Button variant="ghost" className="w-full justify-start">
                    <PiggyBank className="mr-2 h-4 w-4" />
                    Budget Planner
                  </Button>
                </Link>
              </FeatureGate>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}