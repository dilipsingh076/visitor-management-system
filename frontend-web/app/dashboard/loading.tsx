export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-6">
        <div className="h-10 bg-muted-bg rounded-lg w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-muted-bg rounded-xl animate-pulse" />
          <div className="h-28 bg-muted-bg rounded-xl animate-pulse" />
          <div className="h-28 bg-muted-bg rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

