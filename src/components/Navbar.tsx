import Link from 'next/link';
import { Layers } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
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
          <Link href="#" className={styles.link}>Log in</Link>
          <Link href="#" className={styles.premiumBtn}>Go Premium</Link>
        </div>
      </div>
    </nav>
  );
}
