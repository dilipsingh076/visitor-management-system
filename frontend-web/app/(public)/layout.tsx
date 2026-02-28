/**
 * Public layout (server). Use for home, about, contact, faq, features, how-it-works, privacy, use-cases.
 * Does not affect URL (route group). All pages under (public) are server-rendered; client components used only where needed.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="public-layout">{children}</div>;
}
