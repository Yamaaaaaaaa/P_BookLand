
import FeaturedBooks from '../../components/FeaturedBooks';
import HeroSection from '../../components/HeroSection';
import FlashSale from '../../components/FlashSale';
import TrendingSection from '../../components/TrendingSection';
import FeaturedBookcases from '../../components/FeaturedBookcases';
import WeeklyBestseller from '../../components/WeeklyBestseller';
import Recommendations from '../../components/Recommendations';
import Newsletter from '../../components/Newsletter';
import '../../styles/pages/home.css';
import '../../styles/components/book-card.css';

const HomePage = () => {
    return (
        <div>
            <HeroSection />
            <FlashSale />
            <TrendingSection />
            <FeaturedBookcases />
            <WeeklyBestseller />
            <Recommendations />
            <Newsletter />
        </div>
    );
};

export default HomePage;
