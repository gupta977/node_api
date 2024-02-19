const express = require("express");
const app = express();
var _ethers = require("ethers");
var w3d = require("@web3yak/web3domain");
const fa = require("@glif/filecoin-address");
require("dotenv").config();

const settings = {
  matic_rpc_url: process.env.MATIC_RPC,
  eth_rpc_url: process.env.ETH_RPC,
  fvm_rpc_url: process.env.FVM_RPC,
};

let resolve = new w3d.Web3Domain(settings);

var intro =
  "This is live API script which you can host on your node webserver application to get wallet address from the Web3 Domain Name.<hr> Eg. <code>http://....../?name=brad.eth&currency=ETH</code> ";


  
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Define routes
app.get("/", (req, res) => {
  const { param } = req.query;
  let query = req.query;

  console.log(query);

  
  if ((typeof query.address !== 'undefined')) {

    //Search for ETH address

    if (!_ethers.utils.isAddress(query.address)) {

      let fil = fa.validateAddressString(query.address); //Only check t4 address
      if (fil) {
        //This is FIL address and convert it ot ETH
        const convert_t4 = fa.ethAddressFromDelegated(query.address).toString();

       addr_to_domain(convert_t4, res)

      }
      else {
        res.json({ error: 'Invalid address', code: 400 })
      }
    }
    else {
      //ETH address search
      addr_to_domain(query.address, res)
    }

  }
  else if ((typeof query.name !== 'undefined') && (typeof query.type !== 'undefined')) {

    if(query.type == 'uri')
    {
      domain_to_uri(query.name, res)
    }
    else
    {

    domain_to_ipfs(query.name, res);
    }
  }
  else {
    if ((typeof query.name !== 'undefined')) {

      if ((typeof query.currency === 'undefined')) {

        domain_to_addr(query.name, 'ETH', res);
      }
      else {

        domain_to_addr(query.name, query.currency, res);
      }

    }
    else {
      res.json({ error: intro })
    }
  }

});

//Domain to Address
function domain_to_addr(name, currency, res) {
  resolve
    .getAddress(name, currency)
    .then((x) => {
      console.log(x);
      if (x == null) {
        res.json({ address: x, code: 404 });
      } else {
        res.json({ address: x, code: 200 });
      }
    })
    .catch(console.error);
}

//Address to Domain

function addr_to_domain(address, res) {
  const convert_f4 = fa.newDelegatedEthAddress(address).toString();
  console.log(convert_f4);

  resolve
    .getDomain(address, "W3D")
    .then((x) => {
      //EVM address to Web3Domain Name
      if (x == null || x == "") {
        addr_to_domain_ens(address, res);
      } else {
        res.json({ domain: x, code: 200, fvm: convert_f4, eth: address });
      }
    })
    .catch(console.error);
}

//Address to domain for ENS
function addr_to_domain_ens(address, res) {
  const convert_t4 = fa.delegatedFromEthAddress(address).toString();

  resolve
    .getDomain(address, "ENS")
    .then((x) => {
      //ENS address to ETH Domain
      if (x == null) {
        res.json({ domain: x, code: 404 });
      } else {
        res.json({ domain: x, code: 200, fvm: convert_t4, eth: address });
      }
    })
    .catch(console.error);
}

//Find IPFS from domain
function domain_to_ipfs(name, res) {
  resolve
    .getWeb(name)
    .then((x) => {
      if (x == null) {
        res.json({ ipfs: x, code: 404 });
      } else {
        res.json({ ipfs: x, code: 200 });
      }
    })
    .catch(console.error);
}

//Find URI from domain
function domain_to_uri(name, res) {
  resolve
    .w3d_tokenURI(name)
    .then((x) => {
      if (x == null) {
        res.json({ tokenURI: x, code: 404 });
      } else {
        res.json({ tokenURI: x, code: 200 });
      }
    })
    .catch(console.error);
}
