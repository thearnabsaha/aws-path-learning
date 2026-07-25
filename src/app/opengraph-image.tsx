import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AWS Path — Learn Cloud the Right Way";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(145deg, #f4ebe0 0%, #e8d8c4 55%, #dcc4a8 100%)",
          color: "#241910",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(145deg, #9a6340, #6b432b)",
              color: "#fffaf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>
            AWS Path
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Learn AWS clearly
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: "#6a5546",
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Core path + SAA extras · quizzes · cream & mocha
        </div>
      </div>
    ),
    { ...size }
  );
}
