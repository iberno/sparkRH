import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen dark:bg-spark-dark-bg bg-spark-light flex items-center justify-center font-body">
      <Outlet />
    </div>
  );
}
