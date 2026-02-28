export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted-bg rounded w-48" />
        <div className="h-12 bg-muted-bg rounded" />
        <div className="h-96 bg-muted-bg rounded-xl" />
      </div>
    </div>
  );
}
