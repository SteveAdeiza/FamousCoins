import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "dstevinho@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return unsub;
  }, [navigate]);

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
        const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        await setDoc(doc(db, "users", userCred.user.uid), {
          uid: userCred.user.uid,
          email: email,
          username: username,
          balance: 0,
          mining: true,
          lastClaim: Date.now(),
          referralCode: refCode,
          referredBy: "",
          referrals: 0,
          isAdmin: email === ADMIN_EMAIL,
          createdAt: Date.now()
        });
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl w-full max-w-md border border-purple-500/30">
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
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password - min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 outline-none"
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

        <p className="text-center text-gray-400 mt-4 text-sm">
          {isLogin? "No account?" : "Already mining?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 ml-1 font-semibold hover:underline"
          >
            {isLogin? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
          }
