function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl tracking-tight text-onyx">{title}</h1>
      <p className="text-sm text-onyx/60">{description}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Placeholder
      title="Analytics"
      description="Sales, conversion, and inventory analytics will aggregate from orders and products on this page."
    />
  );
}
