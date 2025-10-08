import { createBrowserRouter, useParams } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Notes from './pages/user/Notes';

const routes = createBrowserRouter([
	{
		path: '/',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/login',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/register',
		// loader: loginLoader,
		element: <Register />,
	},
	{
		path: '/users',
		// loader: verifyLoader('admin'),
		errorElement: <ErrorElement />,
		children: [{ path: 'notes', element: <Notes /> }],
	},
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
