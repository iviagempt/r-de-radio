"use client";

import { useState } from "react";

export default function SearchClient({
  placeholder,
  onChange,
  style,
}: {
  placeholder?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}) {
  const [q, setQ] = useState("");

  return (
    <input
      type="search"
      placeholder={placeholder}
      value={q}
      onChange={(e) => {
        setQ(e.target.value);
        onChange?.(e.target.value);
      }}
      style={style}
    />
  );
}
