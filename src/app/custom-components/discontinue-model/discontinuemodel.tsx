// Utility-related modules
import { useState, useEffect } from 'react';
import CSVButton from "../tables/csvbutton";

// UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// State management for tabs and search
import useSearchStore from '../globalstore/searchstore';
import { FeatureTabs, useFeatureTabStore } from '../globalstore/tabstore';

// Styling
import styles from './discontinuemodel.module.css';


export default function DiscontinueModel({ search, id, project, processChunk }: any) {
    const searchText = useSearchStore((state) => state.getSearchText(1));
    // Sets searchText using search store
    const setSearchText = useSearchStore((state) => state.setSearchText);
    // State type should be changed
    const setFeatureTab = useFeatureTabStore((state) => state.setTab);
    // Tracks search for discontinue components
    const [searchQuery, setSearchQuery] = useState("");
    // Manages dialog open
    const [dialogOpen, setDialogOpen] = useState(false);

    const [csvData, setCsvData] = useState<any>([]);
    const csvHeaders = [
        { label: "ItemID", key: "ID" },
        { label: "Description", key: "DESCRIPTION" },
        { label: "Item Type", key: "ITEM_TYPE" },
        { label: "Selection Code", key: "SELECTION_CODE" },
        { label: "Discontinuable?", key: "DISCONTINUABLE" },
    ];

    const [streamDone, setStreamDone] = useState(false);

    const [data, setData] = useState<any[]>([]);

    // Get all the components that go into this product
    const getAffectedComponents = () => {
        fetch(`/api/product/components/`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ 'ID': `('${id}')`, 'PROJECT': `('${project}')` })
        })
            .then(async response => {
                setData([]);
                setStreamDone(false);
                
                if (response.status === 200) {
                    const partStream = response.body!.getReader();

                    let incompletePart = '';

                    // Updating product -> parts results with the streamed chunks
                    while (true) {
                        const { done, value } = await partStream.read();
                        console.log(done)
                        if (done) {
                            setStreamDone(true);
                            break;
                        }

                        const { processedItems, incompleteItem } = processChunk(
                            value, incompletePart, '{{', '}}');

                        incompletePart = incompleteItem;


                        setData(prevState => {
                            return [...prevState, ...processedItems];
                        });
                    }
                }
            }).catch(e => console.log(e));
    }

    // Filter data for when exporting to CSV
    useEffect(() => {
        const filteredDataForCSV = data.filter(item => item.PRODUCTS != 0)
            .map(item => ({
                ID: item.ID,
                DESCRIPTION: item.DESCRIPTION,
                ITEM_TYPE: item.ITEM_TYPE,
                SELECTION_CODE: item.SELECTION_CODE,
                DISCONTINUABLE: (item.PRODUCTS == 1 && item.ITEM_TYPE == "Purchased" && item.SELECTION_CODE != "EXP" ? "Yes" : "No"),
            }));
        setCsvData(filteredDataForCSV);
    }, [data]);

    // Switches tab to part to products and closes dialog
    const switchPartToProduct = (itemID: string) => {
        setFeatureTab(FeatureTabs.PartToProducts);
        setSearchText(itemID, FeatureTabs.PartToProducts);
        search({ content: itemID, currentTab: FeatureTabs.PartToProducts });
        setDialogOpen(false);
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className={styles['datamodel-discontinue-button']} onClick={getAffectedComponents}>View Discontinuable Parts</Button>
            </DialogTrigger>
            <DialogContent className={styles['datamodel-content']}>
                <DialogHeader className={styles['datamodel-header']}>

                    {/* Searchbar to search for an item in the discontinue table */}
                    <Input placeholder='Search for Any Field' onChange={(e) => setSearchQuery(e.target.value)} />
                    
                    <DialogTitle className={styles['datamodel-title']}>Listed Components</DialogTitle>
                    {/* Export to CSV button when results are done streaming in */}
                    {csvData.length > 0 && streamDone && <CSVButton
                        data={csvData}
                        headers={csvHeaders}
                        fileName={id || 'results'} />}
                </DialogHeader>

                <section>
                    <Table>
                        {/* Table columns */}
                        <TableHeader>
                            <TableRow>
                                <TableHead>ItemID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Item Type</TableHead>
                                <TableHead>Selection Code</TableHead>
                            </TableRow>
                        </TableHeader>

                        {/* Part data */}
                        <TableBody>
                            {/* When filtering by search */}
                            {data.filter(item => item.PRODUCTS != 0 && (
                                item.PARENT.includes(searchQuery.toUpperCase()) || 
                                item.DESCRIPTION.includes(searchQuery.toUpperCase()) || 
                                item.ITEM_TYPE.toUpperCase().includes(searchQuery.toUpperCase()) || 
                                item.SELECTION_CODE?.includes(searchQuery.toUpperCase())
                        )).map(item => (

                                // Highlight green when item is only used in one product
                                // Exclude purchased or expense items
                                // Clicking on any item brings you to the Part to Products tab and searches for that item ID
                                <TableRow className={
                                    item.PRODUCTS == 1 &&
                                        item.ITEM_TYPE == "Purchased" &&
                                        item.SELECTION_CODE != "EXP"
                                        ? styles['lime-background'] : ''
                                } key={item.itemID}>

                                    <TableCell>
                                        <h1 className={styles['datamodel-itemid']} onClick={() => switchPartToProduct(item.ID)}>
                                            {item.ID}
                                        </h1>
                                    </TableCell>

                                    <TableCell>
                                        <h1 className={styles['datamodel-itemid']} onClick={() => switchPartToProduct(item.ID)}>
                                            {item.DESCRIPTION}
                                        </h1>
                                    </TableCell>

                                    <TableCell>
                                        <h1 className={styles['datamodel-itemid']} onClick={() => switchPartToProduct(item.ID)}>
                                            {item.ITEM_TYPE}
                                        </h1>
                                    </TableCell>

                                    <TableCell>
                                        <h1 className={styles['datamodel-itemid']} onClick={() => switchPartToProduct(item.ID)}>
                                            {item.SELECTION_CODE}
                                        </h1>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </DialogContent>
        </Dialog>
    )
}
