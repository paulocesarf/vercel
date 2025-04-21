import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Loader2, Pencil, Trash2, DollarSign, Clock, Shield } from 'lucide-react';
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
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const logger = pino({ level: 'info' });

// Esquema de validação
const planFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }).regex(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers, and spaces.',
  }),
  max_concurrent_attacks: z.coerce.number().int().min(1).max(100, {
    message: 'Must be between 1 and 100.',
  }),
  max_time: z.coerce.number().int().min(1).max(3600, {
    message: 'Must be between 1 and 3600 seconds.',
  }),
  price: z.coerce.number().min(0).max(10000, {
    message: 'Price must be between 0 and 10000 USD.',
  }),
});

// Componente cliente para formulário
async function AdminPlansClient({
  plans,
  editingPlan,
  csrfToken,
}: {
  plans: any[];
  editingPlan: any | null;
  csrfToken: string;
}) {
  'use client';
  import { useRouter } from 'next/navigation';
  import { useState } from 'react';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useForm } from 'react-hook-form';
  import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: editingPlan
      ? {
          name: editingPlan.name,
          max_concurrent_attacks: editingPlan.max_concurrent_attacks,
          max_time: editingPlan.max_time,
          price: editingPlan.price,
        }
      : {
          name: '',
          max_concurrent_attacks: 1,
          max_time: 60,
          price: 0,
        },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Plan Management</h1>
        <p className="text-white/70">Manage subscription plans</p>
      </div>

      <Card className="bg-black/30 border-white/10 text-white">
        <CardHeader>
          <CardTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</CardTitle>
          <CardDescription className="text-white/70">
            {editingPlan ? 'Update plan details' : 'Add a new subscription plan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={async (formData: FormData) => {
                setIsSubmitting(true);
                try {
                  const response = await fetch('/api/admin/plans', {
                    method: 'POST',
                    body: JSON.stringify({
                      id: editingPlan?.id,
                      name: formData.get('name'),
                      max_concurrent_attacks: parseInt(formData.get('max_concurrent_attacks') as string),
                      max_time: parseInt(formData.get('max_time') as string),
                      price: parseFloat(formData.get('price') as string),
                      csrfToken,
                    }),
                    headers: { 'Content-Type': 'application/json' },
                  });
                  const result = await response.json();
                  if (!response.ok) {
                    throw new Error(result.error || 'Failed to save plan');
                  }
                  toast({
                    title: editingPlan ? 'Plan Updated' : 'Plan Created',
                    description: `Plan ${formData.get('name')} has been ${
                      editingPlan ? 'updated' : 'created'
                    } successfully.`,
                  });
                  form.reset();
                  router.refresh();
                } catch (error: any) {
                  toast({
                    title: 'Error',
                    description: error.message || 'Failed to save plan. Please try again.',
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Plan Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Basic, Pro, Enterprise"
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Price (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className="bg-black/50 border-white/20 text-white pl-8"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_concurrent_attacks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Concurrent Attacks</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                          <Input
                            type="number"
                            {...field}
                            className="bg-black/50 border-white/20 text-white pl-8"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Attack Time (seconds)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                          <Input
                            type="number"
                            {...field}
                            className="bg-black/50 border-white/20 text-white pl-8"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
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
                      {editingPlan ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingPlan ? (
                    'Update Plan'
                  ) : (
                    'Create Plan'
                  )}
                </Button>

                {editingPlan && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => router.push('/dashboard/admin/plans')}
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
          <CardTitle>Plans</CardTitle>
          <CardDescription className="text-white/70">Manage all subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Price</TableHead>
                  <TableHead className="text-white">Max Concurrent</TableHead>
                  <TableHead className="text-white">Max Time</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} className="border-white/10">
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>${plan.price.toFixed(2)}</TableCell>
                    <TableCell>{plan.max_concurrent_attacks}</TableCell>
                    <TableCell>{plan.max_time} seconds</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() => router.push(`/dashboard/admin/plans?edit=${plan.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <form
                          action={async () => {
                            try {
                              const response = await fetch('/api/admin/plans', {
                                method: 'DELETE',
                                body: JSON.stringify({ id: plan.id, csrfToken }),
                                headers: { 'Content-Type': 'application/json' },
                              });
                              if (!response.ok) {
                                const result = await response.json();
                                throw new Error(result.error || 'Failed to delete plan');
                              }
                              toast({
                                title: 'Plan Deleted',
                                description: 'Plan has been deleted successfully.',
                              });
                              router.refresh();
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error.message || 'Failed to delete plan. Please try again.',
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

export default async function AdminPlansPage({ request }: { request: Request }) {
  // Rate limiting: 10 requisições por IP em 5 minutos
  const { success, limit, remaining } = await rateLimit(request, { max: 10, windowMs: 5 * 60 * 1000 });
  if (!success) {
    logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin plans page');
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Too many requests. Please try again later.</p>
      </div>
    );
  }

  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    logger.info({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized access to admin plans page');
    redirect('/login');
  }

  // Verificar se é admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
    logger.warn({ userId: user?.id }, 'Non-admin attempted access to admin plans page');
    redirect('/dashboard');
  }

  // Obter query de edição
  const url = new URL(request.url);
  const editingPlanId = url.searchParams.get('edit');

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

  // Buscar plano em edição, se aplicável
  let editingPlan = null;
  if (editingPlanId) {
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', editingPlanId)
      .single();

    if (!planError && planData) {
      editingPlan = planData;
    }
  }

  // Gerar token CSRF
  const csrfToken = createCsrfToken();

  return (
    <DashboardLayout isAdmin={true}>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-white/50 mx-auto mt-8" />}>
        <AdminPlansClient plans={plansData || []} editingPlan={editingPlan} csrfToken={csrfToken} />
      </Suspense>
    </DashboardLayout>
  );
}