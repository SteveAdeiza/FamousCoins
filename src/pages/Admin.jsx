import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "dstevinho@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/register");
        return;
      }
      if (user.email!== ADMIN_EMAIL) {
        navigate("/dashboard");
        return;
      }
      setCurrentUser(user);
      await loadUsers();
      setLoading(false);
    });
    return unsub;
  }, [navigate]);

  const loadUsers = async () => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id,...doc.data() }));
    setUsers(usersList);
  };

  const updateBalance = async (uid, amount) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { balance: amount });
    await loadUsers();
  };

  const toggleAdmin = async (uid, currentStatus) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { isAdmin:!currentStatus });
    await loadUsers();
  };

  const handleLogout = () => signOut(auth);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-purple-300">Logged in as: {currentUser?.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/dashboard")} className="bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold">
              Dashboard
            </button>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-lg text-white font-semibold">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl border-purple-500/30 overflow-hidden">
          <div className="p-4 bg-black/40">
            <h2 className="text-xl font-bold text-white">All Users - {users.length}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/60">
                <tr>
                  <th className="p-3 text-purple-300 text-sm">Username</th>
                  <th className="p-3 text-purple-300 text-sm">Email</th>
                  <th className="p-3 text-purple-300 text-sm">Balance</th>
                  <th className="p-3 text-purple-300 text-sm">Referrals</th>
                  <th className="p-3 text-purple-300 text-sm">Admin</th>
                  <th className="p-3 text-purple-300 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800">
                    <td className="p-3 text-white">{user.username}</td>
                    <td className="p-3 text-gray-400 text-sm">{user.email}</td>
                    <td className="p-3 text-green-400 font-mono">{user.balance?.toFixed(5)}</td>
                    <td className="p-3 text-white">{user.referrals}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${user.isAdmin? 'bg-yellow-600' : 'bg-gray-600'}`}>
                        {user.isAdmin? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const newBal = prompt(`Enter new balance for ${user.username}:`, user.balance);
                          if (newBal!== null) updateBalance(user.id, parseFloat(newBal));
                        }}
                        className="bg-blue-600 px-2 py-1 rounded text-white text-xs mr-2"
