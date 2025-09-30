import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const kycSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  country: z.string().min(2, 'Please select a country'),
  documentType: z.string().min(1, 'Please select a document type'),
  documentNumber: z.string().min(5, 'Document number is too short').max(50),
});

interface KYCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
}

export const KYCModal = ({ open, onOpenChange, walletAddress }: KYCModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    documentType: '',
    documentNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = kycSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const validatedData = validation.data;
      
      const { error } = await supabase
        .from('kyc_submissions')
        .insert({
          wallet_address: walletAddress,
          full_name: validatedData.fullName,
          email: validatedData.email,
          country: validatedData.country,
          document_type: validatedData.documentType,
          document_number: validatedData.documentNumber,
          status: 'pending'
        });

      if (error) throw error;

      // Create or update profile
      await supabase
        .from('profiles')
        .upsert({
          wallet_address: walletAddress,
          email: validatedData.email,
          kyc_status: 'pending'
        }, {
          onConflict: 'wallet_address'
        });

      toast.success('KYC application submitted successfully');
      onOpenChange(false);
      setFormData({
        fullName: '',
        email: '',
        country: '',
        documentType: '',
        documentNumber: '',
      });
    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      toast.error(error.message || 'Failed to submit KYC application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">KYC Verification</DialogTitle>
              <DialogDescription>
                Complete your identity verification to unlock higher investment limits
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full legal name"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country of Residence *</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">ID Document Type *</Label>
              <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="national_id">National ID Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number *</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                placeholder="Enter your document number"
                required
                maxLength={50}
              />
            </div>
          </div>

          <div className="bg-muted/20 p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm">Your information is encrypted and stored securely</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm">Verification typically takes 24-48 hours</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm">Increase your investment limit to 100 ETH</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};