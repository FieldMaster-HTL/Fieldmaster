import Link from "next/link";

export default function Page() {
  return (
    <main className="bg-surface flex min-h-screen items-center justify-center p-6">
      <section className="bg-elevated w-full max-w-3xl rounded-lg border p-8 shadow-md">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-primary-500 text-3xl font-extrabold md:text-4xl">Fieldmaster</h1>
            <p className="text-foreground/90 mt-2 text-sm">
              Verwaltungstool für Felder und Einsätze — schnell, übersichtlich und zuverlässig.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-primary-500 inline-block rounded-md px-4 py-2 font-medium text-white shadow-sm hover:opacity-95"
            >
              Zum Dashboard
            </Link>
            <Link
              href="/new"
              className="bg-secondary-100 hover:bg-secondary-200 border-secondary-500 text-foreground inline-block rounded-md border px-4 py-2 font-medium"
            >
              Neu anlegen
            </Link>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="bg-surface border-primary-500/10 hover:border-primary-500/30 rounded-md border p-4 transition">
            <h3 className="text-primary-500 font-semibold">Übersicht</h3>
            <p className="text-foreground/90 mt-2 text-sm">
              Schneller Zugriff auf Felder und Tasks. Dashboard mit Echtzeit-Status und
              Filteroptionen.
            </p>
          </article>

          <article className="bg-surface border-primary-500/10 hover:border-primary-500/30 rounded-md border p-4 transition">
            <h3 className="text-primary-500 font-semibold">Verwaltung</h3>
            <p className="text-foreground/90 mt-2 text-sm">
              Erstelle und verwalte Areas (Felder) sowie Tasks (Einsätze) zentral an einem Ort.
            </p>
          </article>

          <article className="bg-surface border-primary-500/10 hover:border-primary-500/30 rounded-md border p-4 transition">
            <h3 className="text-primary-500 font-semibold">Organisation</h3>
            <p className="text-foreground/90 mt-2 text-sm">
              Ordne Tasks zu Areas zu und behalte den Überblick über alle laufenden und geplanten
              Arbeiten.
            </p>
          </article>
        </div>

        <footer className="border-foreground/10 mt-8 border-t pt-6">
          <p className="text-foreground/80 text-sm">
            👉 Klicke auf{" "}
            <span className="text-primary-500 font-semibold">„Zum Dashboard&quot;</span> um zu
            starten, oder erstelle neue Areas und Tasks mit{" "}
            <span className="text-primary-500 font-semibold">„Neu anlegen&quot;</span>.
          </p>
        </footer>
      </section>
    </main>
  );
}
