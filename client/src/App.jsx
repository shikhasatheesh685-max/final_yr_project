import { Routes, Route, useLocation } from 'react-router-dom';
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
import ArtistTransactions from './pages/ArtistTransactions';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminArtworks from './pages/AdminArtworks';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';
import AdminCategories from './pages/AdminCategories';
import AdminSiteContent from './pages/AdminSiteContent';
import AdminReports from './pages/AdminReports';
import UserOrders from './pages/UserOrders';
import Payment from './pages/Payment';
import ArtistProfile from './pages/ArtistProfile';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import MyAuctions from './pages/MyAuctions';
import CreateAuction from './pages/CreateAuction';
import NotFound from './pages/NotFound';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  // Hide navbar on admin pages and auth pages
  const hideNavbar = location.pathname.startsWith('/admin') || 
                     location.pathname === '/login' || 
                     location.pathname === '/register';

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      <main className={`main-content ${hideNavbar ? 'no-navbar' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
            <Route path="/artist/:id" element={<ArtistProfile />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
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
            <Route
              path="/artist/transactions"
              element={
                <ProtectedRoute requiredRole="artist">
                  <ArtistTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/auctions"
              element={
                <ProtectedRoute requiredRole={['artist', 'admin']}>
                  <MyAuctions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artist/auctions/create"
              element={
                <ProtectedRoute requiredRole={['artist', 'admin']}>
                  <CreateAuction />
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
            {/* Payment / Transaction history (role-based) */}
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
