import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "FitNutricion | Planes personalizados con revisión humana",
  description:
    "Onboarding integral para crear planes de entrenamiento y nutrición revisados por un equipo humano. Sin claims médicos, solo orientación."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
          <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-300">FitNutricion</p>
                  <p className="text-sm text-slate-300">
                    Planes orientativos, revisión humana incluida
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Beta privada</span>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-slate-800/60 px-4 py-8 text-center text-xs text-slate-500">
            Esta información es orientativa y no sustituye consejo médico. Ante dudas, consulta con
            profesionales de salud.
          </footer>
        </div>
      </body>
    </html>
  );
}
