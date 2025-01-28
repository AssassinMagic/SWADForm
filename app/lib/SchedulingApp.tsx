"use client";

import './styles.css';
import React, { useState, useEffect } from "react";

interface SkateSizes {
  [key: string]: {
    times: {
      [key: string]: number;
    };
  };
}

const fetchSkateSizes = async (): Promise<SkateSizes> => {
  const response = await fetch("/skate_sizes.csv");
  const text = await response.text();
  const lines = text.split("\n");
  const sizes: SkateSizes = {};

  lines.forEach((line) => {
    const [size, count] = line.split(",");
    sizes[size] = {
      times: {
        "12:00 - 1:00 PM": parseInt(count, 10),
        "1:00 - 2:00 PM ": parseInt(count, 10),
        "2:00 - 3:00 PM": parseInt(count, 10),
      },
    };
  });
  return sizes;
};

function SchedulingApp() {
  const [skateSizes, setSkateSizes] = useState<SkateSizes>({});
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    fetchSkateSizes().then(setSkateSizes);
  }, []);

  const handleSizeSelection = (size: string, time: string) => {
    setSkateSizes((prev) => {
      const updatedSizes = JSON.parse(JSON.stringify(prev)); // Deep clone to prevent state mutation issues
      if (updatedSizes[size].times[time] > 0) {
        updatedSizes[size].times[time] -= 1;
      }
      return updatedSizes;
    });
    alert(`You selected size ${size} for ${time}`);
  };

  const availableTimes = Array.from(
    new Set(
      Object.values(skateSizes).flatMap((size) => Object.keys(size.times))
    )
  );

  return (
    <div className="app-container">
      <div className="main-card">
        <h1>Skate Size Scheduling</h1>
        <div className="time-grid">
          {availableTimes.map((time) => (
            <div key={time} className="time-card">
              <h2 className="time-heading">{time}</h2>
              <div className="size-grid">
                {Object.keys(skateSizes).map((size) => {
                  const count = skateSizes[size]?.times[time] || 0;
                  return (
                    count > 0 && (
                      <button
                        key={size}
                        className="btn"
                        onClick={() => handleSizeSelection(size, time)}
                      >
                        {size} ({count} left)
                      </button>
                    )
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchedulingApp;
