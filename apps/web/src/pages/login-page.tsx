export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-md items-center justify-center">
      <div className="panel hover-lift motion-fade-up w-full p-8">
        <p className="kpi-badge">Sign In</p>
        <h1 className="mt-2 text-3xl font-bold">Login to Pulltora</h1>
        <p className="mt-2 text-sm text-muted-foreground">Secure authentication setup comes in the next phase.</p>
        <form className="mt-6 grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input className="glass-input" placeholder="you@company.com" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input className="glass-input" type="password" placeholder="Enter password" />
          </label>
          <button type="button" className="btn-primary mt-2">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}
