import { create } from 'zustand';

type ViewMode = 'card' | 'horse';
type PageMode = 'home' | 'diagnosis';

type UIState = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentPage: PageMode;
  setCurrentPage: (page: PageMode) => void;
  diagnosisModalOpen: boolean;
  setDiagnosisModalOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'card',
  setViewMode: (mode) => set({ viewMode: mode }),
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  diagnosisModalOpen: false,
  setDiagnosisModalOpen: (open) => set({ diagnosisModalOpen: open }),
}));
