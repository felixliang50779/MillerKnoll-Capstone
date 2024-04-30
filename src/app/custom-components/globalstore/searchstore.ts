import { create } from 'zustand';

// Storing input searchtext 
interface SearchStore {
    searchTextMap: Record<number, string>
    setSearchText: (text: string, tab: number) => void;
    getSearchText: (tab: number) => string;
}

const searchTextTabMapping: Record<number, number> = {
    0: 0,
    1: 0,
    2: 1,
    3: 0,
};


const useSearchStore = create<SearchStore>((set, get) => ({
    searchTextMap: {
        0: '',
        1: ''
    },
    setSearchText: (text, tab) => {
        const map = get().searchTextMap;
        map[searchTextTabMapping[tab]] = text;
        set({ searchTextMap: map });
    },
    getSearchText: (tab) => {
        return get().searchTextMap[searchTextTabMapping[tab]];
    }
}));

export default useSearchStore;
