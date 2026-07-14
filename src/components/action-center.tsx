import {
  Mail,
  Calendar,
  FileText,
  Play,
  Zap,
  Share2,
} from "lucide-react";
import { PremiumCard, SectionHeader } from "./premium-card";
import type { ActionCard as ActionCardType } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<any>> = {
  Mail,
  Calendar,
  FileText,
  Zap,
  Share2,
};

interface ActionCenterProps {
  actionCards?: ActionCardType[];
}

export function ActionCenter({ actionCards = [] }: ActionCenterProps) {
  const defaultCards: ActionCardType[] = [
    {
      id: "ac1",
      title: "Draft Follow-up Email",
      description: "Generate personalized follow-up message",
      icon: "Mail",
      action: "Generate",
    },
    {
      id: "ac2",
      title: "Create Calendar Reminder",
      description: "Schedule action item reminders",
      icon: "Calendar",
      action: "Create",
    },
    {
      id: "ac3",
      title: "Export Summary",
      description: "Download meeting summary as document",
      icon: "FileText",
      action: "Export",
    },
  ];

  const cards = actionCards.length > 0 ? actionCards : defaultCards;

  return (
    <section className="mb-12">
      <SectionHeader
        icon={<Zap className="size-5" strokeWidth={1.75} />}
        title="Action Center"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = iconMap[card.icon] || FileText;
          return (
            <PremiumCard key={card.id} className="hover:shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-5 text-brand-accent" strokeWidth={1.75} />
                      <h3 className="font-semibold text-sm">{card.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors">
                  <Play className="size-3" strokeWidth={2} />
                  {card.action}
                </button>
              </div>
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
