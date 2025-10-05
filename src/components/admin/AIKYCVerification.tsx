import { useState } from "react";
import { useAIKYCVerification } from "@/hooks/useAIKYCVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIKYCVerificationProps {
  kycSubmission: {
    id: string;
    full_name: string;
    date_of_birth: string;
    document_type: string;
  };
  documentImageUrl: string; // Could be from storage or base64
  onVerificationComplete?: (result: any) => void;
}

export const AIKYCVerification = ({
  kycSubmission,
  documentImageUrl,
  onVerificationComplete,
}: AIKYCVerificationProps) => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { mutate: verifyKYC, isPending } = useAIKYCVerification();

  const handleVerify = async () => {
    // Convert image to base64 if needed
    let base64Image = documentImageUrl;
    
    if (!documentImageUrl.startsWith('data:')) {
      // If it's a URL, fetch and convert to base64
      try {
        const response = await fetch(documentImageUrl);
        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Failed to convert image:", error);
        return;
      }
    }

    verifyKYC(
      {
        documentImage: base64Image,
        documentType: kycSubmission.document_type,
        fullName: kycSubmission.full_name,
        dateOfBirth: kycSubmission.date_of_birth,
      },
      {
        onSuccess: (result) => {
          setVerificationResult(result);
          onVerificationComplete?.(result);
        },
      }
    );
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "approve":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "reject":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "manual_review":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Verification
            </CardTitle>
            <CardDescription>
              Automated document analysis using Gemini 2.5 Pro
            </CardDescription>
          </div>
          <Button
            onClick={handleVerify}
            disabled={isPending || !!verificationResult}
            variant="default"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : verificationResult ? (
              "Verified"
            ) : (
              "Run AI Verification"
            )}
          </Button>
        </div>
      </CardHeader>

      {isPending && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing document...</span>
              <span className="text-muted-foreground">This may take 10-30 seconds</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        </CardContent>
      )}

      {verificationResult && (
        <CardContent className="space-y-4">
          {/* Main Result */}
          <Alert>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getRecommendationIcon(verificationResult.recommendation)}
                <div>
                  <div className="font-semibold capitalize">
                    {verificationResult.recommendation.replace("_", " ")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: <span className={getConfidenceColor(verificationResult.confidence)}>
                      {verificationResult.confidence}%
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant={verificationResult.isAuthentic ? "default" : "destructive"}>
                {verificationResult.isAuthentic ? "Authentic" : "Suspicious"}
              </Badge>
            </div>
          </Alert>

          {/* Reasoning */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Analysis</div>
            <div className="text-sm text-muted-foreground">
              {verificationResult.reasoning}
            </div>
          </div>

          {/* Extracted Data */}
          {verificationResult.extractedData && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Extracted Information</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(verificationResult.extractedData).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>{" "}
                      <span className="font-medium">{value as string}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Face Detection */}
          {verificationResult.faceDetection && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Face Detection</div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Detected:</span>{" "}
                  <Badge variant={verificationResult.faceDetection.faceDetected ? "default" : "destructive"}>
                    {verificationResult.faceDetection.faceDetected ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality:</span>{" "}
                  <span className="capitalize">{verificationResult.faceDetection.faceQuality}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tampering:</span>{" "}
                  <Badge variant={verificationResult.faceDetection.photoTampering ? "destructive" : "default"}>
                    {verificationResult.faceDetection.photoTampering ? "Detected" : "None"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Indicators */}
          {verificationResult.fraudIndicators && verificationResult.fraudIndicators.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Fraud Indicators Detected:</div>
                <ul className="list-disc list-inside text-sm">
                  {verificationResult.fraudIndicators.map((indicator: string, i: number) => (
                    <li key={i}>{indicator}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
};
