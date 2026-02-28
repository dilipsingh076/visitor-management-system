export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-10 bg-muted-bg rounded-lg w-40 animate-pulse mb-4" />
      <div className="h-6 bg-muted-bg rounded-lg w-80 animate-pulse mb-8" />
      <div className="h-96 bg-muted-bg rounded-xl animate-pulse" />
    </div>
  );
}

