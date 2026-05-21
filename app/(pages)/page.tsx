import type { Metadata } from "next";

import { AppShell } from "@/components/ui/app-shell";
import { HomeLanding } from "@/components/ui/home-landing";

export const metadata: Metadata = {
  title: "Taskios — канбан-доски для задач и проектов",
  description:
    "Спокойный канбан с drag & drop, тегами и несколькими досками — для фриланса и небольших команд.",
};

export default function HomePage() {
  return (
    <AppShell>
      <HomeLanding />
    </AppShell>
  );
}
