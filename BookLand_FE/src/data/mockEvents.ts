import type { Event } from '../types/Event';
import { EventStatus } from '../types/Event';
import { EventType } from '../types/EventType';
import type { EventImage } from '../types/EventImage';
import { ImageType } from '../types/EventImage';
import { mockUsers } from './mockUsers';

const image1: EventImage = {
    id: 1,
    event: undefined as any,
    imageUrl: 'https://cdn0.fahasa.com/media/wysiwyg/Thang-05-2023/Tuan-02/Banner-Slide-840x320.jpg',
    imageType: ImageType.MAIN
};

const image2: EventImage = {
    id: 2,
    event: undefined as any,
    imageUrl: 'https://cdn0.fahasa.com/media/wysiwyg/Thang-05-2023/Tuan-02/Banner-Safe-840x320.jpg',
    imageType: ImageType.MAIN
};

export const mockEvents: Event[] = [
    {
        id: 1,
        name: 'Summer Sale',
        description: 'Big discounts for summer.',
        type: EventType.SEASONAL_SALE,
        startTime: '2023-06-01T00:00:00Z',
        endTime: '2023-08-31T23:59:59Z',
        status: EventStatus.ACTIVE,
        priority: 1,
        createdBy: mockUsers[0],
        images: [image1]
    },
    {
        id: 2,
        name: 'Back to School',
        description: 'Prepare for the new year.',
        type: EventType.BACK_TO_SCHOOL,
        startTime: '2023-08-15T00:00:00Z',
        endTime: '2023-09-15T23:59:59Z',
        status: EventStatus.ACTIVE,
        priority: 2,
        createdBy: mockUsers[0],
        images: [image2]
    }
];

// Fix circular refs
if (mockEvents[0].images) mockEvents[0].images[0].event = mockEvents[0];
if (mockEvents[1].images) mockEvents[1].images[0].event = mockEvents[1];
