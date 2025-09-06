import React from 'react';
import './globals.css';
import '../styles/bootstrap'
export const metadata = { title: 'CourseGen MVP' };


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
<header style={{ marginBottom: 24 }}>
<h1>CourseGen MVP</h1>
<p>Supabase + Next.js</p>
</header>
<nav className="navbar navbar-dark bg-dark">
  <div className="container">
    <a className="navbar-brand" href="/">CourseGen</a>
    <div className="d-flex gap-3">
      <a className="nav-link text-white" href="/courses">Courses</a>
      <a className="nav-link text-white" href="/triage">Triage</a>
    </div>
  </div>
{children}

</nav>
</body>
</html>
);
}