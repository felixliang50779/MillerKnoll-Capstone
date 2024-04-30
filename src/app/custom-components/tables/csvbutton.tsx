import React from 'react';
import { CSVLink } from 'react-csv';
import styles from '../../dashboard.module.css';


function CSVButton({ data, headers, fileName }: any) {
    return (
        <CSVLink
            className={styles.csvButton}
            data={data}
            headers={headers}
            filename={`${fileName}.csv`}
        >
            Export to CSV
        </CSVLink>
    );
}

export default CSVButton;
