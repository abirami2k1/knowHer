import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import Home from '@/pages/Home';
import Learn from '@/pages/Learn';
import Log from '@/pages/Log';
import Profile from '@/pages/Profile';

/** All routes live here. The shell (bottom nav + page transition) wraps every page. */
export const router = createBrowserRouter([
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
]);
