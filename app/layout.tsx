import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JSON Comparator - Intelligent JSON Comparison Tool",
  description: "Compare JSON files with semantic analysis, side-by-side view, and intelligent difference detection.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} theme-transition-disabled`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="json-comparator-theme"
        >
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(() => {
                  document.body.classList.remove('theme-transition-disabled');
                }, 100);
              `,
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
