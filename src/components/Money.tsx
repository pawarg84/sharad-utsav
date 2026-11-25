export function Money({ cents }: { cents: number }) {
  return (
    <span>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(cents / 100)}
    </span>
  );
}
