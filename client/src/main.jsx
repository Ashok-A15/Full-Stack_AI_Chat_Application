import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Homepage from './routes/homepage/Homepage.jsx';
import DashboardPage from './routes/dashboardPage/DashboardPage.jsx';
import ChatPage from './routes/chatPage/ChatPage.jsx'; // ✅ Correct import
import RootLayout from './layouts/rootLayout/RootLayout.jsx';
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout.jsx';
import SignInPage from './routes/signInPage/signInPage.jsx';
import SignUpPage from './routes/signUpPage/signUpPage.jsx';

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          path: '/', // Homepage
          element: <Homepage />,
        },
        {
          path: '/sign-in/*',
          element: <SignInPage />,
        },
        {
          path: '/sign-up/*',
          element: <SignUpPage />,
        },
        {
          element: <DashboardLayout />,
          children: [
            {
              path: '/dashboard', // ✅ lowercase
              element: <DashboardPage />,
            },
            {
              path: '/dashboard/chats', // ✅ Direct chat route
              element: <ChatPage />,
            },
            {
              path: '/dashboard/chats/:id', // ✅ Dynamic chat route
              element: <ChatPage />,
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true, // 👈 this removes the warning
    },
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
