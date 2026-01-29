
import FeaturedBooks from '../../components/FeaturedBooks';
import HeroSection from '../../components/HeroSection';
import LatestArticles from '../../components/LatestArticles';
import Newsletter from '../../components/Newsletter';
import { featuredBooks, offerBooks } from '../../data/mockBooks';
import '../../styles/pages/home.css';
import '../../styles/components/book-card.css';

const HomePage = () => {
    return (
        <div>
            <HeroSection />
            <FeaturedBooks
                subtitle="Some Quality Items"
                title="Featured Books"
                books={featuredBooks}
            />
            <Newsletter />
            <FeaturedBooks
                subtitle="Special Offers"
                title="Books With Offer"
                books={offerBooks}
            />
            <LatestArticles />
        </div>
    );
};

export default HomePage;
