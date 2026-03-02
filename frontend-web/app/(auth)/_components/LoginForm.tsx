import { Input } from "@/components/ui";

type Props = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  showPasswordHint?: boolean;
};

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  showPasswordHint = false,
}: Props) {
  return (
    <>
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
      <Input
        id="password"
        type="password"
        label="Password *"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder="••••••••"
        required
        hint={showPasswordHint ? "Minimum 6 characters" : undefined}
        noMargin
      />
    </>
  );
}
