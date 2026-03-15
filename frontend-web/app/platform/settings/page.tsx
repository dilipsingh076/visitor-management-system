"use client";

import { useState } from "react";
import {
  usePlatformSettings,
  useUpdateSetting,
} from "@/features/admin/hooks/usePlatformSettings";
import {
  PageHeader,
  Button,
  Card,
  Input,
  Select,
  SkeletonCard,
  useToast,
} from "../components";
import { Settings, Save, RefreshCw, Plus } from "lucide-react";

export default function PlatformSettingsPage() {
  const toast = useToast();
  const { data: settings, isLoading, error, refetch } = usePlatformSettings();
  const updateMutation = useUpdateSetting();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const value = editedSettings[key];
    if (value === undefined) return;

    try {
      await updateMutation.mutateAsync({ key, value });
      setEditedSettings((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success("Setting saved", `${key} updated.`);
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Save failed", err instanceof Error ? err.message : "Could not save setting.");
    }
  };

  const groupedSettings = settings?.reduce(
    (acc, setting) => {
      const category = setting.category || "general";
      if (!acc[category]) acc[category] = [];
      acc[category].push(setting);
      return acc;
    },
    {} as Record<string, typeof settings>
  );

  if (error) {
    return (
      <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
        Failed to load settings: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure platform-wide settings and preferences"
        actions={
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />

      {/* Settings */}
      {isLoading ? (
        <SkeletonCard />
      ) : !settings?.length ? (
        <Card padding="lg">
          <div className="text-center py-6">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No settings configured yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Settings will appear here once created via the API
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings || {}).map(([category, categorySettings]) => (
            <Card key={category} padding="none">
              <div className="px-5 py-3 border-b border-border bg-muted-bg/30">
                <h3 className="font-semibold text-foreground capitalize text-sm">
                  {category.replace(/_/g, " ")}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {categorySettings?.map((setting) => {
                  const currentValue =
                    editedSettings[setting.key] ?? setting.value ?? "";
                  const hasChanges = editedSettings[setting.key] !== undefined;

                  return (
                    <div
                      key={setting.key}
                      className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{setting.key}</p>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {setting.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:w-72">
                        {setting.value_type === "boolean" ? (
                          <Select
                            options={[
                              { value: "true", label: "True" },
                              { value: "false", label: "False" },
                            ]}
                            value={currentValue}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                          />
                        ) : (
                          <Input
                            type={setting.value_type === "number" ? "number" : "text"}
                            value={currentValue}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                          />
                        )}
                        <Button
                          size="icon"
                          onClick={() => handleSave(setting.key)}
                          disabled={!hasChanges}
                          isLoading={updateMutation.isPending}
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Setting */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4 text-sm">Add New Setting</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const key = (form.elements.namedItem("key") as HTMLInputElement).value;
            const value = (form.elements.namedItem("value") as HTMLInputElement).value;
            const description = (
              form.elements.namedItem("description") as HTMLInputElement
            ).value;

            if (!key.trim() || !value.trim()) return;

            try {
              await updateMutation.mutateAsync({
                key: key.trim(),
                value: value.trim(),
                description: description.trim() || undefined,
              });
              form.reset();
            } catch (err) {
              console.error("Failed to create:", err);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <Input
            name="key"
            type="text"
            placeholder="Setting key"
            required
          />
          <Input
            name="value"
            type="text"
            placeholder="Value"
            required
          />
          <Input
            name="description"
            type="text"
            placeholder="Description (optional)"
          />
          <Button type="submit" isLoading={updateMutation.isPending} leftIcon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
        </form>
      </Card>
    </div>
  );
}
