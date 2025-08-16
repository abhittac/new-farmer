import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  value?: string;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ 
  length = 6, 
  onComplete, 
  value = '', 
  onChange, 
  disabled = false,
  error = false 
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(length).fill(null));

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, length);
      const paddedOtp = [...otpArray, ...new Array(length - otpArray.length).fill('')];
      setOtp(paddedOtp);
    }
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const newValue = element.value;
    
    if (!/^\d*$/.test(newValue)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = newValue.slice(-1); // Take only the last digit
    setOtp(newOtp);
    
    const otpString = newOtp.join('');
    onChange?.(otpString);
    
    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Call onComplete when all fields are filled
    if (otpString.length === length && !otpString.includes('')) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    
    if (pastedData) {
      const newOtp = pastedData.split('');
      const paddedOtp = [...newOtp, ...new Array(length - newOtp.length).fill('')];
      setOtp(paddedOtp);
      
      const otpString = newOtp.join('');
      onChange?.(otpString);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (otpString.length === length) {
        onComplete(otpString);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold border rounded-md",
            "focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-gray-300",
            "transition-colors"
          )}
        />
      ))}
    </div>
  );
}