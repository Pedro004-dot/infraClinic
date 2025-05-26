'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function ClinicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const clinicaId = params.id as string;
  const [nomeClinica, setNomeClinica] = useState('');

  useEffect(() => {
    async function fetchClinica() {
      try {
        const res = await fetch(`/api/admin/clinicas/${clinicaId}`);
        const data = await res.json();
        setNomeClinica(data.nome || 'Clínica');
      } catch {
        setNomeClinica('Clínica');
      }
    }
    if (clinicaId) fetchClinica();
  }, [clinicaId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar nomeClinica={nomeClinica} clinicaId={clinicaId} />
      <main className="flex-1">
        <div className="py-6">
          <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 