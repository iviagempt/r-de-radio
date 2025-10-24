// src/components/AppHeader.tsx
"use client";

export default function AppHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 12,
        padding: "12px 16px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <img src="/logo.png" alt="Logo" width={100} height={100} />
      </a>
    </header>
  );
}
