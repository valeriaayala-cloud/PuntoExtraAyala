import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api';
import { useAuth } from '../auth/useAuth';
import Alert from '../components/Alert';

interface LocationState {
  from?: string;
  registeredEmail?: string;
}

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state ?? {}) as LocationState;

  const [email, setEmail] = useState(state.registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (token) return <Navigate to={state.from ?? '/search'} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresa tu email y contraseña');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(state.from ?? '/search', { replace: true });
    } catch (err) {
      const detail = errorMessage(err);
      setError(detail === 'Username does not exist' ? 'Email o contraseña incorrectos' : detail);
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <h1>Bienvenido de vuelta 👋</h1>
          <p className="muted">Ingresa para reservar y ver tus viajes.</p>

        {state.registeredEmail && !error && (
          <Alert kind="success">Cuenta creada. Ya puedes iniciar sesión.</Alert>
        )}
        {searchParams.get('expired') && !error && (
          <Alert kind="info">Tu sesión expiró o no es válida. Vuelve a iniciar sesión.</Alert>
        )}
        {state.from && !error && <Alert kind="info">Inicia sesión para continuar.</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
                        <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
              />
              Mostrar contraseña
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="muted center">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </section>
  );
}
