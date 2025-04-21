import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AlertCircle, Clock, Search } from 'lucide-react';
import pino from 'pino';
import { Suspense } from 'react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { formatDate } from '@/lib/utils';

const logger = pino({ level: 'info' });

// Componente cliente para o campo de busca
async function SearchForm({ initialQuery }: { initialQuery: string }) {
  'use client';
  import { useRouter } from 'next/navigation';
  import { useState } from 'react';

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ q: searchQuery });
    router.push(`/dashboard/history?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full md:w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
      <Input
        placeholder="Search attacks..."
        className="pl-8 bg-black/50 border-white/20 text-white"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </form>
  );
}

export default async function HistoryPage({ request }: { request: Request }) {
  // Rate limiting: 10 requisições por IP em 5 minutos
  const { success, limit, remaining } = await rateLimit(request, { max: 50, windowMs: 5 * 60 * 1000 });
  if (!success) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for history page');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Too many requests. Please try again later.</p>
      </div>
    );
  }

  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.info({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized access to history page');
    redirect('/login');
  }

  // Buscar perfil
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profileData) {
    logger.error({ error: profileError }, 'Failed to fetch profile');
    redirect('/login');
  }

  // Obter query de busca da URL
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';

  // Buscar histórico de ataques
  let query = supabase
    .from('attack_history')
    .select('*, attack_methods(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    query = query.or(
      `host.ilike.%${searchQuery}%,attack_methods.name.ilike.%${searchQuery}%`,
      { referencedTable: 'attack_methods' }
    );
  }

  const { data: attacksData, error: attacksError } = await query;

  if (attacksError) {
    logger.error({ error: attacksError }, 'Failed to fetch attack history');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Failed to load attack history. Please try again.</p>
      </div>
    );
  }

  const attacks = attacksData || [];

  return (
    <DashboardLayout isAdmin={profileData.role === 'admin'}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Attack History</h1>
          <p className="text-white/70">View all your previous attacks</p>
        </div>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Your Attacks</CardTitle>
                <CardDescription className="text-white/70">Complete history of all your attacks</CardDescription>
              </div>
              <Suspense fallback={<Input placeholder="Loading search..." disabled />}>
                <SearchForm initialQuery={searchQuery} />
              </Suspense>
            </div>
          </CardHeader>
          <CardContent>
            {attacks.length > 0 ? (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Target</TableHead>
                      <TableHead className="text-white">Method</TableHead>
                      <TableHead className="text-white">Duration</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attacks.map((attack) => (
                      <TableRow key={attack.id} className="border-white/10">
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                attack.status === 'completed'
                                  ? 'bg-green-500'
                                  : attack.status === 'running'
                                    ? 'bg-blue-500'
                                    : attack.status === 'failed'
                                      ? 'bg-red-500'
                                      : 'bg-yellow-500'
                              }`}
                            />
                            <span className="capitalize">{attack.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {attack.host}:{attack.port}
                        </TableCell>
                        <TableCell>{attack.attack_methods?.name || 'Unknown'}</TableCell>
                        <TableCell>{attack.time} seconds</TableCell>
                        <TableCell>{formatDate(attack.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-white/70">
                <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No attacks found</h3>
                <p className="text-sm">
                  {searchQuery ? 'Try a different search term' : 'Start your first attack to see it here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}