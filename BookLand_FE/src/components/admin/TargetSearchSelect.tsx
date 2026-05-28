import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import { EventTargetType } from '../../types/EventTargetType';
import bookService from '../../api/bookService';
import categoryService from '../../api/categoryService';
import serieService from '../../api/serieService';
import authorService from '../../api/authorService';
import publisherService from '../../api/publisherService';

interface TargetOption {
    id: number;
    label: string;
}

interface Props {
    targetType: EventTargetType;
    selectedId: number;
    onSelect: (id: number, label: string) => void;
}

const PLACEHOLDER: Record<EventTargetType, string> = {
    [EventTargetType.BOOK]: 'Tìm tên sách...',
    [EventTargetType.CATEGORY]: 'Tìm danh mục...',
    [EventTargetType.SERIES]: 'Tìm bộ sách...',
    [EventTargetType.AUTHOR]: 'Tìm tác giả...',
    [EventTargetType.PUBLISHER]: 'Tìm nhà xuất bản...',
    [EventTargetType.ALL]: '',
};

async function fetchOptions(targetType: EventTargetType, keyword: string): Promise<TargetOption[]> {
    const params = { keyword, page: 0, size: 10 };
    try {
        switch (targetType) {
            case EventTargetType.BOOK: {
                const res = await bookService.getAllBooks({ keyword, page: 0, size: 10 });
                return (res.result?.content || []).map((b: any) => ({ id: b.id, label: b.name }));
            }
            case EventTargetType.CATEGORY: {
                const res = await categoryService.getAll(params);
                return (res.result?.content || []).map((c: any) => ({ id: c.id, label: c.name }));
            }
            case EventTargetType.SERIES: {
                const res = await serieService.getAllSeries(params);
                return (res.result?.content || []).map((s: any) => ({ id: s.id, label: s.name }));
            }
            case EventTargetType.AUTHOR: {
                const res = await authorService.getAllAuthors(params);
                return (res.result?.content || []).map((a: any) => ({
                    id: a.id,
                    label: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || `ID ${a.id}`
                }));
            }
            case EventTargetType.PUBLISHER: {
                const res = await publisherService.getAllPublishers(params);
                return (res.result?.content || []).map((p: any) => ({ id: p.id, label: p.name }));
            }
            default:
                return [];
        }
    } catch {
        return [];
    }
}

const TargetSearchSelect = ({ targetType, selectedId, onSelect }: Props) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<TargetOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Khi ALL thì không cần chọn
    const isAll = targetType === EventTargetType.ALL;

    // Load label của item đã chọn khi mount/type thay đổi
    useEffect(() => {
        if (isAll) { setSelectedLabel(''); return; }
        if (!selectedId) { setSelectedLabel(''); return; }

        let cancelled = false;
        fetchOptions(targetType, '').then(opts => {
            if (cancelled) return;
            const found = opts.find(o => o.id === selectedId);
            if (found) setSelectedLabel(found.label);
            else setSelectedLabel(`ID: ${selectedId}`);
        });
        return () => { cancelled = true; };
    }, [targetType, selectedId]);

    // Reset khi đổi target type
    useEffect(() => {
        setInputValue('');
        setOptions([]);
        setIsOpen(false);
        setSelectedLabel('');
    }, [targetType]);

    // Click outside để đóng dropdown
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInputChange = useCallback((value: string) => {
        setInputValue(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            const results = await fetchOptions(targetType, value);
            setOptions(results);
            setIsLoading(false);
        }, 350);
    }, [targetType]);

    const handleOpen = useCallback(async () => {
        if (isAll) return;
        setIsOpen(true);
        if (options.length === 0) {
            setIsLoading(true);
            const results = await fetchOptions(targetType, '');
            setOptions(results);
            setIsLoading(false);
        }
    }, [isAll, options.length, targetType]);

    const handleSelect = (opt: TargetOption) => {
        onSelect(opt.id, opt.label);
        setSelectedLabel(opt.label);
        setInputValue('');
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(0, '');
        setSelectedLabel('');
        setInputValue('');
    };

    if (isAll) {
        return (
            <div className="target-search-select">
                <div className="target-select-display target-select-all">
                    <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Áp dụng cho tất cả — không cần chọn</span>
                </div>
            </div>
        );
    }

    return (
        <div className="target-search-select" ref={containerRef}>
            {/* Display box – click để mở */}
            <div
                className={`target-select-display ${isOpen ? 'open' : ''}`}
                onClick={handleOpen}
            >
                {selectedLabel ? (
                    <>
                        <span className="selected-label">{selectedLabel}</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>(ID: {selectedId})</span>
                    </>
                ) : (
                    <span className="target-placeholder">{PLACEHOLDER[targetType]}</span>
                )}
                <span className="target-select-actions">
                    {selectedLabel && (
                        <X size={14} className="target-clear-btn" onClick={handleClear} />
                    )}
                    <ChevronDown size={16} className={`target-chevron ${isOpen ? 'rotated' : ''}`} />
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="target-dropdown">
                    {/* Search input */}
                    <div className="target-search-box">
                        <Search size={14} />
                        <input
                            autoFocus
                            type="text"
                            className="target-search-input"
                            placeholder={PLACEHOLDER[targetType]}
                            value={inputValue}
                            onChange={e => handleInputChange(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                    </div>

                    {/* Options list */}
                    <ul className="target-options-list">
                        {options.length === 0 && !isLoading && (
                            <li className="target-option-empty">Không tìm thấy kết quả</li>
                        )}
                        {options.map(opt => (
                            <li
                                key={opt.id}
                                className={`target-option ${opt.id === selectedId ? 'selected' : ''}`}
                                onClick={() => handleSelect(opt)}
                            >
                                <span className="option-label">{opt.label}</span>
                                <span className="option-id">ID: {opt.id}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TargetSearchSelect;
