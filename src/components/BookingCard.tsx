import type { Booking } from '../types';
import { formatDate } from '../utils/format';

/** Detalle completo de una reserva (GET /flights/book/{id}). */
export default function BookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="card booking-card">
      <header className="booking-head">
        <div>
          <p className="muted small">Reserva #{booking.id}</p>
          <h3>
            {booking.flightNumber} · {booking.airlineName}
          </h3>
        </div>
      </header>
      <dl className="details">
        <dt>Salida</dt>
        <dd>{formatDate(booking.estDepartureTime)}</dd>
        <dt>Llegada</dt>
        <dd>{formatDate(booking.estArrivalTime)}</dd>
        <dt>Pasajero</dt>
        <dd>
          {booking.customerFirstName} {booking.customerLastName}
        </dd>
        <dt>Reservado el</dt>
        <dd>{formatDate(booking.bookingDate)}</dd>
      </dl>
    </article>
  );
}
