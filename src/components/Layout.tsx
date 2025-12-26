import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingSidebar } from './FloatingSidebar';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout-container">
      <FloatingSidebar />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
