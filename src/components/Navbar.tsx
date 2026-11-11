import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/search" className="brand">
        ✈ Fly<span>Away</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/search">Vuelos</NavLink>
        {token && <NavLink to="/bookings">Mis viajes</NavLink>}
        {!token && <NavLink to="/login">Ingresar</NavLink>}
        {!token && <NavLink to="/register">Crear cuenta</NavLink>}
      </nav>
      {token && (
        <div className="nav-user">
          <span className="user-name">
            {user ? `👤 ${user.firstName} ${user.lastName}` : 'Cargando…'}
          </span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
