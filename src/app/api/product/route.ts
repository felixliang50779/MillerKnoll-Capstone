import { NextResponse, NextRequest } from "next/server";
import snowflake from 'snowflake-sdk'
import db from '@/lib/db';


export async function GET(request: NextRequest) {
  await db.prepare();
  if(request.nextUrl.searchParams.has("ID") == false || request.nextUrl.searchParams.get("ID") == "") {
    return NextResponse.json({ message: "Please enter a product number!" }, { status: 400 });
  } 

  const ID = request.nextUrl.searchParams.get("ID");

  const queryText =
  `
  SELECT DISTINCT cb.COMPANY, cb.ITEM, cb.CFG_DESC, MAX(cb.project) as project,
  ci.DESCRIPTION, ci.ITEM_GROUP, MAX(so."Order_Date") as ORDER_DATE,
  ci.ITEM_TYPE, ci.WAREHOUSE, ci.PRODUCT_LINE FROM erp.CUSTOM_BOM as cb
  JOIN erp.CUSTOM_ITEM as ci ON ci.ITEM = cb.ITEM
  LEFT JOIN tableau_output."Sales_Order_Dates" as so on cb.project = so."Project"
  WHERE cb.CFG_DESC LIKE CONCAT(?, '%')
  GROUP BY cb.company, cb.item, cb.cfg_desc, ci.description, ci.item_group, ci.ITEM_TYPE, ci.WAREHOUSE, ci.PRODUCT_LINE
  `;

  const stream = new ReadableStream({
    start(controller) {
      
      db.query({
        sqlText: queryText,
        streamResult: true,
        binds: [`${ID}`],
        complete: function (err: any | undefined, stmt: snowflake.Statement) {
          if(err != undefined) {
            console.log(err);
          }
        
            const stream = stmt.streamRows();
            const uniqueProductDict: any = {};

            stream.on('readable', function (this: any, row: any) {
              while ((row = this.read()) !== null)
              {
                  if (!(`${row['PROJECT']}${row['CFG_DESC']}${row['ITEM']}` in uniqueProductDict)) {
                    uniqueProductDict[`${row['PROJECT']}${row['CFG_DESC']}${row['ITEM']}`] = 1;
                    let rowStr = JSON.stringify(row);
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
            }).on('end', function () {
              // 200
              controller.close();
              return;
            }).on('error', function (err: any) {
              console.log("Failed when attempting to fetch products - " + err);
              // 500
              controller.close();
              return;
            });
        }
      });
      

    },
  });

  return new NextResponse(stream, { headers: { "Content-Type": "application/json" }, status: 200 });
}
