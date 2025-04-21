import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Loader2, Search, Pencil, Trash2 } from 'lucide-react';
import { Suspense } from 'react';
import pino from 'pino';
import { z } from 'zod';
import { createCsrfToken } from '@/lib/csrf';
import { rateLimit } from '@/lib/rate-limit';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const logger = pino({ level: 'info' });

// Esquema de validação
const userFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
  role: z.enum(['user', 'admin'], { message: 'Role must be either user or admin.' }),
  plan_id: z.string().optional().or(z.literal('')),
});

// Componente cliente para formulário e busca
async function AdminUsersClient({
  users,
  plans,
  initialSearchQuery,
  editingUser,
  csrfToken,
}: {
  users: any[];
  plans: any[];
  initialSearchQuery: string;
  editingUser: any | null;
  csrfToken: string;
}) {
  'use client';
  import { useRouter } from 'next/navigation';
  import { useState } from 'react';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useForm } from 'react-hook-form';
  import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: editingUser
      ? {
          username: editingUser.username,
          password: '',
          role: editingUser.role,
          plan_id: editingUser.plan_id || '',
        }
      : {
          username: '',
          password: '',
          role: 'user',
          plan_id: '',
        },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ q: searchQuery });
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-white/70">Manage users and their permissions</p>
      </div>

      <Card className="bg-black/30 border-white/10 text-white">
        <CardHeader>
          <CardTitle>{editingUser ? 'Edit User' : 'Create New User'}</CardTitle>
          <CardDescription className="text-white/70">
            {editingUser ? 'Update user details' : 'Add a new user to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={async (formData: FormData) => {
                setIsSubmitting(true);
                try {
                  const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    body: JSON.stringify({
                      id: editingUser?.id,
                      username: formData.get('username'),
                      password: formData.get('password'),
                      role: formData.get('role'),
                      plan_id: formData.get('plan_id') || null,
                      csrfToken,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                  });
                  const result = await response.json();
                  if (!response.ok) {
                    throw new Error(result.error || 'Failed to save user');
                  }
                  toast({
                    title: editingUser ? 'User Updated' : 'User Created',
                    description: `User ${formData.get('username')} has been ${
                      editingUser ? 'updated' : 'created'
                    } successfully.`,
                  });
                  form.reset();
                  router.refresh();
                } catch (error: any) {
                  toast({
                    title: 'Error',
                    description: error.message || 'Failed to save user. Please try again.',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black/50 border-white/20 text-white" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          className="bg-black/50 border-white/20 text-white"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black/50 border-white/20 text-white">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-black border-white/20 text-white">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-black/50 border-white/20 text-white">
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-black border-white/20 text-white">
                          <SelectItem value="none">No Plan</SelectItem>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} (${plan.price.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingUser ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingUser ? (
                    'Update User'
                  ) : (
                    'Create User'
                  )}
                </Button>

                {editingUser && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => router.push('/dashboard/admin/users')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-white/10 text-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription className="text-white/70">Manage all users in the system</CardDescription>
            </div>
            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search users..."
                className="pl-8 bg-black/50 border-white/20 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Username</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">Plan</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-white/10">
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          user.role === 'admin'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'bg-white/10 text-white/70 border-white/20'
                        } capitalize`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.plans?.name || 'No Plan'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() =>
                            router.push(`/dashboard/admin/users?edit=${user.id}&q=${encodeURIComponent(searchQuery)}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <form
                          action={async () => {
                            try {
                              const response = await fetch('/api/admin/users', {
                                method: 'DELETE',
                                body: JSON.stringify({ id: user.id, csrfToken }),
                                headers: { 'Content-Type': 'application/json' },
                              });
                              if (!response.ok) {
                                const result = await response.json();
                                throw new Error(result.error || 'Failed to delete user');
                              }
                              toast({
                                title: 'User Deleted',
                                description: 'User has been deleted successfully.',
                              });
                              router.refresh();
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error.message || 'Failed to delete user. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white/70 hover:text-red-500 hover:bg-red-500/10"
                            type="submit"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AdminUsersPage({ request }: { request: Request }) {
  // Rate limiting: 10 requisições por IP em 5 minutos
  const { success, limit, remaining } = await rateLimit(request, { max: 10, windowMs: 5 * 60 * 1000 });
  if (!success) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin users page');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Too many requests. Please try again later.</p>
      </div>
    );
  }

  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.info({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized access to admin users page');
    redirect('/login');
  }

  // Verificar se é admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
    logger.warn({ userId: user?.id }, 'Non-admin attempted access to admin users page');
    redirect('/dashboard');
  }

  // Obter query de busca e edição
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  const editingUserId = url.searchParams.get('edit');

  // Buscar usuários
  const { data: usersData, error: usersError } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .order('created_at', { ascending: false });

  if (usersError) {
    logger.error({ error: usersError }, 'Failed to fetch users');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Failed to load users. Please try again.</p>
      </div>
    );
  }

  // Buscar planos
  const { data: plansData, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: true });

  if (plansError) {
    logger.error({ error: plansError }, 'Failed to fetch plans');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Failed to load plans. Please try again.</p>
      </div>
    );
  }

  // Buscar usuário em edição, se aplicável
  let editingUser = null;
  if (editingUserId) {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*, plans(*)')
      .eq('id', editingUserId)
      .single();

    if (!userError && userData) {
      editingUser = userData;
    }
  }

  // Gerar token CSRF
  const csrfToken = createCsrfToken();

  return (
    <DashboardLayout isAdmin={true}>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-white/50 mx-auto mt-8" />}>
        <AdminUsersClient
          users={usersData || []}
          plans={plansData || []}
          initialSearchQuery={searchQuery}
          editingUser={editingUser}
          csrfToken={csrfToken}
        />
      </Suspense>
    </DashboardLayout>
  );
}