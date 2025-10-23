// src/app/station/[id]/page.tsx
export default function StationTestPage({ params }: { params: { id: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>Station page OK</h1>
      <p>ID: {params.id}</p>
    </main>
  );
}
