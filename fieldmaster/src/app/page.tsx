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
              href="/new"
              className="inline-block bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white"
            >
              Neu anlegen
            </Link>
            <Link
              href="/about"
              className="inline-block bg-secondary-100 px-4 py-2 border border-secondary-500 rounded-md text-white"
            >
              Mehr erfahren
            </Link>
          </div>
        </header>

        <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mt-6">
          <article className="bg-surface p-4 border border-primary-500/10 rounded-md">
            <h3 className="font-semibold text-primary-500">Übersicht</h3>
            <p className="mt-2 text-foreground/90 text-sm">
              Schneller Zugriff auf Felder, Teams und Aktivitäten. Filter, Sortierung und Live-Status.
            </p>
          </article>

          <article className="bg-surface p-4 border border-primary-500/10 rounded-md">
            <h3 className="font-semibold text-primary-500">Planung</h3>
            <p className="mt-2 text-foreground/90 text-sm">
              Planungstools zur Einsatzkoordination mit Kalender-Export und Erinnerungen.
            </p>
          </article>

          <article className="bg-surface p-4 border border-primary-500/10 rounded-md">
            <h3 className="font-semibold text-primary-500">Berichte</h3>
            <p className="mt-2 text-foreground/90 text-sm">
              Exportierbare Berichte und einfache Auswertungen für Management und Team.
            </p>
          </article>
        </div>

        <footer className="mt-6 text-foreground/80 text-sm">
          <p>Willkommen zur App. Starte mit „Neu anlegen“ um loszulegen.</p>
        </footer>
      </section>
    </main>
  )
}