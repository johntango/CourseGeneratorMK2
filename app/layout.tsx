import React from 'react';
import './globals.css';


export const metadata = { title: 'CourseGen MVP' };


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
<header style={{ marginBottom: 24 }}>
<h1>CourseGen MVP</h1>
<p>Supabase + Next.js</p>
</header>
{children}
</body>
</html>
);
}