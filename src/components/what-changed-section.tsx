import { CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import { PremiumCard, SectionHeader } from "./premium-card";

interface WhatChangedProps {
  decisions: string[];
  risks: string[];
  opportunities?: string[];
}

export function WhatChangedSection({
  decisions,
  risks,
  opportunities = [],
}: WhatChangedProps) {
  return (
    <section className="mb-12">
      <SectionHeader title="What Changed" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Decisions */}
        <PremiumCard>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="size-5 text-emerald-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-sm">New Decisions</h3>
          </div>
          <ul className="space-y-3">
            {decisions.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-emerald-500 font-bold mt-0.5">→</span>
                <span className="text-foreground/80">{d}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>

        {/* Risks */}
        <PremiumCard>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-sm">Risks</h3>
          </div>
          <ul className="space-y-3">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                <span className="text-foreground/80">{r}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <PremiumCard>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-5 text-blue-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-sm">Opportunities</h3>
            </div>
            <ul className="space-y-3">
              {opportunities.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-blue-500 font-bold mt-0.5">✨</span>
                  <span className="text-foreground/80">{o}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>
        )}
      </div>
    </section>
  );
}
