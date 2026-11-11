import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth/useAuth';
import Alert from '../components/Alert';
import type { Booking } from '../types';
import { getBookingIds, removeBookingIds } from '../utils/bookingStorage';
import { formatDate } from '../utils/format';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [failed, setFailed] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const ids = getBookingIds(user.email);

    Promise.allSettled(ids.map(id => api.get<Booking>(`/flights/book/${id}`))).then(results => {
      if (cancelled) return;
      const found: Booking[] = [];
      const missing: number[] = [];
      let otherErrors = 0;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') found.push(r.value.data);
        // Si el backend se reinició, la reserva ya no existe: se limpia su ID.
        else if (axios.isAxiosError(r.reason) && r.reason.response) missing.push(ids[i]);
        else otherErrors++;
      });
      if (missing.length) removeBookingIds(user.email, missing);
      found.sort((a, b) => a.estDepartureTime.localeCompare(b.estDepartureTime));
      setBookings(found);
      setFailed(otherErrors);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <section>
      <div className="page-head">
        <h1>Mis viajes 🧳</h1>
          <p className="muted">Todos tus vuelos reservados, del más próximo al más lejano.</p>
      </div>

      {failed > 0 && (
        <Alert kind="error">No se pudieron cargar {failed} reserva(s). Revisa la conexión.</Alert>
      )}

      {bookings === null && <p className="muted">Cargando reservas…</p>}

      {bookings && bookings.length === 0 && (
        <div className="card empty">
          <p className="empty-icon" aria-hidden="true">🧳</p>
          <p>
            <strong>Aún no tienes reservas.</strong>
          </p>
          <p className="muted">
            <Link to="/search">Busca un vuelo</Link> y resérvalo para verlo aquí.
          </p>
        </div>
      )}

      {bookings && bookings.length > 0 && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reserva</th>
                <th>Vuelo</th>
                <th>Aerolínea</th>
                <th>Salida</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="mono">#{b.id}</td>
                  <td className="mono">{b.flightNumber}</td>
                  <td>{b.airlineName}</td>
                  <td>{formatDate(b.estDepartureTime)}</td>
                  <td className="actions">
                    <Link to={`/bookings/${b.id}`} className="btn btn-ghost btn-sm">
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
