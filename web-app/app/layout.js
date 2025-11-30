import '../styles/globals.css'
import { AuthProvider } from '../hooks/useAuth'
import { LanguageProvider } from '../hooks/useLanguage'

export const metadata = {
  title: 'SIH Dashboard',
  description: 'Slope Monitoring & Risk Assessment System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

