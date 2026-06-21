interface Section {
  heading: string;
  body: string;
}

export function LegalPage({ title, lastUpdated, sections }: { title: string; lastUpdated: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 text-3xl font-bold">{title}</h1>
      <p className="mb-8 text-sm text-gray-400">{lastUpdated}</p>
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="mb-2 text-lg font-bold">{s.heading}</h2>
            <p className="whitespace-pre-line leading-7 text-gray-700">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
