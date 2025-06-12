import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // Ensure globals.css has zinc theme variables
import { ThemeProvider } from "@/components/theme-provider"
import { AppLayout } from "@/components/app-layout" // Import the new layout

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dev Tools - Free Developer Utilities",
  description: "A collection of free, offline-first utilities to save time and reduce repetitive development work.",
  generator: "v0.dev",
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
          disableTransitionOnChange={false} // Set to false for smoother theme transitions
          storageKey="dev-tools-theme" // Unique storage key
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
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
