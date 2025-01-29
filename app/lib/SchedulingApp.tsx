'use client'

import React, { useState, useEffect } from "react";
import './styles.css';

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
        "1:00 - 2:00 PM": parseInt(count, 10),
        "2:00 - 3:00 PM": parseInt(count, 10),
      },
    };
  });
  return sizes;
};

function SchedulingApp() {
  const [skateSizes, setSkateSizes] = useState<SkateSizes>({});
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [songRecommendation, setSongRecommendation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchSkateSizes().then(setSkateSizes);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTime || !selectedSize || !email || !name || !studentId) {
      alert("Please fill out all required fields.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Send email (Nodemailer)
      await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, name, student_id: studentId, skate_time: selectedTime, skate_size: selectedSize, song_recommendation: songRecommendation }),
      });

      // Save reservation in Neon database
      await fetch("/api/saveReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, name, student_id: studentId, skate_time: selectedTime, skate_size: selectedSize, song_recommendation: songRecommendation }),
      });

      alert(`Reservation confirmed! Time: ${selectedTime}, Size: ${selectedSize}`);

      // Update state and reset fields
      setSkateSizes((prev) => {
        const updatedSizes = { ...prev };
        if (updatedSizes[selectedSize!] && updatedSizes[selectedSize!].times[selectedTime!]) {
          updatedSizes[selectedSize!].times[selectedTime!] -= 1;
          if (updatedSizes[selectedSize!].times[selectedTime!] === 0) {
            delete updatedSizes[selectedSize!].times[selectedTime!];
          }
        }
        return updatedSizes;
      });

      setSelectedTime(null);
      setSelectedSize(null);
      setEmail("");
      setName("");
      setStudentId("");
      setSongRecommendation("");

      window.location.href = "/confirmation";
    } catch (error) {
      console.error("Error processing reservation:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleFormSubmit} className="form">
          <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Enter your student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Song recommendation (optional)" value={songRecommendation} onChange={(e) => setSongRecommendation(e.target.value)} />
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
                          type="button"
                          key={size}
                          className={`btn ${selectedTime === time && selectedSize === size ? "btn-selected" : ""}`}
                          onClick={() => {
                            setSelectedTime(time);
                            setSelectedSize(size);
                          }}
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
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Confirm Reservation"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SchedulingApp;
