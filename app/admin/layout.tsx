import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Pinus Bar — Admin' };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: config } = await supabase
    .from('configuracoes')
    .select('restaurante_aberto')
    .eq('id', 1)
    .single();

  return (
    <div className="flex h-screen bg-pinus-bg overflow-hidden">
      <AdminSidebar
        userEmail={user.email ?? ''}
        restauranteAberto={config?.restaurante_aberto ?? true}
      />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
