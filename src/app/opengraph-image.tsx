import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Affinité — Annonces escorts vérifiées au Cameroun";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0d0014 0%, #2a0a30 50%, #4a0a40 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 60,
          position: "relative",
        }}
      >
        {/* Cœur stylisé */}
        <div
          style={{
            display: "flex",
            fontSize: 120,
            marginBottom: 30,
          }}
        >
          ❤️‍🔥
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            fontSize: 130,
            fontWeight: 900,
            background: "linear-gradient(90deg, #ff3d8b, #a020f0)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: -3,
            marginBottom: 20,
          }}
        >
          Affinité
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#e5e5e5",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Annonces escorts vérifiées au Cameroun
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a0a0a0",
            marginTop: 20,
          }}
        >
          Douala · Yaoundé · Bafoussam · Kribi · Limbé
        </div>

        {/* 18+ badge */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 40,
            right: 40,
            background: "#ff3d8b",
            color: "white",
            padding: "12px 24px",
            borderRadius: 30,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          18+
        </div>
      </div>
    ),
    size,
  );
}
