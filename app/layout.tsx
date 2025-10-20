import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { DataProvider } from "@/lib/data-provider"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Na Régua - Encontre e Agende sua Barbearia",
  description:
    "Conecte-se com as melhores barbearias da sua região. Agende horários, veja avaliações e encontre o corte perfeito.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
