"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFrequentVisitors } from "./useFrequentVisitors";
import type { User } from "@/lib/auth";
import type { FrequentVisitor } from "../types";

export function useFrequentVisitorsPage(user: User | null) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const frequentQ = useFrequentVisitors(Boolean(user));
  const visitors = frequentQ.data ?? [];
  const loading = frequentQ.isLoading;

  const filteredVisitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        (v.purpose && v.purpose.toLowerCase().includes(q))
    );
  }, [visitors, searchQuery]);

  const handleQuickInvite = (visitor: FrequentVisitor) => {
    router.push(
      `/visitors/invite?name=${encodeURIComponent(visitor.name)}&phone=${encodeURIComponent(visitor.phone)}&purpose=${encodeURIComponent(visitor.purpose ?? "")}`
    );
  };

  return {
    visitors: filteredVisitors,
    searchQuery,
    setSearchQuery,
    loading,
    handleQuickInvite,
  };
}
