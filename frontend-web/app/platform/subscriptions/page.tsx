"use client";

import { useState } from "react";
import {
  usePlatformPlans,
  usePlatformSubscriptions,
  usePlatformPayments,
} from "@/features/admin/hooks/usePlatformSubscriptions";
import {
  PageHeader,
  Button,
  StatusBadge,
  Card,
  Tabs,
  SkeletonCard,
  Table,
  TableHead,
  TableTh,
  TableBody,
  TableRow,
  TableTd,
  TableEmpty,
  TableLoading,
  Pagination,
} from "../components";
import {
  CreditCard,
  Package,
  Receipt,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";

type TabId = "plans" | "subscriptions" | "payments";

export default function PlatformSubscriptionsPage() {
  const [tab, setTab] = useState<TabId>("plans");
  const [subsPage, setSubsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);

  const { data: plans, isLoading: plansLoading } = usePlatformPlans(true);
  const { data: subscriptions, isLoading: subsLoading } = usePlatformSubscriptions({
    page: subsPage,
    page_size: 20,
  });
  const { data: payments, isLoading: paymentsLoading } = usePlatformPayments({
    page: paymentsPage,
    page_size: 20,
  });

  const tabs = [
    { id: "plans" as TabId, label: "Plans", icon: <Package className="w-4 h-4" />, count: plans?.length },
    { id: "subscriptions" as TabId, label: "Subscriptions", icon: <CreditCard className="w-4 h-4" />, count: subscriptions?.total },
    { id: "payments" as TabId, label: "Payments", icon: <Receipt className="w-4 h-4" />, count: payments?.total },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions & Billing"
        description="Manage subscription plans, subscriptions, and payments"
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Plan
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => setTab(id as TabId)}
        variant="pills"
      />

      {/* Plans Tab */}
      {tab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plansLoading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : plans?.length === 0 ? (
            <Card className="col-span-full" padding="lg">
              <div className="text-center py-6">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No subscription plans found</p>
              </div>
            </Card>
          ) : (
            plans?.map((plan) => (
              <Card
                key={plan.id}
                padding="md"
                className={!plan.is_active ? "opacity-60" : ""}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.code}</p>
                  </div>
                  {plan.is_active ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    ₹{Number(plan.price).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {plan.max_residents && (
                    <p>Up to {plan.max_residents} residents</p>
                  )}
                  {plan.max_visitors_per_month && (
                    <p>Up to {plan.max_visitors_per_month} visitors/month</p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Edit Plan
                </Button>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {tab === "subscriptions" && (
        <>
          <Table>
            <TableHead>
              <TableTh>Society</TableTh>
              <TableTh>Plan</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Start Date</TableTh>
              <TableTh>End Date</TableTh>
              <TableTh>Auto Renew</TableTh>
            </TableHead>
            <TableBody>
              {subsLoading ? (
                <TableLoading colSpan={6} />
              ) : subscriptions?.items.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  icon={<CreditCard className="w-6 h-6" />}
                  title="No subscriptions found"
                />
              ) : (
                subscriptions?.items.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableTd>
                      <span className="font-medium text-foreground">
                        {sub.society_name || "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="text-sm text-foreground">
                        {sub.plan_name || "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      <StatusBadge status={sub.status} />
                    </TableTd>
                    <TableTd>
                      <span className="text-sm text-muted-foreground">
                        {sub.start_date
                          ? new Date(sub.start_date).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="text-sm text-muted-foreground">
                        {sub.end_date
                          ? new Date(sub.end_date).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      {sub.auto_renew ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableTd>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {subscriptions && subscriptions.total_pages > 1 && (
            <Pagination
              page={subscriptions.page}
              pageSize={20}
              total={subscriptions.total}
              totalPages={subscriptions.total_pages}
              onPageChange={setSubsPage}
            />
          )}
        </>
      )}

      {/* Payments Tab */}
      {tab === "payments" && (
        <>
          <Table>
            <TableHead>
              <TableTh>Society</TableTh>
              <TableTh>Amount</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Method</TableTh>
              <TableTh>Transaction ID</TableTh>
              <TableTh>Date</TableTh>
            </TableHead>
            <TableBody>
              {paymentsLoading ? (
                <TableLoading colSpan={6} />
              ) : payments?.items.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  icon={<Receipt className="w-6 h-6" />}
                  title="No payments found"
                />
              ) : (
                payments?.items.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableTd>
                      <span className="font-medium text-foreground">
                        {payment.society_name || "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="text-sm font-medium text-foreground">
                        {payment.currency} {Number(payment.amount).toLocaleString()}
                      </span>
                    </TableTd>
                    <TableTd>
                      <StatusBadge status={payment.status} />
                    </TableTd>
                    <TableTd>
                      <span className="text-sm text-muted-foreground">
                        {payment.payment_method || "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="text-sm text-muted-foreground font-mono">
                        {payment.transaction_id
                          ? payment.transaction_id.slice(0, 12) + "..."
                          : "—"}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </TableTd>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {payments && payments.total_pages > 1 && (
            <Pagination
              page={payments.page}
              pageSize={20}
              total={payments.total}
              totalPages={payments.total_pages}
              onPageChange={setPaymentsPage}
            />
          )}
        </>
      )}
    </div>
  );
}
