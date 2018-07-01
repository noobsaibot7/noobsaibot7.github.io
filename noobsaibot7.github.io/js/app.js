const UI = (function() {
  async function fetchCurrencies(url) {
    let a = await fetch(url);
    a = await a.json();
    return a.results;
  }

  async function getCurrency(query) {
    let val = await fetch(
      `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`
    );
    val = await val.json();
    return val;
  }

  async function currencyVal(amt, query) {
    let val = await getCurrency(query).then(val => val[query]);
    val = await parseFloat(val);
    const Amount = await parseFloat(amt);
    const answer = Math.round(Amount * val * 100) / 100;
    return answer.toFixed(2);

  }

  function arrayToObject(ary, key) {
    return Object.assign({}, ...ary.map(item => ({ [item[key]]: item })));
  }

  function addOptions(idName, data) {
    let options, selector;
    selector = document.getElementById(idName);
  
    for (const ball in data) {
      let {currencySymbol, id } = data[ball];
      options = document.createElement('option');
      options.text = `${id} ${
        currencySymbol !== undefined ? ' - ' + currencySymbol : ''
      }`;
      options.value = id;
      selector.add(options);
    }
    
  }

  return {
    fetchCurrencies,
    addOptions,
    currencyVal,
    arrayToObject
  };
})();

let networkAvailable = false;
const URL = 'https://free.currencyconverterapi.com/api/v5/currencies';
UI.fetchCurrencies(URL).then(data => {
  networkAvailable = true;
  UI.addOptions('currency2-dropdown', data);
  UI.addOptions('currency1-dropdown', data);
});

if ('indexedDB' in window) {
  readAllData('currencies').then(data => {
    if (!networkAvailable) {
      const obj = UI.arrayToObject(data, 'id');
      UI.addOptions('currency2-dropdown', obj);
      UI.addOptions('currency1-dropdown', obj);
    }
  });
}

document.getElementById('key1').addEventListener('keyup', event => {
  const keyName = event.key;
  const key1 = document.getElementById('key1').value;
  const conv1 = document.getElementById('currency1-dropdown').value;
  const conv2 = document.getElementById('currency2-dropdown').value;
  const queries = `${conv1}_${conv2}`;

  UI.currencyVal(key1, queries)
    .then(val => {
      if (!val) {
        document.getElementById('key2').value = 'Loading...';
      } else if (val) {
        document.getElementById('key2').value = val;
      }
    })
    .catch(err => {
      throw new Error('Check your network connection');
    });

});

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/serviceworker.js')
 //   .then(() => console.log('service worker first done by franco'));
}

