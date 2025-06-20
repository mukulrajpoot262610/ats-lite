import type { Metadata } from 'next'
import './globals.css'

import { Inter } from 'next/font/google'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/common/app-sidebar'
import { NavActions } from '@/components/common/nav-actions'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeProvider } from '@/components/common/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ATS Challenge',
  description: 'ATS Challenge',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased tracking-tight`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex border-b shrink-0 items-center gap-2 p-4 sticky top-0 bg-background z-10">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                  <h1 className="text-sm font-semibold">ATSLite</h1>{' '}
                  <Badge variant="outline" className="text-[9px] uppercase">
                    Beta
                  </Badge>
                </div>
                <div className="ml-auto px-3">
                  <NavActions />
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 px-10 py-10">{children}</div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
