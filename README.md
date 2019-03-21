<p align="center">
  <img src="./tsunagi-logo.png" width="300px">
  <h1 align="center">Tsunagi</h1>
  <p align="center">Integrate your 0x protocol dApp with many wallets using a consistent API.</p>
</p>

## Introduction

[0x](https://0x.org) is a powerful, expansive protocol for trading on the Ethereum network, but getting your dApp off the ground can be a _massive_ undertaking. `tsunagi` is a library that abstracts common dApp user actions into a handful of methods, so you can focus on what makes your dApp magical and spend less time on the underlying architecture. `tsunagi` integrates with many popular software and hardware wallets that work on Ethereum—providing developers with a consistent API and giving users broad optionality! There is also an [expressive plugin system](./src/lib/abstract-wallet-plugin.ts) to enable highly custom behavior. Whether you're building a 0x relayer or a new kind of utility, `tsunagi` is an approachable entry-point to the complex dApp ecosystem.

> ⚠️ Please be aware that this library and its documentation are thoroughly a **_WORK IN PROGRESS!_** We do not recommend it for hardened production use—yet! However, we _do_ use it extensively at [Radar Relay](https://radarrelay.com). Any contribution, big or small, is welcome!

## Wallet Integrations

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://metamask.io/" target="_blank">
          MetaMask
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.ledger.fr/" target="_blank">
          Ledger
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://trezor.io/" target="_blank">
          Trezor
        </a>
      </td>
      <td align="center" valign="middle">
        Many more coming soon!
      </td>
    </tr>
  </tbody>
</table>

## Usage

### Installation

Via Yarn (recommended):

```sh
yarn add tsunagi
```

or via NPM:

```sh
npm install tsunagi
```

### Getting started

#### Spinning up

1. Import and instantiate a wallet of your choice:

```ts
import { MetamaskWallet } from 'tsunagi';

const metamaskWallet = new MetamaskWallet({
  rpcEndpoints: ['https://...']
});
```

2. Start the connection to your wallet instance:

```ts
await metamaskWallet.start();
```

3. Get accounts:

```ts
const accounts = await metamaskWallet.getAccounts();
const myAccount = accounts[0]; // An instance of EthereumAccount -- this is where things get fun!
```

#### Spinning down

```ts
await metamaskWallet.stop();
```

### Using accounts

See [EthereumAccount](./src/lib/ethereum-account.ts) for information about available methods.
