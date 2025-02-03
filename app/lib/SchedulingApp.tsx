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

    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);

    try {
      // Step 1: Make the reservation (this should decrement the count)
      const reservationResponse = await fetch("/api/makeReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, name, student_id: studentId, skate_time: selectedTime, skate_size: selectedSize, song_recommendation: songRecommendation }),
      });

      const reservationResult = await reservationResponse.json();
      if (!reservationResponse.ok) throw new Error(reservationResult.error);

      // Step 2: Only send email AFTER confirming reservation
      await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, name, student_id: studentId, skate_time: selectedTime, skate_size: selectedSize, song_recommendation: songRecommendation }),
      });

      // Step 3: Fetch updated inventory
      setSkateSizes(await fetchSkateSizes());

      alert("Reservation successful!");
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
        <p className="description">Reserve your preferred skate size and time slot (L is for Women, M is for Men, Y is for Youth, Skates with letters are figure skates, Skates without letters are hockey skates). Please ensure you fill out all required details before confirming your reservation.</p>
        <form onSubmit={handleFormSubmit} className="form">
          <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Enter your student ID (N/A if you don't have one)" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Song recommendation (optional)" value={songRecommendation} onChange={(e) => setSongRecommendation(e.target.value)} />

          <div className="time-grid">
            {availableTimes.map((time) => (
              <div key={time} className="time-card">
                <h2 className="time-heading">{time}</h2>
                <div className="size-grid">
                  {Object.keys(skateSizes).map((size) => (
                    <button
                      type="button" 
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
      <footer className="footer">
        <div className="footer-content">
          <img src="/logo.png" alt="Science & Engineering Student Board Logo" className="logo" />
          <span>© 2025 Science & Engineering Student Board</span>
          <div className="footer-links">
            {['Terms', 'Privacy', 'Security', 'Status', 'Docs', 'Contact', 'Manage cookies', 'Do not share my personal information'].map((text, index) => (
              <a key={index} href={`/${text.toLowerCase().replace(/ /g, '-')}`} className="footer-link">{text}</a>
            ))}
          </div>
        </div>
      </footer>
      <style jsx>{`
        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .logo {
          height: 40px;
          margin-right: 10px;
        }
        .footer-links {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .footer-link {
          text-decoration: none;
          color: inherit;
        }
      `}</style>
    </div>
  );
}

export default SchedulingApp;
