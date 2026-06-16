import React, { useEffect, useState, type ReactElement } from 'react';
import HeroSection from '../../components/HeroSection';
import FlashSale from '../../components/FlashSale';
import TrendingSection from '../../components/TrendingSection';
import FeaturedBookcases from '../../components/FeaturedBookcases';
import WeeklyBestseller from '../../components/WeeklyBestseller';
import Recommendations from '../../components/Recommendations';
import Newsletter from '../../components/Newsletter';
import EventPromoModal from '../../components/EventPromoModal';
import homeService from '../../api/homeService';
import type { HomeSection } from '../../types/HomeSection';
import '../../styles/pages/home.css';
import '../../styles/components/book-card.css';

const SECTION_COMPONENTS: Record<string, ReactElement> = {
    super_sale: <FlashSale />,
    trending: <TrendingSection />,
    featured: <FeaturedBookcases />,
    best_seller: <WeeklyBestseller />,
    recommend: <Recommendations />,
};

// Fallback default order if API is unavailable
const DEFAULT_SECTIONS: HomeSection[] = [
    { id: 1, sectionKey: 'super_sale', nameVi: 'Super Sale', nameEn: 'Super Sale', icon: '⚡', anchorId: 'super-sale-section', displayOrder: 1, visible: true, itemLimit: 5 },
    { id: 2, sectionKey: 'trending', nameVi: 'Xu Hướng', nameEn: 'Trending', icon: '📈', anchorId: 'trending-section', displayOrder: 2, visible: true, itemLimit: 5 },
    { id: 3, sectionKey: 'featured', nameVi: 'Nổi Bật', nameEn: 'Featured', icon: '🌟', anchorId: 'featured-section', displayOrder: 3, visible: true, itemLimit: 5 },
    { id: 4, sectionKey: 'best_seller', nameVi: 'Bán Chạy', nameEn: 'Best Sellers', icon: '🏆', anchorId: 'bestseller-section', displayOrder: 4, visible: true, itemLimit: 5 },
    { id: 5, sectionKey: 'recommend', nameVi: 'Gợi Ý', nameEn: 'Recommendations', icon: '💡', anchorId: 'recommendation-section', displayOrder: 5, visible: true, itemLimit: 5 },
];

const HomePage = () => {
    const [sections, setSections] = useState<HomeSection[]>(DEFAULT_SECTIONS);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await homeService.getHomeSections();
                if (res.result && res.result.length > 0) {
                    setSections(res.result);
                }
            } catch (error) {
                console.error("Failed to fetch home sections, using defaults", error);
            }
        };
        fetchSections();
    }, []);

    return (
        <div>
            <EventPromoModal />
            <HeroSection />
            {sections
                .filter(s => s.visible)
                .map(section => (
                    <div key={section.sectionKey} id={section.anchorId}>
                        {SECTION_COMPONENTS[section.sectionKey] 
                            ? React.cloneElement(SECTION_COMPONENTS[section.sectionKey] as React.ReactElement<any>, { itemLimit: section.itemLimit || 5 }) 
                            : null}
                    </div>
                ))
            }
            <Newsletter />
        </div>
    );
};

export default HomePage;
