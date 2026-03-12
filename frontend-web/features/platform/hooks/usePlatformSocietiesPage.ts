"use client";

import { useState, useCallback } from "react";
import { useSocieties, useCreateSociety } from "./usePlatformSocieties";

function slugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "society";
}

export function usePlatformSocietiesPage(enabled: boolean) {
  const { data: societies = [], isLoading } = useSocieties(enabled);
  const createMutation = useCreateSociety();
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createError, setCreateError] = useState("");

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateError("");
      if (!createName.trim() || !createSlug.trim() || !createEmail.trim()) {
        setCreateError("Name, slug, and contact email are required.");
        return;
      }
      const slug = createSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "society";
      try {
        const created = await createMutation.mutateAsync({
          name: createName.trim(),
          slug,
          contact_email: createEmail.trim(),
        });
        if (created) {
          setCreateName("");
          setCreateSlug("");
          setCreateEmail("");
          setCreating(false);
        } else {
          setCreateError("Failed to create society. Slug may already exist.");
        }
      } catch {
        setCreateError("Failed to create society. Slug may already exist.");
      }
    },
    [createName, createSlug, createEmail, createMutation]
  );

  const setCreateNameWithSlug = useCallback((value: string) => {
    setCreateName(value);
    setCreateSlug((prev) => (prev ? prev : slugFromName(value)));
  }, []);

  return {
    societies,
    isLoading,
    creating,
    setCreating,
    createName,
    setCreateName: setCreateNameWithSlug,
    createSlug,
    setCreateSlug,
    createEmail,
    setCreateEmail,
    createError,
    handleCreate,
    createMutation,
  };
}
