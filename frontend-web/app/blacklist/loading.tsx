export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-10 bg-muted-bg rounded-lg w-64 animate-pulse mb-6" />
      <div className="space-y-4">
        <div className="h-40 bg-muted-bg rounded-xl animate-pulse" />
        <div className="h-40 bg-muted-bg rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
