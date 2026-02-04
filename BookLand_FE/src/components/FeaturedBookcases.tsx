import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import '../styles/components/featured-bookcases.css';

const FeaturedBookcases = () => {
    const collections = [
        { id: 1, name: 'Bình Yên Để Bắt Đầu', image: 'https://cdn0.fahasa.com/media/catalog/product/b/i/binh-yen-de-bat-dau.jpg' },
        { id: 2, name: 'Làm Chủ Đồng Tiền', image: 'https://cdn0.fahasa.com/media/catalog/product/l/a/lam-chu-dong-tien.jpg' },
        { id: 3, name: 'Về Nhà Ăn Tết', image: 'https://cdn0.fahasa.com/media/catalog/product/v/e/ve-nha-an-tet.jpg' },
        { id: 4, name: 'Tác Giả Trẻ Việt Nam', image: 'https://cdn0.fahasa.com/media/catalog/product/t/a/tac-gia-tre-viet-nam.jpg' },
        { id: 5, name: 'Thiếu Nhi Vui Đón Tết', image: 'https://cdn0.fahasa.com/media/catalog/product/t/h/thieu-nhi-vui-don-tet.jpg' },
        { id: 6, name: 'Sách chỉ bán tại Fahasa', image: 'https://cdn0.fahasa.com/media/catalog/product/s/a/sach-chi-ban-tai-fahasa.jpg' },
        { id: 7, name: 'Tủ Sách Trinh Thám', image: 'https://cdn0.fahasa.com/media/catalog/product/t/u/tu-sach-trinh-tham.jpg' },
        { id: 8, name: 'Tủ Sách Kinh Dị', image: 'https://cdn0.fahasa.com/media/catalog/product/t/u/tu-sach-kinh-di.jpg' }
    ];

    return (
        <section className="featured-bookcases">
            <div className="bookcases-container">
                <div className="bookcases-header">
                    <div className="bookcases-icon-box">
                        <BookOpen size={20} color="white" fill="white" />
                    </div>
                    <h2 className="bookcases-title">TỦ SÁCH NỔI BẬT</h2>
                </div>
                <div className="bookcases-grid">
                    {collections.map((col) => (
                        <Link key={col.id} to={`/category/${col.id}`} className="bookcase-item">
                            <div className="bookcase-image-wrapper">
                                <img src={col.image} alt={col.name} className="bookcase-image" />
                            </div>
                            <span className="bookcase-name">{col.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedBookcases;
