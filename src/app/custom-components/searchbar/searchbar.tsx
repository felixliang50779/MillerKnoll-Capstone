"use client";

// Utility-related modules
import { useState, useEffect } from 'react';
import debounce from "debounce";

// State management for tab and search
import useSearchStore from '../globalstore/searchstore';
import { useFeatureTabStore } from '../globalstore/tabstore';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserDropdown from '../user-dropdown/userdropdown';

import styles from './searchbar.module.css';

const featureSearchMap = {
    0: "Enter a CFG Description", 
    1: "Enter a CFG Description", 
    2: "Enter a Part ID", 
    3: "Enter a Full CFG Description"
};

export default function SearchBar({ search, searchState, featureTab, isAuthenticated, collapsed } : {search: Function, searchState: Boolean, featureTab: 0 | 1 | 2 | 3, isAuthenticated: String, collapsed: Boolean}) {
    const { getSearchText, setSearchText } = useSearchStore();
    // Gets current tab for
    const { currentTab } = useFeatureTabStore();
    // Initializes searchPlaceholder as featureSearchMap[0]
    const [searchPlaceholder, setSearchPlaceholder] = useState(featureSearchMap[0]);
    // Gets current search text from current tab
    const searchText = getSearchText(currentTab);

    // Adds 200ms debounce time to search function to
    // account for double-clicks
    const throttledSearch = debounce(search, 200);

    // Updates searchPlaceholder whenever featureTab changes
    useEffect(() => {
        if (featureTab === 0) {
            setSearchPlaceholder(featureSearchMap[0]);
        }
        else if (featureTab === 1) {
            setSearchPlaceholder(featureSearchMap[1]);
        }
        else if (featureTab === 2) {
            setSearchPlaceholder(featureSearchMap[2]);
        }
        else {
            setSearchPlaceholder(featureSearchMap[3]);
        }
    }, [featureTab]);
    
    // Updates search text when input changes
    function handleSearchInput(event: any) {
        setSearchText(event.target.value, featureTab);
    }

    return ( 
        <div className={styles['navbar-container']}>
            <div className={styles['search-container']}>
                <Input className={styles['search-bar']} type='text' value={searchText}
                    onChange={handleSearchInput} placeholder={searchPlaceholder}></Input>
                {
                    isAuthenticated !== 'true' || searchState ? <></> :
                    <Button
                        type='submit'
                        disabled={isAuthenticated !== 'true'}
                        onClick={() => throttledSearch({content: searchText, currentTab: currentTab})}>
                            Search
                    </Button>
                }
            </div>
            <UserDropdown
                isAuthenticated={isAuthenticated}
                collapsed={collapsed} />
        </div>
    );
}