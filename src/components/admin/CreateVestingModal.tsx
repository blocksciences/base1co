import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CreateVestingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

export const CreateVestingModal = ({ open, onOpenChange, projectId, onSuccess }: CreateVestingModalProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryAddress: '',
    scheduleType: 'team',
    totalAmount: '',
    cliffDays: '90',
    vestingDays: '365',
    revocable: 'true',
  });

  const handleCreate = async () => {
    if (!formData.beneficiaryAddress || !formData.totalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      // Calculate start time and durations
      const startTime = new Date();
      const cliffDuration = parseInt(formData.cliffDays) * 24 * 60 * 60; // Convert days to seconds
      const vestingDuration = parseInt(formData.vestingDays) * 24 * 60 * 60;

      const { error } = await supabase
        .from('vesting_schedules')
        .insert({
          project_id: projectId,
          beneficiary_address: formData.beneficiaryAddress,
          schedule_type: formData.scheduleType,
          total_amount: parseFloat(formData.totalAmount),
          released_amount: 0,
          start_time: startTime.toISOString(),
          cliff_duration: cliffDuration,
          vesting_duration: vestingDuration,
          revocable: formData.revocable === 'true',
          contract_address: '0x0000000000000000000000000000000000000000', // Placeholder
        });

      if (error) throw error;

      toast.success('Vesting schedule created successfully');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        beneficiaryAddress: '',
        scheduleType: 'team',
        totalAmount: '',
        cliffDays: '90',
        vestingDays: '365',
        revocable: 'true',
      });
    } catch (error: any) {
      console.error('Error creating vesting schedule:', error);
      toast.error(error.message || 'Failed to create vesting schedule');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Vesting Schedule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary Address *</Label>
            <Input
              id="beneficiary"
              placeholder="0x..."
              value={formData.beneficiaryAddress}
              onChange={(e) => setFormData({ ...formData, beneficiaryAddress: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select value={formData.scheduleType} onValueChange={(value) => setFormData({ ...formData, scheduleType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Total Token Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000000"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliff">Cliff Period (Days)</Label>
              <Input
                id="cliff"
                type="number"
                value={formData.cliffDays}
                onChange={(e) => setFormData({ ...formData, cliffDays: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vesting">Vesting Duration (Days)</Label>
              <Input
                id="vesting"
                type="number"
                value={formData.vestingDays}
                onChange={(e) => setFormData({ ...formData, vestingDays: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revocable">Revocable</Label>
            <Select value={formData.revocable} onValueChange={(value) => setFormData({ ...formData, revocable: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating} className="bg-gradient-primary">
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Schedule'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};