import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();

  const MINING_RATE = 0.00005;
  const MIN_WITHDRAWAL = 1000;
  const CLAIM_INTERVAL = 24 * 60 * 60 * 1000;

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

          // Fix missing fields for old accounts
          if (!data.lastClaim) {
            data.lastClaim = Date.now();
            data.mining = true;
            data.balance = data.balance || 0;
            data.createdAt = data.createdAt || Date.now();
            data.username = data.username || currentUser.displayName || "User";
            await setDoc(docRef, data, { merge: true });
          }

          // Auto-claim if 24h passed
          const now = Date.now();
          if (data.mining && data.lastClaim && now - data.lastClaim >= CLAIM_INTERVAL) {
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

  // Live mining + countdown timer
  useEffect(() => {
    if (!userData?.mining ||!userData?.lastClaim) {
      setTimeLeft("Starting...");
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - userData.lastClaim) / 1000;
      const earned = timeDiff * MINING_RATE;
      const newBalance = (userData.balance || 0) + earned;

      setUserData(prev => ({
       ...prev,
        balance: newBalance
      }));

      const nextClaim = userData.lastClaim + CLAIM_INTERVAL;
      const diff = nextClaim - now;

      if (diff <= 0) {
        setTimeLeft("Ready to claim");
      } else {
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userData?.lastClaim, userData?.mining, userData?.balance]);

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${userData?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => signOut(auth);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Loading Dashboard...</p>
      </div>
    </div>
  );

  const progressPercent = userData?.lastClaim 
   ? Math.min(((Date.now() - userData.lastClaim) / CLAIM_INTERVAL) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-black p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="FMC" className="w-14 h-14 drop-shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-white">Famous Coins</h1>
              <p className="text-purple-300 text-sm">Welcome back, {userData?.username || "User"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {userData?.isAdmin && (
              <button onClick={() => navigate("/admin")} className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-5 py-2 rounded-xl text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-yellow-500/30">
                Admin Panel
              </button>
            )}
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-xl text-white font-semibold transition-colors">
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1">Total Balance</p>
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {(userData?.balance || 0).toFixed(5)}
            </h3>
            <p className="text-gray-500 text-xs mt-2">FMC</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1">Mining Rate</p>
            <h3 className="text-3xl font-bold text-green-400">{MINING_RATE}</h3>
            <p className="text-gray-500 text-xs mt-2">FMC per second</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1">Next Auto-Claim</p>
            <h3 className="text-2xl font-bold text-yellow-400">{timeLeft}</h3>
            <p className="text-gray-500 text-xs mt-2">24h cycle</p>
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-white">Mining Progress</h3>
            <span className="text-purple-400 text-sm font-semibold">{Math.floor(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-xs mt-3 text-center">
            Auto-claim triggers every 24 hours. Balance updates live.
          </p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Referral Program</h3>
              <p className="text-gray-400 text-sm">Earn 10 FMC per referral</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Total Referrals</p>
              <p className="text-2xl font-bold text-purple-400">{userData?.referrals || 0}</p>
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-xl mb-3">
            <p className="text-gray-400 text-xs mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/register?ref=${userData?.referralCode || "CODE"}`}
                className="flex-1 bg-gray-800 text-purple-400 font-mono text-sm px-3 py-2 rounded-lg border-gray-700"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition-transform"
              >
                {copied? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="text-gray-400 text-xs">Referral Bonus</p>
              <p className="text-green-400 font-bold">+10 FMC</p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="text-gray-400 text-xs">Min Withdrawal</p>
              <p className="text-yellow-400 font-bold">{MIN_WITHDRAWAL} FMC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
