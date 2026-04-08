import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { BrandHeading } from '@dds/ui';
import { AppChip, getCuneiformByTLD } from '@dds/icons';
import PendingSignOutButton from './sign-out-button';
import styles from './pending.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pending Review — BlackDot Partners',
  description: 'Your partner access request is under review.',
};

export default async function PendingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    '';

  const cuneiform = getCuneiformByTLD('partners');

  return (
    <main className={styles.wrap}>
      {cuneiform && (
        <div className={styles.chip}>
          <AppChip entry={cuneiform} size={72} flipDelay={600} flipDuration={800} />
        </div>
      )}

      <span className={styles.pill}>⏳ Pending review</span>

      <BrandHeading>You're on the list</BrandHeading>

      <h1 className={styles.headline} style={{ marginTop: '1rem' }}>
        Welcome to the threshold
      </h1>

      <p className={styles.sub}>
        Your partner access request is under review. BlackDot is curated — we
        approve collaborators by hand to keep the ecosystem aligned. You'll
        receive an email the moment your access is granted.
      </p>

      {email && <div className={styles.email}>{email}</div>}

      <div className={styles.footer}>
        <PendingSignOutButton />
      </div>
    </main>
  );
}
