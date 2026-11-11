const dateFormat = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Muestra una fecha ISO-8601 en hora local legible. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date);
}

/** Convierte el valor de un <input type="datetime-local"> a ISO-8601 (o undefined si está vacío). */
export function toIso(localValue: string): string | undefined {
  return localValue ? new Date(localValue).toISOString() : undefined;
}
