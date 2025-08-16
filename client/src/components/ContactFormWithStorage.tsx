import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertContactMessageSchema } from "@shared/schema";

// Create a more specific validation schema for the contact form
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
  status: z.string().default("new")
});

// Infer the type from our schema
type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactFormWithStorage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Set up the form with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      status: "new" // Default status for new messages
    }
  });

  // Set up the mutation to send the form data to the API
  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Message sent!",
        description: "We've received your message and will get back to you soon.",
        variant: "default"
      });
      
      // Reset the form
      reset();
      
      // Show success state
      setIsSuccess(true);
      
      // Hide success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    },
    onError: (error) => {
      // Show error message
      toast({
        title: "Message failed to send",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
      console.error("Contact form error:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    // Add the status if it doesn't exist
    const formData = {
      ...data,
      status: data.status || "new"
    };
    mutation.mutate(formData as ContactFormValues);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
          <p className="font-medium">Thank you for contacting us!</p>
          <p>Your message has been sent successfully. We'll get back to you as soon as possible.</p>
        </div>
      ) : null}
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Your Name
          </label>
          <Input
            id="name"
            placeholder="John Doe"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-gray-700">
          Subject
        </label>
        <Input
          id="subject"
          placeholder="How can we help you?"
          {...register("subject")}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p className="text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-gray-700">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Please provide details about your inquiry..."
          rows={6}
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {(isSubmitting || mutation.isPending) ? "Sending..." : "Send Message"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting || mutation.isPending}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}