import { Input, Select } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/auth";
import { theme } from "@/lib/theme";

const JOIN_SOCIETY_ROLES = ["resident", "guard"] as const;
type Role = (typeof JOIN_SOCIETY_ROLES)[number];

type Building = { id: string; code: string | null; name: string };

type Props = {
  societyCode: string;
  onSocietyCodeChange: (value: string) => void;
  onSocietyCodeBlur?: () => void;
  societyNotFound: boolean;
  societyLoading?: boolean;
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  fullName: string;
  onFullNameChange: (value: string) => void;
  buildings: Building[];
  selectedBuildingId: string;
  onBuildingChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  flatNumber: string;
  onFlatNumberChange: (value: string) => void;
};

export function SignupForm({
  societyCode,
  onSocietyCodeChange,
  onSocietyCodeBlur,
  societyNotFound,
  societyLoading = false,
  selectedRole,
  onRoleChange,
  fullName,
  onFullNameChange,
  buildings,
  selectedBuildingId,
  onBuildingChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  phone,
  onPhoneChange,
  flatNumber,
  onFlatNumberChange,
}: Props) {
  return (
    <div className="space-y-4 [&_input]:py-2.5 [&_select]:py-2.5">
      {/* Society code: enter then tab out to load buildings */}
      <div className="space-y-3">
        <Input
          id="societyCode"
          label="Society code *"
          value={societyCode}
          onChange={(e) => onSocietyCodeChange(e.target.value)}
          onBlur={onSocietyCodeBlur}
          placeholder="e.g. green-valley or demo-society"
          required
          hint={societyLoading ? "Checking society…" : "Enter your society code and tab out to load buildings. Get the code from your committee or register a new society."}
          error={
            societyNotFound
              ? "Society not found. Check the code or register a new society."
              : undefined
          }
          noMargin
        />
        <div>
          <label className={theme.text.label}>I am a *</label>
          <div className="flex gap-2 mt-1.5">
            {JOIN_SOCIETY_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRoleChange(r)}
                className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-sm font-medium border-2 transition ${selectedRole === r ? theme.auth.roleButtonActive : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Committee roles are assigned when you Register a society.</p>
        </div>
      </div>

      {/* Building + Flat (after society is loaded) */}
      {buildings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted-bg/50 border border-border">
          <Select
            id="building"
            label="Building *"
            value={selectedBuildingId}
            onChange={(e) => onBuildingChange(e.target.value)}
            options={[
              { value: "", label: "— Select your building —" },
              ...buildings.map((b) => ({
                value: b.id,
                label: b.code ? `${b.name} (${b.code})` : b.name,
              })),
            ]}
          />
          <Input
            id="flatNumber"
            label="Flat / unit *"
            value={flatNumber}
            onChange={(e) => onFlatNumberChange(e.target.value)}
            placeholder="e.g. 101, A-201"
            noMargin
          />
        </div>
      )}

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="fullName"
          label="Full name *"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          placeholder="John Doe"
          required
          noMargin
        />
        <Input
          id="email"
          type="email"
          label="Email *"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          required
          noMargin
        />
      </div>

      {/* Password + confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Input
            id="password"
            type="password"
            label="Password *"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            required
            noMargin
          />
          <p className={theme.text.mutedSmall}>Min 6 characters</p>
        </div>
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm password *"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="••••••••"
          required
          noMargin
        />
      </div>

      {/* Phone */}
      <Input
        id="phone"
        type="tel"
        label="Phone"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="1234567890"
        noMargin
      />
    </div>
  );
}
