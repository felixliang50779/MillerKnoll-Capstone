"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Image from 'next/image';
import Logo from '../../assets/images/millerknoll-invert-logo.png';
import styles from './sidebar.module.css';
import { useFeatureTabStore, FeatureTabs } from '../globalstore/tabstore';
import TooltipButton from "./tooltip";
import HelpPopup from "./HelpPopup";
import { useTour } from '@reactour/tour'

interface SidebarCollapse {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

function Sidebar({ collapsed , setCollapsed } : SidebarCollapse) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
    const currentTab = useFeatureTabStore((state) => state.currentTab); 
    const setFeatureTab = useFeatureTabStore((state) => state.setTab);
    const { setIsOpen, setCurrentStep } = useTour(); 

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        setCollapsed(!collapsed);
    }; 
    
    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleHelpButtonClick = () => {
        setCurrentStep(0);
        setIsOpen(true); 
    };

    return (
        <div>
            <div className={`${styles['sidebar-base']} ${isCollapsed ? styles['sidebar-container-collapsed'] : styles['sidebar-container-expanded']}`}>
                {!isCollapsed && (
                    <>
                        <Button className={styles['sidebar-close']} onClick={toggleSidebar}>
                            <ArrowLeftIcon className={styles['close-icon']} />
                        </Button>
                        <Image
                            src={Logo}
                            width={250}
                            height={50}
                            alt="MillerKnollLogo"
                            loading="lazy"
                        />
                        <div className={styles["sidebar-links"]}>
                            <button
                                className={`${styles["sidebar-link"]} ${currentTab === FeatureTabs.ProductLookupTool && styles['active-tab']}`}
                                onClick={
                                    () => setFeatureTab(FeatureTabs.ProductLookupTool)
                                }>
                                <ChevronRightIcon className={`${styles['selected-icon']} ${currentTab === FeatureTabs.ProductLookupTool && styles['selected-active']}`} />
                                Product Lookup Tool
                            </button>
                            <button
                                className={`${styles["sidebar-link"]} ${currentTab === FeatureTabs.ProductToParts && styles['active-tab']}`}
                                onClick={
                                    () => setFeatureTab(FeatureTabs.ProductToParts)
                                }>
                                <ChevronRightIcon className={`${styles['selected-icon']} ${currentTab === FeatureTabs.ProductToParts && styles['selected-active']}`} />
                                Product to Parts
                            </button>
                            <button
                                className={`${styles["sidebar-link"]} ${currentTab === FeatureTabs.PartToProducts && styles['active-tab']}`}
                                onClick={
                                    () => setFeatureTab(FeatureTabs.PartToProducts)
                                }>
                                <ChevronRightIcon className={`${styles['selected-icon']} ${currentTab === FeatureTabs.PartToProducts && styles['selected-active']}`} />
                                Part to Products
                            </button>
                            <button
                                className={`${styles["sidebar-link"]} ${currentTab === FeatureTabs.ProductFlowchart && styles['active-tab']}`}
                                onClick={
                                    () => setFeatureTab(FeatureTabs.ProductFlowchart)
                                }>
                                <ChevronRightIcon className={`${styles['selected-icon']} ${currentTab === FeatureTabs.ProductFlowchart && styles['selected-active']}`} />
                                Product Flowchart
                            </button>
                            
                        </div>

                        <TooltipButton
                            onClick={handleHelpButtonClick} />

                    </>
                )}
            </div>
            <button className={`${styles["toggle-button"]} ${!isCollapsed && styles['toggle-button-open']}`} 
                onClick={toggleSidebar}>
                {isCollapsed ? ">" : "<"}
            </button> 
            {isPopupOpen && <HelpPopup isOpen={isPopupOpen} onClose={handleClosePopup} />}
        </div>
    );
}

export default Sidebar;
