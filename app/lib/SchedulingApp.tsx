"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface SkateSizes {
  [key: string]: {
    times: {
      [key: string]: number;
    };
  };
}

const fetchSkateSizes = async (): Promise<SkateSizes> => {
  const response = await fetch('/skate_sizes.csv');
  const text = await response.text();
  const lines = text.split('\n');
  const sizes: SkateSizes = {};
  
  lines.forEach((line) => {
    const [size, count] = line.split(',');
    sizes[size] = {
      times: {
        '10:00 AM': parseInt(count, 10),
        '11:00 AM': parseInt(count, 10),
        '1:00 PM': parseInt(count, 10),
      },
    };
  });
  return sizes;
};

function SchedulingApp() {
  const [skateSizes, setSkateSizes] = useState<SkateSizes>({});
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    fetchSkateSizes().then(setSkateSizes);
  }, []);

  const handleSizeSelection = (size: string) => {
    if (skateSizes[size]) {
      setSelectedSize(size);
      setAvailableTimes(Object.keys(skateSizes[size].times));
    }
  };

  const handleTimeSelection = (time: string) => {
    if (selectedSize) {
      setSkateSizes((prev) => {
        const updatedSizes = JSON.parse(JSON.stringify(prev)); // Deep clone to prevent state mutation issues
        if (updatedSizes[selectedSize].times[time] > 0) {
          updatedSizes[selectedSize].times[time] -= 1;
        }
        return updatedSizes;
      });
      alert(`You selected ${time} for ${selectedSize}`);
      setSelectedSize(null); // Clear selection after scheduling
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Skate Size Scheduling</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.keys(skateSizes).map((size) => (
            <Card key={size} className="p-4 shadow-md bg-gray-50 rounded-lg flex flex-col gap-3">
              <Button
                className="w-full text-left py-3 text-lg font-medium bg-white text-gray-800 border border-gray-400 rounded-md focus:outline-none"
                onClick={() => handleSizeSelection(size)}
                disabled={Object.values(skateSizes[size].times).every(count => count === 0)}
              >
                {size} ({Object.values(skateSizes[size].times).reduce((a, b) => a + b, 0)} left)
              </Button>
              {selectedSize === size && (
                <Select onValueChange={(value) => handleTimeSelection(value)}>
                  <SelectTrigger className="w-full py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-800 shadow-sm">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        onValueChange={(value) => handleTimeSelection(value)}
                      >
                        {time} ({skateSizes[size].times[time]} left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchedulingApp;
