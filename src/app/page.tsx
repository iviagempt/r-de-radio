import StationCard from "@/components/StationCard";

export default async function Home() {
  const stations = [{ name: "Rádio Comercial", slug: "comercial" }];
  return (
    <div style={{ padding: 20 }}>
      <h1>Home</h1>
      {stations.map(s => (
        <StationCard key={s.slug} href={`/r/${s.slug}`} name={s.name} />
      ))}
    </div>
  );
}
