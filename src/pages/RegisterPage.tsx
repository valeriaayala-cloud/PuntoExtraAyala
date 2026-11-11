import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Alert from '../components/Alert';

interface RegisterForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const EMPTY: RegisterForm = { email: '', firstName: '', lastName: '', password: '' };

const LABELS: Record<keyof RegisterForm, string> = {
  email: 'Email',
  firstName: 'Nombre',
  lastName: 'Apellido',
  password: 'Contraseña',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tras registrarse, redirige al login con el email ya escrito.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(
      () => navigate('/login', { state: { registeredEmail: form.email.trim() } }),
      1500,
    );
    return () => clearTimeout(timer);
  }, [success, navigate, form.email]);

  const update = (field: keyof RegisterForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación de campos vacíos antes de enviar (el backend acepta email vacío).
    const missing: Partial<Record<keyof RegisterForm, string>> = {};
    (Object.keys(LABELS) as (keyof RegisterForm)[]).forEach(field => {
      if (!form[field].trim()) missing[field] = 'Este campo es obligatorio';
    });
    setFieldErrors(missing);
    if (Object.keys(missing).length > 0) return;

    setLoading(true);
    try {
      await api.post('/users/register', {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(translateRegisterError(errorMessage(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <h1>Crear cuenta</h1>
        <p className="muted">Regístrate para reservar vuelos con Fly Away.</p>

        {error && <Alert kind="error">{error}</Alert>}
        {success && (
          <Alert kind="success">¡Registro exitoso! Te llevamos al inicio de sesión…</Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {(Object.keys(LABELS) as (keyof RegisterForm)[]).map(field => (
            <div className="field" key={field}>
              <label htmlFor={field}>{LABELS[field]}</label>
              <input
                id={field}
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                autoComplete={
                  field === 'password'
                    ? 'new-password'
                    : field === 'email'
                      ? 'email'
                      : field === 'firstName'
                        ? 'given-name'
                        : 'family-name'
                }
                value={form[field]}
                onChange={e => update(field)(e.target.value)}
                aria-invalid={Boolean(fieldErrors[field])}
                disabled={loading || success}
              />
              {field === 'password' && !fieldErrors.password && (
                <small className="hint">Mínimo 8 caracteres, una mayúscula y un dígito.</small>
              )}
              {(field === 'firstName' || field === 'lastName') && !fieldErrors[field] && (
                <small className="hint">Debe empezar con mayúscula.</small>
              )}
              {fieldErrors[field] && <small className="field-error">{fieldErrors[field]}</small>}
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || success}>
            {loading ? 'Registrando…' : 'Registrarse'}
          </button>
        </form>

        <p className="muted center">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
}

/** Traduce los mensajes de validación del backend; si no reconoce alguno, lo deja tal cual. */
function translateRegisterError(detail: string): string {
  const translations: Record<string, string> = {
    'password: must be at least 8 characters': 'La contraseña debe tener al menos 8 caracteres',
    'password: must contain at least one uppercase letter and one digit':
      'La contraseña debe tener al menos una mayúscula y un dígito',
    'firstName: must start with an uppercase letter': 'El nombre debe empezar con mayúscula',
    'lastName: must start with an uppercase letter': 'El apellido debe empezar con mayúscula',
    'email: must be a valid email': 'El email no es válido',
    'Username already exists': 'Ese email ya está registrado',
  };
  return detail
    .split(';')
    .map(part => part.trim())
    .map(part => translations[part] ?? part)
    .join('. ');
}
