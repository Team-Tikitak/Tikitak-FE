import { cn } from '@/shared/lib';

interface PageSectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export const PageSection = ({ title, className, children }: PageSectionProps) => (
  <section className="flex flex-col gap-4">
    <h2 className="body-2 text-black">{title}</h2>
    <div className={cn('flex flex-col', className)}>{children}</div>
  </section>
);
