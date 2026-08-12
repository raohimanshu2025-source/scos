import React, { useState, useEffect } from 'react';
import { Search, Building2, User, AlertTriangle, Box, MapPin, X, CornerDownLeft } from 'lucide-react';
import { Modal } from '../ui/Feedback';

interface SearchResultItem {
  id: string;
  category: 'User' | 'Department' | 'Incident' | 'Complaint' | 'Asset' | 'Location';
  title: string;
  subtitle: string;
  badge?: string;
  route: string;
}

const MOCK_SEARCH_DATABASE: SearchResultItem[] = [
  { id: '1', category: 'Department', title: 'Kanpur Jal Sansthan (Water Works)', subtitle: 'KJS-01 • District Water Supply & Sewage', badge: 'OPERATIONAL', route: '/departments/water' },
  { id: '2', category: 'Department', title: 'Kanpur Nagar Nigam (Municipal Corp)', subtitle: 'KNN-01 • Solid Waste & Sanitation', badge: 'OPERATIONAL', route: '/departments/municipal' },
  { id: '3', category: 'Department', title: 'Kanpur Traffic Police & Transport', subtitle: 'KTP-01 • Intelligent Traffic Control', badge: 'OPERATIONAL', route: '/departments/traffic' },
  { id: '4', category: 'Incident', title: 'Overflowing Sewage Line - Zone 4 Jajmau', subtitle: 'INC-7842 • High Severity • Water Dept', badge: 'CRITICAL', route: '/operations' },
  { id: '5', category: 'Incident', title: 'Traffic Signal Sensor Blackout - Parade Crossing', subtitle: 'INC-7845 • Medium Severity • Traffic Dept', badge: 'WARNING', route: '/operations' },
  { id: '6', category: 'User', title: 'Dr. R. K. Verma', subtitle: 'Chief Engineer • Kanpur Jal Sansthan', badge: 'DEPT_ADMIN', route: '/admin' },
  { id: '7', category: 'User', title: 'Shri R. P. Singh (IAS)', subtitle: 'District Magistrate • Kanpur Nagar', badge: 'DISTRICT_ADMIN', route: '/admin' },
  { id: '8', category: 'Asset', title: 'Bithoor Water Pumping Station B-02', subtitle: 'IoT Pumping Asset • Flow 14.2 MLD', badge: 'ONLINE', route: '/gis' },
  { id: '9', category: 'Location', title: 'Shuklaganj Ganga Outfall Monitor', subtitle: 'Sensor Node #402 • Ganga Flood Watch', badge: 'WATCH', route: '/gis' },
];

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(MOCK_SEARCH_DATABASE.slice(0, 5));
    } else {
      const q = query.toLowerCase();
      setResults(
        MOCK_SEARCH_DATABASE.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
      );
    }
  }, [query]);

  // Keyboard CMD+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryIcons = {
    User: <User className="w-4 h-4 text-indigo-500" />,
    Department: <Building2 className="w-4 h-4 text-emerald-500" />,
    Incident: <AlertTriangle className="w-4 h-4 text-rose-500" />,
    Complaint: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    Asset: <Box className="w-4 h-4 text-sky-500" />,
    Location: <MapPin className="w-4 h-4 text-purple-500" />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SCOS Unified Institutional Search" maxWidth="xl">
      <div className="space-y-4">
        {/* Search input field */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, departments, incidents, complaints, assets, or GIS nodes..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No matching SCOS governance records found.</div>
          ) : (
            results.map((res) => (
              <button
                key={res.id}
                onClick={() => {
                  onSelectResult(res.route);
                  onClose();
                }}
                className="w-full p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 text-left flex items-center justify-between gap-3 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition shrink-0">
                    {categoryIcons[res.category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{res.category}</span>
                      {res.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {res.badge}
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">{res.title}</h5>
                    <p className="text-[11px] text-slate-500">{res.subtitle}</p>
                  </div>
                </div>
                <CornerDownLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
              </button>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Press ESC or Cmd+K to dismiss</span>
          <span>SCOS Search Engine v5B.3</span>
        </div>
      </div>
    </Modal>
  );
};
