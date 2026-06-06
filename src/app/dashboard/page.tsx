import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import styles from "./page.module.css";
import RazorpayButton from "@/components/RazorpayButton";
import DashboardClient from "./DashboardClient";

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
        <DashboardClient />
      )}
    </div>
  );
}
