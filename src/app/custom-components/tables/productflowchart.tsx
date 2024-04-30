import React, { useState } from 'react';
import ReactFlow, { MiniMap, Controls } from 'react-flow-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function ProductFlowchart({ results, productId }: any) {

    const plantCodes = { // for mapping COMPANY -> Manufacturing Location
        101: "Greenhouse Seating Operations",
        103: "Panels",
        104: "Hickory",
        105: "HPL (Wood plant)",
        106: "Geiger Hildebran, North Carolina",
        107: "Meridian/171st",
        108: "Geiger Fulton",
        109: "Nemschoff",
        110: "Purchase Finished Goods",
        112: "International Third Party Logistics"
    };

    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    function buildTree(jsonData: any) {
        const tree: any = {};

        jsonData.forEach((node: any) => {
            if (!tree[node.ID]) {
                tree[node.ID] = { ...node, children: [] };
            }

            if (node.PARENT) {
                if (!tree[node.PARENT]) {
                    tree[node.PARENT] = { children: [node.ID] };
                } else {
                    tree[node.PARENT].children.push(node.ID);
                }
            }
        });

        return tree;
    }

    function generateFlow(tree: any) {
        const containerWidth = window.innerWidth;
        const nodes = [{ id: productId, data: { label: `ProductID: ${productId}` }, position: { x: containerWidth / 2, y: 0 } }];
        const edges: any[] = [];
        const horizontalSpacing = 200;
        const verticalSpacing = 200;

        let xPos = (window.innerWidth / 2) - (results.length * horizontalSpacing / 2) + (horizontalSpacing / 2);
        const layoutChildren = (parentId: any, childrenIds: any, startY: any, depth: any) => {

            childrenIds.forEach((childId: any) => {
                const yPos = startY + verticalSpacing;
                const childNode = tree[childId];
                
                nodes.push({
                    id: childId,
                    data: { label: `ID: ${childId}, DESCRIPTION: ${childNode.DESCRIPTION}` },
                    position: { x: xPos, y: yPos }
                });

                edges.push({
                    id: `e${parentId}-${childId}`,
                    source: parentId,
                    target: childId,
                    type: 'straight',
                });

                xPos += horizontalSpacing;

                const child = tree[childId];
                if (child && child.children && child.children.length > 0) {
                    layoutChildren(childId, child.children, yPos, depth + 1);
                }
            });
        };

        const rootChildren = tree[productId].children;
        if (rootChildren && rootChildren.length > 0) {
            layoutChildren(productId, rootChildren, 50, 0);
        }

        return { nodes, edges };
    }

    const tree = buildTree(results);
    const { nodes, edges }: any = results.length > 0 ? generateFlow(tree) : [];

    const handleNodeClick = (event: any, node: any) => {
        const nodeData = tree[node.id];
        if (nodeData && node.id !== productId) {
            setSelectedNode(nodeData);
            setDialogOpen(true);
        }
    };

    return (
        <div style={{ height: '800px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
            >
                <MiniMap />
                <Controls />
            </ReactFlow>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Node {selectedNode ? selectedNode.ID! : ' Details'}</DialogTitle>
                    </DialogHeader>
                    <section>
                        {selectedNode && Object.keys(selectedNode).map((key) => {
                            const value = selectedNode[key];
                            if (key === 'children' || key === 'PRODUCTS' || value === null) return null;
                            return (
                                <div key={key}>
                                    <strong>{key}:</strong> {selectedNode[key]}
                                </div>
                            );
                        })}
                    </section>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ProductFlowchart;
