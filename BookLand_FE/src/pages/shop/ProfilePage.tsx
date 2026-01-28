import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import '../../styles/shop.css';
import { mockUsers } from '../../data/mockUsers';

// Local interface for form state, mapped from User entity
interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    joinDate: string;
}

const ProfilePage = () => {
    // Simulate getting logged in user
    const currentUser = mockUsers.find(u => u.username === 'customer1') || mockUsers[1];

    // Default address
    const defaultAddress = currentUser.addresses?.find(a => a.isDefault) || currentUser.addresses?.[0];

    const [isEditing, setIsEditing] = useState(false);

    // Initialize state from properties
    const [profile, setProfile] = useState<UserProfile>({
        name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username,
        email: currentUser.email,
        phone: currentUser.phone || defaultAddress?.contactPhone || '',
        address: defaultAddress?.addressDetail || '',
        city: 'Hanoi', // Placeholder as it's not in Address entity
        country: 'Vietnam', // Placeholder
        joinDate: currentUser.createdAt || 'January 2024',
    });

    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

    // Update profile if currentUser changes (simulated)
    useEffect(() => {
        setProfile({
            name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username,
            email: currentUser.email,
            phone: currentUser.phone || defaultAddress?.contactPhone || '',
            address: defaultAddress?.addressDetail || '',
            city: 'Hanoi',
            country: 'Vietnam',
            joinDate: currentUser.createdAt || 'January 2024',
        });
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile(profile);
    };

    const handleSave = () => {
        setProfile(editedProfile);
        setIsEditing(false);
        // In real app, would call API to update User entity
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleChange = (field: keyof UserProfile, value: string) => {
        setEditedProfile(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="profile-page">
            <div className="shop-container">
                {/* Page Header */}
                <div className="profile-page__header">
                    <div>
                        <h1 className="profile-page__title">My Profile</h1>
                        <p className="profile-page__subtitle">Manage your account information</p>
                    </div>
                    {!isEditing ? (
                        <button className="btn-primary" onClick={handleEdit}>
                            <Edit2 size={18} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="profile-page__actions">
                            <button className="btn-secondary" onClick={handleCancel}>
                                <X size={18} />
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Content */}
                <div className="profile-content">
                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-card__avatar">
                            <User size={48} />
                        </div>
                        <h2 className="profile-card__name">{profile.name}</h2>
                        <p className="profile-card__email">{profile.email}</p>
                        <div className="profile-card__badge">
                            <Calendar size={14} />
                            Member since {profile.joinDate}
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="profile-details">
                        <h3 className="profile-details__title">Personal Information</h3>

                        <div className="profile-field">
                            <label className="profile-field__label">
                                <User size={18} />
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="profile-field__input"
                                    value={editedProfile.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            ) : (
                                <p className="profile-field__value">{profile.name}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <label className="profile-field__label">
                                <Mail size={18} />
                                Email Address
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className="profile-field__input"
                                    value={editedProfile.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            ) : (
                                <p className="profile-field__value">{profile.email}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <label className="profile-field__label">
                                <Phone size={18} />
                                Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className="profile-field__input"
                                    value={editedProfile.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            ) : (
                                <p className="profile-field__value">{profile.phone}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <label className="profile-field__label">
                                <MapPin size={18} />
                                Address
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="profile-field__input"
                                    value={editedProfile.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                />
                            ) : (
                                <p className="profile-field__value">{profile.address}</p>
                            )}
                        </div>

                        <div className="profile-field-group">
                            <div className="profile-field">
                                <label className="profile-field__label">City</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="profile-field__input"
                                        value={editedProfile.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                    />
                                ) : (
                                    <p className="profile-field__value">{profile.city}</p>
                                )}
                            </div>

                            <div className="profile-field">
                                <label className="profile-field__label">Country</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="profile-field__input"
                                        value={editedProfile.country}
                                        onChange={(e) => handleChange('country', e.target.value)}
                                    />
                                ) : (
                                    <p className="profile-field__value">{profile.country}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order History Section */}
                <div className="order-history">
                    <h3 className="order-history__title">Recent Orders</h3>
                    <div className="order-history__empty">
                        <p>No orders yet</p>
                        <a href="/shop/books" className="order-history__link">Start Shopping</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
