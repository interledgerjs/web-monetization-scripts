# Web Monetization Scripts
> Client-side scripts to Web Monetize sites

## Donate

### Description

The donate script is used for a page that's supported through donations in the
background. It shows the user a coil logo when payment is being sent, and if
the Interledger connection drops it will re-establish it.

This is useful for Web Monetizing static sites (i.e. replacing advertising). For cases where you want to replace a paywall, you'll want something that can securely detect when payment occurs (scripts for that use case will be added soon).

### Including the Script

```html
<script src="https://interledgerjs.github.io/web-monetization-scripts/dist/donate.js"></script>
```

### Usage

Example of usage at [`examples/donate.html`](https://github.com/interledgerjs/web-monetization-scripts/blob/master/examples/donate.html), source code at [`src/donate.js`](https://github.com/interledgerjs/web-monetization-scripts/blob/master/src/donate.js).

```
window.WebMonetizationScripts.donate({
  paymentPointer: '$twitter.xrptipbot.com/sharafian_',
  noRetry: false,
  noWidget: false
})
```

#### Parameters

- `opts: Object` - Required. Options for donation.
- `opts.paymentPointer: String` - Required. [Payment pointer](https://github.com/interledger/rfcs/blob/master/0026-payment-pointers/0026-payment-pointers.md) to receive donations.
- `opts.noRetry: Boolean` - Optional, default `false`. If `noRetry` is set then the ILP connection will not be re-established when it goes down. You can manually re-establish it by calling `donate` again.
- `opts.noWidget: Boolean` - Optional, default `false`. If `noWidget` is set then no Coil logo will appear in the bottom left of the screen when payment occurs.

#### Return Value

- `ret: Promise<EventTarget>` - Listen for `money` to get a notification when a packet of money has been sent (`ev.detail.amount` has the exact amount). Listen for `close` to get a notification whenever the connection drops.
- `ret.connection: WebConnection` - [Web Monetization Connection](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#ilp-connection-class) currently used by the donation.
- `ret.stream: WebStream` - [Web Monetization Stream](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#ilp-stream-class) currently used by the donation.
