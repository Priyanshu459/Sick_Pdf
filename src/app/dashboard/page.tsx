import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import styles from "./page.module.css";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Cloud Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {session.user.name}</p>
      </header>

      <DashboardClient />
    </div>
  );
}
