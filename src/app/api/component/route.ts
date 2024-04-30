import { NextResponse, NextRequest } from "next/server";
import snowflake from 'snowflake-sdk'
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  await db.prepare();
  if(!request.nextUrl.searchParams.has('ID') || request.nextUrl.searchParams.get('ID') == "") {
    return NextResponse.json({ message: "Please enter a product number!" }, { status: 400 });
  }

  const ID = request.nextUrl.searchParams.get('ID');

  const stream = new ReadableStream({
    start(controller) {
      
      db.query({
        sqlText:
        `
        select distinct item, si.DESCRIPTION, si.ITEM_TYPE, si.ITEM_GROUP, si.SUPPLIER, sm.supplier_name,
        si.SELECTION_CODE, si.SAFETY_STOCK, si.SAFETY_TIME, si.ORDER_LEAD_TIME, si.MIN_ORDER_QUANTITY,
        si.SIGNAL_CODE FROM ERP.STANDARD_ITEM as si 
        LEFT join TABLEAU_OUTPUT."SM_Master_to_Suno" as sm 
        where sm.supplier_number = si.supplier and item = ?
        `,
        binds: [`${ID}`],
        complete: function(err: any, stmt: any, rows: any) {
          if (err) {
            console.error('Failed to execute statement due to the following error: ' + err.message);
          } else {
            const textEnc = new TextEncoder();
            if(rows.length == 0) {
              controller.enqueue(textEnc.encode("{}"));
              controller.close();
              return;
            }
            controller.enqueue(textEnc.encode(JSON.stringify(rows[0])));
            controller.close();
            return;
          }
        }
      });
      

    },
  });

  return new NextResponse(stream, { headers: { "Content-Type": "application/json" } });
}
