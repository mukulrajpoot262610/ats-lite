import type { Metadata } from 'next'
import './globals.css'

import AppNavBar from '@/components/common/app-nav-bar'

import { Inter } from 'next/font/google'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/common/app-sidebar'
import { ThemeProvider } from '@/components/common/theme-provider'
import { THEME_CONFIG } from '@/constants/app-config'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ATS-Lite',
  description: 'Watch the ATS Think - Transparent candidate filtering and ranking',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased tracking-tight transition-all duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={THEME_CONFIG.DEFAULT_THEME}
          enableSystem={THEME_CONFIG.ENABLE_SYSTEM}
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppNavBar />
              <div className="flex flex-1 flex-col gap-4">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
