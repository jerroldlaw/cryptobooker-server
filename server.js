const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const axios = require('axios')

app.use(cors())

app.get('/orderbook', async (req, res) => {
  let dict = {
    asks: [],
    bids: []
  }

  let response = await axios.get('https://api.kraken.com/0/public/Depth?pair=ETHXBT');
  let data = response.data;
  dict = compileKrakenData(dict, data.result.XETHXXBT)
  response = await axios.get('https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=both');
  data = response.data;
  dict = compileBittrexData(dict, data.result)

  res.json(sortDict(dict))
})

let compileKrakenData = (dict, data) => {
  data.asks.forEach(order => {
   dict.asks.push({price: order[0], qty: order[1], exchange: 'kraken'})
  })
  data.bids.forEach(order => {
   dict.bids.push({price: order[0], qty: order[1], exchange: 'kraken'})
  })

  return dict
}

let compileBittrexData = (dict, data) => {
  data.sell.forEach(order => {
    dict.asks.push({price: order.Rate, qty: order.Quantity, exchange: 'bittrex'})
  })
  data.buy.forEach(order => {
    dict.bids.push({price: order.Rate, qty: order.Quantity, exchange: 'bittrex'})
  })

  return dict
}

let sortDict = (dict) => {
  let compare = (a,b) => {
    if (a.price < b.price)
      return -1;
    if (a.price > b.price)
      return 1;
    return 0;
  }

  dict.asks = dict.asks.sort(compare)
  dict.bids = dict.bids.sort(compare)

  return dict
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
