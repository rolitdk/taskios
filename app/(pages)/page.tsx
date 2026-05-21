import type { Metadata } from "next";

import { AppShell } from "@/components/ui/app-shell";
import { HomeLanding } from "@/components/ui/home-landing";

export const metadata: Metadata = {
  title: "Taskios — доски задач для ваших проектов",
  description:
    "Канбан-доски с drag & drop: планируйте задачи и проекты в удобном интерфейсе Taskios.",
};

export default function HomePage() {
  return (
    <AppShell>
      <HomeLanding />
    </AppShell>
  );
}
