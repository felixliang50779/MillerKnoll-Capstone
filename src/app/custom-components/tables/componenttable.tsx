import { useEffect, useState, useMemo, useCallback } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { Input } from '@/components/ui/input';
import styles from './table.module.css';


function ComponentTable({ results, setLoadingSpinner, searchState, setSearchState, setFetchTimeToParts,
    setProductToPartsResults, updateCSV, processChunk, fetchTime, productSearchComplete, productToPartsExecuted, setProductToPartsExecuted, productToPartsComplete, setProductToPartsComplete }: any) {
    // Manages state for sorting header and direction
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredResults, setFilteredResults] = useState(results);

    const onComponentTableSort = useCallback((key: string) => {
        let direction = 'ascending';
        // If ascending sorting has already occurred and direction is ascending
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        // Updates sorting direction
        setSortConfig({ key, direction });
    }, [sortConfig]);

    // useMemo to reduce re renders everytime user sorts the table
    const sortedResults = useMemo(() => {
        return [...filteredResults].sort((aItemInfo, bItemInfo) => {

            // Makes current item info in key column to lowercase
            const valueA = aItemInfo[sortConfig.key]?.toString().toLowerCase() || '';
            const valueB = bItemInfo[sortConfig.key]?.toString().toLowerCase() || '';

            // If less than, aItemInfo displays before bItemInfo for sort
            if (valueA < valueB) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            // If more than, bItemInfo displays before aItemInfo for sort
            if (valueA > valueB) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }

            return 0;
        });
    }, [filteredResults, sortConfig]);


    useEffect(() => {
        const newFilteredResults = results.filter((item: any) =>
            Object.values(item).some(value =>
                value?.toString().toUpperCase().includes(searchQuery.toUpperCase())
            )
        );
        setFilteredResults(newFilteredResults);
    }, [results, searchQuery]);

    // Visible headers for fields in the results
    const visibleHeaders = useMemo(() => {
        const firstResult = results[0] || {};

        // Filter headers based on non-null and non-empty values in the first result
        const filteredHeaders = Object.keys(firstResult).filter(header =>
            results.some((result: any) => {
                const value = result[header];
                return value != null && value !== '';
            })
        );

        return filteredHeaders;
    }, [results]);


    const productToParts = (cfg_str: any, project: any, fetchBegin: any) => {
        fetch(`/api/product/components/`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ 'ID': `('${cfg_str}')`, 'PROJECT': `('${project}')` })
        })
            .then(async response => {

                if (response.status === 200) {
                    setLoadingSpinner(false);
                    const partStream = response.body!.getReader();

                    let incompletePart = '';

                    // Updating product -> parts results with the streamed chunks
                    while (true) {
                        const { done, value } = await partStream.read();


                        if (done) {
                            // Sets the executed + completed fetch to true when query is complete
                            setProductToPartsExecuted(true);
                            setProductToPartsComplete(true);
                            setSearchState(false);
                            break;
                        }

                        const { processedItems, incompleteItem } = processChunk(
                            value, incompletePart, '{{', '}}');

                        incompletePart = incompleteItem;

                        setFetchTimeToParts((Date.now() - fetchBegin) / 1000);

                        setProductToPartsResults((prevState: any) => {
                            return [...prevState, ...processedItems];
                        });
                    }
                }
            }).catch(e => console.log(e));
    }

    useEffect(() => {
        if (results.length > 0) {
            const headers = visibleHeaders.map(header => ({
                label: header.charAt(0).toUpperCase() + header.slice(1),
                key: header
            }));
            updateCSV(filteredResults, headers);
        }
    }, [updateCSV, filteredResults, visibleHeaders]);

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableSeperatorText}>
                <Input
                    className={styles.searchbar}
                    placeholder='Search Any Field'
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {(!productSearchComplete || (productToPartsExecuted && !productToPartsComplete)) && <span className={styles.streamingBlink}></span>}
                {filteredResults.length} Results {searchQuery.length === 0 ? `- Fetched in ${fetchTime} seconds` : ""}

            </div>
            <TableVirtuoso
                data={sortedResults}

                className={productToPartsExecuted ? styles.tableMainSecondStep : styles.tableMain}
                style={{ height: 490 }}
                fixedHeaderContent={() => (
                    <tr>
                        {visibleHeaders.map(header => (
                            <th
                                key={header}
                                onClick={() => onComponentTableSort(header)}
                            >
                                {header.charAt(0).toUpperCase() + header.slice(1)}
                                {sortConfig.key === header && (
                                    sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'
                                )}
                            </th>
                        ))}
                    </tr>
                )}
                itemContent={(index, product) => (
                    <>
                        {visibleHeaders.map(header => (
                            <td key={header}
                                onClick={() => {
                                    // If we are on the products page of the product->parts
                                    if ( productSearchComplete && !productToPartsExecuted ) {
                                        // Let spinner start loading
                                        setLoadingSpinner(true);
                                        // Set search state to true
                                        setSearchState(true);
                                        // Set the product -> parts executed to true because the query just started
                                        setProductToPartsExecuted(true);
                                        // Reset the product -> parts complete to false
                                        setProductToPartsComplete(false);
                                        // Empty the results
                                        setProductToPartsResults([]);
                                        // Start the fetch time
                                        const fetchBegin = Date.now();
                                        productToParts(product['CFG_DESC'], product['PROJECT'], fetchBegin);
                                    }
                                }}
                            >
                                {product[header]}
                            </td>
                        ))}
                    </>
                )}
            />
        </div>
    );
}

export default ComponentTable;
