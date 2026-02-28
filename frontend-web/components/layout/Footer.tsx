import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="text-xl font-bold text-white">VMS</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Secure, contactless visitor management for Indian gated societies, offices, and factories. DPDP compliant.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-sm text-slate-400 hover:text-emerald-400 transition">Features</Link></li>
              <li><Link href="/use-cases" className="text-sm text-slate-400 hover:text-emerald-400 transition">Use Cases</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-slate-400 hover:text-emerald-400 transition">How it works</Link></li>
              <li><Link href="/faq" className="text-sm text-slate-400 hover:text-emerald-400 transition">FAQ</Link></li>
              <li><Link href="/about" className="text-sm text-slate-400 hover:text-emerald-400 transition">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-emerald-400 transition">Privacy & DPDP</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-400 hover:text-emerald-400 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Quick links</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-sm text-slate-400 hover:text-emerald-400 transition">Login</Link></li>
              <li><Link href="/checkin" className="text-sm text-slate-400 hover:text-emerald-400 transition">Check-in</Link></li>
              <li><Link href="/visitors" className="text-sm text-slate-400 hover:text-emerald-400 transition">Visitors</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          © {year} Visitor Management System. Built for India.
        </div>
      </div>
    </footer>
  );
}
