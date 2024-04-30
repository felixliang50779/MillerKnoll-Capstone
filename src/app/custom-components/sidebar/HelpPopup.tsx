import React from 'react';
import styles from './sidebar.module.css'; 
import { useTour } from '@reactour/tour';

interface HelpPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {
    const { setIsOpen } = useTour(); 

    if (!isOpen) return null;

  
    const handleClose = () => {
        setIsOpen(true); 
        onClose(); 
    };

    return (
        <div className={styles.popup}>
            <div className={styles.popupHeader}>
                <h2>Help Menu</h2> 
                <button className={styles.closeButton} onClick={handleClose}>X</button> 
            </div>
        </div>
    );
};

export default HelpPopup;