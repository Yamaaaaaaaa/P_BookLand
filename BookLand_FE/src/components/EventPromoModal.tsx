import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { eventService } from '../api/eventService';
import type { Event } from '../types/Event';
import '../styles/components/event-promo-modal.css';

const EventPromoModal = () => {
    const [event, setEvent] = useState<Event | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the event popup has already been shown in this browser session
        const hasBeenShown = sessionStorage.getItem('event_promo_shown');
        
        const fetchHighestPriorityEvent = async () => {
            try {
                const response = await eventService.getHighestPriorityEvent();
                if (response && response.code === 1000) {
                    setEvent(response.result || null);
                }
            } catch (error) {
                console.error("Failed to fetch highest priority event:", error);
            } finally {
                setIsLoading(false);
                // Trigger modal to open once per browser session
                if (!hasBeenShown) {
                    setIsOpen(true);
                    sessionStorage.setItem('event_promo_shown', 'true');
                }
            }
        };

        fetchHighestPriorityEvent();
    }, []);

    if (!isOpen || isLoading) return null;

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleBannerClick = () => {
        if (event) {
            setIsOpen(false);
            navigate(`/shop/event-detail/${event.id}`);
        }
    };

    // Get the main event banner image URL
    const mainImageUrl = event?.images?.find(img => img.imageType === 'MAIN')?.imageUrl
        || event?.images?.[0]?.imageUrl;

    return (
        <div className="event-modal-backdrop" onClick={handleClose}>
            <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Floating Circular Close Trigger */}
                <button 
                    className="event-modal-close-btn" 
                    onClick={handleClose}
                    aria-label="Đóng sự kiện"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

                {event && mainImageUrl ? (
                    /* 1. Promotional Active Event Banner exists */
                    <div className="event-modal-banner-link" onClick={handleBannerClick}>
                        <img 
                            src={mainImageUrl} 
                            alt={event.name} 
                            className="event-modal-banner-img"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                        />
                    </div>
                ) : (
                    /* 2. No Event is active - Show beautifully designed BookLand empty card */
                    <div className="event-modal-empty-card">
                        <div className="event-modal-empty-icon-box">
                            🎁
                        </div>
                        <h3 className="event-modal-empty-title">Thông báo sự kiện</h3>
                        <p className="event-modal-empty-desc">
                            Hiện không có sự kiện nào, hãy đón chờ nhé!
                        </p>
                        <button className="event-modal-empty-btn" onClick={handleClose}>
                            Đồng ý
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventPromoModal;
