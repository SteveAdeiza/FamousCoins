import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const MINING_RATE = 0.00005;
  const MIN_WITHDRAWAL = 1000;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/register");
        return;
      }
      setUser(currentUser);

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        let data;
        if (docSnap.exists()) {
          data = docSnap.data();

          if (!data.lastClaim) {
            data.lastClaim = Date.now();
            data.mining = true;
            data.balance = data.balance || 0;
            data.createdAt = data.createdAt || Date.now();
            await setDoc(docRef, data, { merge: true });
          }

          if (data.mining && data.lastClaim) {
            const now = Date.now();
            const timeDiff = (now - data.lastClaim) / 1000;
            const earned = timeDiff * MINING_RATE;
            const newBalance = (data.balance || 0) + earned;
            await updateDoc(docRef, { balance: newBalance, lastClaim: now });
            data.balance = newBalance;
            data.lastClaim = now;
          }
        } else {
          data = {
            uid: currentUser.uid,
            email: currentUser.email,
            username: currentUser.displayName || "User",
            balance: 0,
            lastClaim: Date.now(),
            mining: true,
            referralCode: currentUser.uid.slice(0, 6).toUpperCase(),
            referrals: 0,
            isAdmin: currentUser.email === "dstevinho@gmail.com",
            createdAt: Date.now()
          };
          await setDoc(docRef, data);
        }

        setUserData(data);
      } catch (err) {
        console.error("Error loading user data:", err);
      }

      setLoading(false);
    });
    return unsub;
  }, [navigate]);

  // Live mining counter - updates every second like Pi
  useEffect(() => {
    if (!userData?.mining ||!userData?.lastClaim) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - userData.lastClaim) / 1000;
      const earned = timeDiff * MINING_RATE;
      const newBalance = (userData.balance || 0) + earned;

      setUserData(prev => ({
       ...prev,
        balance: newBalance
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [userData?.lastClaim, userData?.mining, userData?.balance]);

  const handleClaim = async () => {
    if (!user ||!userData ||!userData.lastClaim) return;

    setClaimLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const now = Date.now();
      const timeDiff = (now - userData.lastClaim) / 1000;
      const earned = timeDiff * MINING_RATE;
      const newBalance = (userData.balance || 0) + earned;

      await updateDoc(docRef, { balance: newBalance, lastClaim: now });
      setUserData({...userData, balance: newBalance, lastClaim: now });
    } catch (err) {
      console.error("Claim error:", err);
      alert("Claim failed: " + err.message);
    }
    setClaimLoading(false);
  };

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${userData?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="FMC" className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-white">Famous Coins</h1>
          </div>
          <div className="flex gap-2">
            {userData?.isAdmin && (
              <button onClick={() => navigate("/admin")} className="bg-yellow-600 px-4 py-2 rounded-lg text-white font-semibold">
                Admin
              </button>
            )}
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-lg text-white font-semibold">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border-purple-500/30 mb-4">
          <p className="text-gray-400 text-sm">Welcome,</p>
          <h2 className="text-xl font-bold text-white mb-4">{userData?.username || "User"}</h2>

          <div className="bg-black/40 p-6 rounded-xl text-center mb-4">
            <p className="text-gray-400 text-sm mb-2">Your Balance</p>
            <h3 className="text-4xl font-bold text-purple-400">{(userData?.balance || 0).toFixed(5)} FMC</h3>
            <p className="text-gray-500 text-xs mt-2">Mining at {MINING_RATE} FMC/sec</p>
          </div>

          <button
            onClick={handleClaim}
            disabled={claimLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 mb-3"
          >
            {claimLoading? "Claiming..." : "Claim FMC Now"}
          </button>

          <div className="bg-yellow-500/10 border-yellow-500/30 p-3 rounded-lg">
            <p className="text-yellow-300 text-xs text-center">
              Min Withdrawal: {MIN_WITHDRAWAL} FMC - Contact Admin to withdraw
            </p>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border-purple-500/30">
          <h3 className="text-lg font-bold text-white mb-3">Your Referral Link</h3>

          <div className="bg-black/40 p-4 rounded-lg mb-3">
            <p className="text-gray-400 text-xs mb-1">Referral Code:</p>
            <div className="flex justify-between items-center">
              <span className="text-purple-400 font-mono text-lg">{userData?.referralCode || "----"}</span>
              <button
                onClick={handleCopyLink}
                className="bg-purple-600 px-3 py-1 rounded text-white text-sm hover:bg-purple-700"
              >
                {copied? "Copied!" : "Copy Link"}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2 break-all">
              {window.location.origin}/register?ref={userData?.referralCode || "CODE"}
            </p>
          </div>

          <p className="text-gray-400 text-xs">Total Referrals: {userData?.referrals || 0}</p>
          <p className="text-gray-500 text-xs mt-1">Share this link. You get 10 FMC per referral.</p>
        </div>
      </div>
    </div>
  );
}
