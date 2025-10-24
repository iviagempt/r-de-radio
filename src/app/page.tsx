export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h1>Home OK</h1>
      <p>Sem handlers de evento nesta página.</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 16
      }}>
        <a href="/r/comercial" style={{ color: "#9cf" }}>Ir para Comercial</a>
      </div>
    </div>
  );
}
