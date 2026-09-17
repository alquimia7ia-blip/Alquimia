"use client";

import { useCallback, useRef, useState } from "react";

/** Aviso efímero al pie. Portado del prototipo. */
export function useToast() {
  const [texto, setTexto] = useState("");
  const [visible, setVisible] = useState(false);
  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback((t: string) => {
    setTexto(t);
    setVisible(true);
    if (tmr.current) clearTimeout(tmr.current);
    tmr.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  const Toast = useCallback(
    () => (
      <div className={`toast ${visible ? "on" : ""}`} role="status" aria-live="polite">
        <span>{texto}</span>
      </div>
    ),
    [texto, visible],
  );

  return { avisar, Toast };
}
