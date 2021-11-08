# SAIA MTM Widget

Widget, that implements getting garment size for user based on SAIA MTM API.

## How to run

**1. Install all dependencies with the following command:**

```sh
npm install
```

**2. To run the project in development mode, type in a terminal the following command:**

```sh
npm start
```

**3. To build the widget for production use this command:**

```sh
npm run build:prod
```

Build for Shopify (for internal usage only):

```sh
npm run build:shopify
```

## Build configuration file

Configuration file should be named like this:

    saia-config.<config type>.js

File should export an object, which contains the following:

```js
module.exports = {
  // saia api host url
  API_HOST: '',
  // client api key
  API_KEY: '',
  // widget host url
  WIDGET_HOST: '',
  // path to widget assets for url configuration
  // this folder needs to contain widget-assets folder
  // should end with /
  WIDGET_ASSETS_URL: '/wp-content/widget/',
};
```


## Deployment requirements

To properly host widget for your website, you need to host index.html file of subdomain, for example, https://widget.example.com, and then call it from your website. This is required for widget navigation to work.


## Example of usage

Let's configure widget for your store, that is located on this domain https://test-store.com/. Clone this repository to your computer. After that go to the widget directory in the terminal and run the following command:

```sh
npm install
```

This command will install all the dependencies. Then create a configuration file for your shop with name like this:

```
saia-config.test-store.js
```

Enter required information to this file:

```js
// saia-config.test-store.js
module.exports = {
  // saia api host url
  API_HOST: 'https://saia.3dlook.me',
  // client api key
  API_KEY: 'h2f98h13fh934hv91b3h51345b245yqeg255y',
  // widget host url
  WIDGET_HOST: 'https://test-store.com/wp-content/my-widget-build/index.html',
  // path to widget assets for url configuration
  // this folder needs to contain widget-assets folder
  // should end with /
  WIDGET_ASSETS_URL: '/wp-content/my-widget-build/',
};
```

After that, run in the terminal the following command:

```sh
export NODE_ENV=production && export CONFIG=test-store && webpack --progress
```

You will get dist folder, that has this structure:

```
dist/
--widget-assets/
....*image assets*
--index.html
--saia-mtm-button.js
..ignore other files
```

Then you should upload the content of dist folder to your hosting in the folder, that you have already specified in the configuration file (```WIDGET_ASSETS_URL```). saia-mtm-button.js should be included on the pages, on which you want to display a button and widget modal. This file could be included with this code:

```html
<script src="/wp-content/my-widget-build/saia-mtm-button.js"></script>
```

After that you will get "Your MTM" button on the page.

## Set default options via global `MTM_WIDGET_OPTIONS` object

To overwrite default options without creating a custom integration script, you could define a global `MTM_WIDGET_OPTIONS` object and set there the same options as in `SaiaMTMButton` constructor.

For example, you want to overwrite default height, weight, and email values and set predefined ones. disableInput is option to disable email input (it works only if you preset email in defaultValues object). Also, you would like to set a callback function to get measurements, when they are ready. Let's say, you want to set height in feet and inches. To do this, declare `window.MTM_WIDGET_OPTIONS` object:

```js
window.MTM_WIDGET_OPTIONS = {
  // overwrite default input values
  defaultValues: {
    heightFt: 6,
    heightIn: 5,
    weight: 80,
    email: 'pisa@gmail.com',
  },
  disableInput: {
    email: true
  },

  // callback function that will be called with person object, which contains measurements
  onMeasurementsReady: (measurements) => {
    console.log(measurements);
  },
};
```

In this example, `weight` supposed to be in pounds. To use the metric system you need to set `heightCm` instead of `heightFt` and `heightIn`.

The widget will catch these options on its initialization step and set them in the corresponding inputs.

## Set custom widget button text

You have an option to set custom widget button text via `data-button-title` attribute. For example, you have a regular integration code for your page from MTM admin panel:

```html
<script id="saia-mtm-integration" async src="/integration.js" data-public-key="f23$F234f:qwe2323e:FQWERFwerf234"></script>
```

To set custom button title, set `data-button-title` attribute value like this:

```html
<script id="saia-mtm-integration" async src="/integration.js" data-public-key="f23$F234f:qwe2323e:FQWERFwerf234" data-button-title="My custom title"></script>
```

<a name="SaiaMTMButton"></a>

## SaiaMTMButton
**Kind**: global class  

* [SaiaMTMButton](#SaiaMTMButton)
    * [new SaiaMTMButton(options)](#new_SaiaMTMButton_new)
    * [.init()](#SaiaMTMButton+init)
    * [.checkGetParamsForMeasurements()](#SaiaMTMButton+checkGetParamsForMeasurements)
    * [.checkButtonVisibility()](#SaiaMTMButton+checkButtonVisibility)
    * [.showWidget()](#SaiaMTMButton+showWidget)
    * [.getSize()](#SaiaMTMButton+getSize) ⇒ <code>Object</code> \| <code>null</code>
    * [.displaySize(recomendations)](#SaiaMTMButton+displaySize)

<a name="new_SaiaMTMButton_new"></a>

### new SaiaMTMButton(options)
SaiaMTMButton constructor


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | parameters |
| options.container | <code>string</code> | selector for button container |
| options.key | <code>string</code> | SAIA PF API key |
| [options.widgetUrl] | <code>string</code> | url to the widget host to open it in the iframe |
| [options.product] | <code>Object</code> | object with product parameters (optional) |
| [options.product.description] | <code>string</code> | product description. Will be displayed on final results page |
| [options.product.imageUrl] | <code>string</code> | url to product image Will be displayed on final results page |
| [options.product.url] | <code>string</code> | url to product. For shopify usage only. Instead use brand and bodyPart options to determine right sizecharts |
| [options.brand] | <code>string</code> | brand name. If brand and bodyPart are set, then product.url is ignored |
| [options.bodyPart] | <code>string</code> | body part name. If brand and bodyPart are set, then product.url is ignored |
| [options.id] | <code>number</code> \| <code>string</code> | unique id of the button |
| [options.returnUrl] | <code>string</code> | product page url on which user will be redirected after he pressing close button at results screen after he complite the mobile flow |
| [options.returnUrlDesktop] | <code>string</code> | should widget open returnUrl on desktop or not |
| [options.fakeSize] | <code>string</code> | should show fake size result page |
| [options.productId] | <code>number</code> | shoify product id |
| [options.buttonTitle] | <code>string</code> | shoify product id |
| [options.defaultValues] | <code>Object</code> | default values for some widget fields |
| [options.defaultValues.email] | <code>string</code> | default value for email field |
| [options.defaultValues.heightCm] | <code>number</code> | default value for height in centimeters. Will also set units field to 'cm'. |
| [options.defaultValues.heightFt] | <code>number</code> | default value for height in feet and inches. Contains feet part. Should be used in combination with heightIn. Will also set units field to 'in'. |
| [options.defaultValues.heightIn] | <code>number</code> | default value for height in feet and inches. Contains inches part. Should be used in combination with heightFt. Will also set units field to 'in'. |
| [options.defaultValues.weight] | <code>number</code> | default value for weight field. If you set heightCm, then weight should contain value in kilograms. If you set heightFt and heightIn, then weight should contain value in pounds. |

<a name="SaiaMTMButton+init"></a>

### saiaMTMButton.init()
Init widget

**Kind**: instance method of [<code>SaiaMTMButton</code>](#SaiaMTMButton)  
<a name="SaiaMTMButton+checkGetParamsForMeasurements"></a>

### saiaMTMButton.checkGetParamsForMeasurements()
Get persons data from get parameters and save them to localStorage

**Kind**: instance method of [<code>SaiaMTMButton</code>](#SaiaMTMButton)  
<a name="SaiaMTMButton+checkButtonVisibility"></a>

### saiaMTMButton.checkButtonVisibility()
Check should we display button for current product page or not

**Kind**: instance method of [<code>SaiaMTMButton</code>](#SaiaMTMButton)  
<a name="SaiaMTMButton+showWidget"></a>

### saiaMTMButton.showWidget()
Show widget

**Kind**: instance method of [<code>SaiaMTMButton</code>](#SaiaMTMButton)  
<a name="SaiaMTMButton+getSize"></a>

### saiaMTMButton.getSize() ⇒ <code>Object</code> \| <code>null</code>
Get size for current product if measurements presaved in localstorage

**Kind**: instance method of [<code>SaiaMTMButton</code>](#SaiaMTMButton)  
**Returns**: <code>Object</code> \| <code>null</code> - recomendations  
<a name="SaiaMTMButton+displaySize"></a>

### saiaMTMButton.displaySize(recomendations)
Display sizes on the button

**Kind**: instance method of [<code>SaiaMTMButton</code>](#SaiaMTMButton)  

| Param | Type | Description |
| --- | --- | --- |
| recomendations | <code>Object</code> | size recomendations transformed object |


# TODO:

* Split SCSS styles to components style files
