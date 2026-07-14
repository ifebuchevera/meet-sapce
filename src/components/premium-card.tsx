export function PremiumCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-border/80 hover:bg-surface/80 animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="text-brand-accent">{icon}</div>}
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
