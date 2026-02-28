export default function Loading() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted-bg rounded w-48 mx-auto" />
        <div className="h-12 bg-muted-bg rounded" />
        <div className="h-12 bg-muted-bg rounded" />
        <div className="h-10 bg-muted-bg rounded w-32" />
      </div>
    </div>
  );
}
