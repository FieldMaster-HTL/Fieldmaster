import Link from 'next/link'

export default function Page() {
  return (
    <main className="flex justify-center items-center bg-surface p-6 min-h-screen">
      <section className="bg-elevated shadow-md p-8 border rounded-lg w-full max-w-3xl">
        <header className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
          <div>
            <h1 className="font-extrabold text-primary-500 text-3xl md:text-4xl">Fieldmaster</h1>
            <p className="mt-2 text-foreground/90 text-sm">
              Verwaltungstool für Felder und Einsätze — schnell, übersichtlich und zuverlässig.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-block bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white font-medium"
            >
              Zum Dashboard
            </Link>
            <Link
              href="/new"
              className="inline-block bg-secondary-100 hover:bg-secondary-200 px-4 py-2 border border-secondary-500 rounded-md text-foreground font-medium"
            >
              Neu anlegen
            </Link>
          </div>
        </header>

        <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mt-6">
          <article className="bg-surface p-4 border border-primary-500/10 rounded-md hover:border-primary-500/30 transition">
            <h3 className="font-semibold text-primary-500">Übersicht</h3>
            <p className="mt-2 text-foreground/90 text-sm">
              Schneller Zugriff auf Felder und Tasks. Dashboard mit Echtzeit-Status und Filteroptionen.
            </p>
          </article>

          <article className="bg-surface p-4 border border-primary-500/10 rounded-md hover:border-primary-500/30 transition">
            <h3 className="font-semibold text-primary-500">Verwaltung</h3>
            <p className="mt-2 text-foreground/90 text-sm">
              Erstelle und verwalte Areas (Felder) sowie Tasks (Einsätze) zentral an einem Ort.
            </p>
          </article>

          <article className="bg-surface p-4 border border-primary-500/10 rounded-md hover:border-primary-500/30 transition">
            <h3 className="font-semibold text-primary-500">Organisation</h3>
            <p className="mt-2 text-foreground/90 text-sm">
              Ordne Tasks zu Areas zu und behalte den Überblick über alle laufenden und geplanten Arbeiten.
            </p>
          </article>
        </div>

        <footer className="mt-8 pt-6 border-t border-foreground/10">
          <p className="text-foreground/80 text-sm">
            👉 Klicke auf{' '}
            <span className="font-semibold text-primary-500">„Zum Dashboard"</span> um zu starten, oder erstelle neue Areas und Tasks mit{' '}
            <span className="font-semibold text-primary-500">„Neu anlegen"</span>.
          </p>
        </footer>
      </section>
    </main>
  )
}