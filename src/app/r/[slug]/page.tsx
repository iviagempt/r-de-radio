export const dynamic = "force-dynamic";

export default function StationDebug({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Rota /r/[slug] OK</h1>
      <p>Slug: {params.slug}</p>
    </div>
  );
}
