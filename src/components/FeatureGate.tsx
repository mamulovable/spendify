import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';

interface FeatureGateProps {
  children: ReactNode;
  feature: keyof Omit<SubscriptionLimits, 'maxStatements' | 'maxSavedAnalyses'>;
}

export function FeatureGate({ children, feature }: FeatureGateProps) {
  const { limits, activePlan } = useSubscription();
  const navigate = useNavigate();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  if (limits[feature]) {
    return <>{children}</>;
  }

  // If the feature is not available, show upgrade dialog
  return (
    <>
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              This feature is not available on your current plan ({activePlan?.name || 'Free'}). 
              Upgrade to access {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate('/pricing')}>
              View Plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div onClick={() => setShowUpgradeDialog(true)}>
        {children}
      </div>
    </>
  );
} 