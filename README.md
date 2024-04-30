# Product Lifecycle Tracing System - Frontend
This is the frontend to the MillerKnoll MSU Capstone project.

## Running
1. Run `npm install` while at the root of this project directory to install all dependencies
2. Run `npm run dev` while at the root of this project directory
3. This will start the Next.js project in development mode on port 3000 (unless something is already running on it)
4. Navigate to `http://localhost:3000` on your web browser to view the webpage

## Environment Variables
*This project requires certain environment variables be set for certain functionality.*

The following variables must be set for the project to be fully functional:
- `ENCRYPTED_PRIVATE_KEY`: The private key required to authenticate with MillerKnoll's Snowflake Database
- `PRIVATE_KEY_PASSPHRASE`: The private key passphrase required to authenticate with MillerKnoll's Snowflake Database
- `SNOWFLAKE_USERNAME`: The username associated with the private key and passphrase to authenticate with MillerKnoll's Snowflake Database

## Key Features
- Product Lookup Tool: This is used when you know a full or partial Configuration Description to get more information about a Product
- Product to Parts: This is used when you know a full or partial Configuration Description and you what to know what parts go into a specific Project acosciated with that Configuration Description
- Parts to Products: This is useful when you know the full Part ID and you want information about what product it goes into
- Product Flowchart: This is useful when you know the full Configuration Description of a product and want to visualize not just what parts go into it, but also exactly how all the parts are strcutured

## SQL Queries
### Product Lookup Tool

? is the configuration description

```sql
SELECT DISTINCT cb.COMPANY, cb.ITEM, cb.CFG_DESC, MAX(cb.project) as project,
ci.DESCRIPTION, ci.ITEM_GROUP, MAX(so."Order_Date") as ORDER_DATE,
ci.ITEM_TYPE, ci.WAREHOUSE, ci.PRODUCT_LINE FROM erp.CUSTOM_BOM as cb
JOIN erp.CUSTOM_ITEM as ci ON ci.ITEM = cb.ITEM
LEFT JOIN tableau_output."Sales_Order_Dates" as so on cb.project = so."Project"
WHERE cb.CFG_DESC LIKE CONCAT(?, '%')
GROUP BY cb.company, cb.item, cb.cfg_desc, ci.description, ci.item_group, ci.ITEM_TYPE, ci.WAREHOUSE, ci.PRODUCT_LINE
```

### Product to Parts
These queries have 2 parts:
- Start Query
- Recursive Query

The recursive query ends when it returns 0 results.

Start Queries:
**Flowchart***
```sql
SELECT DISTINCT cb.CHILD ID, cb.CFG_DESC as PARENT, cb.COMPANY,
si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME,
si.INVENTORY_ON_HAND, si.INVENTORY_ON_HAND_VALUE, si.MIN_ORDER_QUANTITY,
si.SIGNAL_CODE, (select count(*) from erp.custom_bom where child = cb.CHILD) as products FROM erp.CUSTOM_BOM as cb
JOIN erp.STANDARD_ITEM as si ON si.ITEM = ID
LEFT join TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
on sm.supplier_number = si.supplier
WHERE cb.CFG_DESC IN ${ID}
```

**List**
```sql
SELECT DISTINCT cb.CHILD ID, cb.CFG_DESC as PARENT, cb.COMPANY,
si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME,
si.INVENTORY_ON_HAND, si.INVENTORY_ON_HAND_VALUE, si.MIN_ORDER_QUANTITY,
si.SIGNAL_CODE, (select count(*) from erp.custom_bom where child = cb.CHILD) as products FROM erp.CUSTOM_BOM as cb
JOIN erp.STANDARD_ITEM as si ON si.ITEM = ID
LEFT join TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
on sm.supplier_number = si.supplier
WHERE cb.CFG_DESC IN ${ID} AND cb.PROJECT IN ${PROJECT}
```

Recursive Query:
```sql
SELECT DISTINCT sb.CHILD ID, sb.ITEM as PARENT, sb.COMPANY,
si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME, 
si.INVENTORY_ON_HAND, si.INVENTORY_ON_HAND_VALUE, si.MIN_ORDER_QUANTITY, 
si.SIGNAL_CODE, (select count(*) from erp.custom_bom where child = sb.CHILD) as products FROM erp.STANDARD_BOM as sb
JOIN erp.STANDARD_ITEM as si ON si.ITEM = ID
LEFT JOIN TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
on sm.supplier_number = si.supplier
WHERE sb.ITEM IN ${conditionalString}
```

### Part to Product
```sql
select distinct cfg_desc, company, item, qty from erp.custom_bom where child = '${ID}
```
