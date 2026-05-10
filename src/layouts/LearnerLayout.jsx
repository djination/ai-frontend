import { Outlet } from 'react-router-dom';
import { LearnerTopNav } from '../components/LearnerTopNav';
import { LearnerEntitlementProvider } from '../context/LearnerEntitlementContext';

export function LearnerLayout() {
  return (
    <LearnerEntitlementProvider>
      <div className="mx-auto max-w-6xl">
        <LearnerTopNav />
        <Outlet />
      </div>
    </LearnerEntitlementProvider>
  );
}
