import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import BookingDetailPage from './pages/BookingDetailPage';
import BookingsPage from './pages/BookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/:id" element={<BookingDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
