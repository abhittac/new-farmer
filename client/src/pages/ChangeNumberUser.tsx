import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OTPInput } from "@/components/ui/otp-input";
import { Input } from "@/components/ui/input";

export default function ChangeNumberUser() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [showChangeFlow, setShowChangeFlow] = useState(false);
  const [step, setStep] = useState<"input" | "otp">("input");
  const [newNumber, setNewNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const res = await apiRequest("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: user?.mobile,
          purpose: "change_number",
        }),
      });

      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message);

      toast({
        title: "OTP Sent",
        description: "Check your mobile number.",
      });
      setStep("otp");
    } catch (error: any) {
      toast({
        title: "OTP Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/api/auth/change-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp, value: newNumber }),
      });

      toast({
        title: "Number Updated",
        description: `Your number has been changed to ${newNumber}`,
      });

      // Reset form
      setShowChangeFlow(false);
      setStep("input");
      setNewNumber("");
      setOtp("");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Change Number
        </CardTitle>
        <CardDescription>
          Update the mobile number associated with your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showChangeFlow ? (
          <Button
            onClick={() => setShowChangeFlow(true)}
            variant="outline"
            className="w-full"
          >
            <Phone className="h-4 w-4 mr-2" />
            Change Number
          </Button>
        ) : step === "input" ? (
          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="Enter new mobile number"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-4">
              <Button
                onClick={handleSendOtp}
                disabled={!newNumber || newNumber.length < 10 || loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangeFlow(false);
                  setStep("input");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Enter the OTP sent to <strong>{newNumber}</strong>
            </p>
            <OTPInput
              length={6}
              value={otp}
              onChange={setOtp}
              onComplete={setOtp}
              disabled={loading}
            />
            <div className="space-y-3">
              <Button
                onClick={handleVerifyAndChange}
                className="w-full"
                disabled={otp.length !== 6 || loading}
              >
                {loading ? "Verifying..." : "Verify & Update"}
              </Button>
              <div className="flex justify-between text-sm">
                <Button
                  variant="ghost"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("input");
                    setOtp("");
                  }}
                >
                  ← Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
