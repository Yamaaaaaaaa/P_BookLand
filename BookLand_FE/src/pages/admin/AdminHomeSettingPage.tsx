import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import homeService from '../../api/homeService';
import axiosClient from '../../api/axiosClient';
import type { HomeSection } from '../../types/HomeSection';
import type { ApiResponse } from '../../types/api';
import settingService from '../../api/settingService';
import GalleryModal from '../../components/admin/GalleryModal';
import './admin-home-setting.css';

/* ── DB action types ── */
type DbAction = 'seed' | 'clear' | null;

const DB_CONFIG = {
    seed: {
        icon: '🌱',
        iconClass: 'db-action-icon--seed',
        modalIconClass: 'db-modal-icon--seed',
        title: 'Seed Data',
        desc: 'Khởi tạo dữ liệu mẫu vào database bao gồm sách, danh mục, người dùng, đơn hàng… Thích hợp dùng để demo hoặc khởi động hệ thống lần đầu.',
        warn: { label: 'ℹ️ An toàn — không xoá dữ liệu hiện có', cls: 'db-action-warn--info' },
        confirmTitle: 'Xác nhận Seed Data',
        confirmBtn: 'hs-btn--success',
        confirmLabel: '🌱 Seed Data',
        cardClass: 'db-action-card--seed',
        apiPath: '/api/init/seed-data',
    },
    clear: {
        icon: '🗑️',
        iconClass: 'db-action-icon--clear',
        modalIconClass: 'db-modal-icon--clear',
        title: 'Clear Data',
        desc: 'Xoá toàn bộ dữ liệu trong database (trừ tài khoản admin). Thao tác này KHÔNG THỂ hoàn tác — hãy chắc chắn trước khi thực hiện.',
        warn: { label: '⚠️ Nguy hiểm — xoá toàn bộ dữ liệu', cls: 'db-action-warn--danger' },
        confirmTitle: 'Xác nhận Clear Data',
        confirmBtn: 'hs-btn--danger',
        confirmLabel: '🗑️ Xoá tất cả',
        cardClass: 'db-action-card--clear',
        apiPath: '/api/init/clear-data',
    },
} as const;

const AdminHomeSettingPage = () => {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [resetting, setResetting] = useState(false);

    // Banner Settings
    const [banner1, setBanner1] = useState<string>('');
    const [banner2, setBanner2] = useState<string>('');
    const [showGallery, setShowGallery] = useState(false);
    const [currentBannerSelect, setCurrentBannerSelect] = useState<1 | 2 | null>(null);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    /* ── DB section state ── */
    const [pendingAction, setPendingAction] = useState<DbAction>(null);
    const [dbLoading, setDbLoading] = useState(false);

    useEffect(() => {
        fetchSections();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await settingService.getAllSettings();
            if (res.result) {
                if (res.result['home_side_banner_1']) setBanner1(res.result['home_side_banner_1']);
                if (res.result['home_side_banner_2']) setBanner2(res.result['home_side_banner_2']);
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const fetchSections = async () => {
        setLoading(true);
        try {
            const res = await homeService.getHomeSections();
            if (res.result) setSections(res.result);
        } catch {
            toast.error('Tải danh sách sections thất bại');
        } finally {
            setLoading(false);
        }
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const next = [...sections];
        const to = direction === 'up' ? index - 1 : index + 1;
        if (to < 0 || to >= next.length) return;
        [next[index], next[to]] = [next[to], next[index]];
        setSections(next);
        setSavedAt(null);
    };

    const toggleVisibility = (index: number) => {
        const next = [...sections];
        next[index] = { ...next[index], visible: !next[index].visible };
        setSections(next);
        setSavedAt(null);
    };

    const handleItemLimitChange = (index: number, value: number) => {
        const next = [...sections];
        next[index] = { ...next[index], itemLimit: value };
        setSections(next);
        setSavedAt(null);
    };

    const handleDragStart = (position: number) => {
        dragItem.current = position;
    };

    const handleDragEnter = (position: number) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const next = [...sections];
            const draggedContent = next.splice(dragItem.current, 1)[0];
            next.splice(dragOverItem.current, 0, draggedContent);
            setSections(next);
            setSavedAt(null);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleSave = async () => {
        // Validation
        const invalidSection = sections.find(s => !Number.isInteger(s.itemLimit) || s.itemLimit <= 0 || s.itemLimit > 30);
        if (invalidSection) {
            toast.error('❌ Số lượng sản phẩm phải là số dương từ 1 đến 30!');
            return;
        }

        setSaving(true);
        try {
            const requests = sections.map((s, index) => ({
                id: s.id,
                displayOrder: index + 1,
                visible: s.visible,
                itemLimit: s.itemLimit
            }));
            await homeService.bulkUpdateHomeSections(requests);
            
            // Save settings
            await settingService.saveSettings({
                'home_side_banner_1': banner1,
                'home_side_banner_2': banner2
            });

            setSavedAt(new Date());
            toast.success('✅ Cập nhật cấu hình trang chủ thành công!');
            fetchSections();
        } catch {
            toast.error('Lưu cấu hình thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset về thứ tự mặc định?')) return;
        setResetting(true);
        try {
            const res = await homeService.resetHomeSectionsToDefault();
            if (res.result) {
                setSections(res.result);
                setSavedAt(new Date());
                toast.success('✅ Đã reset về thứ tự mặc định!');
            }
        } catch {
            toast.error('Reset thất bại.');
        } finally {
            setResetting(false);
        }
    };

    /* ── DB action handler ── */
    const handleDbConfirm = async () => {
        if (!pendingAction) return;
        const cfg = DB_CONFIG[pendingAction];
        setDbLoading(true);
        try {
            const res = await axiosClient.post<any, ApiResponse<string>>(cfg.apiPath);
            toast.success(`✅ ${res.result ?? 'Thao tác thành công!'}`);
            setPendingAction(null);
        } catch {
            toast.error(`❌ ${cfg.title} thất bại. Vui lòng thử lại.`);
        } finally {
            setDbLoading(false);
        }
    };

    const fmtTime = (d: Date) =>
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const activeCfg = pendingAction ? DB_CONFIG[pendingAction] : null;

    return (
        <div>
            {/* ════════════════════════════════
                HOME SETTING SECTION
            ════════════════════════════════ */}
            <div className="hs-page-header">
                <div className="hs-page-title-block">
                    <h1 className="hs-page-title">Thiết lập Trang chủ</h1>
                    <p className="hs-page-subtitle">
                        Sắp xếp thứ tự và ẩn/hiện các khu vực trên trang chủ. Thay đổi được áp dụng sau khi nhấn Lưu.
                    </p>
                </div>
                <div className="hs-action-group">
                    {savedAt && (
                        <span className="hs-saved-pill">✓ Đã lưu lúc {fmtTime(savedAt)}</span>
                    )}
                    <button
                        className="hs-btn hs-btn--secondary"
                        onClick={handleReset}
                        disabled={resetting || loading}
                    >
                        ↺ Reset mặc định
                    </button>
                    <button
                        className="hs-btn hs-btn--primary"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                    </button>
                </div>
            </div>

            <div className="hs-layout" style={{ marginBottom: '24px' }}>
                <div className="hs-card">
                    <div className="hs-card-header">
                        <span className="hs-card-title">🖼️ Cấu hình Banners phụ (Bên phải)</span>
                    </div>
                    <div className="hs-card-body" style={{ display: 'flex', gap: '24px', padding: '16px' }}>
                        <div className="banner-config-item" style={{ flex: 1 }}>
                            <h4>Banner trên</h4>
                            <div 
                                className="banner-preview" 
                                style={{ 
                                    width: '100%', height: '120px', 
                                    border: '1px dashed #ccc', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative'
                                }}
                                onClick={() => { setCurrentBannerSelect(1); setShowGallery(true); }}
                            >
                                {banner1 ? (
                                    <img src={banner1} alt="Banner 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#888' }}>+ Chọn ảnh</span>
                                )}
                            </div>
                            {banner1 && (
                                <button onClick={() => setBanner1('')} style={{ marginTop: '8px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xóa ảnh</button>
                            )}
                        </div>

                        <div className="banner-config-item" style={{ flex: 1 }}>
                            <h4>Banner dưới</h4>
                            <div 
                                className="banner-preview" 
                                style={{ 
                                    width: '100%', height: '120px', 
                                    border: '1px dashed #ccc', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative'
                                }}
                                onClick={() => { setCurrentBannerSelect(2); setShowGallery(true); }}
                            >
                                {banner2 ? (
                                    <img src={banner2} alt="Banner 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: '#888' }}>+ Chọn ảnh</span>
                                )}
                            </div>
                            {banner2 && (
                                <button onClick={() => setBanner2('')} style={{ marginTop: '8px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xóa ảnh</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hs-layout">
                {/* Left — Section List */}
                <div className="hs-card">
                    <div className="hs-card-header">
                        <span className="hs-card-title">📋 Danh sách sections</span>
                        <span className="hs-card-badge">
                            {sections.filter(s => s.visible).length} / {sections.length} đang hiển thị
                        </span>
                    </div>

                    {loading ? (
                        <div className="hs-loading">
                            <div className="hs-spinner" />
                            <span>Đang tải cấu hình...</span>
                        </div>
                    ) : (
                        <div className="hs-section-list">
                            {sections.map((section, index) => (
                                <div
                                    key={section.id}
                                    className={`hs-section-item${!section.visible ? ' hs-section-item--hidden' : ''}`}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{ cursor: 'move' }}
                                >
                                    <div className="hs-order-badge">{index + 1}</div>
                                    <div className="hs-section-icon" style={{ cursor: 'move', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                                        <span style={{ color: '#999', fontSize: '20px' }}>≡</span> 
                                        <span>{section.icon}</span>
                                    </div>
                                    <div className="hs-section-info">
                                        <div className="hs-section-name">{section.nameVi}</div>
                                        <div className="hs-section-key">{section.sectionKey}</div>
                                    </div>
                                    <div className="hs-section-controls">
                                        <input
                                            type="number"
                                            className="hs-limit-input"
                                            value={section.itemLimit || ''}
                                            onChange={(e) => handleItemLimitChange(index, Number(e.target.value))}
                                            title="Số lượng sản phẩm hiển thị (Tối đa 30)"
                                            min={1}
                                            max={30}
                                            style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' }}
                                        />
                                        <button
                                            className="hs-move-btn"
                                            onClick={() => moveSection(index, 'up')}
                                            disabled={index === 0}
                                            title="Di chuyển lên"
                                        >▲</button>
                                        <button
                                            className="hs-move-btn"
                                            onClick={() => moveSection(index, 'down')}
                                            disabled={index === sections.length - 1}
                                            title="Di chuyển xuống"
                                        >▼</button>
                                        <label
                                            className="hs-toggle"
                                            title={section.visible ? 'Đang hiển thị — click để ẩn' : 'Đang ẩn — click để hiển thị'}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={section.visible}
                                                onChange={() => toggleVisibility(index)}
                                            />
                                            <span className="hs-toggle-slider" />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════
                DATABASE SETTINGS SECTION
            ════════════════════════════════ */}
            {/* <div className="db-section">
                <div className="db-section-header">
                    <h2 className="db-section-title">Thiết lập Database</h2>
                    <p className="db-section-subtitle">
                        Quản lý dữ liệu hệ thống. Chỉ tài khoản <strong>Admin</strong> mới có quyền thực hiện các thao tác này.
                    </p>
                </div>

                <div className="db-actions-grid">
                    <div className={`db-action-card ${DB_CONFIG.seed.cardClass}`}>
                        <div className={`db-action-icon ${DB_CONFIG.seed.iconClass}`}>
                            {DB_CONFIG.seed.icon}
                        </div>
                        <div className="db-action-body">
                            <h3 className="db-action-title">{DB_CONFIG.seed.title}</h3>
                            <p className="db-action-desc">{DB_CONFIG.seed.desc}</p>
                        </div>
                        <span className={`db-action-warn ${DB_CONFIG.seed.warn.cls}`}>
                            {DB_CONFIG.seed.warn.label}
                        </span>
                        <button
                            className="hs-btn hs-btn--success"
                            onClick={() => setPendingAction('seed')}
                        >
                            🌱 Seed Data
                        </button>
                    </div>
                    <div className={`db-action-card ${DB_CONFIG.clear.cardClass}`}>
                        <div className={`db-action-icon ${DB_CONFIG.clear.iconClass}`}>
                            {DB_CONFIG.clear.icon}
                        </div>
                        <div className="db-action-body">
                            <h3 className="db-action-title">{DB_CONFIG.clear.title}</h3>
                            <p className="db-action-desc">{DB_CONFIG.clear.desc}</p>
                        </div>
                        <span className={`db-action-warn ${DB_CONFIG.clear.warn.cls}`}>
                            {DB_CONFIG.clear.warn.label}
                        </span>
                        <button
                            className="hs-btn hs-btn--danger"
                            onClick={() => setPendingAction('clear')}
                        >
                            🗑️ Clear Data
                        </button>
                    </div>
                </div>
            </div> */}

            {/* ════════════════════════════════
                CONFIRMATION MODAL
            ════════════════════════════════ */}
            {pendingAction && activeCfg && (
                <div
                    className="db-modal-overlay"
                    onClick={() => !dbLoading && setPendingAction(null)}
                >
                    <div className="db-modal" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="db-modal-header">
                            <div className={`db-modal-icon ${activeCfg.modalIconClass}`}>
                                {activeCfg.icon}
                            </div>
                            <h3 className="db-modal-title">{activeCfg.confirmTitle}</h3>
                        </div>

                        {/* Body */}
                        <div className="db-modal-body">
                            {pendingAction === 'seed' ? (
                                <>Thao tác này sẽ thêm dữ liệu mẫu vào hệ thống. Dữ liệu hiện có sẽ <strong>không bị xoá</strong>.</>
                            ) : (
                                <>
                                    Thao tác này sẽ <strong>xoá toàn bộ dữ liệu</strong> trong database.
                                    Hành động này <strong>không thể hoàn tác</strong>.<br /><br />
                                    Bạn có chắc chắn muốn tiếp tục?
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="db-modal-footer">
                            <button
                                className="hs-btn hs-btn--secondary"
                                onClick={() => setPendingAction(null)}
                                disabled={dbLoading}
                            >
                                Huỷ
                            </button>
                            <button
                                className={`hs-btn ${activeCfg.confirmBtn}`}
                                onClick={handleDbConfirm}
                                disabled={dbLoading}
                            >
                                {dbLoading
                                    ? <><span className="btn-spinner" /> Đang xử lý...</>
                                    : activeCfg.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showGallery && (
                <GalleryModal
                    isOpen={true}
                    onClose={() => setShowGallery(false)}
                    onSelect={(images) => {
                        if (images.length > 0) {
                            if (currentBannerSelect === 1) setBanner1(images[0].url);
                            if (currentBannerSelect === 2) setBanner2(images[0].url);
                        }
                    }}
                    multiple={false}
                />
            )}
        </div>
    );
};

export default AdminHomeSettingPage;
