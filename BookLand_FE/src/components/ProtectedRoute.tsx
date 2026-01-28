import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    isAuthenticated: boolean;
    redirectPath: string;
}

const ProtectedRoute = ({ children, isAuthenticated, redirectPath }: ProtectedRouteProps) => {
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
