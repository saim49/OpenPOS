let db;

const initDB = () => {
  const request = indexedDB.open("posOpen", 1);

  request.onupgradeneeded = (event) => {
    db = event.target.result;

    if (!db.objectStoreNames.contains("invoices")) {
      const store = db.createObjectStore("invoices", { keyPath: "id", autoIncrement: true });
      store.createIndex("invoice_date", "invoice_date", { unique: false });   // Index on 'date'
      store.createIndex("invoice_code", "invoice_code", { unique: true }); // Index on 'code'
    }

    if (!db.objectStoreNames.contains("inventory")) {
      const store = db.createObjectStore("inventory", { keyPath: "id", autoIncrement: true });
      store.createIndex("itemName", "itemName", { unique: false });   // Index on 'name'
    }

    if (!db.objectStoreNames.contains("lines")) {
      const store = db.createObjectStore("lines", { keyPath: "id", autoIncrement: true });
      store.createIndex("itemName", "itemName", { unique: false });   // Index on 'name'
      store.createIndex("invoice_code", "invoice_code", { unique: false }); // Index on 'code'
      store.createIndex("invoice_date", "invoice_date", { unique: false }); // Index on 'date'
    }

    console.log("Database setup complete!");
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database initialized!");
  };

  request.onerror = (event) => {
    console.error("Database error:", event.target.error);
  };
};

