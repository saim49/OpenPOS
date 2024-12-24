// Author: Muhammad Saim
// Method: report detail view 
function reportDetailView(p_invoice_code) {
    if (p_invoice_code) {
        let v_html = "";
        v_html += "<div class='table-responsive'>";
        v_html += "<table class='table table-striped table-bordered'><thead><tr>";
        v_html += "<th>Sr</th>";
        v_html += "<th>Item</th>";
        v_html += "<th>Invoice Code</th>";
        v_html += "<th>Quantity</th>";
        v_html += "<th>Price</th>";
        v_html += "<th>Discount</th>";
        v_html += "<th>Net</th>";
        v_html += "</tr></thead><tbody>";
        
        // Start a transaction on the 'lines' object store
        const transaction = db.transaction(["lines"], "readonly");
        const store = transaction.objectStore("lines");
        const index = store.index("invoice_code");

        // Get all the records for the specific invoice code
        const request = index.getAll(p_invoice_code);
        
        request.onsuccess = (event) => {
            const results = event.target.result;
            let groupedData = {};  // Will hold the final grouped data

            // Group by invoice_code and itemName, then sum the values
            results.forEach((result) => {
                // Initialize group for invoice_code if not already created
                if (!groupedData[result.invoice_code]) {
                    groupedData[result.invoice_code] = {};
                }

                // Initialize group for itemName if not already created
                if (!groupedData[result.invoice_code][result.itemName]) {
                    groupedData[result.invoice_code][result.itemName] = {
                        qty: 0,
                        price: 0,
                        disc: 0,
                        net: 0,
                        count: 0
                    };
                }

                // Sum the values for each group
                groupedData[result.invoice_code][result.itemName].qty += Number(result.qty);
                groupedData[result.invoice_code][result.itemName].price += Number(result.price);
                groupedData[result.invoice_code][result.itemName].disc += Number(result.disc);
                groupedData[result.invoice_code][result.itemName].net += Number(result.net);
                groupedData[result.invoice_code][result.itemName].count += 1;
            });

            // Generate the HTML based on the grouped data
            let v_i = 0;
            let v_total_qty = 0;
            let v_total_price = 0;
            let v_total_disc = 0;
            let v_total_net = 0;

            // Loop through groupedData to generate the table rows
            for (let invoice_code in groupedData) {
                for (let itemName in groupedData[invoice_code]) {
                    const group = groupedData[invoice_code][itemName];
                    v_i += 1;
                    v_total_qty += group.qty;
                    v_total_price += group.price;
                    v_total_disc += group.disc;
                    v_total_net += group.net;

                    v_html += `<tr>`;
                    v_html += `<td>${v_i}</td>`;
                    v_html += `<td>${itemName}</td>`;
                    v_html += `<td>${invoice_code}</td>`;
                    v_html += `<td>${group.qty}</td>`;
                    v_html += `<td class='amount'>${formatNumberWithCommas(group.price)}</td>`;
                    v_html += `<td class='amount'>${formatNumberWithCommas(group.disc)}</td>`;
                    v_html += `<td class='amount'>${formatNumberWithCommas(group.net)}</td>`;
                    v_html += `</tr>`;
                }
            }

            // Add the totals row in the footer
            v_html += "</tbody><tfoot>";
            v_html += `<tr>`;
            v_html += `<td></td>`;
            v_html += `<td></td>`;
            v_html += `<td></td>`;
            v_html += `<td>${v_total_qty}</td>`;
            v_html += `<td class='amount'><mark>${formatNumberWithCommas(v_total_price)}</mark></td>`;
            v_html += `<td class='amount'><mark>${formatNumberWithCommas(v_total_disc)}</mark></td>`;
            v_html += `<td class='amount'><mark>${formatNumberWithCommas(v_total_net)}</mark></td>`;
            v_html += `</tr>`;
            v_html += "</tfoot></table></div>";

            // Show the popup with the generated HTML
            popup_html(`${p_invoice_code} Detail View`, v_html);
        };

        request.onerror = (event) => {
            console.error("Error fetching records:", event.target.error);
        };
    }
}

// Author: Muhammad Saim
// Method: report detail view 
function reportDetailReturnView(p_invoice_code) {
    if (p_invoice_code) {
        let v_html = "";
        v_html += "<div class='table-responsive'>";
        v_html += "<table class='table table-bordered'><thead><tr>";
        v_html += "<th width='5%'>Sr</th>";
        v_html += "<th width='22%'>Item</th>";
        v_html += "<th width='8%'>Qty</th>";
        v_html += "<th width='10%'>Price</th>";
        v_html += "<th width='15%'>Discount</th>";
        v_html += "<th width='13%'>Net</th>";
        v_html += "<th width='15%'>Return Qty</th>";
        v_html += "<th width='12%'>Action</th>";
        v_html += "</tr></thead><tbody>";
        
        const transaction = db.transaction(["lines"], "readonly");
        const store = transaction.objectStore("lines");
        const index = store.index("invoice_code");

        const request = index.getAll(p_invoice_code);
        request.onsuccess = (event) => {
            const results = event.target.result;

            // Sort the results by itemName in ascending order
            results.sort((a, b) => {
                if (a.itemName < b.itemName) return -1;
                if (a.itemName > b.itemName) return 1;
                return 0;
            });

            let v_i = 0;
            let v_total_qty = 0;
            let v_total_net = 0;
            let v_total_price = 0;
            let v_total_disc = 0;

            if (results.length > 0) {
                for (let key in results) {
                    const line = results[key];
                    v_i++;
                    v_total_qty += Number(line.qty);
                    v_total_price += Number(line.price);
                    v_total_net += Number(line.net);
                    v_total_disc += Number(line.disc);

                    if (Number(line.qty) > 0) {
                        v_html += `<tr>`;
                        v_html += `<td>${v_i}</td>`;
                        v_html += `<td>${line.itemName}</td>`;
                        v_html += `<td><center>${line.qty}</center></td>`;
                        v_html += `<td class='amount'>${formatNumberWithCommas(line.price)}</td>`;
                        v_html += `<td class='amount'>${formatNumberWithCommas(line.disc)}</td>`;
                        v_html += `<td class='amount'>${formatNumberWithCommas(line.net)}</td>`;
                        v_html += `<td><input type='number' class='form-control' id='return-qty-${line.id}' value=`+ (Number(line.qty) - Number(line.ret_qty))+` /></td>`;
                        v_html += `<td><button class="btn btn-success" onclick='returnQty("${line.itemName}", "${line.qty}", "${line.disc}", "${line.price}", "${line.invoice_code}", ${line.id}, "${line.ret_qty}")'>Return</button></td>`;
                        v_html += `</tr>`;
                    } else {
                        v_html += `<tr>`;
                        v_html += `<td style='background-color:#f6f2f2'>${v_i}</td>`;
                        v_html += `<td style='background-color:#f6f2f2'>${line.itemName}</td>`;
                        v_html += `<td style='background-color:#f6f2f2'><center>${line.qty}</center></td>`;
                        v_html += `<td style='background-color:#f6f2f2' class='amount'>${formatNumberWithCommas(line.price)}</td>`;
                        v_html += `<td style='background-color:#f6f2f2' class='amount'>${formatNumberWithCommas(line.disc)}</td>`;
                        v_html += `<td style='background-color:#f6f2f2' class='amount'>${formatNumberWithCommas(line.net)}</td>`;
                        v_html += `<td style='background-color:#f6f2f2'><center>${-1 * line.qty}</center></td>`;
                        v_html += `<td><code>Returned</code></td>`;
                        v_html += `</tr>`;
                    }
                }

                // Add totals row
                v_html += "</tbody><tfoot>";
                v_html += `<tr>`;
                v_html += `<td></td>`;
                v_html += `<td></td>`;
                v_html += `<td><center>${v_total_qty}</center></td>`;
                v_html += `<td class='amount'><mark>${formatNumberWithCommas(v_total_price)}</mark></td>`;
                v_html += `<td class='amount'><mark>${formatNumberWithCommas(v_total_disc)}</mark></td>`;
                v_html += `<td class='amount'><mark>${formatNumberWithCommas(v_total_net)}</mark></td>`;
                v_html += `<td></td>`;
                v_html += `<td></td>`;
                v_html += `</tr>`;
                v_html += "</tfoot></table></div>";
                popup_html(p_invoice_code + " Detail View", v_html);
            }
        };   
    }
} 

//Author: Muhammad Saim
//Method: print receipt and bill 
function ReprintReceiptAndBill(p_invoice_code, p_type)
{
    if (p_invoice_code && p_type)
    {
        const transaction = db.transaction(["invoices"], "readonly");
        const store = transaction.objectStore("invoices");
        const index = store.index("invoice_code");

        const request = index.getAll(p_invoice_code);
        request.onsuccess = (event) => {
            const results = event.target.result;
            console.log(results);
            var v_newBillData = {};
            if (results.length > 0) 
            {
            for (let key in results)
            {
                v_newBillData['invoice_code']		    = results[key].invoice_code;
                    v_newBillData['counter_name']		= results[key].counter_name
                    v_newBillData['user_id']			= results[key].user_id
                    v_newBillData['invoice_date']		= results[key].invoice_date;
                    v_newBillData['invoice_date_time']	= results[key].invoice_date_time;
                    v_newBillData['invoice_total']		= results[key].invoice_total;
                    v_newBillData['invoice_discount']	= results[key].invoice_discount;
                    v_newBillData['invoice_net']		= results[key].invoice_net;
                    v_newBillData['payment_mode']		= results[key].payment_mode;
                    v_newBillData['customer'] 		    = results[key].customer;
                    v_newBillData['invoice_lines'] 	    = results[key].invoice_lines;
        
                localStorage.setItem("invoicesData",JSON.stringify(v_newBillData));
            }
            }
            if (p_type=='bill')
            {
                window.open("bill.html");
            }
            else if (p_type=='receipt')
            {
            window.open("print.html","MsgWindow", "width=800,height=500");
            }

        };    
    }
}

//Author: Muhammad Saim
//Method: generate Sale Report
function generateSaleReport()
{
    var date =  document.getElementById('sale-report-date').value;
    const dateLib = new Date();
    if (!date) { 
       
        date= dateLib.getFullYear()+"-"+Number(parseInt(dateLib.getMonth())+parseInt(1))+"-"+dateLib.getDate();
        document.getElementById('sale-report-date').value =date;
    }
    if (date)
    {
        const transaction = db.transaction(["invoices"], "readonly");
        const store = transaction.objectStore("invoices");
        const index = store.index("invoice_date");

        const request = index.getAll(date);
        request.onsuccess = (event) => {
            const results = event.target.result;
            var v_html = "";
            var v_i = 0;
            if (results.length > 0) 
            {
                for (let key in results) 
                {
                    v_i = v_i + 1;
                    v_html  += `<tr>`;
                    v_html  += `<td>`+v_i+`</td>`;
                    v_html  += `<td>`+results[key].invoice_date+`</td>`;
                    v_html  += `<td>`+results[key].invoice_code+`</td>`;
                    v_html  += `<td>`+results[key].payment_mode+`</td>`;
                    v_html  += `<td class='amount'>`+formatNumberWithCommas(results[key].invoice_total - (results[key].invoice_return_total)) +`</td>`;
                    v_html  += `<td class='amount'>`+formatNumberWithCommas(results[key].invoice_discount - results[key].invoice_return_discount)+`</td>`;
                    v_html  += `<td class='amount'>`+formatNumberWithCommas(results[key].invoice_net - results[key].invoice_return_net)+`</td>`;
                    v_html  += `<td><a target='_blank' onclick='reportDetailView("`+results[key].invoice_code+`")' class='btn btn-success btn-sm'>Veiw Detail</a> | <a target='_blank' onclick='ReprintReceiptAndBill("`+results[key].invoice_code+`", "receipt")' class='btn btn-success btn-sm'>Print Receipt</a> | <a target='_blank' onclick='ReprintReceiptAndBill("`+results[key].invoice_code+`", "bill")'  class='btn btn-success btn-sm'>Print Bill</a></td>`;
                    v_html  += `</tr>`;
                }

                $('#sale-report-body').html(v_html);
            } else {
                popup("No Record Found !", "No record found for the given date");
            }
        };
        
    }
    else
    {
        popup("Date Selection Error", "Date must not be null");
    }
}

//Author: Muhammad Saim
//Method: generate sale and return report 
function generateSaleReturnReport()
{
    var date =  document.getElementById('sale-return-date').value;
    const dateLib = new Date();
    if (!date) { 
       
        date= dateLib.getFullYear()+"-"+Number(parseInt(dateLib.getMonth())+parseInt(1))+"-"+dateLib.getDate();
        document.getElementById('sale-return-date').value =date;
    }
    if (date)
    {
        const transaction = db.transaction(["invoices"], "readonly");
        const store = transaction.objectStore("invoices");
        const index = store.index("invoice_date");

        const request = index.getAll(date);
        request.onsuccess = (event) => {
            const results = event.target.result;
            var v_html = "";
            var v_i = 0;
            if (results.length > 0) 
            {
                for (let key in results) 
                {
                    v_i = v_i + 1;
                    v_html  += `<tr>`;
                    v_html  += `<td>`+v_i+`</td>`;
                    v_html  += `<td>`+results[key].invoice_date+`</td>`;
                    v_html  += `<td>`+results[key].invoice_code+`</td>`;
                    v_html  += `<td>`+results[key].payment_mode+`</td>`;
                    v_html  += `<td class='amount'>`+formatNumberWithCommas(results[key].invoice_total - (results[key].invoice_return_total)) +`</td>`;
                    v_html  += `<td class='amount'>`+formatNumberWithCommas(results[key].invoice_discount - results[key].invoice_return_discount)+`</td>`;
                    v_html  += `<td class='amount'>`+formatNumberWithCommas(results[key].invoice_net - results[key].invoice_return_net)+`</td>`;
                    v_html  += `<td><a target='_blank' onclick='reportDetailView("`+results[key].invoice_code+`")' class='btn btn-success btn-sm'>Veiw Detail</a> | <a target='_blank' onclick='reportDetailReturnView("`+results[key].invoice_code+`")' class='btn btn-success btn-sm'>Return</a> </td>`;
                    v_html  += `</tr>`;
                }

                $('#sale-return-body').html(v_html);
            } else {
                popup("No Record Found !", "No record found for the given date");
            }
        };
        
    }
    else
    {
        popup("Date Selection Error", "Date must not be null");
    }
}

//Author: Muhammad Saim
//Method: return qty
function returnQty(p_itemName, p_qty, p_disc, p_price, p_invoiceCode, p_id, p_retQty)
{
   
    var v_returnQty = 0;
    if (p_itemName &&  p_qty && p_price && p_invoiceCode && p_id)
    {
        v_returnQty = Number($('#return-qty-'+p_id).val());
        if (v_returnQty>0)
        {
            if ((p_qty - Number(p_retQty)) >= v_returnQty)
            {
                var v_returnLineObj = {};
                var v_negi_qty = Number(-1 * v_returnQty);
                var v_negi_price = Number(p_price);
                var v_negi_discount = 0;
                if (Number(p_disc)!=0)
                {
                    v_negi_discount = Math.round((Number(p_disc) /  Number(p_qty)) * Number(v_returnQty));
                }
                var v_negi_net = -1* ((-1 * (v_negi_qty * v_negi_price)) - v_negi_discount);
                const date = new Date();

                v_returnLineObj['itemName']     = p_itemName;
                v_returnLineObj['qty']          = v_negi_qty;
                v_returnLineObj['price']        = 0;
                v_returnLineObj['disc']         = (-1 * v_negi_discount);
                v_returnLineObj['net']          = v_negi_net;
                v_returnLineObj['invoice_code'] = p_invoiceCode;
                v_returnLineObj['invoice_date'] = date.getFullYear()+"-"+Number(parseInt(date.getMonth())+parseInt(1))+"-"+date.getDate();
                
                addLineItem(v_returnLineObj);

                const transaction = db.transaction(["invoices"], "readwrite");
                const store = transaction.objectStore("invoices");
                const index = store.index("invoice_code");
                const request = index.get(p_invoiceCode);
                request.onsuccess = function(event) {
                    let record = event.target.result;
                    if (record) {
                        // Update the record (e.g., change the 'age' field)
                        record.invoice_return			= 1;
                        record.invoice_return_total		= (v_returnQty * (Number(v_negi_price + record.invoice_return_total)));
                        record.invoice_return_discount	= Number(v_negi_discount + record.invoice_return_discount);
                        record.invoice_return_net		= Number((-1 * v_negi_net) + record.invoice_return_net);
                        // Put the updated record back into the object store
                        let putRequest = store.put(record);
            
                        putRequest.onsuccess = function() {
                            console.log("Record updated successfully!");
                        };
            
                    } else {
                        console.log("Record not found.");
                    }
                };
            
                const transactionLine = db.transaction(["lines"], "readwrite");
                const storeLine = transactionLine.objectStore("lines");
                const requestLine = storeLine.get(p_id);
                requestLine.onsuccess = function(event) {
                    let recordLine = event.target.result;
                    if (recordLine) {
                        // Update the record (e.g., change the 'age' field)
                        recordLine.ret_qty	= Number(p_qty - 1);
                        // Put the updated record back into the object store
                        let putRequestLine = storeLine.put(recordLine);
            
                        putRequestLine.onsuccess = function() {
                            console.log("Record updated successfully!");
                        };
            
                    } else {
                        console.log("Record not found.");
                    }
                };

                popup('Quantity Updated','Return quantity is updated successfully.');
                
                generateSaleReturnReport();
                reportDetailReturnView(p_invoiceCode);
                
            }   
            else
            {
                popup('Return More than Actaul','Return quantity must be less then or equal to actual quantity')
            }
        }
        else
        {
            popup('Zero Quantity Error','Return quantity must be greater then zero')
        }

    }
}




 // Author: Muhammad Saim
// Method: generate Quantity report
function generateQuantityReport() {
    const inventoryData = []; // To store inventory data
    const itemNames = new Set(); // To detect duplicates
    const duplicates = []; // To store duplicate items

    // Open the IndexedDB transaction
    const transaction = db.transaction(["inventory"], "readonly");
    const objectStore = transaction.objectStore("inventory");
    const index = objectStore.index("itemName");

    // Use cursor to collect item names
    const cursorRequest = index.openCursor();

    cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const itemName = cursor.key;

            // Check for duplicates
            if (itemNames.has(itemName)) {
                duplicates.push(itemName);
            } else {
                itemNames.add(itemName);
                inventoryData.push({ itemName });
            }

            // Continue the cursor
            cursor.continue();
        } else {
            // Cursor is done, process purchase and sale quantities
            processInventoryData(inventoryData).then(() => {
                // Save final data to localStorage
                localStorage.setItem("Inventory_in_hand", JSON.stringify(inventoryData));
                console.log("Inventory report saved:", inventoryData);
                drawQuantityReportTableLine();
            });
        }
    };

    cursorRequest.onerror = (event) => {
        console.error("Error reading inventory data:", event.target.error);
    };
}

// Helper function to process inventory data
async function processInventoryData(inventoryData) {
    for (const item of inventoryData) {
        const purchQty = await getPurchaseQuantity(item.itemName);
        const saleQty = await getSaleQuantity(item.itemName);

        item.purch_qty = purchQty;
        item.sale_qty = saleQty;
    }
}

// Helper function to get purchase quantities
function getPurchaseQuantity(itemName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["inventory"], "readonly");
        const store = transaction.objectStore("inventory");
        const index = store.index("itemName");
        const request = index.getAll(itemName);

        request.onsuccess = (event) => {
            const results = event.target.result;
            const total = results.reduce((sum, record) => sum + Number(record.inventoryQuantity), 0);
            resolve(total);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Helper function to get sale quantities
function getSaleQuantity(itemName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["lines"], "readonly");
        const store = transaction.objectStore("lines");
        const index = store.index("itemName");
        const request = index.getAll(itemName);

        request.onsuccess = (event) => {
            const results = event.target.result;
            const total = results.reduce((sum, record) => sum + Number(record.qty), 0);
            resolve(total);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function drawQuantityReportTableLine()
{
    // Example JSON array
    const inventoryData = JSON.parse(localStorage.getItem('Inventory_in_hand'));

    // Get the table body element
    const tableBody = document.getElementById("qty-report-body");

    // Initialize totals
    var v_i = 0;
    let totalPurchase = 0;
    let totals = 0;
    let totalSales = 0;
    // Loop through the JSON array and create table rows
    inventoryData.forEach((item) => {
        // Create a new row
        const row = document.createElement("tr");
        v_i = v_i + 1;
        totalPurchase += item.purch_qty;
        totalSales += item.sale_qty;
        totals     += item.purch_qty - item.sale_qty;

        // Create and append cells for itemName, purch_qty, and sale_qty
        row.innerHTML = `
            <td>${v_i}</td>
            <td>${item.itemName}</td>
            <td><center>${item.purch_qty}</center></td>
            <td><center>${item.sale_qty}</center></td>
            <td><center>${item.purch_qty - item.sale_qty}</center></td>
        `;

        const totalRow = document.createElement("tr");

        // Add totals row content
        totalRow.innerHTML = `
            <td><strong></strong></td>
            <td><strong>Total</strong></td>
            <td><strong>${totalPurchase}</strong></td>
            <td><strong>${totalSales}</strong></td>
            <td><strong>${totals}</strong></td>
        `;


        // Append the row to the table body
        tableBody.appendChild(row);
    });

}
