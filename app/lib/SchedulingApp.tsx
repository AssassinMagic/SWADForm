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
  const response = await fetch("/api/getSkateInventory");
  return response.json();
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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/makeReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, name, student_id: studentId, skate_time: selectedTime, skate_size: selectedSize, song_recommendation: songRecommendation }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      alert("Reservation successful!");
      setSkateSizes(await fetchSkateSizes());

      setSelectedTime(null);
      setSelectedSize(null);
      setEmail("");
      setName("");
      setStudentId("");
      setSongRecommendation("");

      window.location.href = "/confirmation";
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTimes = Array.from(new Set(Object.values(skateSizes).flatMap((size) => Object.keys(size.times))));

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
                  {Object.keys(skateSizes).map((size) => (
                    <button
                      key={size}
                      disabled={!skateSizes[size].times[time]}
                      className={`btn ${selectedTime === time && selectedSize === size ? "btn-selected" : ""}`}
                      onClick={() => { setSelectedTime(time); setSelectedSize(size); }}
                    >
                      {size} ({skateSizes[size].times[time] || 0} left)
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={isSubmitting}>Confirm Reservation</button>
        </form>
      </div>
    </div>
  );
}

export default SchedulingApp;
