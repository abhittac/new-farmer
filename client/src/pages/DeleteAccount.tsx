// components/account/DeleteAccountCard-delete.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { OTPInput } from "@/components/ui/otp-input";
import { useLocation } from "wouter";

export default function DeleteAccount() {
  const [showDeleteFlow, setShowDeleteFlow] = useState(false);
  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout, token, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const handleSendOtp = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const res = await apiRequest("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: user?.mobile,
          purpose: "account_deletion",
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

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message);

      toast({
        title: "Account Deleted",
        description: "You have been logged out.",
      });

      logout(); // Clean up localStorage and redirect

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ">
          <Trash2 className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showDeleteFlow ? (
          // Step 1: Initial Button
          <Button
            onClick={() => setShowDeleteFlow(true)}
            variant="outline"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        ) : step === "confirm" ? (
          // Step 2: Confirmation Step
          <div className="space-y-4">
            <p className="text-sm">
              This will <strong>permanently delete</strong> your data including
              orders, reviews, and subscriptions.
            </p>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Yes, I'm Sure"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteFlow(false);
                  setStep("confirm");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Step 3: OTP Entry Step
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Enter the OTP sent to your mobile number
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
                onClick={handleDeleteAccount}
                className="w-full"
                disabled={otp.length !== 6 || loading}
              >
                {loading ? "Deleting..." : "Verify & Delete"}
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
                    setStep("confirm");
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
