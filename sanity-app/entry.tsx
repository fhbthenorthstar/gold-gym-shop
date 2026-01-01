const fallbackAppUrl = "https://www.goldgym.shop";
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || fallbackAppUrl;
const adminUrl = `${appUrl}/admin`;

export default function SanityAdminLauncher() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)",
          padding: "28px",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Gold Gym Shop Admin
        </h1>
        <p style={{ margin: "0 0 16px", color: "#475569" }}>
          Open the storefront admin in a new tab to manage products and orders.
        </p>
        <a
          href={adminUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 16px",
            borderRadius: "999px",
            background: "#0f172a",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Open Admin
        </a>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          URL: {adminUrl}
        </p>
      </div>
    </div>
  );
}
