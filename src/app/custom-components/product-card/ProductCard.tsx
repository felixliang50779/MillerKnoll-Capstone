// Utility-related modules
import { useState, useEffect, useCallback } from 'react';
import PartialSearchTable from '../tables/partialSearchTable';
import DiscontinueModel from '../discontinue-model/discontinuemodel';

// State management for search and tab
import { useFeatureTabStore, FeatureTabs } from '../globalstore/tabstore';
import useSearchStore from '../globalstore/searchstore';

// UI components
import { Button } from '@/components/ui/button';
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";
import { LoaderIcon } from 'lucide-react';

import styles from './productcard.module.css';


type Product = {
    ID: string;
    description: string;
    projectID: string;
    subcategory: string;
    line: string;
    finalOrderDate: number;
    finalShipDate: number;
    regions: string[];
};

type ProductCardProps = {
    product: any;
    setProductSearchResult: any;
    search: Function;
    fetchTime: number;
    processChunk: Function;
    originalProducts: Array<Object>;
    productSearchComplete: boolean;
}

function ProductCard(props: ProductCardProps) {
    // Makes props individual variables
    const { product, fetchTime, setProductSearchResult, processChunk, originalProducts, productSearchComplete } = props;

    const setFeatureTab = useFeatureTabStore((state) => state.setTab);
    const [partialSearchResult, setPartialSearchResult] = useState(false);
    // If the user had to click on a product
    const [twoStep, setTwoStep] = useState(false);

    // Image data
    const [imageDone, setImageDone] = useState(false);
    const [imageUrl, setimageURL] = useState<string | undefined>(undefined);

    // Sets product search result back to original list of products
    const handleBackClick = useCallback(() => {
        setProductSearchResult(originalProducts);
    }, [setProductSearchResult, originalProducts]);

    const productDetails = product[0];

    // Fetches product image from backend, checks if product has 1 object - then fetches
    useEffect(() => {
        // Reset the URL and complete bool
        setimageURL("");
        setImageDone(false);
        if (product.length == 1) {
            fetch(`/api/images?name=${productDetails.DESCRIPTION}`)
                .then(async (response) => {
                    if (response.status == 200) {
                        // Set the URL
                        var tempUrl = await response.text();
                        setimageURL(tempUrl.substring(1, tempUrl.length - 1));
                    }
                    // Done fetching
                    setImageDone(true);
                })
        }
    }, [props.product]);

    useEffect(() => {
        // Check if product object returned successfully and if valid,
        // wasn't just one product
        if (product && Object.keys(product).length > 1) {
            setPartialSearchResult(true);
            setTwoStep(true);
        }
        else {
            setPartialSearchResult(false);
        }
    }, [props.product]);

    if (!product) return null;

    return (
        <div className={styles['product-card']}>
            {/* If a partial search, allow user to select one of the products */}
            {partialSearchResult ? (
                <PartialSearchTable
                    results={product}
                    setResults={setProductSearchResult}
                    setPartialSearch={setPartialSearchResult}
                    fetchTime={fetchTime}
                    productSearchComplete={productSearchComplete}
                />
            ) :
                // If a product is selected or a direct CSV description was entered, display the Product Card
                (
                    <section className={styles['product-page']}>
                        {/* Data for the product itself */}
                        <div className={styles['product-details']}>

                            <h1 className={styles['product-title']}>{productDetails.CFG_DESC}</h1>
                            <h1 className={styles['product-subtitle']}>{productDetails.DESCRIPTION}</h1>

                            <div className={styles['product-detail']}>
                                <h1 className={styles['product-detail-label']}>Item:</h1>
                                <h1 className={styles['product-detail-value']}>{productDetails.ITEM}</h1>
                            </div>

                            <div className={styles['product-detail']}>
                                <h1 className={styles['product-detail-label']}>Project ID:</h1>
                                <h1 className={styles['product-detail-value']}>{productDetails.PROJECT}</h1>
                            </div>

                            <div className={styles['product-detail']}>
                                <h1 className={styles['product-detail-label']}>Line:</h1>
                                <h1 className={styles['product-detail-value']}>{productDetails.PRODUCT_LINE}</h1>
                            </div>
                            <div className={styles['product-detail']}>
                                <h1 className={styles['product-detail-label']}>Type:</h1>
                                <h1 className={styles['product-detail-value']}>{productDetails.ITEM_TYPE}</h1>
                            </div>
                        </div>

                        {/* Image for the product pulling from the Herman Miller website (searched by description) */}
                        <div className={styles['product-details']}>
                            <div style={{ width: '100%', height: '80%', display: 'flex', justifyContent: 'center', }}>
                                {imageUrl ?
                                    <img className={styles['product-image']} src={imageUrl} alt="Product Image" loading="lazy" /> :
                                    <>
                                        {/* If no ImageURL found */}
                                        {imageUrl === "" ? (
                                            // If none was loaded
                                            imageDone ? (
                                                <div className={styles['product-image']} style={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center'}}>
                                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="62.7734" height="46.6992">
                                                        <g>
                                                            <rect height="46.6992" opacity="0" width="62.7734" x="0" y="0" />
                                                            <path d="M54.5117 19.1602C59.4727 21.1133 62.4023 25.6445 62.4023 30.8203C62.4023 37.5781 56.6016 42.9492 49.1602 42.9492L14.7461 42.9297C6.32812 42.9297 0 36.9336 0 29.6484C0 23.5742 3.57422 18.6719 9.17969 17.8906C9.25781 10.8984 15.9766 6.21094 22.0703 8.18359C24.9609 3.71094 29.7461 0 36.6016 0C46.7188 0 54.6484 8.06641 54.5117 19.1602ZM23.3398 16.8164C22.7539 17.4609 22.6172 18.4375 23.3008 19.1602L28.8086 24.668L23.3008 30.1953C22.6172 30.918 22.6953 31.9336 23.3398 32.5195C23.9844 33.1055 24.9609 33.2617 25.7031 32.5586L31.1914 27.0703L36.6992 32.5586C37.4414 33.2617 38.4375 33.1836 39.043 32.5391C39.6484 31.8945 39.7852 30.918 39.1016 30.1953L33.5938 24.668L39.1016 19.1602C39.7852 18.4375 39.707 17.4219 39.0625 16.8164C38.418 16.2109 37.4414 16.0742 36.6992 16.7969L31.1914 22.2852L25.7031 16.7969C24.9609 16.0938 23.9453 16.1719 23.3398 16.8164Z" fill="#ffffff" fill-opacity="0.85" />
                                                        </g>
                                                    </svg>
                                                </div>) :
                                                // If still loading
                                                <div className={styles['product-image']} style={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center'}}>
                                                    <LoaderIcon className={styles['loading-icon']} />
                                                </div>
                                        )
                                            : (<Skeleton height="100%" />)
                                        }
                                    </>
                                }
                            </div>

                            {/* Buttons below the image */}
                            <div className={styles['product-buttons']}>
                                {/* Back button -> Go back to Product Lookup Tool page */}
                                {(twoStep &&
                                    <Button onClick={handleBackClick} className={styles['product-back']}>
                                        Back
                                    </Button>)}

                                {/* View Components button -> Search this product in the Product to Parts tab */}
                                <Button
                                    onClick={() => {
                                        setFeatureTab(FeatureTabs.ProductToParts);
                                        props.search({ content: productDetails['CFG_DESC'], currentTab: FeatureTabs.ProductToParts });
                                        // Sets search in Product to Parts to product CFG_DESC
                                        useSearchStore.getState().setSearchText(productDetails['CFG_DESC'], FeatureTabs.ProductToParts);
                                    }}
                                    className={styles['product-viewcomponents']}
                                >
                                    View Components
                                </Button>

                                {/* View Discontinueable Parts -> See all the parts in this product that only go into one other product */}
                                <DiscontinueModel
                                    search={props.search}
                                    id={productDetails.CFG_DESC}
                                    project={productDetails.PROJECT}
                                    processChunk={processChunk}
                                />
                            </div>
                        </div>
                    </section>
                )}
        </div>
    );
}

export default ProductCard;