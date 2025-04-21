import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Loader2, Pencil, Trash2, LinkIcon } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Esquema de validação
const methodFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }).regex(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers, and spaces.',
  }),
  description: z.string().max(500, { message: 'Description cannot exceed 500 characters.' }).optional().or(z.literal('')),
  api_endpoint: z.string().url({ message: 'Must be a valid URL.' }).refine(
    (val) => val.includes('{HOST}') && val.includes('{PORT}') && val.includes('{TIME}'),
    { message: 'API endpoint must include {HOST}, {PORT}, and {TIME} placeholders.' }
  ),
});

// Componente cliente para formulário
async function AdminMethodsClient({
  methods,
  editingMethod,
  csrfToken,
}: {
  methods: any[];
  editingMethod: any | null;
  csrfToken: string;
}) {
  'use client';
  import { useRouter } from 'next/navigation';
  import { useState } from 'react';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useForm } from 'react-hook-form';
  import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof methodFormSchema>>({
    resolver: zodResolver(methodFormSchema),
    defaultValues: editingMethod
      ? {
          name: editingMethod.name,
          description: editingMethod.description || '',
          api_endpoint: editingMethod.api_endpoint,
        }
      : {
          name: '',
          description: '',
          api_endpoint: '',
        },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Attack Methods</h1>
        <p className="text-white/70">Manage attack methods and API endpoints</p>
      </div>

      <Card className="bg-black/30 border-white/10 text-white">
        <CardHeader>
          <CardTitle>{editingMethod ? 'Edit Method' : 'Create New Method'}</CardTitle>
          <CardDescription className="text-white/70">
            {editingMethod ? 'Update method details' : 'Add a new attack method'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={async (formData: FormData) => {
                setIsSubmitting(true);
                try {
                  const response = await fetch('/api/admin/methods', {
                    method: 'POST',
                    body: JSON.stringify({
                      id: editingMethod?.id,
                      name: formData.get('name'),
                      description: formData.get('description') || null,
                      api_endpoint: formData.get('api_endpoint'),
                      csrfToken,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                  });
                  const result = await response.json();
                  if (!response.ok) {
                    throw new Error(result.error || 'Failed to save method');
                  }
                  toast({
                    title: editingMethod ? 'Method Updated' : 'Method Created',
                    description: `Method ${formData.get('name')} has been ${
                      editingMethod ? 'updated' : 'created'
                    } successfully.`,
                  });
                  form.reset();
                  router.refresh();
                } catch (error: any) {
                  toast({
                    title: 'Error',
                    description: error.message || 'Failed to save method. Please try again.',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Method Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. TCP Flood, UDP Flood"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what this attack method does"
                        className="bg-black/50 border-white/20 text-white min-h-[100px]"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">API Endpoint</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                        <Input
                          {...field}
                          placeholder="https://api.example.com/attack?host={HOST}&port={PORT}&time={TIME}"
                          className="bg-black/50 border-white/20 text-white pl-8"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-white/70">
                      Use {'{HOST}'}, {'{PORT}'}, and {'{TIME}'} as placeholders for attack parameters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingMethod ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingMethod ? (
                    'Update Method'
                  ) : (
                    'Create Method'
                  )}
                </Button>

                {editingMethod && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => router.push('/dashboard/admin/methods')}
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
          <CardTitle>Attack Methods</CardTitle>
          <CardDescription className="text-white/70">Manage all attack methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">API Endpoint</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method.id} className="border-white/10">
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {method.description || <span className="text-white/50 italic">No description</span>}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{method.api_endpoint}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() => router.push(`/dashboard/admin/methods?edit=${method.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <form
                          action={async () => {
                            try {
                              const response = await fetch('/api/admin/methods', {
                                method: 'DELETE',
                                body: JSON.stringify({ id: method.id, csrfToken }),
                                headers: { 'Content-Type': 'application/json' },
                              });
                              if (!response.ok) {
                                const result = await response.json();
                                throw new Error(result.error || 'Failed to delete method');
                              }
                              toast({
                                title: 'Method Deleted',
                                description: 'Method has been deleted successfully.',
                              });
                              router.refresh();
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error.message || 'Failed to delete method. Please try again.',
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

const logger = pino({ level: 'info' });

export default async function AdminMethodsPage({ request }: { request: Request }) {
  // Rate limiting: 10 requisições por IP em 5 minutos
  const { success, limit, remaining } = await rateLimit(request, { max: 10, windowMs: 5 * 60 * 1000 });
  if (!success) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin methods page');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Too many requests. Please try again later.</p>
      </div>
    );
  }

  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.info({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized access to admin methods page');
    redirect('/login');
  }

  // Verificar se é admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
    logger.warn({ userId: user?.id }, 'Non-admin attempted access to admin methods page');
    redirect('/dashboard');
  }

  // Obter query de edição
  const url = new URL(request.url);
  const editingMethodId = url.searchParams.get('edit');

  // Buscar métodos
  const { data: methodsData, error: methodsError } = await supabase
    .from('attack_methods')
    .select('*')
    .order('name', { ascending: true });

  if (methodsError) {
    logger.error({ error: methodsError }, 'Failed to fetch methods');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Failed to load methods. Please try again.</p>
      </div>
    );
  }

  // Buscar método em edição, se aplicável
  let editingMethod = null;
  if (editingMethodId) {
    const { data: methodData, error: methodError } = await supabase
      .from('attack_methods')
      .select('*')
      .eq('id', editingMethodId)
      .single();

    if (!methodError && methodData) {
      editingMethod = methodData;
    }
  }

  // Gerar token CSRF
  const csrfToken = createCsrfToken();

  return (
    <DashboardLayout isAdmin={true}>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-white/50 mx-auto mt-8" />}>
        <AdminMethodsClient methods={methodsData || []} editingMethod={editingMethod} csrfToken={csrfToken} />
      </Suspense>
    </DashboardLayout>
  );
}