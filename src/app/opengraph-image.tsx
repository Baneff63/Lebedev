import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#f2ede3",
          color: "#141210",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8a8278",
          }}
        >
          <span>baneoff</span>
          <span>mixing &amp; mastering</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 600, lineHeight: 1 }}>
            Sound you can
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 600,
              lineHeight: 1,
              fontStyle: "italic",
              color: "#c41e3a",
            }}
          >
            trust with your release.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 2,
            color: "#8a8278",
          }}
        >
          <span>Daniil Lebedev</span>
          <span>20+ releases · 6 years</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
