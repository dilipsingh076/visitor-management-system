export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/20" />
        <div className="h-4 w-48 rounded bg-muted-bg" />
        <div className="h-3 w-64 rounded bg-muted-bg" />
      </div>
    </div>
  );
}
