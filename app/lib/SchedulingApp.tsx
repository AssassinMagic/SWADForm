"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">Skate Size Scheduling</h1>
      <div className="grid grid-cols-3 gap-4">
        {Object.keys(skateSizes).map((size) => (
          <Button key={size} onClick={() => handleSizeSelection(size)} disabled={Object.values(skateSizes[size].times).every(count => count === 0)}>
            {size} ({Object.values(skateSizes[size].times).reduce((a, b) => a + b, 0)} left)
          </Button>
        ))}
      </div>

      {selectedSize && (
        <Card className="w-full max-w-md mt-4">
          <CardContent>
            <h2 className="text-xl font-semibold">Available Times for {selectedSize}</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  onClick={() => handleTimeSelection(time)}
                  disabled={skateSizes[selectedSize].times[time] === 0}
                >
                  {time} ({skateSizes[selectedSize].times[time]} left)
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SchedulingApp;
