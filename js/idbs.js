const dbPromise = idb.open('currency-store', 1, DB => {
  if (!DB.objectStoreNames.contains('currencies')) {
      DB.createObjectStore('currencies', { keyPath: 'id', autoIncrement:true });
      DB.createObjectStore('savedCurrencies', { keyPath: 'query' });
     
  }
});

function clearDataAll(storeName){
  return dbPromise
  .then(db=>{
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      return tx.complete;
      
  })
}

function readAllData(storeName){
  return dbPromise
  .then(db=>{
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return store.getAll();
             
  })
}