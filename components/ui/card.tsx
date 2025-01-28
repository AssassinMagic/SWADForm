export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>;
  }
  
  export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="p-4">{children}</div>;
  }  