import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../auth/useAuth';
import Alert from '../components/Alert';
import type { Flight, FlightSearchResponse, NewId } from '../types';
import { addBookingId } from '../utils/bookingStorage';
import { formatDate, toIso } from '../utils/format';

interface Filters {
  flightNumber: string;
  airlineName: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { flightNumber: '', airlineName: '', from: '', to: '' };

type BookingResult =
  | { kind: 'success'; bookingId: number; flight: Flight }
  | { kind: 'error'; message: string; flight: Flight };

export default function SearchPage() {
  const { token, user } = useAuth();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(true);
  const [bookingFlightId, setBookingFlightId] = useState<number | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const applyResult = useCallback((promise: Promise<Flight[]>) => {
    promise
      .then(items => {
        setFlights(items);
        setSearchError(null);
      })
      .catch(err => {
        setSearchError(errorMessage(err));
        setFlights(null);
      })
      .finally(() => setSearching(false));
  }, []);

  const search = (f: Filters) => {
    setSearching(true);
    applyResult(fetchFlights(f));
  };

  // Al entrar se muestran todos los vuelos.
  useEffect(() => {
    applyResult(fetchFlights(EMPTY_FILTERS));
  }, [applyResult]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (filters.from && filters.to && filters.from > filters.to) {
      setSearchError('La fecha "desde" debe ser anterior a la fecha "hasta"');
      return;
    }
    setBookingResult(null);
    search(filters);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setBookingResult(null);
    search(EMPTY_FILTERS);
  };

  const handleBook = async (flight: Flight) => {
           const ok = window.confirm(
         `¿Quieres reservar el vuelo ${flight.flightNumber} de ${flight.airlineName}?\n\n` +
           `Salida: ${formatDate(flight.estDepartureTime)}\n` +
           `Llegada: ${formatDate(flight.estArrivalTime)}`,
       );
       if (!ok) return;
    setBookingFlightId(flight.id);
    setBookingResult(null);
    try {
      const { data } = await api.post<NewId>('/flights/book', { flightId: flight.id });
      if (user) addBookingId(user.email, data.id);
      setBookingResult({ kind: 'success', bookingId: data.id, flight });
      // Refleja el asiento ocupado sin volver a buscar.
      setFlights(prev =>
        prev?.map(f => (f.id === flight.id ? { ...f, availableSeats: f.availableSeats - 1 } : f)) ??
        null,
      );
    } catch (err) {
      setBookingResult({ kind: 'error', message: translateBookingError(errorMessage(err)), flight });
    } finally {
      setBookingFlightId(null);
    }
  };

  const setField = (field: keyof Filters) => (value: string) =>
    setFilters(prev => ({ ...prev, [field]: value }));

  return (
    <section>
      <div className="page-head">
        <h1>¿A dónde vamos hoy? ✈</h1>
        <p className="muted">Encuentra tu vuelo por número, aerolínea o fechas.</p>
      </div>

      <form className="card search-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="flightNumber">Número de vuelo</label>
          <input
            id="flightNumber"
            placeholder="ej. LA101"
            value={filters.flightNumber}
            onChange={e => setField('flightNumber')(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="airlineName">Aerolínea</label>
          <input
            id="airlineName"
            placeholder="ej. LATAM"
            value={filters.airlineName}
            onChange={e => setField('airlineName')(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="from">Sale desde</label>
          <input
            id="from"
            type="datetime-local"
            value={filters.from}
            onChange={e => setField('from')(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="to">Sale hasta</label>
          <input
            id="to"
            type="datetime-local"
            value={filters.to}
            onChange={e => setField('to')(e.target.value)}
          />
        </div>
        <div className="search-actions">
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? 'Buscando…' : 'Buscar vuelos'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleClear} disabled={searching}>
            Limpiar
          </button>
        </div>
      </form>

      {!token && (
        <Alert kind="info">
          <Link to="/login">Inicia sesión</Link> para reservar un vuelo.
        </Alert>
      )}

      {bookingResult?.kind === 'success' && (
        <Alert kind="success">
          ¡Reserva confirmada! Vuelo {bookingResult.flight.flightNumber} · ID de reserva{' '}
          <strong>#{bookingResult.bookingId}</strong>.{' '}
          <Link to={`/bookings/${bookingResult.bookingId}`}>Ver detalle</Link>
        </Alert>
      )}
      {bookingResult?.kind === 'error' && (
        <Alert kind="error">
          No se pudo reservar {bookingResult.flight.flightNumber}: {bookingResult.message}
        </Alert>
      )}
      {searchError && <Alert kind="error">{searchError}</Alert>}

      {flights && flights.length === 0 && (
        <div className="card empty">
          <p className="empty-icon" aria-hidden="true">🛫</p>
          <p>
            <strong>Ups, no hay vuelos con esos filtros.</strong>
          </p>
          <p className="muted">Prueba con otra aerolínea, otro número de vuelo o amplía las fechas.</p>
        </div>
      )}

      {flights && flights.length > 0 && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vuelo</th>
                <th>Aerolínea</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th className="num">Asientos</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {flights.map(flight => (
                <tr key={flight.id}>
                  <td className="mono">{flight.flightNumber}</td>
                  <td>{flight.airlineName}</td>
                  <td>{formatDate(flight.estDepartureTime)}</td>
                  <td>{formatDate(flight.estArrivalTime)}</td>
                  <td className="num">{flight.availableSeats}</td>
                  <td className="actions">
                    {token ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleBook(flight)}
                        disabled={bookingFlightId !== null || !user}
                      >
                        {bookingFlightId === flight.id ? 'Reservando…' : 'Reservar'}
                      </button>
                    ) : (
                      <Link to="/login" className="btn btn-ghost btn-sm">
                        Inicia sesión
                      </Link>
                    )}
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

async function fetchFlights(f: Filters): Promise<Flight[]> {
  const { data } = await api.get<FlightSearchResponse>('/flights/search', {
    params: {
      flightNumber: f.flightNumber.trim() || undefined,
      airlineName: f.airlineName.trim() || undefined,
      // Las fechas deben ir en ISO-8601: el valor crudo del input provoca un 500.
      estDepartureTimeFrom: toIso(f.from),
      estDepartureTimeTo: toIso(f.to),
    },
  });
  return data.items;
}

function translateBookingError(detail: string): string {
  const translations: Record<string, string> = {
    'Cannot book a past flight': 'el vuelo ya partió',
    'Overlapping flight found': 'se superpone con otra de tus reservas',
  };
  return translations[detail] ?? detail;
}
