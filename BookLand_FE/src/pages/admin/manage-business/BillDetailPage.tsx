import { useParams } from 'react-router-dom';

const BillDetailPage = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Bill Detail</h1>
            <p>Showing details for bill ID: {id}</p>
        </div>
    );
};

export default BillDetailPage;
