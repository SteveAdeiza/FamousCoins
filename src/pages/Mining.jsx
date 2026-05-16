import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import coinImg from "../assets/fmc-coin.png";

export default function Mining() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [hashRate, setHashRate] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const intervalRef = useRef(null);

  // Fetch user data on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setBalance(data.balance || 0);
          setHashRate(data.hashRate || 0);
          setIsMining(data.isMining || false);
          setTimeLeft(data.timeLeft || 0);
        }
      } catch (err) {
        console.error("Error fetching mining data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Mining loop
  useEffect(() => {
    if (isMining && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          const earned = hashRate / 3600;

          setEarnings((prev) => prev + earned);
          setBalance((prev) => prev + earned);

          const userRef = doc(db, "users", user.uid);
          updateDoc(userRef, {
            timeLeft: newTime,
            balance: increment(earned),
          }).catch((err) => console.error("Update error:", err));

          if (newTime <= 0) {
            setIsMining(false);
            updateDoc(userRef, { isMining: false }).catch((err) =>
              console.error("Update error:", err)
            );
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMining, hashRate, user]);

  const startMining = async () => {
    if (!user || isMining) return;

    try {
      setIsMining(true);
      setTimeLeft(86400);
      setEarnings(0);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isMining: true,
        timeLeft: 86400
      });
    } catch (err) {
      console.error("Error starting mining:", err);
      setIsMining(false);
      setTimeLeft(0);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-gray-400">Please log in to start mining</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 tracking-wide">
        <span className="text-[#D4AF37]">FMC</span> Mining
      </h1>

      <div className="relative mb-10">
        <img
          src={coinImg}
          alt="FMC Coin"
          className={`w-48 h-48 rounded-full shadow-2xl ${
            isMining? "animate-spin-slow drop-shadow-[0_0_25px_#D4AF37]" : ""
          }`}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4AF37]/20 to-transparent blur-2xl"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
        {[
          { label: "Balance", value: balance.toFixed(6), suffix: "FMC" },
          { label: "Hash Rate", value: hashRate, suffix: "H/s" },
          { label: "Time Left", value: formatTime(timeLeft), suffix: "" },
          { label: "Session Earnings", value: earnings.toFixed(6), suffix: "FMC" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-lg border-[#D4AF37]/30 rounded-2xl p-4 text-center shadow-lg"
          >
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="text-xl font-bold text-[#FFD700] mt-1">
              {item.value} <span className="text-sm">{item.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {isMining && (
        <div className="w-full max-w-2xl mb-6">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"
              style={{ width: `${((86400 - timeLeft) / 86400) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={startMining}
        disabled={isMining}
        className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
          isMining
           ? "bg-gray-700 cursor-not-allowed"
            : "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:shadow-[0_0_20px_#D4AF37] hover:scale-105"
        }`}
      >
        {isMining? "Mining Active" : "Start Mining"}
      </button>
    </div>
  );
}
