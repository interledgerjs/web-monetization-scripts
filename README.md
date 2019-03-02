# Web Monetization Scripts
> Client-side scripts to Web Monetize sites

## Conditionals

### Description

Sometimes you want to show/hide your content based on whether the viewer is
Web-Monetized. These scripts provide a really simple way to do that on the
client side.

The idea is that everyone should be able to do this on their site/blog!

**Keep in mind that all of your html is still sent to the client, so a tricky
user could bypass this without actually having Web Monetization!** In the
future, there will be better support for secure Web Monetized content.

These conditional scripts will work anywhere that HTML with script tags can be used!

If you're using react for your site, it is _highly_ recommended that you use
[React Web Monetization](https://github.com/sharafian/react-web-monetization)
instead.

### Including the Script

For all of these snippets, make sure you have included the Web Monetization
`<meta>` tag in your page.

#### Show an Element if the User is Web Monetized

Put this code where you want your element to appear. It will be invisible
(`visibility: hidden`) until Web Monetization starts. It will never appear is
Web Monetization is not enabled.

It's important to keep the `<div>` wrapped around the code in exactly the way
it's done below (including style)! The `<script>` MUST be the first thing
inside of the div for this to work. Everything after the `<script>` inside of
the `<div>` is displayed conditionally.

```html
<div style="visibilty:hidden;">
  <script src="https://cdn.coil.com/if-monetized.js"></script>
  <!-- you can put whatever code you want after the script tag -->
  <p>Monetization is enabled!</p>
</div>
```

#### Show an Element if the User is Not Web Monetized

Put this code where you want your element to appear. If the browser does not
support Web Monetization, it will appear immediately. If the browser supports
Web Monetization but is not paying, it will appear after a couple of seconds.

It's important to keep the `<div>` wrapped around the code in exactly the way
it's done below (including style)! The `<script>` MUST be the first thing
inside of the div for this to work. Everything after the `<script>` inside of
the `<div>` is displayed conditionally.

```html
  <div style="visibilty:hidden;">
    <script src="https://cdn.coil.com/if-not-monetized.js"></script>
    <!-- you can put whatever code you want after the script tag -->
    <p>Monetization is not enabled!</p>
  </div>
```

## Counter

### Description

Shows a counter of how much has been donated to the page. This is compatible
with the new `<meta>` tag based version of Web Monetization.

### Including the Script

Make sure you have included the Web Monetization `<meta>` tag in your page.
Pasting the following code into your page will add a counter to the bottom left
of the page:

```html
<script src="https://cdn.coil.com/counter.js"></script>
<script>
  window.WebMonetizationScripts.createCounter()
</script>
```

### Usage

This will hook into the existing web monetization events, so there are no
parameters required.

```
window.WebMonetizationScripts.createCounter()
```

#### Parameters

None.

#### Return Value

None.

## Donate

### Description

The donate script is used for a page that's supported through donations in the
background. It shows the user a coil logo when payment is being sent, and if
the Interledger connection drops it will re-establish it.

This is useful for Web Monetizing static sites (i.e. replacing advertising). For cases where you want to replace a paywall, you'll want something that can securely detect when payment occurs (scripts for that use case will be added soon).

### Including the Script

```html
<script src="https://cdn.coil.com/donate.js"></script>
```

The script also exists at `https://interledgerjs.github.io/web-monetization-scripts/dist/donate.js`, or can be built locally and served from your site.

### Usage

Example of usage at [`examples/donate.html`](https://github.com/interledgerjs/web-monetization-scripts/blob/master/examples/donate.html), source code at [`src/donate.js`](https://github.com/interledgerjs/web-monetization-scripts/blob/master/src/donate.js).

```
window.WebMonetizationScripts.donate({
  paymentPointer: '$twitter.xrptipbot.com/sharafian_',
  noRetry: false,
  noWidget: false,
  addCoilAdvert: true
})
```

#### Parameters

- `opts: Object` - Required. Options for donation.
- `opts.paymentPointer: String` - Required. [Payment pointer](https://github.com/interledger/rfcs/blob/master/0026-payment-pointers/0026-payment-pointers.md) to receive donations.
- `opts.noRetry: Boolean` - Optional, default `false`. If `noRetry` is set then the ILP connection will not be re-established when it goes down. You can manually re-establish it by calling `donate` again.
- `opts.noWidget: Boolean` - Optional, default `false`. If `noWidget` is set then no Coil logo will appear in the bottom left of the screen when payment occurs.
- `opts.addCoilAdvert` - Optional, default `false`. If `addCoilAdvert` is set to `true` then a Coil advert logo will appear in the bottom left of the screen if no payment handler is detected.

#### Return Value

- `ret: EventTarget` - Listen for `money` to get a notification when a packet of money has been sent (`ev.detail.amount` has the exact amount). Listen for `close` to get a notification whenever the connection drops.
- `ret.connection: WebConnection` - [Web Monetization Connection](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#ilp-connection-class) currently used by the donation.
- `ret.stream: WebStream` - [Web Monetization Stream](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#ilp-stream-class) currently used by the donation.
