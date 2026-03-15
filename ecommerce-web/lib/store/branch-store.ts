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
      // Persist to DB — backend reads this on every request
      await apiClient.patch(`/auth/select-branch/${branch.id}`).catch(() => {
        // Silent fail: the branch is set in UI state even if the API call fails
      });
    }
  },

  setBranches: (branches) => set({ branches }),

  clear: () => set({ currentBranch: null, branches: [] }),
}));
