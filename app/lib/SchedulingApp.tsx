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
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [skatePreference, setSkatePreference] = useState<string>("");
  const [shoeSize, setShoeSize] = useState<string>("");
  const [skatingAbility, setSkatingAbility] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timeSlots = ["5-6pm", "6-7pm", "7-8pm"];
  const abilityLevels = ["Beginner", "Beginner/Intermediate", "Intermediate", "Intermediate/Expert", "Expert"];
  const skatePreferences = ["Bring Own Skates", "Use Provided Skates"];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !phone || !email || !address || !height || !weight || !age || !studentId || !skatingAbility || !selectedTime || !skatePreference) {
      alert("Please fill out all required fields.");
      return;
    }

    if (skatePreference === "Use Provided Skates" && !shoeSize) {
      alert("Please enter your shoe size.");
      return;
    }

    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);

    try {
      // Step 1: Make the reservation
      const reservationResponse = await fetch("/api/makeReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          phone, 
          email, 
          address, 
          height, 
          weight, 
          age, 
          student_id: studentId,
          skate_preference: skatePreference,
          shoe_size: skatePreference === "Use Provided Skates" ? shoeSize : null,
          skating_ability: skatingAbility, 
          skate_time: selectedTime 
        }),
      });

      const reservationResult = await reservationResponse.json();
      if (!reservationResponse.ok) throw new Error(reservationResult.error);

      // Step 2: Send email
      await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          phone, 
          email, 
          address, 
          height, 
          weight, 
          age,
          student_id: studentId,
          skate_preference: skatePreference,
          shoe_size: skatePreference === "Use Provided Skates" ? shoeSize : "N/A",
          skating_ability: skatingAbility, 
          skate_time: selectedTime 
        }),
      });

      alert("Reservation successful!");
      // Reset form
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setHeight("");
      setWeight("");
      setAge("");
      setStudentId("");
      setSkatePreference("");
      setShoeSize("");
      setSkatingAbility("");
      setSelectedTime("");

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

  return (
    <div className="app-container">
      <div className="main-card">
        <h1>Skate Scheduling</h1>
        <p className="description">Please fill out the form below to reserve your slot.</p>
        <form onSubmit={handleFormSubmit} className="form">
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="Home Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          
          <div className="row-inputs">
             <input type="text" placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} required />
             <input type="text" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} required />
             <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
          </div>

          <select value={skatingAbility} onChange={(e) => setSkatingAbility(e.target.value)} required>
            <option value="" disabled>Select Skating Ability</option>
            {abilityLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select value={skatePreference} onChange={(e) => setSkatePreference(e.target.value)} required>
            <option value="" disabled>Do you have your own skates?</option>
            {skatePreferences.map(pref => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>

          {skatePreference === "Use Provided Skates" && (
             <input type="text" placeholder="Shoe Size" value={shoeSize} onChange={(e) => setShoeSize(e.target.value)} required />
          )}
          
          <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required>
            <option value="" disabled>Select Time Slot</option>
             {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>

          <button type="submit" disabled={isSubmitting}>Confirm Reservation</button>
        </form>
      </div>
    </div>
  );
}

export default SchedulingApp;
