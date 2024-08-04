import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Signup from './pages/Signup.jsx';
import Sentrequests from './components/Sentrequests.jsx';
import Signin from './pages/Signin.jsx';
import Pendingrequests from './components/Pendingrequests.jsx';
import Personalprofile from './pages/Personalprofile.jsx';
import Profile from './pages/Profile.jsx';
import Home from './pages/Home.jsx';
import Addfriend from './components/Addfriend.jsx';
import Myfriends from './components/Myfriends.jsx';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Messages from './pages/Messages.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Signup',
    element: <Signup />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Signin',
    element: <Signin />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Addfriend',
    element: <Addfriend />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Home',
    element: <Home />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Myfriends',
    element: <Myfriends />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Pendingrequests',
    element: <Pendingrequests />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Profile',
    element: <Profile />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Personalprofile',
    element: <Personalprofile />,
    errorElement: <div>404</div>,
  },
  {
    path: '/Sentrequests',
    element: <Sentrequests />,
    errorElement: <div>404</div>,
  },
  {
    path:'Messages',
    element:<Messages/>,
    errorElement:<div>404</div>
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
