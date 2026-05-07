// Minimal root layout required by Next.js App Router.
// This project is used exclusively as an API backend — no UI is rendered.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
