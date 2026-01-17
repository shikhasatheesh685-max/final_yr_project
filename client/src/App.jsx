import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArtworkDetail from './pages/ArtworkDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Placeholder routes for future pages */}
            <Route path="/orders" element={<div>Orders Page - Coming Soon</div>} />
            <Route path="/artist/dashboard" element={<div>Artist Dashboard - Coming Soon</div>} />
            <Route path="/admin" element={<div>Admin Dashboard - Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
