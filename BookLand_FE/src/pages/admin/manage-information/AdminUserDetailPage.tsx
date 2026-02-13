import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Lock, Calendar } from 'lucide-react';
import userService from '../../../api/userService';
import { toast } from 'react-toastify';
import type { UserRequest, UserUpdateRequest, UserStatus } from '../../../types/User';
import type { Role } from '../../../types/Role';
import '../../../styles/components/buttons.css';
import '../../../styles/components/forms.css';
import '../../../styles/pages/admin-management.css';

const AdminUserDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = id !== 'new';

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<UserRequest & { status: UserStatus }>({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        status: 'ENABLE',
        roleIds: []
    });

    // START: Temporary Role fetching/definition since we don't have roleService yet
    // In a real app, you'd fetch this from via roleService.getAllRoles()
    const [availableRoles] = useState<Role[]>([
        { id: 2, name: 'ADMIN', description: 'Administrator' },
        { id: 1, name: 'USER', description: 'Standard User' }
    ]);
    // END: Temporary Role fetching

    useEffect(() => {
        if (isEditMode && id) {
            fetchUser(parseInt(id));
        }
    }, [isEditMode, id]);

    const fetchUser = async (userId: number) => {
        setIsLoading(true);
        try {
            const response: any = await userService.adminGetUserById(userId);
            // Check if response is wrapped in 'result' or returned directly
            const user = response.result ? response.result : response;

            if (user && user.username) {
                setFormData({
                    username: user.username,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email,
                    phone: user.phone || '',
                    dob: user.dob || '',
                    password: '', // Don't populate password
                    status: user.status,
                    roleIds: user.roles?.map((r: any) => r.id) || []
                });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Failed to load user details');
            navigate('/admin/manage-user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleId: number) => {
        setFormData(prev => {
            const currentRoles = prev.roleIds || [];
            if (currentRoles.includes(roleId)) {
                return { ...prev, roleIds: currentRoles.filter(id => id !== roleId) };
            } else {
                return { ...prev, roleIds: [...currentRoles, roleId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditMode && id) {
                // Update
                const updateData: UserUpdateRequest = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dob: formData.dob,
                    email: formData.email,
                    phone: formData.phone,
                    status: formData.status,
                    roleIds: formData.roleIds
                };
                // Only include password if provided
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await userService.adminUpdateUser(parseInt(id), updateData);
                // Also update roles and status if separate endpoints needed, but userService.adminUpdateUser might handle it? 
                // Based on userService, there are separate endpoints for status and roles:
                // adminUpdateUser, adminUpdateUserRoles, adminUpdateUserStatus.
                // Let's rely on adminUpdateUser first, if backend supports it. 
                // If not, we might need to call them separately.
                // Assuming adminUpdateUser handles basic info. 

                // Explicitly call role update and status update to be safe as per service structure
                await userService.adminUpdateUserRoles(parseInt(id), formData.roleIds || []);
                await userService.adminUpdateUserStatus(parseInt(id), formData.status);

                toast.success('User updated successfully');
            } else {
                // Create
                await userService.adminCreateUser(formData);
                toast.success('User created successfully');
            }
            navigate('/admin/manage-user');
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Failed to save user');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditMode && !formData.email) {
        return <div className="admin-container">Loading...</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/admin/manage-user')} className="btn-icon">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="admin-title">{isEditMode ? 'Edit User' : 'Add New User'}</h1>
                        <p className="admin-subtitle">{isEditMode ? `Update details for ${formData.username}` : 'Create a new user account'}</p>
                    </div>
                </div>
            </div>

            <div className="admin-content-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>

                    {/* Account Info */}
                    <h3 className="section-title">Account Information</h3>
                    <div className="grid-2-cols">
                        <div className="form-group margin-bottom">
                            <label className="form-label">Username <span style={{ color: 'red' }}>*</span></label>
                            <div className="input-group">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                    required
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>
                        <div className="form-group margin-bottom">
                            <label className="form-label">Password {isEditMode && '(Leave blank to keep unchanged)'} {!isEditMode && <span style={{ color: 'red' }}>*</span>}</label>
                            <div className="input-group">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditMode}
                                    placeholder="********"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group margin-bottom">
                        <label className="form-label">Email <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-group">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    {/* Personal Info */}
                    <h3 className="section-title margin-top">Personal Information</h3>
                    <div className="grid-2-cols">
                        <div className="form-group margin-bottom">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                className="form-input"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                            />
                        </div>
                        <div className="form-group margin-bottom">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-input"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="grid-2-cols">
                        <div className="form-group margin-bottom">
                            <label className="form-label">Phone Number</label>
                            <div className="input-group">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="phone"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+123..."
                                />
                            </div>
                        </div>
                        <div className="form-group margin-bottom">
                            <label className="form-label">Date of Birth</label>
                            <div className="input-group">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="date"
                                    name="dob"
                                    className="form-input"
                                    value={formData.dob}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Roles & Status */}
                    <h3 className="section-title margin-top">Role & Status</h3>

                    <div className="form-group margin-bottom">
                        <label className="form-label">Status <span style={{ color: 'red' }}>*</span></label>
                        <select
                            name="status"
                            className="form-select"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="ENABLE">Active (Enable)</option>
                            <option value="DISABLE">Blocked (Disable)</option>
                        </select>
                    </div>

                    <div className="form-group margin-bottom">
                        <label className="form-label">Roles <span style={{ color: 'red' }}>*</span></label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {availableRoles.map(role => (
                                <label key={role.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: formData.roleIds?.includes(role.id) ? 'var(--shop-bg-secondary)' : 'transparent',
                                    border: '1px solid var(--shop-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.roleIds?.includes(role.id)}
                                        onChange={() => handleRoleChange(role.id)}
                                    />
                                    {role.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/manage-user')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            <Save size={18} />
                            {isLoading ? 'Saving...' : 'Save User'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
