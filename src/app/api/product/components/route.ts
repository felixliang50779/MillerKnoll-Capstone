import { NextResponse, NextRequest } from "next/server";
import snowflake from 'snowflake-sdk'
import db from '@/lib/db';
import { componentSearch } from './functions';

export async function POST(request: NextRequest) {
  await db.prepare();
  const requestJson = await request.json();
  console.log(requestJson['ID'] != undefined);
  if(requestJson['ID'] == undefined || requestJson['ID'] == "") {
    return NextResponse.json({ message: "Please enter a product number!" }, { status: 400 });
  } 

  

      let PROJECT;
      let query: any;

      const ID = requestJson['ID'];

      if (request.nextUrl.searchParams.has('FLOWCHART') == true && request.nextUrl.searchParams.get('FLOWCHART') === 'true') {
        
        query =
        `
        SELECT DISTINCT cb.CHILD ID, cb.CFG_DESC as PARENT, cb.COMPANY,
        si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
        si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME,
        si.INVENTORY_ON_HAND, si.INVENTORY_ON_HAND_VALUE, si.MIN_ORDER_QUANTITY,
        si.SIGNAL_CODE, (select count(*) from erp.custom_bom where child = cb.CHILD) as products FROM erp.CUSTOM_BOM as cb
        JOIN erp.STANDARD_ITEM as si ON si.ITEM = ID
        LEFT join TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
        on sm.supplier_number = si.supplier
        WHERE cb.CFG_DESC IN ${ID}
        `;
      }
      else {
    console.log("bruh");
        PROJECT = requestJson['PROJECT'];

        query =
        `
        SELECT DISTINCT cb.CHILD ID, cb.CFG_DESC as PARENT, cb.COMPANY,
        si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
        si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME,
        si.INVENTORY_ON_HAND, si.INVENTORY_ON_HAND_VALUE, si.MIN_ORDER_QUANTITY,
        si.SIGNAL_CODE, (select count(*) from erp.custom_bom where child = cb.CHILD) as products FROM erp.CUSTOM_BOM as cb
        JOIN erp.STANDARD_ITEM as si ON si.ITEM = ID
        LEFT join TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
        on sm.supplier_number = si.supplier
        WHERE cb.CFG_DESC IN ${ID} AND cb.PROJECT IN ${PROJECT}
        `;
      }

  const stream = new ReadableStream({
    start(controller) {
      

      // repeating project and cfg still valid because multiple bill items under that item
      // order by project on long string screen
      
      db.query({
        sqlText: query,
        streamResult: true,
        complete: function (err: any, stmt: any) {
          if(err != undefined) {
            console.log(err);
            return;
          }
          const stream = stmt.streamRows();
          let fetchedComponents: any = [];
          let uniqueComponents: any = {};

          stream.on('readable', function (this: any, row: any) {
            while ((row = this.read()) !== null) {
              if (!(0 in uniqueComponents)) {
                uniqueComponents[0] = {};
              }

              if ('ID' in row) {

                if (!(row.ID in uniqueComponents[0])) {
                  uniqueComponents[0][row.ID] = row;
                  fetchedComponents.push(row);

                  const chunkToStream: any = {}
                  chunkToStream[0] = row;

                  let rowStr = JSON.stringify(chunkToStream);
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
            if (!fetchedComponents.length) {
              controller.close();
              return;
            }

            let conditionalString = "";
            const ids = fetchedComponents.map((item: any) => {
              return item.ID;
            })
            for (const id of Array.from(new Set(ids))) {
              if (!conditionalString.length) {
                conditionalString += `('${id}'`;
              }
              else {
                conditionalString += `, '${id}'`;
              }
            }

            conditionalString += ')';
            componentSearch(controller, conditionalString, uniqueComponents);
          })
        }
      });

    },
  });

  return new NextResponse(stream, { headers: { "Content-Type": "application/json" } });

}
