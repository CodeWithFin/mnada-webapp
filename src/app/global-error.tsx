"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          <h2>Something went wrong!</h2>
          <p>We apologize for the inconvenience. Please try refreshing.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              background: "#1c1a19",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
