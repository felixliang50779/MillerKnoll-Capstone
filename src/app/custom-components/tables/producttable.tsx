import { useEffect, useState, useMemo, useCallback } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { Input } from '@/components/ui/input';
import styles from './table.module.css';


function ProductTable({ results, updateCSV, fetchTime }: any) {
    const headers = results.length > 0 ? Object.keys(results[0]) : [];

    const [searchQuery, setSearchQuery] = useState("");

    // Manages state for sorting header and direction
    const [sortConfig, setSortConfig] = useState<any>({ key: null, direction: 'ascending' });

    const filteredResults = useMemo(() => {
        const uppercaseQuery = searchQuery.toUpperCase();

        return results.filter((item: any) =>
            Object.values(item).some(value =>
                value?.toString().toUpperCase().includes(uppercaseQuery)
            )
        );
    }, [results, searchQuery]);

    // useMemo to reduce re renders everytime user sorts the table
    const sortedResults = useMemo(() => {
        if (sortConfig.key) {
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
        }
        return filteredResults;
    }, [filteredResults, sortConfig]);

    const onProductTableSort = useCallback((key : string) => {
        let direction = 'ascending';
        // If ascending sorting has already occurred and direction is ascending
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        // Updates sorting direction
        setSortConfig({ key, direction });
    }, [sortConfig]);


    useEffect(() => {
        if (results.length > 0) {
            updateCSV(results, headers);
        }
    }, [results, updateCSV]);

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableSeperatorText}>
                <Input 
                    className={styles.searchbar} 
                    placeholder='Search Any Field' 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {filteredResults.length} Results {searchQuery.length === 0 ? `- Fetched in ${fetchTime} seconds` : ""}
            </div>
            <TableVirtuoso
                data={sortedResults} 
                className={styles.tableMain}
                style={{height: 490}}
                fixedHeaderContent={() => (
                    <tr>
                        {headers.map(header => (
                            <th
                                key={header}
                                onClick={() => onProductTableSort(header)}
                                style={{ width: 290 }}
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
                        {headers.map(header => (
                            <td key={header}>
                                {product[header]}
                            </td>
                        ))}
                    </>
                )}
            />
        </div>
    );
}

export default ProductTable;
