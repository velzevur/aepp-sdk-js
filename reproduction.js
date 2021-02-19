const { Ae, MemoryAccount, Chain, Transaction, Node } = require('./dist/aepp-sdk')
const axios = require('axios')

const publicKey = 'ak_2dATVcZ9KJU5a8hdsVtTv21pYiGWiPbmVcU1Pz72FFqpk9pSRR';
const url = 'http://localhost:3013';

const fetchNode = async path => (await axios.get(url + '/v2/' + path)).data;

(async () => {
  const sdk = await Ae.compose(MemoryAccount, Chain, Transaction)({
    keypair: {
      publicKey,
      secretKey: 'bf66e1c256931870908a649572ed0257876bb84e3cdf71efb12f56c7335fad54d5cf08400e988222f26eb4b02c8f89077457467211a6e6d955edb70749c6a33b',
    },
    nodes: [{ name: 'test', instance: await Node({ url }) }],
  });
  const getNonce = async () => (await fetchNode('accounts/' + publicKey)).nonce;
  const initialNonce = await getNonce();

  for (let nonce = initialNonce + 1; nonce <= initialNonce + 1000; nonce++) {
    const { hash } = await sdk.spend(
      1e17,
      'ak_Y1NRjHuoc3CGMYMvCmdHSBpJsMDR6Ra2t5zjhRcbtMeXXLpLH',
      { waitMined: false, verify: false, nonce },
    )
    while (true) {
      const { block_height } = await fetchNode('transactions/' + hash);
      if (block_height === -1) continue;
      console.log('spend', block_height, nonce);
      break;
    }
    const nonces = [];
    for (let j = 1; j <= 10; j++) {
      nonces.push(await getNonce());
    }
    if (nonces.some(n => n !== nonce)) {
      for (let j = 1; j <= 30; j++) {
        nonces.push(await getNonce());
      }
      console.log('current nonce', nonce);
      console.log('nonces', nonces);
      break;
    }
  }
})()
