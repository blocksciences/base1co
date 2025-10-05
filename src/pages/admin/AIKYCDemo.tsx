import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AIKYCVerification } from "@/components/admin/AIKYCVerification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIKYCDemo = () => {
  const [formData, setFormData] = useState({
    fullName: "John Smith",
    dateOfBirth: "1990-01-15",
    documentType: "passport",
  });
  const [documentImage, setDocumentImage] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">AI KYC Verification Demo</h1>
              <p className="text-muted-foreground mt-2">
                Test the AI-powered document verification using Gemini 2.5 Pro
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> Upload an identity document (passport, driver's license, ID card) 
                and our AI will analyze it for authenticity, extract information, detect faces, and flag potential fraud.
                This uses Google's Gemini 2.5 Pro multimodal AI which is currently <strong>FREE</strong> during the promotional period.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Upload Document for Verification</CardTitle>
                <CardDescription>
                  Supported formats: JPG, PNG, PDF (first page)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Document Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="document"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {documentImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentImage("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {documentImage && (
                  <div className="border rounded-lg p-4">
                    <img
                      src={documentImage}
                      alt="Document preview"
                      className="max-w-full h-auto max-h-96 mx-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {documentImage && (
              <AIKYCVerification
                kycSubmission={{
                  id: "demo",
                  full_name: formData.fullName,
                  date_of_birth: formData.dateOfBirth,
                  document_type: formData.documentType,
                }}
                documentImageUrl={documentImage}
                onVerificationComplete={setVerificationResult}
              />
            )}

            {verificationResult && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong> Based on the AI recommendation, you can now manually review 
                  the document and make a final decision. The AI analysis serves as a powerful assistant 
                  to help admins make faster, more accurate decisions.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIKYCDemo;
