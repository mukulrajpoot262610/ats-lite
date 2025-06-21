import type { Metadata } from 'next'
import './globals.css'

import { Inter } from 'next/font/google'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/common/app-sidebar'
import { ThemeProvider } from '@/components/common/theme-provider'
import { NavHeader } from '@/components/common/nav-header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ATS Lite',
  description: 'AI Agents for ATS',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased tracking-tight transition-all duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <NavHeader />
              <div className="flex flex-1 flex-col gap-4">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
