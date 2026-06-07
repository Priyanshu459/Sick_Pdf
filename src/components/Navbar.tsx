"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Layers, Menu, X } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Layers className={styles.icon} />
          <span>PDF Master</span>
        </Link>
        
        <div className={styles.desktopNav}>
          <div className={styles.navLinks}>
            <Link href="/merge" className={styles.link}>Merge PDF</Link>
            <Link href="/split" className={styles.link}>Split PDF</Link>
            <Link href="/compress" className={styles.link}>Compress</Link>
            <Link href="/convert" className={styles.link}>Convert</Link>
            <Link href="/edit" className={styles.link}>Edit PDF</Link>
          </div>

          <div className={styles.actions}>
            {session ? (
              <div className={styles.userMenu}>
                <Link href="/dashboard" className={styles.link}>My Cloud Dashboard</Link>
                <button onClick={() => signOut()} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Log out</button>
                {session.user?.image && (
                  <img src={session.user.image} alt="Profile" className={styles.profilePic} />
                )}
              </div>
            ) : (
              <>
                <button onClick={() => signIn("google")} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Log in with Google</button>
                <Link href="#" className={styles.premiumBtn}>Go Premium</Link>
              </>
            )}
          </div>
        </div>

        <button className={styles.mobileMenuBtn} onClick={toggleMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <Link href="/merge" className={styles.mobileLink} onClick={toggleMenu}>Merge PDF</Link>
            <Link href="/split" className={styles.mobileLink} onClick={toggleMenu}>Split PDF</Link>
            <Link href="/compress" className={styles.mobileLink} onClick={toggleMenu}>Compress</Link>
            <Link href="/convert" className={styles.mobileLink} onClick={toggleMenu}>Convert</Link>
            <Link href="/edit" className={styles.mobileLink} onClick={toggleMenu}>Edit PDF</Link>
          </div>
          <div className={styles.mobileActions}>
            {session ? (
              <div className={styles.mobileUserMenu}>
                <div className={styles.mobileProfile}>
                  {session.user?.image && (
                    <img src={session.user.image} alt="Profile" className={styles.profilePic} />
                  )}
                  <span className={styles.mobileLinkName}>{session.user?.name}</span>
                </div>
                <Link href="/dashboard" className={styles.mobileLink} onClick={toggleMenu}>My Cloud Dashboard</Link>
                <button onClick={() => { signOut(); toggleMenu(); }} className={styles.mobileLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Log out</button>
              </div>
            ) : (
              <>
                <button onClick={() => { signIn("google"); toggleMenu(); }} className={styles.mobileLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Log in with Google</button>
                <Link href="#" className={styles.premiumBtn} style={{ textAlign: 'center', marginTop: '1rem', display: 'block' }} onClick={toggleMenu}>Go Premium</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
