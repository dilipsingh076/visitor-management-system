import { Input, Select } from "@/components/ui";
import { theme } from "@/lib/theme";

const REGISTER_STEPS = 5;

const SOCIETY_TYPE_OPTIONS = [
  { value: "", label: "— Select type (optional) —" },
  { value: "cooperative_housing", label: "Cooperative Housing Society" },
  { value: "aoa", label: "Apartment Owners Association (AOA)" },
  { value: "rwa", label: "Residents Welfare Association (RWA)" },
  { value: "other", label: "Other" },
];

export type RegisterSocietyState = {
  registerStep: number;
  societyName: string;
  societySlug: string;
  societyAddress: string;
  societyCity: string;
  societyState: string;
  societyPincode: string;
  societyCountry: string;
  contactEmail: string;
  contactPhone: string;
  registrationNumber: string;
  societyType: string;
  registrationYear: string;
  registerBuildings: { name: string; code: string }[];
  adminBuildingIndex: number;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  flatNumber: string;
};

type Props = {
  state: RegisterSocietyState;
  setters: {
    setRegisterStep: (n: number | ((prev: number) => number)) => void;
    setSocietyName: (s: string) => void;
    setSocietySlug: (s: string) => void;
    setSocietyAddress: (s: string) => void;
    setSocietyCity: (s: string) => void;
    setSocietyState: (s: string) => void;
    setSocietyPincode: (s: string) => void;
    setSocietyCountry: (s: string) => void;
    setContactEmail: (s: string) => void;
    setContactPhone: (s: string) => void;
    setRegistrationNumber: (s: string) => void;
    setSocietyType: (s: string) => void;
    setRegistrationYear: (s: string) => void;
    setRegisterBuildings: (updater: (prev: { name: string; code: string }[]) => { name: string; code: string }[]) => void;
    setAdminBuildingIndex: (n: number) => void;
    setFullName: (s: string) => void;
    setEmail: (s: string) => void;
    setPassword: (s: string) => void;
    setPhone: (s: string) => void;
    setFlatNumber: (s: string) => void;
  };
  canProceed: () => boolean;
};

export { REGISTER_STEPS };

export function RegisterSocietyWizard({ state, setters, canProceed }: Props) {
  const step = state.registerStep;

  return (
    <>
      {/* Step progress */}
      <div className={theme.auth.wizardStepHeader}>
        <div className={`flex items-center justify-between ${theme.auth.stepText}`}>
          <span>Step {step} of {REGISTER_STEPS}</span>
          <span>{Math.round((step / REGISTER_STEPS) * 100)}%</span>
        </div>
        <div className={theme.auth.progressBar}>
          <div
            className={theme.auth.progressFill}
            style={{ width: `${(step / REGISTER_STEPS) * 100}%` }}
          />
        </div>
        <p className={theme.auth.stepTitle}>
          {step === 1 && "Society basics"}
          {step === 2 && "Address & contact"}
          {step === 3 && "Official documents"}
          {step === 4 && "Buildings (required)"}
          {step === 5 && "Your admin account"}
        </p>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className={theme.auth.wizardStepBody}>
          <Input
            id="societyName"
            label="Society name *"
            value={state.societyName}
            onChange={(e) => setters.setSocietyName(e.target.value)}
            placeholder="e.g. Green Valley Apartments"
            noMargin
          />
          <Input
            id="societySlug"
            label="Society code (optional)"
            value={state.societySlug}
            onChange={(e) => setters.setSocietySlug(e.target.value)}
            placeholder="Leave blank to derive from name"
            hint="Residents and guards use this code to join."
            noMargin
          />
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="p-6 space-y-4">
          <Input
            id="societyAddress"
            label="Address"
            value={state.societyAddress}
            onChange={(e) => setters.setSocietyAddress(e.target.value)}
            placeholder="Street, area, landmark"
            noMargin
          />
          <div className={theme.grid.formTwoColSm}>
            <Input
              id="societyCity"
              label="City"
              value={state.societyCity}
              onChange={(e) => setters.setSocietyCity(e.target.value)}
              placeholder="City"
              noMargin
            />
            <Input
              id="societyState"
              label="State"
              value={state.societyState}
              onChange={(e) => setters.setSocietyState(e.target.value)}
              placeholder="State"
              noMargin
            />
          </div>
          <div className={theme.grid.formTwoColSm}>
            <Input
              id="societyPincode"
              label="Pincode"
              value={state.societyPincode}
              onChange={(e) => setters.setSocietyPincode(e.target.value)}
              placeholder="400001"
              noMargin
            />
            <Input
              id="societyCountry"
              label="Country"
              value={state.societyCountry}
              onChange={(e) => setters.setSocietyCountry(e.target.value)}
              placeholder="India"
              noMargin
            />
          </div>
          <Input
            id="contactEmail"
            type="email"
            label="Contact email *"
            value={state.contactEmail}
            onChange={(e) => setters.setContactEmail(e.target.value)}
            placeholder="society@example.com"
            required
            noMargin
          />
          <Input
            id="contactPhone"
            type="tel"
            label="Contact phone"
            value={state.contactPhone}
            onChange={(e) => setters.setContactPhone(e.target.value)}
            placeholder="9876543210"
            noMargin
          />
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">Optional but recommended. Helps verify your society.</p>
          <Input
            id="registrationNumber"
            label="Registration number"
            value={state.registrationNumber}
            onChange={(e) => setters.setRegistrationNumber(e.target.value)}
            placeholder="e.g. MH/HSG/2024/12345"
            noMargin
          />
          <Select
            id="societyType"
            label="Type of society"
            value={state.societyType}
            onChange={(e) => setters.setSocietyType(e.target.value)}
            options={SOCIETY_TYPE_OPTIONS}
          />
          <Input
            id="registrationYear"
            label="Year of registration"
            value={state.registrationYear}
            onChange={(e) => setters.setRegistrationYear(e.target.value)}
            placeholder="e.g. 2018"
            noMargin
          />
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className={theme.auth.wizardStepBody}>
          <p className={theme.text.muted}>Add at least one building (tower or wing). You can add more from the dashboard later.</p>
          {state.registerBuildings.map((b, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={b.name}
                  onChange={(e) =>
                    setters.setRegisterBuildings((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p))
                    )
                  }
                  placeholder="e.g. Tower A"
                  className={theme.input.base}
                />
              </div>
              <div className="w-24 min-w-[5rem]">
                <input
                  type="text"
                  value={b.code}
                  onChange={(e) =>
                    setters.setRegisterBuildings((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, code: e.target.value } : p))
                    )
                  }
                  placeholder="Code"
                  className={theme.input.base}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setters.setRegisterBuildings((prev) => prev.filter((_, i) => i !== idx))
                }
                className={theme.auth.wizardRemoveBtn}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setters.setRegisterBuildings((prev) => [...prev, { name: "", code: "" }])
            }
            className={theme.auth.wizardAddLink}
          >
            + Add building
          </button>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className={theme.auth.wizardStepBody}>
          <p className={theme.text.muted}>You will be the first admin. Add more users from the dashboard later.</p>
          <Input
            id="regFullName"
            label="Your full name *"
            value={state.fullName}
            onChange={(e) => setters.setFullName(e.target.value)}
            placeholder="John Doe"
            required
            noMargin
          />
          <Input
            id="regEmail"
            type="email"
            label="Your email (admin login) *"
            value={state.email}
            onChange={(e) => setters.setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            noMargin
          />
          <Input
            id="regPassword"
            type="password"
            label="Password *"
            value={state.password}
            onChange={(e) => setters.setPassword(e.target.value)}
            placeholder="••••••••"
            required
            hint="Minimum 6 characters"
            noMargin
          />
          <Input
            id="regPhone"
            type="tel"
            label="Your phone"
            value={state.phone}
            onChange={(e) => setters.setPhone(e.target.value)}
            placeholder="1234567890"
            noMargin
          />
          {state.registerBuildings.filter((b) => b.name.trim()).length > 0 && (
            <div className="space-y-2">
              <label className={theme.text.label} htmlFor="regBuilding">
                Your building *
              </label>
              <Select
                id="regBuilding"
                value={String(state.adminBuildingIndex)}
                onChange={(e) => setters.setAdminBuildingIndex(parseInt(e.target.value, 10))}
                options={state.registerBuildings
                  .filter((b) => b.name.trim())
                  .map((b, idx) => ({
                    value: String(idx),
                    label: b.code.trim() ? `${b.name.trim()} (${b.code.trim()})` : b.name.trim(),
                  }))}
              />
            </div>
          )}
          <Input
            id="regFlatNumber"
            label="Your flat / unit *"
            value={state.flatNumber}
            onChange={(e) => setters.setFlatNumber(e.target.value)}
            placeholder="e.g. 1201 or A-101"
            noMargin
          />
        </div>
      )}

      {/* Wizard footer */}
      <div className={theme.auth.wizardFooter}>
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setters.setRegisterStep((s) => s - 1)}
            className={theme.auth.wizardBack}
          >
            Back
          </button>
        ) : (
          <div />
        )}
        <div className="flex-1" />
        {step < REGISTER_STEPS ? (
          <button
            type="button"
            onClick={() => {
              if (canProceed()) setters.setRegisterStep((s) => s + 1);
            }}
            disabled={!canProceed()}
            className={theme.auth.wizardNext}
          >
            Next
          </button>
        ) : null}
      </div>
    </>
  );
}
