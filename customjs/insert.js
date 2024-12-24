initDB();

const addItem = (data) => {
    const transaction = db.transaction(["invoices"], "readwrite");
    const store = transaction.objectStore("invoices");
  
    store.add(data).onsuccess = () => {
      console.log("Item added:", data);
    };
};
  
const addLineItem = (data) => {
  const transaction = db.transaction(["lines"], "readwrite");
  const store = transaction.objectStore("lines");

  store.add(data).onsuccess = () => {
    console.log("Line item added:", data);
  };
};

const addInventory = (data) => {
  const transaction = db.transaction(["inventory"], "readwrite");
  const store = transaction.objectStore("inventory");

  store.add(data).onsuccess = () => {
    console.log("inventory is added:", data);
  };
};

