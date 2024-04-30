

export const steps: any = [

    {
        selector: '.searchbar_search-bar__34hBm', // This selector targets the search bar
        content: 'This is the search bar. You can use it to find information about a product or a part.',
    },

    {
        selector: '.dashboard_search-results-holder__qkMtD', //  targets the Overview
        content: 'Your search results will open here.',
        position: 'center'

    },

    {
       selector: '.sidebar_sidebar-link__8Yxb_:nth-child(1)', //  targets the first tab
       content: 'This is the Product Lookup Tool. It allows you to search for products.',
    },
    {
       selector: '.sidebar_sidebar-link__8Yxb_:nth-child(2)', //  targets the second tab
       content: 'This is the Product to Parts feature. It shows you the parts that make up a product.',
    },
    {
       selector: '.sidebar_sidebar-link__8Yxb_:nth-child(3)', //  targets the third tab
       content: 'This is the Part to Products feature. It shows you the products that a part is part of.',
    },

    {
        selector: '.sidebar_sidebar-link__8Yxb_:nth-child(4)', //  targets the flowchart
        content: 
            "This is the Product Flowchart feature. It provides an alternative way to visualize a product and its parts."
     },

    // {
    //     selector: '.dashboard_csvButton__quTmu', //  targets the export to CSV button
    //     content: 
    //     '[Note: Please search an item in Product to Parts tab or Part to Products tab to view this option]\
    //         This is the export to CSV button. Click it to export the current search results.',
    //     waitForSelector: true, 
    //     position: 'center' 
    //  },

   ];
