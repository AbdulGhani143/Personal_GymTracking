import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim px-4">
      <div className="w-full max-w-md bg-surface-container-low rounded-xl p-8 border border-outline-variant/20 shadow-none">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="material-symbols-outlined text-blue-500 text-3xl font-bold" data-icon="speed">speed</span>
          <h1 className="text-3xl font-black italic tracking-tighter text-white font-headline uppercase">VELOCITY</h1>
        </div>
        <h2 className="text-xl font-headline font-bold text-white mb-6 text-center">Create an account</h2>
        
        {error && <div className="bg-error-container text-on-error-container p-3 rounded mb-4 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label">Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-surface-container-high border-none rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-surface-container-high border-none rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-surface-container-high border-none rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary-container font-headline font-bold py-3 rounded-xl tracking-widest uppercase mt-4 hover:bg-primary-container transition-colors">
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center text-on-surface-variant text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
