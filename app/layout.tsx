import '../styles/bootstrap';
import Link from 'next/link';

export const metadata = { title: 'CourseGen' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
     <body className="d-flex flex-column min-vh-100 dark">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" href="/">CourseGen</Link>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link" href="/courses">Courses</Link>
              <Link className="nav-link" href="/triage">Triage</Link>
            </div>
          </div>
        </nav>

        <main className="flex-grow-1">
          <div className="container container-narrow py-4">
            {children}
          </div>
        </main>

        <footer className="mt-auto py-3">
          <div className="container text-muted small">
            © {new Date().getFullYear()} CourseGen • Readable in light & dark mode
          </div>
        </footer>
      </body>
    </html>
  );
}
