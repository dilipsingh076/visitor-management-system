"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  Button,
  InputField,
  SelectField,
  TextareaField,
} from "../../components";
import { Building2, Save, X } from "lucide-react";
import { createSociety } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/features/admin/hooks/keys";

interface SocietyFormData {
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contact_email: string;
  contact_phone: string;
  registration_number: string;
  society_type: string;
  plan: string;
}

const SOCIETY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed", label: "Mixed Use" },
  { value: "industrial", label: "Industrial" },
];

const PLANS = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "enterprise", label: "Enterprise" },
];

const INDIAN_STATES = [
  { value: "", label: "Select State" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Delhi", label: "Delhi" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Puducherry", label: "Puducherry" },
];

export default function NewSocietyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SocietyFormData>({
    name: "",
    slug: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    contact_email: "",
    contact_phone: "",
    registration_number: "",
    society_type: "residential",
    plan: "basic",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});

  const createMutation = useMutation({
    mutationFn: async (data: SocietyFormData) => {
      const result = await createSociety({
        name: data.name,
        slug: data.slug,
        address: data.address || undefined,
        city: data.city,
        state: data.state,
        pincode: data.pincode || undefined,
        country: data.country || undefined,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || undefined,
        plan: data.plan,
        status: "active",
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.societies() });
      router.push("/platform/societies");
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "name" && !prev.slug) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
    if (errors[name as keyof SocietyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Invalid email format";
    }
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.contact_phone.replace(/\D/g, ""))) {
      newErrors.contact_phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync(formData);
    } catch (err) {
      console.error("Failed to create society:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Add New Society"
        description="Register a new society on the platform"
        breadcrumbs={[
          { label: "Societies", href: "/platform/societies" },
          { label: "New Society" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <Card>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Society Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Green Valley Apartments"
              error={errors.name}
              required
            />
            <InputField
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="green-valley-apartments"
              error={errors.slug}
              required
            />
            <SelectField
              label="Society Type"
              name="society_type"
              value={formData.society_type}
              onChange={handleChange}
              options={SOCIETY_TYPES}
            />
            <SelectField
              label="Subscription Plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              options={PLANS}
            />
            <InputField
              label="Registration Number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="Society registration number"
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Address */}
        <Card>
          <h3 className="text-sm font-semibold text-foreground mb-4">Address Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaField
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="Full street address"
              className="md:col-span-2"
            />
            <InputField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              error={errors.city}
              required
            />
            <SelectField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              options={INDIAN_STATES}
              error={errors.state}
              required
            />
            <InputField
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
            />
            <InputField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Contact Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="admin@society.com"
              error={errors.contact_email}
              required
            />
            <InputField
              label="Contact Phone"
              name="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
              error={errors.contact_phone}
              required
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            leftIcon={<X className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={createMutation.isPending}
          >
            Create Society
          </Button>
        </div>

        {createMutation.isError && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
            Failed to create society. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
