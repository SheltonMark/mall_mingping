import { SalespersonAuthProvider } from '@/context/SalespersonAuthContext';

export default function SalespersonLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalespersonAuthProvider>
      {children}
    </SalespersonAuthProvider>
  );
}
