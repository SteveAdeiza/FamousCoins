import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "dstevinho@gmail.com";
  const SUPPORT_EMAIL = "famouscoins.help@gmail.com";
  const TELEGRAM_LINK = "https://t.me/FamousCoins001";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return unsub;
  }, [navigate]);

  const createUserDoc = async (user, extraData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username: extraData.username || user.displayName || "User",
        balance: 0,
        mining: true,
        lastClaim: Date.now(),
        referralCode: refCode,
        referredBy: extraData.referredBy || "",
        referrals: 0,
        isAdmin: user.email === ADMIN_EMAIL,
        createdAt: Date.now()
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!username) {
          setError("Username required");
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDoc(userCred.user, { username });
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDoc(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl w-full max-w-md border-purple-500/30">
        <div className="text-center mb-6">
          <img src="/logo.webp" alt="FMC Logo" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-white">Famous Coins</h1>
          <p className="text-purple-300 text-sm">Mine FMC Daily</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-4 text-center">
          {isLogin? "Welcome Back" : "Create Account"}
        </h2>

        {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border-gray-700 focus:border-purple-500 outline-none"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border-gray-700 focus:border-purple-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password - min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border-gray-700 focus:border-purple-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {loading? "Loading..." : isLogin? "Login" : "Start Mining"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-gray-400 mt-4 text-sm">
          {isLogin? "No account?" : "Already mining?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 ml-1 font-semibold hover:underline"
          >
            {isLogin? "Sign Up" : "Login"}
          </button>
        </p>

        {/* Footer with Telegram and Support Email */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            Join our Telegram: 
            <a 
              href={TELEGRAM_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline ml-1 font-semibold"
            >
              t.me/FamousCoins001
            </a>
          </p>
          <p className="text-gray-500 text-xs">
            Support: {SUPPORT_EMAIL}
          </p>
        </div>
      </div>
    </div>
  );
      }
