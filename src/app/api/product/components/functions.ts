import db from "@/lib/db";

export function componentSearch(controller: ReadableStreamDefaultController<any>, conditionalString: any, uniqueComponents: any, i = 1) {
  db.query({
    sqlText:
    `
    SELECT DISTINCT sb.CHILD ID, sb.ITEM as PARENT, sb.COMPANY,
    si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
    si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME, 
    si.INVENTORY_ON_HAND, si.INVENTORY_ON_HAND_VALUE, si.MIN_ORDER_QUANTITY, 
    si.SIGNAL_CODE, (select count(*) from erp.custom_bom where child = sb.CHILD) as products FROM erp.STANDARD_BOM as sb
    JOIN erp.STANDARD_ITEM as si ON si.ITEM = ID
    LEFT JOIN TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
    on sm.supplier_number = si.supplier
    WHERE sb.ITEM IN ${conditionalString}
    `,
    streamResult: true,
    complete: function (err: any, stmt: any) {
      if(err != undefined) {
        console.log(err);
      }
      const stream = stmt.streamRows();
      let fetchedComponents: any[] = [];

      stream.on('readable', function (this:any, row: any) {
        while ((row = this.read()) !== null) {
          if (!(i in uniqueComponents)) {
            uniqueComponents[i] = {};
          }

          if (Object.keys(row).length) {

            if (!(row.ID in uniqueComponents[i])) {
              uniqueComponents[i][row.ID] = row;
              fetchedComponents.push(row);

              const chunkToStream: any = {}
              chunkToStream[i] = row;

              let rowStr = JSON.stringify(chunkToStream);
              rowStr = rowStr.replace("\n", '');
              rowStr = rowStr.replace("\n", '');
              const textEnc = new TextEncoder();
              try {
                controller.enqueue(textEnc.encode(rowStr));
                controller.enqueue(textEnc.encode("\n"));
              } catch (e) {
                //console.log(typeof e);
              }
            }
          }
        }
      }).on('end', function () {
        if (fetchedComponents.length) {

          let condString = "";
          const ids = fetchedComponents.map((item) => {
            return item.ID;
          })
          for (const id of Array.from(new Set(ids))) {
            if (!condString.length) {
              condString += `('${id}'`;
            }
            else {
              condString += `, '${id}'`;
            }
          }

          condString += ')';

          componentSearch(controller, condString, uniqueComponents, i + 1);
        }
        else {
            controller.close();
            return;
        }
      }).on('error', function (err: any) {
        console.log("Failed when attempting to fetch parts of product - " + err);
        controller.close();
        return;
      });
    }
  });
}
