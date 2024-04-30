import { create } from 'zustand';

// Enum for feature tabs
export enum FeatureTabs {
    ProductLookupTool,
    ProductToParts,
    PartToProducts,
    ProductFlowchart,
}

type FeatureTabStore = {
    currentTab: FeatureTabs;
    setTab: (tab: FeatureTabs) => void;
};

export const useFeatureTabStore = create<FeatureTabStore>((set) => ({
    currentTab: FeatureTabs.ProductLookupTool, // Defaults to ProductLookupTool tab
    setTab: (tab) => set({ currentTab: tab }),
}));