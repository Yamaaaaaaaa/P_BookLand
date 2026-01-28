import { useParams } from 'react-router-dom';

const AdminBookDetailPage = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Admin Book Detail</h1>
            <p>Edit book details for book ID: {id}</p>
        </div>
    );
};

export default AdminBookDetailPage;
