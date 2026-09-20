export default function PageHead({ title, children }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted">{children}</p>
    </div>
  );
}
