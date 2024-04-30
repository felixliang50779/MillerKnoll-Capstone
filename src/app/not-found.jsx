import Image from 'next/image';
import Logo from './assets/images/millerknoll-invert-logo.png';

import styles from './not-found.module.css';


export default function NotFound() {
    return (
        <div className={styles['notfound-container']}>
            <nav className={styles['notfound-navbar']}>
                <a href='/'>
                    <Image
                        src={Logo}
                        width={250}
                        height={50}
                        alt="MillerKnollLogo"
                        loading="lazy"
                    />
                </a>
            </nav>
            <div className={styles['notfound-problem-container']}>
                <h1 className={styles['notfound-problem-title']}>There was a problem.</h1>
                <h2 className={styles['notfound-problemtext']}>We could not find the page you are looking for.</h2>
                <a href='/' className={styles['notfound-back']}>Go Back</a>
            </div>
        </div>
    )
}