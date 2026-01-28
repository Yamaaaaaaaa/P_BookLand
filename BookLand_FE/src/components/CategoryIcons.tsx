import { Link } from 'react-router-dom';
import '../styles/shop.css';
import { categories } from '../data/mockCategories';

const CategoryIcons = () => {
    return (
        <section className="categories">
            <div className="shop-container">
                <div className="categories__grid">
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to={`/shop/category/${category.slug}`}
                                className="category-item"
                            >
                                <div className="category-item__icon">
                                    <IconComponent size={28} />
                                </div>
                                <span className="category-item__label">{category.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryIcons;
