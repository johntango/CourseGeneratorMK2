// app/layout.tsx
import '../styles/bootstrap';
import Link from 'next/link';
import AuthHeader from '@/components/AuthHeader';

export const metadata = { title: 'CourseGen' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Prefer Bootstrap’s dark theme attribute over a custom 'dark' class */}
      <body className="d-flex flex-column min-vh-100" data-bs-theme="dark">
        <nav className="navbar navbar-expand-lg bg-dark border-bottom">
          <div className="container">
            <Link className="navbar-brand" href="/">CourseGen</Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavbar"
              aria-controls="mainNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="mainNavbar">
                  <ul className="navbar-nav">
                    <li className="nav-item"><Link className="nav-link" href="/courses">Courses</Link></li>
                    <li className="nav-item"><Link className="nav-link" href="/triage">Triage</Link></li>
                  </ul>

                  <ul className="navbar-nav ms-auto">
                    <AuthHeader />
                  </ul>
            </div>
          </div>
        </nav>

        <main className="flex-grow-1">
          <div className="container container-narrow py-4">
            {children}
          </div>
        </main>

        <footer className="mt-auto py-3 border-top">
          <div className="container text-muted small">
            © {new Date().getFullYear()} CourseGen • Readable in light & dark mode
          </div>
        </footer>
      </body>
    </html>
  );
}
