import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArtworkDetail from './pages/ArtworkDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ArtistDashboard from './pages/ArtistDashboard';
import UploadArtwork from './pages/UploadArtwork';
import MyArtworks from './pages/MyArtworks';
import EditArtwork from './pages/EditArtwork';
import ArtistSales from './pages/ArtistSales';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminArtworks from './pages/AdminArtworks';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';
import AdminCategories from './pages/AdminCategories';
import AdminSiteContent from './pages/AdminSiteContent';
import AdminReports from './pages/AdminReports';
import UserOrders from './pages/UserOrders';
import ArtistProfile from './pages/ArtistProfile';
import NotFound from './pages/NotFound';
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
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Artist Routes */}
            <Route
              path="/artist/dashboard"
              element={
                <ProtectedRoute requiredRole="artist">
                  <ArtistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/upload"
              element={
                <ProtectedRoute requiredRole="artist">
                  <UploadArtwork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/artworks"
              element={
                <ProtectedRoute requiredRole="artist">
                  <MyArtworks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/artworks/edit/:id"
              element={
                <ProtectedRoute requiredRole="artist">
                  <EditArtwork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/sales"
              element={
                <ProtectedRoute requiredRole="artist">
                  <ArtistSales />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/artworks"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminArtworks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/site-content"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSiteContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            
            {/* User Orders Route */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <UserOrders />
                </ProtectedRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
