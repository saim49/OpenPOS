let currentEditId = null;

//Author: Muhammad Saim
//Method: display items
function displayItems(filter = '') 
{
    let items = JSON.parse(localStorage.getItem('items')) || [];
    let itemTable = document.getElementById('itemTableBody');
    itemTable.innerHTML = ''; // Clear current rows
    
    // Sort items by ID in descending order
    items.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    // Apply the filter to search by name or ID
    if (filter) {
        filter = filter.toLowerCase();
        items = items.filter(item => 
            item.name.toLowerCase().includes(filter) || 
            item.id.toString().includes(filter)
        );
    }
    let g_itemOptionHTML = `<option value="" >Select Item</option>`;  
    items.forEach(item => {
        let row = `<tr>
                        <td><center>${item.id}</center></td>
                        <td><center>${item.name}</center></td>
                        <td class='amount'>${formatNumberWithCommas(Number(item.purchaseprice))}</td>
                        <td class='amount'>${formatNumberWithCommas(Number(item.price))}</td>
                        <td><center>${item.disc}%</center></td>
                        <td><center>${item.barcode}</center></td>
                        <td><center>${item.location}</center></td>
                        <td>
                          <button class="btn btn-success btn-sm" onclick="editItem('${item.id}')">Edit</button>
                          <button class="btn btn-success btn-sm" onclick="deleteItem('${item.id}')">Delete</button>
                        </td>
                    </tr>`;
                 
        itemTable.innerHTML += row;
        g_itemOptionHTML += `<option value="${item.name}">${item.id} | ${item.name} | ${item.barcode} | ${item.disc} | ${item.location}</option>`;
    });

    
   
     document.getElementById('itemDropdown').innerHTML = g_itemOptionHTML;

    $( '#itemDropdown' ).select2( {
        dropdownParent: $('#itemModel')
      });
  
}

//Author: Muhammad Saim
//Method: save new item
function saveNewItem() 
{
    const itemName              = document.getElementById('itemDetail').value.trim();
    const itemPrice             = document.getElementById('itemPrice').value;
    const itemPurchasePrice     = document.getElementById('itemPurchasePrice').value;
    const itemDiscount          = document.getElementById('itemDiscount').value;
    const itemBarcode           = document.getElementById('itemBarcode').value;
    const itemLocation          = document.getElementById('itemLocation').value;

    if (!itemName || !itemPrice) {
        alert('Please fill out all required fields.');
        return;
    }

    let items = JSON.parse(localStorage.getItem('items')) || [];
    // Check if the item already exists (by name)
    const duplicateItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase() && item.id !== currentEditId);
    const duplicateBarcode = items.find(item => item.barcode.toLowerCase() === itemBarcode.toLowerCase() && item.id !== currentEditId);
    if (duplicateItem) {
        alert('Item with the same name already exists!');
        return; // Don't allow the duplicate item to be added
    }

    if (duplicateBarcode && itemBarcode.toLowerCase()) {
        alert('Barcode already exists!');
        return; // Don't allow the duplicate barcode to be added
    }

    if (currentEditId) {
        // Update mode
        items = items.map(item => {
            if (item.id === currentEditId) {
                return {
                    id            : item.id,
                    name          : itemName,
                    barcode       : itemBarcode,
                    price         : itemPrice,
                    purchaseprice : itemPurchasePrice,
                    location      : itemLocation,
                    disc          : itemDiscount || "0.00"
                };
            }
            return item;
        });
        alert('Item updated successfully!');
        currentEditId = null; // Reset after editing
    } else {
        // Add new item
        const newItem = {
            id            : items.length ? (parseInt(items[items.length - 1].id) + 1).toString() : '1',
            name          : itemName,
            price         : itemPrice,
            purchaseprice : itemPurchasePrice,
            location      : itemLocation,
            disc          : itemDiscount || "0.00",
            barcode       : itemBarcode
        };

        items.push(newItem);
        
    }

    localStorage.setItem('items', JSON.stringify(items));

    // Reset the form and update the table
    document.getElementById('addItemForm').reset();
    displayItems();
}

//Author: Muhammad Saim
//Method: edit item
function editItem(id) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    const itemToEdit = items.find(item => item.id === id);

    if (itemToEdit) {
        // Populate the form with the item's details
        document.getElementById('itemDetail').value         = itemToEdit.name;
        document.getElementById('itemPrice').value          = itemToEdit.price;
        document.getElementById('itemDiscount').value       = itemToEdit.disc;
        document.getElementById('itemBarcode').value        = itemToEdit.barcode;
        document.getElementById('itemPurchasePrice').value  = itemToEdit.purchaseprice;
        document.getElementById('itemLocation').value       = itemToEdit.location;
        // Set the current edit ID
        currentEditId = itemToEdit.id;
    }
}

//Author: Muhammad Saim
//Method: delete item
function deleteItem(id) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    items = items.filter(item => item.id !== id);
    localStorage.setItem('items', JSON.stringify(items));
    displayItems();
}

//Author: Muhammad Saim
//Method: search items
function searchItems() {
    const searchTerm = document.getElementById('searchItem').value;
    displayItems(searchTerm);
}

//Author: Muhammad Saim
//Method: search items barcode
function searchItemsBarcode() {
    var filter = $('#itemName').val();
    const qty = 1;
    if (filter)
    {
        let items = JSON.parse(localStorage.getItem('items')) || [];
    
        filter = filter.toLowerCase();
        items = items.filter(item => item.barcode.toLowerCase().includes(filter));
        items.forEach(item => {
            if (item.barcode)
            {
                $('#itemName').val(item.name);
                $('#price').val(item.price);
                simpleBillLineNet();
                $('#qty').val(qty);
                $('#disc').val(0);
                simpleSaveBillLine();
            }
        });
    }
}


function saveNewInventory()
{
    const itemName              = document.getElementById('itemDropdown').value.trim();
    const inventoryQuantity     = document.getElementById('inventoryQuantity').value;
    const salePrice             = document.getElementById('salePrice').value;
    const PurchasePrice         = document.getElementById('purchasePrice').value;
    const narration             = document.getElementById('narration').value;
    const location              = document.getElementById('location').value;
    const date                  = document.getElementById('inventoryDate').value;
    var v_inventoryObj          = {};
    if (itemName && inventoryQuantity && salePrice && PurchasePrice && location)
    {
        v_inventoryObj['itemName']          = itemName;
        v_inventoryObj['inventoryQuantity'] = inventoryQuantity;
        v_inventoryObj['salePrice']         = salePrice;
        v_inventoryObj['purchasePrice']     = PurchasePrice;
        v_inventoryObj['narration']         = narration;
        v_inventoryObj['inventoryDate']     = date;
        v_inventoryObj['inventoryLocation'] = location;

        addInventory(v_inventoryObj);

        let items = JSON.parse(localStorage.getItem('items')) || [];
        const itemToEdit = items.find(item => item.name === itemName);

        items = items.map(item => {
            if (item.name === itemToEdit.name) {
                return {
                    id            : itemToEdit.id,
                    name          : itemToEdit.name,
                    barcode       : itemToEdit.barcode,
                    price         : salePrice,
                    purchaseprice : PurchasePrice,
                    location      : location,
                    disc          : itemToEdit.disc
                };
            }
            return item;
        });
        localStorage.setItem('items', JSON.stringify(items));
    }
    
    popup("Added Successfully","Inventory is added successfully.");
    document.getElementById('inventoryQuantity').value = "";
    document.getElementById('salePrice').value= "";
    document.getElementById('purchasePrice').value= "";
    document.getElementById('narration').value= "";
    document.getElementById('inventoryDate').value= "";
    updateQuantityTable();
    displayItems();
}


function updateQuantityTable()
{
    const itemName = document.getElementById('itemDropdown').value.trim();
    var v_sumTotalSaleQuantity = 0;
    var v_sumTotalPurchaseQuantity = 0;
    const transaction = db.transaction(["inventory"], "readonly");
    const store = transaction.objectStore("inventory");
    const index = store.index("itemName");
    const request = index.getAll(itemName);
    request.onsuccess = (event) => {
        const results = event.target.result;
        if (results.length > 0) {
            var v_sumTotalPurchaseQuantity = 0;
            for (let key in results) 
            {
                v_sumTotalPurchaseQuantity +=Number(results[key].inventoryQuantity);
            }
            $('#t-purchaseQunatity').html('<center>'+v_sumTotalPurchaseQuantity+'<center>');
            $('#t-qunatity').html('<center><mark><b>0</b></mark></b>');
            const transaction_billLines = db.transaction(["lines"], "readonly");
            const store_billLines = transaction_billLines.objectStore("lines");
            const index_billLines = store_billLines.index("itemName");
            const request_billLines = index_billLines.getAll(itemName);
            request_billLines.onsuccess = (event) => {
                const results_billLines = event.target.result;
                if (results_billLines.length > 0) {
                  
                    for (let key in results_billLines) 
                    {
                        v_sumTotalSaleQuantity +=Number(results_billLines[key].qty);
                    }
                    
                    $('#t-saleQunatity').html('<center>'+v_sumTotalSaleQuantity+'<center>');
                    $('#t-qunatity').html('<center><mark><b>'+ (v_sumTotalPurchaseQuantity - v_sumTotalSaleQuantity)+'</b></mark><center>');
                }
                return results_billLines;
            };
            let items = JSON.parse(localStorage.getItem('items')) || [];
            const itemToEdit = items.find(item => item.name === itemName);
            $('#location').val(itemToEdit.location);
        } 
        return results;
    };

   
     
}