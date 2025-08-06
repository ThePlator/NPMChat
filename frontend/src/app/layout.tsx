import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
	title: 'NPMChat',
	description: 'A neo-brutalist chat app',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>{children}</AuthProvider>
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	)
}
