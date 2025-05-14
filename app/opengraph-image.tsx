import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Upvoted — Know exactly what to build next";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 32, opacity: 0.6, display: "flex" }}>Upvoted</div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          marginTop: 24,
          lineHeight: 1.1,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        Know exactly what to build next.
      </div>
      <div style={{ fontSize: 28, marginTop: 32, opacity: 0.6, display: "flex" }}>
        Feedback boards and public roadmaps for product teams
      </div>
    </div>,
    size,
  );
}
