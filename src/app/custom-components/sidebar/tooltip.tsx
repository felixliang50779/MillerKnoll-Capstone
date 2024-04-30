import React from 'react';

import { MdOutlineHelpOutline } from "react-icons/md";
import styles from './tooltip.module.css';

interface TooltipButtonProps {
 onClick: () => void;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({ onClick }) => {
 return (
   <div className={styles['tooltip']}>
      <div className={styles['help-button-container']} onClick={onClick}>
         <MdOutlineHelpOutline className={styles['help-button-icon']} />
         <button className={styles['help-button']}>Help</button>
      </div>
   </div>
 );
};

export default TooltipButton;