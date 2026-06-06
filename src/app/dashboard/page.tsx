import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./page.module.css";
import { FileText, Download, Trash2 } from "lucide-react";
import RazorpayButton from "@/components/RazorpayButton";

// Mock data until Cloudinary is hooked up
const mockPdfs = [
  { id: "1", name: "Q1_Financial_Report.pdf", url: "#", date: "2026-06-05" },
  { id: "2", name: "Contract_Signed.pdf", url: "#", date: "2026-06-01" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const isPremium = (session.user as any).isPremium;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Cloud Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {session.user.name}</p>
      </header>

      {!isPremium ? (
        <div className={styles.premiumLock}>
          <h2>Premium Feature</h2>
          <p>The Cloud Dashboard is only available to Premium users.</p>
          <p>Get a 1-Month Pass to unlock cloud storage for your PDFs!</p>
          <RazorpayButton email={session.user.email || ""} name={session.user.name || ""} />
        </div>
      ) : (
        <>
          <section className={styles.pdfGrid}>
        {mockPdfs.map((pdf) => (
          <div key={pdf.id} className={styles.pdfCard}>
            <div className={styles.pdfIconWrapper}>
              <FileText className={styles.pdfIcon} />
            </div>
            <div className={styles.pdfInfo}>
              <h3 className={styles.pdfName}>{pdf.name}</h3>
              <p className={styles.pdfDate}>{pdf.date}</p>
            </div>
            <div className={styles.pdfActions}>
              <button className={styles.actionBtn} title="Download">
                <Download size={18} />
              </button>
              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {mockPdfs.length === 0 && (
        <div className={styles.emptyState}>
          <p>You haven't uploaded any PDFs to your cloud yet.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
