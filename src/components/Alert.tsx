import type { ReactNode } from 'react';

interface Props {
  kind: 'error' | 'success' | 'info';
  children: ReactNode;
}

export default function Alert({ kind, children }: Props) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
