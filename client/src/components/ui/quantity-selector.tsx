import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuantitySelectorProps {
  initialQuantity?: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  initialQuantity = 1,
  min = 1,
  max = 999,
  onChange,
  disabled = false
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleIncrement = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange(newValue);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      const clampedValue = Math.min(Math.max(value, min), max);
      setQuantity(clampedValue);
      onChange(clampedValue);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className="h-9 w-9 rounded-r-none border-r-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <Input
        type="number"
        value={quantity}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        className="h-9 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className="h-9 w-9 rounded-l-none border-l-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}