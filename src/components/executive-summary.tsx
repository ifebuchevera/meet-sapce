import { Lightbulb } from "lucide-react";
import { PremiumCard, SectionHeader } from "./premium-card";

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <section className="mb-12">
      <SectionHeader
        icon={<Lightbulb className="size-5" strokeWidth={1.75} />}
        title="Executive Summary"
      />
      <PremiumCard>
        <p className="text-base md:text-lg leading-relaxed font-light text-foreground/90">
          {summary}
        </p>
      </PremiumCard>
    </section>
  );
}
