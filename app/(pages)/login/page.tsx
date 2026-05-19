import { AppShell } from "@/components/taskios/app-shell";
import { LoginForm } from "@/components/taskios/login-form";

export default function LoginPage() {
  return (
    <AppShell>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-lg ring-1 ring-purple-200/50">
          <LoginForm />
        </div>
      </main>
    </AppShell>
  );
}
