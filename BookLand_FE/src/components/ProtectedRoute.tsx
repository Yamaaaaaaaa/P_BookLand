import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    checkAuth: () => boolean;
    redirectPath: string;
}

const ProtectedRoute = ({ children, checkAuth, redirectPath }: ProtectedRouteProps) => {
    if (!checkAuth()) {
        return <Navigate to={redirectPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
