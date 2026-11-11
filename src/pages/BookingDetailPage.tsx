import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Alert from '../components/Alert';
import BookingCard from '../components/BookingCard';
import type { Booking } from '../types';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  // El resultado guarda el id al que pertenece: si cambia el id, se trata como "cargando".
  const [result, setResult] = useState<{ id?: string; booking?: Booking; error?: string }>({});

  useEffect(() => {
    let cancelled = false;
    api
      .get<Booking>(`/flights/book/${id}`)
      .then(({ data }) => {
        if (!cancelled) setResult({ id, booking: data });
      })
      .catch(err => {
        if (cancelled) return;
        const msg = errorMessage(err);
        setResult({
          id,
          error: msg.startsWith('Error del servidor') ? `No se encontró la reserva #${id}` : msg,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const current = result.id === id ? result : {};
  const booking = current.booking ?? null;
  const error = current.error ?? null;

  return (
    <section className="narrow">
      <div className="page-head">
        <Link to="/bookings" className="back-link">
          ← Mis reservas
        </Link>
        <h1>Detalle de la reserva</h1>
      </div>
      {error && <Alert kind="error">{error}</Alert>}
      {!booking && !error && <p className="muted">Cargando…</p>}
      {booking && <BookingCard booking={booking} />}
    </section>
  );
}
