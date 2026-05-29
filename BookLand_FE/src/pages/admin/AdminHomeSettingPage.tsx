import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import homeService from '../../api/homeService';
import type { HomeSection } from '../../types/HomeSection';
import './admin-home-setting.css';

const AdminHomeSettingPage = () => {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [resetting, setResetting] = useState(false);

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

    const fmtTime = (d: Date) =>
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div>
            {/* Page Header */}
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

            {/* Main Layout */}
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
                                    {/* Order badge */}
                                    <div className="hs-order-badge">{index + 1}</div>

                                    {/* Icon */}
                                    <div className="hs-section-icon">{section.icon}</div>

                                    {/* Info */}
                                    <div className="hs-section-info">
                                        <div className="hs-section-name">{section.nameVi}</div>
                                        <div className="hs-section-key">{section.sectionKey}</div>
                                    </div>

                                    {/* Controls */}
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
        </div>
    );
};

export default AdminHomeSettingPage;
