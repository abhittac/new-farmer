import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();

  return (
    // <Layout>
    // abhi
    <div className="container mx-auto py-10 flex justify-center relative top-16 mb-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            {/* Your payment has been processed successfully. */}
            Thank you for your purchase!
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/account")}>
            View Account
          </Button>
          <Button onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
    // </Layout>
  );
}
