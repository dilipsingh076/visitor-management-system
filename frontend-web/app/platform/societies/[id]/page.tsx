"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  usePlatformSocietyDetail,
  useUpdateSociety,
  useActivateSociety,
  useDeactivateSociety,
  useAssignSocietyAdmin,
} from "@/features/admin/hooks/usePlatformSocieties";
import {
  PageHeader,
  Button,
  Badge,
  Card,
  StatCard,
  Input,
  Select,
  Modal,
  InputField,
  SelectField,
  SkeletonCard,
} from "../../components";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  X,
  UserPlus,
  Shield,
} from "lucide-react";

export default function SocietyDetailPage() {
  const params = useParams();
  const societyId = params.id as string;

  const { data: society, isLoading, error } = usePlatformSocietyDetail(societyId);
  const updateMutation = useUpdateSociety();
  const activateMutation = useActivateSociety();
  const deactivateMutation = useDeactivateSociety();
  const assignAdminMutation = useAssignSocietyAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [showAssignAdmin, setShowAssignAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    contact_email: "",
    contact_phone: "",
    registration_number: "",
    society_type: "",
    plan: "",
  });
  const [adminForm, setAdminForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "chairman",
  });

  const handleEdit = () => {
    if (society) {
      setFormData({
        name: society.name || "",
        address: society.address || "",
        city: society.city || "",
        state: society.state || "",
        pincode: society.pincode || "",
        country: society.country || "",
        contact_email: society.contact_email || "",
        contact_phone: society.contact_phone || "",
        registration_number: society.registration_number || "",
        society_type: society.society_type || "",
        plan: society.plan || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: societyId,
        data: formData,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update society:", err);
    }
  };

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(societyId);
    } catch (err) {
      console.error("Failed to activate:", err);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(societyId);
    } catch (err) {
      console.error("Failed to deactivate:", err);
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignAdminMutation.mutateAsync({
        societyId,
        data: adminForm,
      });
      setShowAssignAdmin(false);
      setAdminForm({ email: "", full_name: "", phone: "", role: "chairman" });
    } catch (err) {
      console.error("Failed to assign admin:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading..."
          breadcrumbs={[{ label: "Societies", href: "/platform/societies" }, { label: "..." }]}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error || !society) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Society Not Found"
          breadcrumbs={[{ label: "Societies", href: "/platform/societies" }, { label: "Error" }]}
        />
        <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
          {error?.message || "Society not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: "Societies", href: "/platform/societies" },
          { label: society.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{society.name}</h1>
            <p className="text-sm text-muted-foreground">{society.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing && (
            <>
              <Button
                variant="secondary"
                leftIcon={<Edit2 className="w-4 h-4" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => setShowAssignAdmin(true)}
              >
                Assign Admin
              </Button>
              {society.is_active ? (
                <Button
                  variant="outline"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={handleDeactivate}
                  isLoading={deactivateMutation.isPending}
                  className="text-error border-error/30 hover:bg-error/10"
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleActivate}
                  isLoading={activateMutation.isPending}
                  className="text-success border-success/30 hover:bg-success/10"
                >
                  Activate
                </Button>
              )}
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="secondary"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={society.is_active ? "success" : "error"} dot size="lg">
          {society.is_active ? "Active" : "Inactive"}
        </Badge>
        {society.plan && (
          <Badge variant="primary" size="lg">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            {society.plan} Plan
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Buildings"
          value={society.total_buildings}
          icon={Building2}
          color="primary"
        />
        <StatCard
          label="Residents"
          value={society.total_residents}
          icon={Users}
          color="success"
        />
        <StatCard
          label="Visitors Today"
          value={society.total_visitors_today ?? 0}
          icon={Users}
          color="warning"
        />
        <StatCard
          label="Visitors This Month"
          value={society.total_visitors_month ?? 0}
          icon={Users}
          color="info"
        />
      </div>

      {/* Details Card */}
      <Card padding="none">
        <div className="px-5 py-3 border-b border-border bg-muted-bg/30">
          <h2 className="text-sm font-semibold text-foreground">Society Details</h2>
        </div>
        <div className="p-5">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Society Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <InputField
                label="Registration Number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              />
              <SelectField
                label="Society Type"
                value={formData.society_type}
                onChange={(e) => setFormData({ ...formData, society_type: e.target.value })}
                options={[
                  { value: "", label: "Select type" },
                  { value: "residential", label: "Residential" },
                  { value: "commercial", label: "Commercial" },
                  { value: "mixed", label: "Mixed" },
                ]}
              />
              <SelectField
                label="Plan"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                options={[
                  { value: "", label: "Select plan" },
                  { value: "basic", label: "Basic" },
                  { value: "standard", label: "Standard" },
                  { value: "premium", label: "Premium" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
              />
              <InputField
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="md:col-span-2"
              />
              <InputField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <InputField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <InputField
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
              <InputField
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <InputField
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
              <InputField
                label="Contact Phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow icon={Building2} label="Society Type" value={society.society_type || "—"} />
              <InfoRow icon={Building2} label="Registration Number" value={society.registration_number || "—"} />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={
                  [society.address, society.city, society.state, society.pincode, society.country]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
                className="md:col-span-2"
              />
              <InfoRow icon={Mail} label="Contact Email" value={society.contact_email || "—"} />
              <InfoRow icon={Phone} label="Contact Phone" value={society.contact_phone || "—"} />
              <InfoRow
                icon={Calendar}
                label="Created"
                value={new Date(society.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              <InfoRow
                icon={Calendar}
                label="Last Updated"
                value={new Date(society.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Assign Admin Modal */}
      <Modal
        isOpen={showAssignAdmin}
        onClose={() => setShowAssignAdmin(false)}
        title="Assign Society Admin"
      >
        <form onSubmit={handleAssignAdmin} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            required
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            placeholder="admin@example.com"
          />
          <InputField
            label="Full Name"
            required
            value={adminForm.full_name}
            onChange={(e) => setAdminForm({ ...adminForm, full_name: e.target.value })}
            placeholder="John Doe"
          />
          <InputField
            label="Phone"
            type="tel"
            value={adminForm.phone}
            onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
            placeholder="+91 9876543210"
          />
          <SelectField
            label="Role"
            value={adminForm.role}
            onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
            options={[
              { value: "chairman", label: "Chairman" },
              { value: "secretary", label: "Secretary" },
              { value: "treasurer", label: "Treasurer" },
            ]}
          />
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAssignAdmin(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={assignAdminMutation.isPending}
            >
              Assign Admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-lg bg-muted-bg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}
