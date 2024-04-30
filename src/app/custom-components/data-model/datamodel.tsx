import { useState } from 'react';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import useSearchStore from '../globalstore/searchstore';
import { FeatureTabs, useFeatureTabStore } from '../globalstore/tabstore';

import styles from './datamodel.module.css';


type ComponentData = {
    itemID: string;
    description: string;
    products: string;
    selection_code: string;
}

export default function DataModel({ search, id, project, processChunk }: any) {
    const searchText = useSearchStore((state) => state.getSearchText(1));
    const setSearchText = useSearchStore((state) => state.setSearchText);
    // State type should be changed
    const setFeatureTab = useFeatureTabStore((state) => state.setTab);
    // Tracks search for discontinue components
    const [searchQuery, setSearchQuery] = useState("");
    // Manages dialog open
    const [dialogOpen, setDialogOpen] = useState(false);


    const [data, setData] = useState<any[]>([]);



    const getAffectedComponents = () => {
        fetch(`/api/product/components/`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ 'ID': `('${id}')`, 'PROJECT': `('${project}')` })
        })
            .then(async response => {
                console.log(response)
                if (response.status === 200) {
                    const partStream = response.body!.getReader();

                    let incompletePart = '';

                    // Updating product -> parts results with the streamed chunks
                    while (true) {
                        const { done, value } = await partStream.read();
                        console.log(done)
                        if (done) {
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
                    <Input placeholder='Search for ItemID or Description' onChange={(e) => setSearchQuery(e.target.value)} />
                    <DialogTitle className={styles['datamodel-title']}>Listed Components</DialogTitle>
                </DialogHeader>
                <section>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ItemID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Item Type</TableHead>
                                <TableHead>Selection Code</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.filter(item => item.PRODUCTS != 0 && (item.PARENT.includes(searchQuery.toUpperCase()) || item.DESCRIPTION.includes(searchQuery.toUpperCase()))).map(item => (

                                // Highlight green when item is only used in one product
                                // Exclused purchased or expense items
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
