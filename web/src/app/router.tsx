import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { RequireAuthor } from '@/components/RequireAuthor';
import { TitleSync } from '@/components/TitleSync';
import AdminPosts from '@/pages/admin/AdminPosts';
import EditPost from '@/pages/admin/EditPost';
import Login from '@/pages/auth/Login';
import SignUp from '@/pages/auth/SignUp';
import Cycle from '@/pages/Cycle';
import History from '@/pages/History';
import Home from '@/pages/Home';
import Learn from '@/pages/Learn';
import Log from '@/pages/Log';
import Onboarding from '@/pages/onboarding/Onboarding';
import Profile from '@/pages/Profile';
import Reader from '@/pages/Reader';
import Trends from '@/pages/Trends';

/**
 * All routes live here, under TitleSync so every one of them names itself.
 * Public: /login, /signup. Everything else sits behind RequireAuth. /onboarding
 * is authed but deliberately outside the shell — no bottom nav until she has
 * finished. Everything else renders inside it; /admin is additionally
 * author-only (the API enforces the same, D7).
 */
export const router = createBrowserRouter([
  {
    element: <TitleSync />,
    children: [
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
              { path: 'history', element: <History /> },
              { path: 'trends', element: <Trends /> },
              { path: 'learn', element: <Learn /> },
              { path: 'learn/:kind/:slug', element: <Reader /> },
              { path: 'profile', element: <Profile /> },
              {
                element: <RequireAuthor />,
                children: [
                  { path: 'admin', element: <AdminPosts /> },
                  { path: 'admin/new', element: <EditPost /> },
                  { path: 'admin/:id', element: <EditPost /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
