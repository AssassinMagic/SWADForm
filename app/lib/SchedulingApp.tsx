"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const SchedulingApp: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const skateSizes = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  };
  const availableTimes = ['10:00 AM', '11:00 AM', '1:00 PM'];

  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
  };

  const handleTimeSelection = (time: string) => {
    alert(`You selected ${time} for ${selectedSize}`);
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">Skate Size Scheduling</h1>
      <div className="grid grid-cols-3 gap-4">
        {Object.keys(skateSizes).map((size) => (
          <Button key={size} onClick={() => handleSizeSelection(size)}>
            {skateSizes[size as keyof typeof skateSizes]}
          </Button>
        ))}
      </div>

      {selectedSize && (
        <Card className="w-full max-w-md mt-4">
          <CardContent>
            <h2 className="text-xl font-semibold">Available Times for {selectedSize}</h2>
            <Select onValueChange={handleTimeSelection}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time} onValueChange={handleTimeSelection}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchedulingApp;