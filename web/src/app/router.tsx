import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';
import Home from '@/pages/Home';
import Learn from '@/pages/Learn';
import Log from '@/pages/Log';
import Profile from '@/pages/Profile';

/**
 * All routes live here. Public: /login, /signup. Everything else sits behind
 * RequireAuth and renders inside the shell (bottom nav + page transition).
 */
export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Home /> },
          { path: 'log', element: <Log /> },
          { path: 'learn', element: <Learn /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
]);
