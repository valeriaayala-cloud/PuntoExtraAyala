// No existe un endpoint que liste las reservas del usuario, así que se guardan
// sus IDs en localStorage, separados por usuario.

const keyFor = (email: string) => `bookings:${email}`;

export function getBookingIds(email: string): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(keyFor(email)) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

export function addBookingId(email: string, id: number): void {
  const ids = getBookingIds(email);
  if (!ids.includes(id)) localStorage.setItem(keyFor(email), JSON.stringify([...ids, id]));
}

export function removeBookingIds(email: string, idsToRemove: number[]): void {
  const ids = getBookingIds(email).filter(id => !idsToRemove.includes(id));
  localStorage.setItem(keyFor(email), JSON.stringify(ids));
}
