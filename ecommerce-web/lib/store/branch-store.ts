import { create } from 'zustand';
import { Branch } from '../types';
import apiClient from '../api/client';

interface BranchState {
  currentBranch: Branch | null;
  branches: Branch[];
  setCurrentBranch: (branch: Branch | null) => Promise<void>;
  setBranches: (branches: Branch[]) => void;
  clear: () => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  currentBranch: null,
  branches: [],

  setCurrentBranch: async (branch) => {
    set({ currentBranch: branch });
    if (branch) {
      // Persist to DB and get new JWT with branchId embedded
      const response = await apiClient
        .patch<{ branchId: string; accessToken: string }>(`/auth/select-branch/${branch.id}`)
        .catch(() => null);
      if (response?.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
      }
    }
  },

  setBranches: (branches) => set({ branches }),

  clear: () => set({ currentBranch: null, branches: [] }),
}));
