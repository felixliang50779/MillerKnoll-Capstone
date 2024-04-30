import { useState, useMemo, useEffect, useCallback } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { Input } from '@/components/ui/input';

import styles from './table.module.css';

interface Product {
    CFG_DESC: string;
    COMPANY: string;
    DESCRIPTION: string;
    ITEM: string;
    ITEM_GROUP: string;
    ITEM_TYPE: string;
    ORDER_DATE: null;
    PRODUCT_LINE: string;
    PROJECT: string;
    WAREHOUSE: string;
}

function PartialSearchTable({ results, fetchTime, setResults, setPartialSearch, productSearchComplete }: any) {
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'ascending' });
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredResults, setFilteredResults] = useState(results);

    const multiItemHeaders = useMemo(() => results.length > 0 ? Object.keys(results[0]) : [], [results]);

    const referenceCardTransition = useCallback((product : Product) => {
        setPartialSearch(false);
        // Set it back to array to all of the products
        setResults([product]);
    }, [setPartialSearch, setResults]);

    const onPartialTableSort = useCallback((key : string) => {
        let direction = 'ascending';

        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
    
        setSortConfig({ key, direction });
    }, [sortConfig]);

    useEffect(() => {
        const newFilteredResults = results.filter((item: any) =>
            Object.values(item).some(value =>
                value?.toString().toUpperCase().includes(searchQuery.toUpperCase())
            )
        );
        setFilteredResults(newFilteredResults);
    }, [results, searchQuery]);

    // useMemo to reduce re renders everytime user sorts the table
    const sortedResults = useMemo(() => {
        return [...filteredResults].sort((aItemInfo, bItemInfo) => {
            if (sortConfig.key && aItemInfo[sortConfig.key] && bItemInfo[sortConfig.key]) {

                // Makes current item info in key column to lowercase
                const valueA = aItemInfo[sortConfig.key].toLowerCase();
                const valueB = bItemInfo[sortConfig.key].toLowerCase();

                // If less than, aItemInfo displays before bItemInfo for sort
                if (valueA < valueB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                // If more than, bItemInfo displays before aItemInfo for sort
                if (valueA > valueB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }

                return 0;
            }
            return 0;
        });
    }, [filteredResults, sortConfig]);

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableSeperatorText}>
                <Input
                    className={styles.searchbar}
                    placeholder='Search Any Field'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {!productSearchComplete && <span className={styles.streamingBlink}></span>}
                {filteredResults.length} Results {searchQuery.length === 0 && `- Fetched in ${fetchTime} seconds`}
            </div>
            <TableVirtuoso
                data={sortedResults}
                className={styles.tableMain}
                style={{ width: 500, height: 490 }}
                fixedHeaderContent={() => (
                    <tr>
                        {multiItemHeaders.map(header => (
                            <th
                                key={header}
                                onClick={() => onPartialTableSort(header)}
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
                        {/* header is CFG_desc */}
                        {multiItemHeaders.map(header => (
                            <td
                                key={header}
                                onClick={() => productSearchComplete && referenceCardTransition(product)}
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

export default PartialSearchTable;
