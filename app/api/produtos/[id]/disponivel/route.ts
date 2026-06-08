import { NextResponse } from 'next/server';
import { createClient }        from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Auth check
  const authClient = createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { disponivel } = await req.json() as { disponivel: boolean };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('produtos')
    .update({ disponivel })
    .eq('id', params.id)
    .select('id, nome, disponivel')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, produto: data });
}
