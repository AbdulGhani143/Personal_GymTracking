import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim px-4">
      <div className="w-full max-w-md bg-surface-container-low rounded-xl p-8 border border-outline-variant/20 shadow-none">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="material-symbols-outlined text-blue-500 text-3xl font-bold" data-icon="speed">speed</span>
          <h1 className="text-3xl font-black italic tracking-tighter text-white font-headline uppercase">VELOCITY</h1>
        </div>
        <h2 className="text-xl font-headline font-bold text-white mb-6 text-center">Login to your account</h2>
        
        {error && <div className="bg-error-container text-on-error-container p-3 rounded mb-4 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            Login
          </button>
        </form>
        <div className="mt-6 text-center text-on-surface-variant text-sm">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
