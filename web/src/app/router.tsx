import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';
import Cycle from '@/pages/Cycle';
import Home from '@/pages/Home';
import Learn from '@/pages/Learn';
import Log from '@/pages/Log';
import Onboarding from '@/pages/onboarding/Onboarding';
import Profile from '@/pages/Profile';

/**
 * All routes live here. Public: /login, /signup. Everything else sits behind
 * RequireAuth. /onboarding is authed but deliberately outside the shell — no bottom
 * nav until she has finished. Everything else renders inside it.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Home /> },
          { path: 'log', element: <Log /> },
          { path: 'cycle', element: <Cycle /> },
          { path: 'learn', element: <Learn /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
]);
