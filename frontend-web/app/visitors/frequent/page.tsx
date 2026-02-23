"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getCachedUser, canInviteVisitor } from "@/lib/auth";
import { Avatar, Button, Input, Badge, Modal, EmptyState, PageHeader } from "@/components/ui";

interface FrequentVisitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visit_count: number;
  last_visit?: string;
  is_preapproved?: boolean;
}

export default function FrequentVisitorsPage() {
  const router = useRouter();
  const [visitors, setVisitors] = useState<FrequentVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ name: "", phone: "", purpose: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const user = getCachedUser();
    if (!canInviteVisitor(user)) {
      router.push("/dashboard");
      return;
    }

    // Mock data - replace with API call
    setVisitors([
      { id: "1", name: "Ramesh Kumar", phone: "9876543210", purpose: "Maid / Domestic Help", visit_count: 45, last_visit: "Today", is_preapproved: true },
      { id: "2", name: "Suresh Singh", phone: "9876543211", purpose: "Driver", visit_count: 30, last_visit: "Today", is_preapproved: true },
      { id: "3", name: "Meera Devi", phone: "9876543212", purpose: "Cook", visit_count: 28, last_visit: "Yesterday", is_preapproved: true },
      { id: "4", name: "Fitness Trainer Raj", phone: "9876543213", purpose: "Personal Trainer", visit_count: 12, last_visit: "2 days ago", is_preapproved: false },
      { id: "5", name: "Amazon Delivery", phone: "9876543214", purpose: "Delivery", visit_count: 8, last_visit: "Last week", is_preapproved: false },
    ]);
    setLoading(false);
  }, [router]);

  const handleAddVisitor = async () => {
    if (!newVisitor.name || !newVisitor.phone) return;
    setSaving(true);
    
    // Mock API call - replace with actual implementation
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setVisitors((prev) => [
      {
        id: Date.now().toString(),
        name: newVisitor.name,
        phone: newVisitor.phone,
        purpose: newVisitor.purpose || "Regular Visitor",
        visit_count: 0,
        is_preapproved: false,
      },
      ...prev,
    ]);
    
    setNewVisitor({ name: "", phone: "", purpose: "" });
    setShowAddModal(false);
    setSaving(false);
  };

  const handleTogglePreapproval = async (visitorId: string) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitorId ? { ...v, is_preapproved: !v.is_preapproved } : v
      )
    );
  };

  const handleQuickInvite = (visitor: FrequentVisitor) => {
    router.push(`/visitors/invite?name=${encodeURIComponent(visitor.name)}&phone=${visitor.phone}&purpose=${encodeURIComponent(visitor.purpose)}`);
  };

  const handleRemove = async (visitorId: string) => {
    if (!confirm("Remove this visitor from your frequent list?")) return;
    setVisitors((prev) => prev.filter((v) => v.id !== visitorId));
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted-bg rounded w-48" />
          <div className="h-12 bg-muted-bg rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted-bg rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Frequent Visitors"
        description="Manage your regular visitors for quick invitations"
        action={
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Visitor
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          placeholder="Search by name, phone, or purpose..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pre-approved Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-5 rounded bg-success" />
          Pre-approved Visitors
          <Badge variant="success">{filteredVisitors.filter((v) => v.is_preapproved).length}</Badge>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          These visitors can check in without requiring your approval each time
        </p>

        {filteredVisitors.filter((v) => v.is_preapproved).length > 0 ? (
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {filteredVisitors
              .filter((v) => v.is_preapproved)
              .map((visitor) => (
                <div key={visitor.id} className="p-4 flex items-center justify-between hover:bg-muted-bg/50 transition">
                  <div className="flex items-center gap-3">
                    <Avatar name={visitor.name} size="lg" />
                    <div>
                      <p className="font-semibold text-foreground">{visitor.name}</p>
                      <p className="text-sm text-muted-foreground">{visitor.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {visitor.visit_count} visits · Last: {visitor.last_visit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleQuickInvite(visitor)}>
                      Quick Invite
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePreapproval(visitor.id)}
                      title="Disable pre-approval"
                    >
                      <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            No pre-approved visitors. Enable pre-approval for regular visitors below.
          </div>
        )}
      </div>

      {/* Regular Frequent Visitors */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-5 rounded bg-primary" />
          Other Frequent Visitors
          <Badge variant="secondary">{filteredVisitors.filter((v) => !v.is_preapproved).length}</Badge>
        </h2>

        {filteredVisitors.filter((v) => !v.is_preapproved).length > 0 ? (
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {filteredVisitors
              .filter((v) => !v.is_preapproved)
              .map((visitor) => (
                <div key={visitor.id} className="p-4 flex items-center justify-between hover:bg-muted-bg/50 transition">
                  <div className="flex items-center gap-3">
                    <Avatar name={visitor.name} size="lg" />
                    <div>
                      <p className="font-semibold text-foreground">{visitor.name}</p>
                      <p className="text-sm text-muted-foreground">{visitor.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {visitor.visit_count} visits · Last: {visitor.last_visit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleQuickInvite(visitor)}>
                      Invite
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePreapproval(visitor.id)}
                      title="Enable pre-approval"
                    >
                      <svg className="w-5 h-5 text-muted-foreground hover:text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(visitor.id)}
                      className="text-error hover:bg-error/10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="No frequent visitors yet"
            description="Visitors you invite multiple times will automatically appear here"
            action={
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Visitor
              </Button>
            }
          />
        )}
      </div>

      {/* Add Visitor Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Frequent Visitor">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <Input
              placeholder="Visitor name"
              value={newVisitor.name}
              onChange={(e) => setNewVisitor((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
            <Input
              placeholder="10-digit phone number"
              value={newVisitor.phone}
              onChange={(e) => setNewVisitor((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Purpose / Role</label>
            <Input
              placeholder="e.g., Maid, Driver, Trainer"
              value={newVisitor.purpose}
              onChange={(e) => setNewVisitor((prev) => ({ ...prev, purpose: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVisitor} loading={saving} disabled={!newVisitor.name || !newVisitor.phone}>
              Add Visitor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
