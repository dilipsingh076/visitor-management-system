import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary opacity-80">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mt-4">Page not found</h2>
        <p className="text-muted mt-2 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton href="/" variant="primary" size="lg">Go home</LinkButton>
          <LinkButton href="/login" variant="secondary" size="lg">Login</LinkButton>
        </div>
      </div>
    </div>
  );
}
