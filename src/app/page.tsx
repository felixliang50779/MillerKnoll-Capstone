"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LoaderIcon } from 'lucide-react';
import axios from 'axios';
import ProductCard from './custom-components/product-card/ProductCard';
import SearchBar from './custom-components/searchbar/searchbar';
import SideBar from "./custom-components/sidebar/sidebar";
import ComponentTable from './custom-components/tables/componenttable';
import ProductTable from './custom-components/tables/producttable';
import CSVButton from "./custom-components/tables/csvbutton";
import ProductFlowchart from './custom-components/tables/productflowchart';
import { useFeatureTabStore, FeatureTabs } from './custom-components/globalstore/tabstore';
import styles from './dashboard.module.css';

export default function Dashboard() {

    ///////// Sidebar /////////
    // Current Tab + If the sidebar is Collapsed
    const currentTab = useFeatureTabStore((state) => state.currentTab);
    const [collapsed, setIsCollapsed] = useState(false);


    ///////// Product Lookup Tool /////////
    // Content in the Product Tool searchbar + Results
    const [productToolSearchID, setProductToolSearchID] = useState<String | null>(null);
    const [productSearchResult, setProductSearchResult] = useState<Array<Object>>([]);
    // Product Lookup search complete
    const [productSearchComplete, setProductSearchComplete] = useState(false);


    ///////// Product to Parts /////////
    // Content in the Product searchbar + Results
    const [productSearchID, setProductSearchID] = useState<String | null>(null);
    const [productToPartsResults, setProductToPartsResults] = useState<Array<Object>>([]);
    const [originalProducts, setOriginalProducts] = useState<Array<Object>>([]);
    // Product to Parts search executed
    const [productToPartsExecuted, setProductToPartsExecuted] = useState(false);
    // Product to Parts search complete
    const [productToPartsComplete, setProductToPartsComplete] = useState(false);


    ///////// Part to Products /////////
    // Content in the Part searchbar + Results
    const [componentSearchID, setComponentSearchID] = useState<String | null>(null);
    const [partToProductsResults, setPartToProductsResults] = useState<Array<Object>>();
    // Part to Products search complete
    const [partToProductComplete, setPartToProductComplete] = useState(false);

    ///////// Product Flowchart /////////
    // Content in the Flowchart searchbar + Results
    const [productFlowchartSearchID, setProductFlowchartSearchID] = useState<String | null>(null);
    const [productFlowchartResults, setProductFlowchartResults] = useState<Array<Object>>();
    const [productFlowchartResultsComplete, setProductFlowchartResultsComplete] = useState(false);


    ///////// Export to CSV /////////
    // CSV data for Products
    const [csvProductData, setProductCsvData] = useState([]);
    const [csvProductHeaders, setProductCsvHeaders] = useState([]);
    // CSV data for Parts
    const [csvPartData, setPartCsvData] = useState([]);
    const [csvPartHeaders, setPartCsvHeaders] = useState([]);


    ///////// Quality of Life /////////
    const [isAuthenticated, setIsAuthenticated] = useState('');
    // Manages if the spinner displays or not
    const [loadingSpinner, setLoadingSpinner] = useState(false);
    // Execution time of product lookup tool on the most recent search
    const [fetchTimeProducts, setFetchTimeProducts] = useState(0);
    const [fetchTimeToParts, setFetchTimeToParts] = useState(0);
    const fetchTimeToProducts = useRef(0);

    // Master state for whether search button should be displayed
    // (hide search button while searching)
    const [searchState, setSearchState] = useState(false);

    type searchProps = {
        content: String,
        currentTab: Number
    }

    useEffect(() => {
        fetch("https://product-traceability-poc.vercel.app/user", {
            credentials: 'include'
        }).then(async response => {
            const authenticated = await response.text();
            setIsAuthenticated(authenticated);
        });
    }, []);

    // Processes information from streamed chunk
    // and turns it into valid objects
    const processChunk = (
        streamBuffer : any, incompleteItem : string, startDelimiter : string, endDelimiter : string) => {

        const chunk = new TextDecoder().decode(streamBuffer);

        let fetchedItems = chunk.split('\n');

        if (fetchedItems.at(-1) === '') {
            fetchedItems.pop();
        }

        const processedItems = [];
        for (const item of fetchedItems) {
            let completeItem = item;

            // If beginning of product str is missing
            if (!(completeItem.startsWith(startDelimiter))) {
                // Add memoized string from prev incomplete
                // item to it
                completeItem = incompleteItem + item;

                // If new product item is still incomplete
                // we skip it and move onto the next
                if (!(completeItem.endsWith(endDelimiter))) {
                    incompleteItem = completeItem;
                    continue;
                }
                else {
                    incompleteItem = "";
                }
            }
            // If end of item str is missing
            else if (!(completeItem.endsWith(endDelimiter))) {
                // Memoize this incomplete str
                // and save it for the next item
                incompleteItem = completeItem;
                continue;
            }

            try {
                // If this func was called for product lookup
                if (startDelimiter === '{') {
                    processedItems.push(JSON.parse(completeItem));
                }
                // If this func was called for product -> parts
                else {
                    processedItems.push(Object.values(
                        JSON.parse(completeItem))[0]);
                }
            }
            catch (e) {
                console.log(completeItem);
                console.log(item);
            }
        }

        return { processedItems: processedItems, incompleteItem: incompleteItem };
    }

    // Searching for a product, used for both lookup + parts conversion
    // unique flag is true when converting from unique product into parts
    // unique flag is false when you're just looking up a product
      const productLookup = async (cfg_desc : String, unique: string) => {
        fetch(`/api/product?ID=${cfg_desc}&unique=${unique}`)
            .then(async response => {
                // Reset product search bool
                setProductSearchComplete(false);

                if (response.status == 200) {
                    setLoadingSpinner(false);
                    const streamReader = response.body!.getReader();

                    const fetchBegin = Date.now();

                    // Initialize product string
                    let incompleteProduct = "";

                    while (true) {
                        const { done, value } = await streamReader.read();

                        if (done) {
                            // When the results are done fetching
                            setProductSearchComplete(true);
                            setSearchState(false);
                            break;
                        }

                        const { processedItems, incompleteItem } = processChunk(
                            value, incompleteProduct, '{', '}');

                        incompleteProduct = incompleteItem;

                        // We are ready to update the lookup results
                        if (unique !== 'true') { //Products
                            setFetchTimeProducts((Date.now() - fetchBegin) / 1000);
                            setOriginalProducts(prevState => {
                                return [...prevState, ...processedItems];
                            });
                            setProductSearchResult(prevState => {
                                return [...prevState, ...processedItems];
                            });
                        }
                        else { //Parts
                            setFetchTimeToParts((Date.now() - fetchBegin) / 1000);
                            setProductToPartsResults(prevState => {
                                return [...prevState, ...processedItems];
                            })
                        }
                    }
                }
            }).catch(e => console.log(e));
    }

    ///////// Search function based on page /////////
    async function search(searchResults: searchProps) {
        searchResults.content = searchResults.content.trim().toUpperCase();

        if (searchResults.content.length < 2) {
            return;
        }

        // Set Loading to true when fetching starts
        setLoadingSpinner(true);
        // Set search state to true when fetching starts
        setSearchState(true);

        switch (searchResults.currentTab) {
            ///////// Product Lookup Tool /////////
            case FeatureTabs.ProductLookupTool:
                // Empty initial results
                setProductSearchResult([]);
                setOriginalProducts([]);
                setProductToolSearchID(searchResults.content);
                
                // Look up partial product
                await productLookup(searchResults.content, 'false');

                break;

            ///////// Product to Parts page /////////
            case FeatureTabs.ProductToParts:
                // Empty initial results
                setProductToPartsResults([]);
                setOriginalProducts([]);
                setProductSearchID(searchResults.content);

                // Resets product to parts executed to false so the user cannot click in the component table
                setProductToPartsExecuted(false);

                // Resets the product to parts completed to false so the Export CSV button does not appear
                setProductToPartsComplete(false);

                await productLookup(searchResults.content, 'true');

                break;

            ///////// Part to Products page /////////
            case FeatureTabs.PartToProducts:
                setComponentSearchID(searchResults.content);
                setPartToProductComplete(false);

                const fetchBegin3 = Date.now();
                // Get results from the endpoint
                axios.get(`/api/component/products?ID=${searchResults.content}`)
                
                    .then((response) => {
                        if (response.status == 200) {
                            fetchTimeToProducts.current = (Date.now() - fetchBegin3) / 1000;
                            setPartToProductsResults(response.data); //set results
                        }
                    })
                    .finally(() => {
                        // Remove spinners & set complete
                        setLoadingSpinner(false);
                        setPartToProductComplete(true);
                        setSearchState(false);
                    });
                break;

            ///////// Product Flowchart page /////////
            case FeatureTabs.ProductFlowchart:
                setProductFlowchartSearchID(searchResults.content);
                setProductFlowchartResultsComplete(false);
                setProductFlowchartResults([]);
                // Get results from the endpoint
                fetch(`/api/product/components?FLOWCHART=true`, {
                
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({ 'ID': `('${searchResults.content}')` })
                })
                    .then(async response => {
                        if (response.status === 200) {
                            const partStream = response.body!.getReader();

                            let incompletePart = '';

                            while (true) {
                                const { done, value } = await partStream.read();

                                if (done) { // When results finalize
                                    setProductFlowchartResultsComplete(true);
                                    setSearchState(false);
                                    setLoadingSpinner(false);
                                    break;
                                }

                                // Recieve data chunks
                                const { processedItems, incompleteItem } = processChunk(
                                    value, incompletePart, '{{', '}}');

                                incompletePart = incompleteItem;

                                // Add chunk to results
                                setProductFlowchartResults((prevState: any) => {
                                    return [...prevState, ...processedItems];
                                });
                            }
                        }
                    }).catch(e => console.log(e));
                break;
        }
    }

    ///////// Collapsable /////////
    function toggleTableView(value: boolean) {
        setIsCollapsed(value);
    }

    ///////// CSV Button for Product to Parts /////////
    const handlePartCSVUpdate = useCallback((data : any, headers : any) => {
        setPartCsvData(data);
        setPartCsvHeaders(headers);
    }, []);
    
    ///////// CSV Button for Part to Products /////////
    const handleProductCSVUpdate = useCallback((data : any, headers : any) => {
        setProductCsvData(data);
        setProductCsvHeaders(headers);
    }, []);

    ///////// Content renderer /////////
    const renderContent = () => {
        let header;
        let headerContent;
        let mainContent;

        switch (currentTab) {
            ///////// Product Lookup tool page /////////
            case FeatureTabs.ProductLookupTool:

                // Main page content
                mainContent = loadingSpinner ? (
                    <LoaderIcon className={styles['loading-icon']} />
                ) : productSearchResult && productSearchResult.length > 0 ? (
                    <ProductCard
                        product={productSearchResult}
                        setProductSearchResult={setProductSearchResult}
                        search={search}
                        processChunk={processChunk}
                        fetchTime={fetchTimeProducts}
                        originalProducts={originalProducts}
                        productSearchComplete = {productSearchComplete}
                    />
                ) : (
                    isAuthenticated === null ? <></> :
                    (
                        isAuthenticated === 'true' ?
                        <div style={{ margin: '1em' }}>Enter a valid Product ID to Search.</div> :
                        <div style={{ margin: '1em' }}>Login to begin searching!</div> 
                    )
                );
                headerContent = productToolSearchID ? `Results for "${productToolSearchID}"` : 'Overview';
                break;

            ///////// Product to parts page /////////
            case FeatureTabs.ProductToParts:

                // Main page content
                mainContent = loadingSpinner ? (
                    <LoaderIcon className={styles['loading-icon']} />
                ) : productToPartsResults.length ? (
                    <ComponentTable
                        results={productToPartsResults}
                        setLoadingSpinner={setLoadingSpinner}
                        searchState={searchState}
                        setSearchState={setSearchState}
                        setFetchTimeToParts={setFetchTimeToParts}
                        setProductToPartsResults={setProductToPartsResults}
                        updateCSV={handlePartCSVUpdate}
                        processChunk={processChunk}
                        fetchTime={fetchTimeToParts}
                        productSearchComplete = {productSearchComplete}
                        productToPartsExecuted={productToPartsExecuted}
                        setProductToPartsExecuted={setProductToPartsExecuted}
                        productToPartsComplete = {productToPartsComplete}
                        setProductToPartsComplete = {setProductToPartsComplete}
                        search={search}
                    />
                ) : (
                    isAuthenticated === null ? <></> :
                    (
                        isAuthenticated === 'true' ?
                        <div style={{ margin: '1em' }}>Enter a valid Product ID to Search.</div> :
                        <div style={{ margin: '1em' }}>Login to begin searching!</div> 
                    )
                );

                // Header at top of page -> display searched product and CSV button
                header = productSearchID ? `Results for "${productSearchID}"` : 'Search Results';
                headerContent = csvPartData.length > 0 && csvPartHeaders.length > 0 ? (
                    <>
                        <h1 className={styles.header}>{header}</h1>
                        {/* CSV button when results are complete */}
                        {productToPartsComplete && <CSVButton
                            data={csvPartData}
                            headers={csvPartHeaders}
                            fileName={productSearchID || 'results'} />}
                    </>
                ) : header;
                break;

            ///////// Part to products page /////////
            case FeatureTabs.PartToProducts:

                // Main page content
                mainContent = loadingSpinner ? (
                    <LoaderIcon className={styles['loading-icon']} />
                ) : partToProductsResults && partToProductsResults.length > 0 ? (
                    <ProductTable
                        results={partToProductsResults}
                        updateCSV={handleProductCSVUpdate}
                        fetchTime={fetchTimeToProducts.current}
                    />
                ) : (
                    isAuthenticated === null ? <></> :
                    (
                        isAuthenticated === 'true' ?
                        <div style={{ margin: '1em' }}>Enter a valid Part ID to Search.</div> :
                        <div style={{ margin: '1em' }}>Login to begin searching!</div> 
                    )
                );

                // Header at top of page -> display searched part and CSV button
                header = componentSearchID ? `Results for "${componentSearchID}"` : 'Search Results';
                headerContent = csvProductData.length > 0 && csvProductHeaders.length > 0 ? (
                    <>
                        <h1 className={styles.header}>{header}</h1>
                        {/* CSV button when results are complete */}
                        {partToProductComplete && <CSVButton
                            data={csvProductData}
                            headers={csvProductHeaders}
                            fileName={componentSearchID || 'results'}
                        />}

                    </>
                ) : header;
                break;

            ///////// Product Flowchart page /////////
            case FeatureTabs.ProductFlowchart:

                // Header at top of page
                headerContent = 'Product Flowchart'

                // Main page content
                mainContent = loadingSpinner ? (
                    <LoaderIcon className={styles['loading-icon']} />
                ) : productFlowchartResults && productFlowchartResults.length > 0 && productFlowchartResultsComplete ? (
                    <ProductFlowchart results={productFlowchartResults} productId={productFlowchartSearchID} />) : (
                        isAuthenticated === null ? <></> :
                        (
                            isAuthenticated === 'true' ?
                            <div style={{ margin: '1em' }}>Enter a valid Product ID to Search.</div> :
                            <div style={{ margin: '1em' }}>Login to begin searching!</div> 
                        )
                )
                break;

            default:
                headerContent = 'Select A Tab';
                mainContent = <div>Please select a tab to begin your search.</div>;
                break;
        }

        ///////// Format content for page /////////
        return (
            <>
                <div className={styles.headerContainer}>
                    {headerContent}
                </div>
                <div className={`${styles['search-results-holder']} ${collapsed ? styles['expanded-table'] : ''}`}>
                    {mainContent}
                </div>
            </>
        );
    };

    ///////// Return content /////////
    return (
        <div className={`${styles['dashboard-container']} ${collapsed && styles['expanded-dashboard']}`}>
            <SideBar
                setCollapsed={toggleTableView}
                collapsed={collapsed}
            />
            <div className={styles['test-container']}>
                <SearchBar
                    search={search}
                    searchState={searchState}
                    featureTab={currentTab}
                    isAuthenticated={isAuthenticated}
                    collapsed={collapsed} />
                {renderContent()}
            </div>
        </div>
    );
}