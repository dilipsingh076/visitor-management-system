export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-10 bg-muted-bg rounded-lg w-48 animate-pulse mb-6" />
      <div className="h-12 bg-muted-bg rounded-xl animate-pulse mb-6" />
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-12 text-center text-muted-foreground">Loading…</div>
      </div>
    </div>
  );
}

