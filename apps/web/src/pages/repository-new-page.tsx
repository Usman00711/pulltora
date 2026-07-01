export default function RepositoryNewPage() {
  return (
    <section className="mx-auto max-w-xl">
      <div className="panel hover-lift motion-fade-up p-8">
        <p className="kpi-badge">Connect Repository</p>
        <h1 className="mt-2 text-3xl font-bold">Add Repository</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connect a repository to start pull request and issue risk analysis.</p>
        <form className="mt-5 space-y-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Repository URL</span>
            <input className="glass-input" placeholder="https://github.com/owner/repository" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Team</span>
            <input className="glass-input" placeholder="Engineering squad name" />
          </label>
          <button type="button" className="btn-primary mt-2">
            Save repository
          </button>
        </form>
      </div>
    </section>
  );
}
