/**
 * Hook for platform subscriptions management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { adminKeys } from "./keys";
import type { SubscriptionPlan, Subscription, Payment, Invoice } from "../types";

// Plans
export function usePlatformPlans(includeInactive = false) {
  return useQuery({
    queryKey: adminKeys.plans(),
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const res = await apiClient.get<SubscriptionPlan[]>(
        `/admin/subscriptions/plans?include_inactive=${includeInactive}`
      );
      if (res.error) throw new Error(res.error);
      return res.data ?? [];
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SubscriptionPlan>) => {
      const res = await apiClient.post<SubscriptionPlan>("/admin/subscriptions/plans", data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubscriptionPlan> }) => {
      const res = await apiClient.patch<SubscriptionPlan>(`/admin/subscriptions/plans/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
    },
  });
}

// Subscriptions
interface SubscriptionFilters {
  page?: number;
  page_size?: number;
  society_id?: string;
  status?: string;
}

export function usePlatformSubscriptions(filters: SubscriptionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.society_id) params.set("society_id", filters.society_id);
  if (filters.status) params.set("status", filters.status);

  return useQuery({
    queryKey: adminKeys.subscriptionList({ ...filters }),
    queryFn: async () => {
      const res = await apiClient.get<{
        items: Subscription[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      }>(`/admin/subscriptions/subscriptions?${params.toString()}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Subscription>) => {
      const res = await apiClient.post<Subscription>("/admin/subscriptions/subscriptions", data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subscription> }) => {
      const res = await apiClient.patch<Subscription>(`/admin/subscriptions/subscriptions/${id}`, data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
    },
  });
}

// Payments
interface PaymentFilters {
  page?: number;
  page_size?: number;
  society_id?: string;
  status?: string;
}

export function usePlatformPayments(filters: PaymentFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.society_id) params.set("society_id", filters.society_id);
  if (filters.status) params.set("status", filters.status);

  return useQuery({
    queryKey: adminKeys.payments({ ...filters }),
    queryFn: async () => {
      const res = await apiClient.get<{
        items: Payment[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      }>(`/admin/subscriptions/payments?${params.toString()}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}

// Invoices
interface InvoiceFilters {
  page?: number;
  page_size?: number;
  society_id?: string;
  status?: string;
}

export function usePlatformInvoices(filters: InvoiceFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.society_id) params.set("society_id", filters.society_id);
  if (filters.status) params.set("status", filters.status);

  return useQuery({
    queryKey: adminKeys.invoices({ ...filters }),
    queryFn: async () => {
      const res = await apiClient.get<{
        items: Invoice[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      }>(`/admin/subscriptions/invoices?${params.toString()}`);
      if (res.error) throw new Error(res.error);
      return res.data ?? { items: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
    },
  });
}
