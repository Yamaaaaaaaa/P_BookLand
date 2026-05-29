import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import homeService from '../../api/homeService';
import axiosClient from '../../api/axiosClient';
import type { HomeSection } from '../../types/HomeSection';
import type { ApiResponse } from '../../types/api';
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

    /* ── DB section state ── */
    const [pendingAction, setPendingAction] = useState<DbAction>(null);
    const [dbLoading, setDbLoading] = useState(false);

    useEffect(() => {
        fetchSections();
    }, []);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            const sectionIds = sections.map(s => s.id);
            await homeService.updateHomeSectionsOrder(sectionIds);
            for (const s of sections) {
                await homeService.toggleHomeSectionVisibility(s.id, s.visible);
            }
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
                                >
                                    <div className="hs-order-badge">{index + 1}</div>
                                    <div className="hs-section-icon">{section.icon}</div>
                                    <div className="hs-section-info">
                                        <div className="hs-section-name">{section.nameVi}</div>
                                        <div className="hs-section-key">{section.sectionKey}</div>
                                    </div>
                                    <div className="hs-section-controls">
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

                {/* Right — Preview */}
                <div className="hs-preview-card">
                    <div className="hs-card-header">
                        <span className="hs-card-title">👁 Xem trước thứ tự</span>
                    </div>
                    <div className="hs-preview-body">
                        <div className="hs-preview-label">Trang chủ sẽ hiển thị theo thứ tự:</div>
                        <div className="hs-preview-items">
                            {sections.map((s, i) => (
                                <div
                                    key={s.id}
                                    className={`hs-preview-item${!s.visible ? ' hs-preview-item--hidden' : ''}`}
                                >
                                    <span className="hs-preview-num">{i + 1}</span>
                                    <span className="hs-preview-emoji">{s.icon}</span>
                                    <span className="hs-preview-name">{s.nameVi}</span>
                                </div>
                            ))}
                        </div>
                        <div className="hs-divider" />
                        <div className="hs-preview-label">Hướng dẫn</div>
                        <ul className="hs-hint-list">
                            <li>Bấm ▲ ▼ để thay đổi thứ tự</li>
                            <li>Bật/tắt switch để ẩn/hiện section</li>
                            <li>Bấm <strong>Lưu thay đổi</strong> để áp dụng</li>
                            <li>Bấm Reset mặc định để hoàn tác</li>
                        </ul>
                    </div>
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
        </div>
    );
};

export default AdminHomeSettingPage;
