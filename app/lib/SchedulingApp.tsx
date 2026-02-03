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

  const timeSlots = ["5-5:45pm", "6-6:45pm", "7-7:45pm"];
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

      // Email is now handled by the server in makeReservation
      
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
        <h1>Skate with a Date RSVP</h1>
        <p className="description">This is the skate reservation for for SWAD 2026 on February 14th. Please enter your information below. This will be used to prefill sections of your waiver, which will be signed in person at the event. If this form is not working, please contact jay00015@umn.edu.</p>
        <form onSubmit={handleFormSubmit} className="form">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">First Name</label>
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Last Name</label>
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Student ID</label>
            <input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Phone Number</label>
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Email Address</label>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Home Address</label>
            <input type="text" placeholder="Home Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          
          <div className="row-inputs">
             <div className="flex flex-col gap-1 flex-1">
               <label className="font-semibold text-gray-700">Height</label>
               <input type="text" placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} required />
             </div>
             <div className="flex flex-col gap-1 flex-1">
               <label className="font-semibold text-gray-700">Weight</label>
               <input type="text" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} required />
             </div>
             <div className="flex flex-col gap-1 flex-1">
               <label className="font-semibold text-gray-700">Age</label>
               <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Skating Ability</label>
            <select value={skatingAbility} onChange={(e) => setSkatingAbility(e.target.value)} required className="custom-select">
              <option value="" disabled>Select Skating Ability</option>
              {abilityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Do you have your own skates?</label>
            <select value={skatePreference} onChange={(e) => setSkatePreference(e.target.value)} required className="custom-select">
              <option value="" disabled>Select Option</option>
              {skatePreferences.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          {skatePreference === "Use Provided Skates" && (
             <div className="flex flex-col gap-2">
               <label className="font-semibold text-gray-700">Shoe Size</label>
               <input type="text" placeholder="Shoe Size" value={shoeSize} onChange={(e) => setShoeSize(e.target.value)} required />
             </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Select Time Slot</label>
            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required className="custom-select">
              <option value="" disabled>Select Time Slot</option>
               {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="mt-4 text-xl py-4 font-bold shadow-md hover:shadow-lg transition-all">
            {isSubmitting ? "Submitting..." : "Confirm Reservation"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SchedulingApp;
