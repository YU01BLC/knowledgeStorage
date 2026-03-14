import { create } from 'zustand';

type ViewMode = 'card' | 'horse';
type PageMode = 'home' | 'diagnosis-list' | 'diagnosis-result';

type UIState = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentPage: PageMode;
  setCurrentPage: (page: PageMode) => void;
  diagnosisModalOpen: boolean;
  setDiagnosisModalOpen: (open: boolean) => void;
  activeDiagnosisId: string | null;
  setActiveDiagnosisId: (id: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'card',
  setViewMode: (mode) => set({ viewMode: mode }),
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  diagnosisModalOpen: false,
  setDiagnosisModalOpen: (open) => set({ diagnosisModalOpen: open }),
  activeDiagnosisId: null,
  setActiveDiagnosisId: (id) => set({ activeDiagnosisId: id }),
}));
