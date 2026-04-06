import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/", icon: "dashboard", label: "Dashboard" },
    { to: "/history", icon: "history", label: "History" },
  ];

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#131318] border-b border-white/5">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4d8eff] text-2xl">speed</span>
            <span className="text-2xl font-black italic tracking-tighter text-white font-headline uppercase">
              VELOCITY
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-label font-bold uppercase tracking-widest transition-colors ${
                    location.pathname === item.to
                      ? "text-[#4d8eff] bg-[#4d8eff]/10"
                      : "text-on-surface-variant hover:text-white hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <Link
                to="/builder"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-label font-bold uppercase tracking-widest text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors ml-2"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                New Template
              </Link>
            </nav>
            {/* User avatar + logout */}
            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-headline font-bold text-white text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-lg overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                <div className="px-4 py-3 border-b border-outline-variant/10">
                  <p className="text-xs text-on-surface-variant font-label">Signed in as</p>
                  <p className="text-white text-sm font-headline font-bold truncate">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors font-label"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-20 pb-24 px-4 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* BottomNavBar — mobile only */}
      <nav className="fixed bottom-0 w-full z-40 flex justify-around items-center px-2 pt-2 pb-6 bg-[#131318] border-t border-white/5 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center rounded-xl px-5 py-1 transition-colors ${
              location.pathname === item.to
                ? "text-[#4d8eff] bg-[#4d8eff]/10"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold mt-0.5">{item.label}</span>
          </Link>
        ))}
        <Link
          to="/builder"
          className={`flex flex-col items-center justify-center rounded-xl px-5 py-1 transition-colors ${
            location.pathname === "/builder"
              ? "text-[#4d8eff] bg-[#4d8eff]/10"
              : "text-gray-500 hover:text-blue-400"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          <span className="text-[10px] uppercase tracking-widest font-bold mt-0.5">Build</span>
        </Link>
      </nav>
    </div>
  );
}
