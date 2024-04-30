import { NextResponse, NextRequest } from "next/server";
import puppeteer, { Browser, Page } from 'puppeteer';

async function getPhotoURL(name: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const browser: Browser = await puppeteer.launch();
      const page: Page = await browser.newPage();
      // Navigate the page to a URL
      await page.goto(`https://www.hermanmiller.com/resources/images/?q=${encodeURIComponent(name)}&ft=White%20Sweep`);
      
      const searchResultSelector = '.search-results-item';
      await page.waitForSelector(searchResultSelector, {timeout: 3000});
      
      await page.waitForSelector(
        'div.image-tile-container > picture-component > picture > source'
      );
      const url = await page.$eval('div.image-tile-container > picture-component > picture > source', (n) => n.getAttribute('srcset'));
      resolve("https://hermanmiller.com" + url);
      await browser.close();
    } catch {
      return reject();
    } 
  }); 
}

export async function GET(request: NextRequest) {
  if(request.nextUrl.searchParams.has("name") == false || request.nextUrl.searchParams.get("name") == "") {
    return NextResponse.json({ message: "Please enter a product name!" }, { status: 400 });
  } 

  const name = request.nextUrl.searchParams.get("name");
  try {
    const url = await getPhotoURL(name!)
    return NextResponse.json(url, {status: 200});
  } catch {
    return NextResponse.json("", {status: 500});
  }
}