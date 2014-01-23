var _ = require('lodash');
var itemsJSON = require('./items.json');
var itemsNamesJSON = require('./items-names.json');

// Create a map of names
// TODO: there must be a one–liner using lodash that can achieve this
var itemsNames = {};
_.forEach(itemsNamesJSON.items, function(item) {
  itemsNames[item[0]] = item[1];
});

function monetise(copper) {
  var negative = false;
  if (copper === 0) {
    return 0;
  } else if (copper < 0) {
    negative = true;
    copper = copper * -1;
  }
  var gold = Math.floor(copper / 10000);
  copper = copper % 10000;
  var silver = Math.floor(copper / 100);
  copper = copper % 100;
  var money = [copper+'c'];
  if (silver) { money.unshift(silver+'s'); }
  if (gold) { money.unshift(gold+'g'); }
  if (negative) {
    money.unshift('-');
  }
  return money.join('');
}

var profitableItems = [];

_.forEach(itemsJSON.items, function(item) {
  item = _.zipObject(itemsJSON.columns, item);

  // Filter out bad data
  if (!item.buy || !item.sell || !item.demand || !item.supply) { return; }

  // Supply and demand must be over 1000
  if (item.demand < 1000 || item.supply < 1000) { return; }

  // Demand must be at least 200% of supply
  if (item.demand < item.supply * 2) { return; }

  // Spread must be at least 1 silver
  item.spread = Math.floor((item.sell * 0.85) - item.buy);
  if (item.spread < 100) { return; }

  // Profit must be at least 50%
  item.profit = Math.floor((item.spread / item.buy) * 100);
  if (item.profit < 50) { return; }

  item.name = itemsNames[item.id];
  item.buy = monetise(item.buy);
  item.sell = monetise(item.sell);
  item.spread = monetise(item.spread);
  item.profit = item.profit+'%';
  profitableItems.push(item);
});

console.log(profitableItems.length+' of '+itemsJSON.items.length+' items match the criteria');
console.log(profitableItems.slice(0,10));
