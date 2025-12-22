import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revision", label: "Revisión" },
    { href: "/admin/sesiones", label: "Sesiones" },
    { href: "/admin/preguntas", label: "Preguntas" },
    { href: "/admin/plantillas", label: "Plantillas" },
    { href: "/admin/pricing", label: "Pricing" },
    { href: "/admin/testimonios", label: "Testimonios" },
    { href: "/admin/ajustes", label: "Ajustes" }
  ];
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-4">
        <h2 className="text-sm font-semibold text-orange-200">Panel Admin</h2>
        <nav className="mt-4 space-y-2 text-sm">
          {links.map((link) => (
            <Link key={link.href} className="block rounded-lg px-3 py-2 hover:bg-slate-800" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
