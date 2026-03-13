"use client";

import { useState } from "react";
import {
  usePlatformAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from "@/features/admin/hooks/usePlatformSettings";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  InputField,
  TextareaField,
  SelectField,
  SkeletonCard,
} from "../components";
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Wrench,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  maintenance: Wrench,
  feature: Sparkles,
  urgent: AlertCircle,
};

const TYPE_VARIANTS: Record<string, BadgeVariant> = {
  info: "info",
  warning: "warning",
  maintenance: "secondary",
  feature: "success",
  urgent: "error",
};

const TYPE_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "maintenance", label: "Maintenance" },
  { value: "feature", label: "Feature" },
  { value: "urgent", label: "Urgent" },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "admins", label: "Admins Only" },
  { value: "residents", label: "Residents Only" },
  { value: "guards", label: "Guards Only" },
];

export default function PlatformAnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [targetAudience, setTargetAudience] = useState("all");

  const { data: announcements, isLoading, error } = usePlatformAnnouncements(true);
  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        type,
        target_audience: targetAudience,
        is_active: true,
      });
      setTitle("");
      setContent("");
      setType("info");
      setTargetAudience("all");
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load announcements: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Manage platform-wide announcements and notifications"
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(!showForm)}
          >
            New Announcement
          </Button>
        }
      />

      {/* Create Form */}
      {showForm && (
        <Card>
          <h3 className="text-base font-semibold text-foreground mb-4">
            Create Announcement
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <InputField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              required
            />
            <TextareaField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement content..."
              rows={4}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Type"
                options={TYPE_OPTIONS}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <SelectField
                label="Target Audience"
                options={AUDIENCE_OPTIONS}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
        ) : announcements?.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-6">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No announcements yet</p>
            </div>
          </Card>
        ) : (
          announcements?.map((announcement) => {
            const Icon = TYPE_ICONS[announcement.type] || Info;
            const variant = TYPE_VARIANTS[announcement.type] || "info";
            return (
              <Card
                key={announcement.id}
                className={!announcement.is_active ? "opacity-60" : ""}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg shrink-0 bg-${variant}/10`}>
                    <Icon className={`w-5 h-5 text-${variant}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant={variant}>{announcement.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Target: {announcement.target_audience}
                          </span>
                          <Badge variant={announcement.is_active ? "success" : "secondary"} dot>
                            {announcement.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                        isLoading={deleteMutation.isPending}
                        className="text-error hover:bg-error/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Created: {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
