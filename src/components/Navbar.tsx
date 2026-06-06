"use client";

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Layers className={styles.icon} />
          <span>PDF Master</span>
        </Link>
        
        <div className={styles.navLinks}>
          <Link href="/merge" className={styles.link}>Merge PDF</Link>
          <Link href="/split" className={styles.link}>Split PDF</Link>
          <Link href="/compress" className={styles.link}>Compress</Link>
          <Link href="/convert" className={styles.link}>Convert</Link>
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
    </nav>
  );
}
