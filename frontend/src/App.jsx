import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import Layout from "./Layout";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import TemplateBuilder from "./TemplateBuilder";
import TemplateEditor from "./TemplateEditor";
import WorkoutSession from "./WorkoutSession";
import History from "./History";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="builder" element={<TemplateBuilder />} />
            <Route path="edit/:id" element={<TemplateEditor />} />
            <Route path="session/:id" element={<WorkoutSession />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
