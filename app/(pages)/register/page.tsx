import { AppShell } from "@/components/taskios/app-shell";
import { RegisterForm } from "@/components/taskios/register-form";

export default function RegisterPage() {
  return (
    <AppShell>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-lg ring-1 ring-purple-200/50">
          <RegisterForm />
        </div>
      </main>
    </AppShell>
  );
}
