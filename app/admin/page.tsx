import LogoutButton from "./LogoutButton";

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Admin</h1>
          <LogoutButton />
        </div>
        <p className="text-neutral-600">
          Přihlášení funguje 🎉 Sem postupně přibudou objednávky, recenze a dotazy od klientů.
        </p>
      </div>
    </main>
  );
}