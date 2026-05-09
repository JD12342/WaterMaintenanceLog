import React from 'react';

export default function MobileSidebar({ open = false, onClose = () => {}, navItems = [], user = null, onNavigate = () => {}, onLogout = () => {} }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            {/* overlay */}
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />

            {/* panel */}
            <div className="fixed left-0 top-0 h-full w-72 bg-[#0f172a] shadow-2xl transform transition-transform duration-200 translate-x-0 flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="text-lg font-bold text-white">Menu</div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">✕</button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const IconComponent = item.icon && typeof item.icon === 'function' ? item.icon : null;
                        return (
                            <button
                                key={item.key || item.id || item.label}
                                onClick={() => { onNavigate(item.href || item.key || item.id); onClose(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
                                <span>{item.label || item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    {user && (
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                <p className="text-slate-400 text-xs truncate">{user.role}</p>
                            </div>
                        </div>
                    )}
                    <button onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors">
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
