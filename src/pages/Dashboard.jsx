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
  const [isMining, setIsMining] = useState(false);
  const navigate = useNavigate();

  const MINING_RATE = 0.00005;
  const MIN_WITHDRAWAL = 1000;
  const MINING_SESSION = 24 * 60 * 60 * 1000;

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

        if (docSnap.exists()) {
          let data = docSnap.data();

          // Create referralCode if missing
          if (!data.referralCode) {
            data.referralCode = currentUser.uid.slice(0, 6).toUpperCase();
            await updateDoc(docRef, { referralCode: data.referralCode });
          }

          // Fix missing username
          if (!data.username) {
            data.username = currentUser.displayName || "User";
            await updateDoc(docRef, { username: data.username });
          }

          const now = Date.now();
          const miningEnd = data.lastMiningStart? data.lastMiningStart + MINING_SESSION : 0;
          const miningActive = data.isMining && now < miningEnd;

          setIsMining(miningActive);

          if (miningActive) {
            const timeDiff = (now - data.lastMiningStart) / 1000;
            const earned = timeDiff * MINING_RATE;
            data.pendingBalance = (data.pendingBalance || 0) + earned;
          } else if (data.isMining) {
            await updateDoc(docRef, {
              balance: (data.balance || 0) + (data.pendingBalance || 0),
              pendingBalance: 0,
              isMining: false
            });
            data.balance = (data.balance || 0) + (data.pendingBalance || 0);
            data.pendingBalance = 0;
            setIsMining(false);
          }

          setUserData(data);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }

      setLoading(false);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (!isMining ||!userData?.lastMiningStart) {
      setTimeLeft("Not mining");
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const endTime = userData.lastMiningStart + MINING_SESSION;
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Session ended");
        setIsMining(false);
        claimMining();
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);

      const timeDiff = (now - userData.lastMiningStart) / 1000;
      const earned = timeDiff * MINING_RATE;
      setUserData(prev => ({
     ...prev,
        pendingBalance: earned
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMining, userData?.lastMiningStart]);

  const startMining = async () => {
    if (!user || isMining) return;

    const docRef = doc(db, "users", user.uid);
    const now = Date.now();

    await updateDoc(docRef, {
      isMining: true,
      lastMiningStart: now,
      pendingBalance: 0
    });

    setUserData(prev => ({
   ...prev,
      isMining: true,
      lastMiningStart: now,
      pendingBalance: 0
    }));
    setIsMining(true);
  };

  const claimMining = async () => {
    if (!user ||!userData) return;

    const docRef = doc(db, "users", user.uid);
    const newBalance = (userData.balance || 0) + (userData.pendingBalance || 0);

    await updateDoc(docRef, {
      balance: newBalance,
      pendingBalance: 0,
      isMining: false
    });

    setUserData(prev => ({
   ...prev,
      balance: newBalance,
      pendingBalance: 0,
      isMining: false
    }));
    setIsMining(false);
  };

  const handleCopyLink = () => {
    if (!userData?.referralCode) return; // <- FIX 1
    const referralLink = `${window.location.origin}/register?ref=${userData.referralCode}`;
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

  const totalBalance = (userData?.balance || 0) + (userData?.pendingBalance || 0);
  const progressPercent = isMining && userData?.lastMiningStart
  ? Math.min(((Date.now() - userData.lastMiningStart) / MINING_SESSION) * 100, 100)
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
              {totalBalance.toFixed(5)}
            </h3>
            <p className="text-gray-500 text-xs mt-2">FMC</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1">Mining Rate</p>
            <h3 className="text-3xl font-bold text-green-400">{MINING_RATE}</h3>
            <p className="text-gray-500 text-xs mt-2">FMC per second</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1">Mining Status</p>
            <h3 className="text-2xl font-bold text-yellow-400">{timeLeft}</h3>
            <p className="text-gray-500 text-xs mt-2">24h session</p>
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

          {!isMining? (
            <button
              onClick={startMining}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl"
            >
              Start Mining
            </button>
          ) : (
            <button
              onClick={claimMining}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl"
            >
              Claim & Stop Mining
            </button>
          )}

          <p className="text-gray-400 text-xs mt-3 text-center">
            Click Start Mining. It runs for 24h, then you need to click again.
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

          {/* FIX 2: Don't show link until referralCode loads */}
          <div className="bg-black/40 p-4 rounded-xl mb-3">
            <p className="text-gray-400 text-xs mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={userData?.referralCode
                 ? `${window.location.origin}/register?ref=${userData.referralCode}`
                  : "Loading..."
                }
                className="flex-1 bg-gray-800 text-purple-400 font-mono text-sm px-3 py-2 rounded-lg border-gray-700"
              />
              <button
                onClick={handleCopyLink}
                disabled={!userData?.referralCode}
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {copied? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
