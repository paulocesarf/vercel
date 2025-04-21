import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Zap, Clock, History, Settings, Server, Loader2 } from 'lucide-react';
import pino from 'pino';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { rateLimit } from '@/lib/rate-limit';

const logger = pino({ level: 'info' });

export default async function DashboardPage({ request }: { request: Request }) {
  // Rate limiting: 10 requisições por IP em 5 minutos
  const { success, limit, remaining } = await rateLimit(request, { max: 50, windowMs: 5 * 60 * 1000 });
  if (!success) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for dashboard');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Too many requests. Please try again later.</p>
      </div>
    );
  }

  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.info({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized access to dashboard');
    redirect('/login');
  }

  // Buscar perfil
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*, plans(max_concurrent_attacks, max_time)')
    .eq('id', user.id)
    .single();

  if (profileError || !profileData) {
    logger.error({ error: profileError }, 'Failed to fetch profile');
    redirect('/login');
  }

  const profile = {
    ...profileData,
    max_concurrent_attacks: profileData.plans?.max_concurrent_attacks || profileData.max_concurrent_attacks || 0,
    max_time: profileData.plans?.max_time || profileData.max_time || 0,
  };

  // Buscar métodos de ataque
  const { data: methodsData } = await supabase.from('attack_methods').select('*');
  const methods = methodsData || [];

  // Buscar histórico de ataques
  const { data: historyData } = await supabase
    .from('attack_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  let attackHistory = historyData || [];
  let concurrentAttacks = 0;

  if (historyData) {
    concurrentAttacks = historyData.filter((attack) => attack.status === 'running').length;
    attackHistory = historyData.map((attack) => {
      const completedAttacks = historyData.filter((a) => a.status === 'completed').length;
      if (attack.status === 'running' && completedAttacks > 0) {
        return { ...attack, status: 'completed' };
      }
      return attack;
    });
  }

  // Buscar total de usuários
  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) {
    logger.error({ error: usersError }, 'Failed to fetch total users');
  }

  const totalServers = 7; // Hardcoded, conforme original

  // Funções utilitárias
  const getMethodName = (methodId: string) => {
    const method = methods.find((m) => m.id === methodId);
    return method ? method.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <>
      <div className="bg-purple-600 text-white text-center py-3">
        <p className="text-sm md:text-base font-medium">
          Please join our Telegram channel to get the latest updates and support.{' '}
          <a
            href="https://t.me/globalstresss"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold hover:text-purple-200"
          >
            Join Telegram
          </a>
        </p>
      </div>
      <DashboardLayout isAdmin={profile.role === 'admin'}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/70">Welcome back, {profile.username || 'User'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/30 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5 text-primary" />
                  Total Servers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{totalServers}</div>
                <div className="text-white/70 text-sm">Servers available for attacks</div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-primary" />
                  Concurrent Attacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold">{concurrentAttacks}</span>
                  <span className="text-white/70">/ {profile.max_concurrent_attacks}</span>
                </div>
                <Progress
                  value={
                    profile.max_concurrent_attacks ? (concurrentAttacks / profile.max_concurrent_attacks) * 100 : 0
                  }
                  className="h-2 bg-white/10"
                />
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-primary" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{totalUsers || 0}</div>
                <div className="text-white/70 text-sm">Number of registered users</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-black/30 border-white/10 text-white lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Attacks</CardTitle>
                  <CardDescription className="text-white/70">Your recent attack history</CardDescription>
                </div>
                <Link href="/dashboard/history" passHref>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <History className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {attackHistory.length > 0 ? (
                  <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow>
                          <TableHead className="text-white">Target</TableHead>
                          <TableHead className="text-white">Method</TableHead>
                          <TableHead className="text-white">Time</TableHead>
                          <TableHead className="text-white">Status</TableHead>
                          <TableHead className="text-white">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attackHistory.map((attack) => (
                          <TableRow key={attack.id} className="border-white/10">
                            <TableCell className="font-medium">
                              {attack.host}:{attack.port}
                            </TableCell>
                            <TableCell>{getMethodName(attack.method_id)}</TableCell>
                            <TableCell>{attack.time}s</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${getStatusColor(attack.status)} capitalize`}>
                                {attack.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white/70">{formatDate(attack.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/70">No attack history found</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}