/**
@module @ember/string
*/
import { Cache } from 'ember-metal';
import { inspect } from 'ember-utils';
import { isArray } from '../utils';
import {
  get as getString
} from '../string_registry';

const STRING_DASHERIZE_REGEXP = (/[ _]/g);

const STRING_DASHERIZE_CACHE = new Cache(1000, key => decamelize(key).replace(STRING_DASHERIZE_REGEXP, '-'));

const STRING_CAMELIZE_REGEXP_1 = (/(\-|\_|\.|\s)+(.)?/g);
const STRING_CAMELIZE_REGEXP_2 = (/(^|\/)([A-Z])/g);

const CAMELIZE_CACHE = new Cache(1000, key => key.replace(STRING_CAMELIZE_REGEXP_1, (match, separator, chr) => chr ? chr.toUpperCase() : '').replace(STRING_CAMELIZE_REGEXP_2, (match /*, separator, chr */) => match.toLowerCase()));

const STRING_CLASSIFY_REGEXP_1 = (/^(\-|_)+(.)?/);
const STRING_CLASSIFY_REGEXP_2 = (/(.)(\-|\_|\.|\s)+(.)?/g);
const STRING_CLASSIFY_REGEXP_3 = (/(^|\/|\.)([a-z])/g);

const CLASSIFY_CACHE = new Cache(1000, str => {
  let replace1 = (match, separator, chr) => chr ? (`_${chr.toUpperCase()}`) : '';
  let replace2 = (match, initialChar, separator, chr) => initialChar + (chr ? chr.toUpperCase() : '');
  let parts = str.split('/');
  for (let i = 0; i < parts.length; i++) {
    parts[i] = parts[i]
      .replace(STRING_CLASSIFY_REGEXP_1, replace1)
      .replace(STRING_CLASSIFY_REGEXP_2, replace2);
  }
  return parts.join('/')
    .replace(STRING_CLASSIFY_REGEXP_3, (match /*, separator, chr */) => match.toUpperCase());
});

const STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
const STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);

const UNDERSCORE_CACHE = new Cache(1000, str => str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').
  replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase());

const STRING_CAPITALIZE_REGEXP = (/(^|\/)([a-z\u00C0-\u024F])/g);

const CAPITALIZE_CACHE = new Cache(1000, str => str.replace(STRING_CAPITALIZE_REGEXP, (match /*, separator, chr */) => match.toUpperCase()));

const STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);

const DECAMELIZE_CACHE = new Cache(1000, str => str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase());

function _fmt(str, formats) {
  let cachedFormats = formats;

  if (!isArray(cachedFormats) || arguments.length > 2) {
    cachedFormats = new Array(arguments.length - 1);

    for (let i = 1; i < arguments.length; i++) {
      cachedFormats[i - 1] = arguments[i];
    }
  }

  // first, replace any ORDERED replacements.
  let idx = 0; // the current index for non-numerical replacements
  return str.replace(/%@([0-9]+)?/g, (s, argIndex) => {
    argIndex = (argIndex) ? parseInt(argIndex, 10) - 1 : idx++;
    s = cachedFormats[argIndex];
    return (s === null) ? '(null)' : (s === undefined) ? '' : inspect(s);
  });
}

function loc(str, formats) {
  if (!isArray(formats) || arguments.length > 2) {
    formats = Array.prototype.slice.call(arguments, 1);
  }

  str = getString(str) || str;
  return _fmt(str, formats);
}

function w(str) {
  return str.split(/\s+/);
}

function decamelize(str) {
  return DECAMELIZE_CACHE.get(str);
}

function dasherize(str) {
  return STRING_DASHERIZE_CACHE.get(str);
}

function camelize(str) {
  return CAMELIZE_CACHE.get(str);
}

function classify(str) {
  return CLASSIFY_CACHE.get(str);
}

function underscore(str) {
  return UNDERSCORE_CACHE.get(str);
}

function capitalize(str) {
  return CAPITALIZE_CACHE.get(str);
}

/**
  Defines string helper methods including string formatting and localization.
  Unless `EmberENV.EXTEND_PROTOTYPES.String` is `false` these methods will also be
  added to the `String.prototype` as well.

  @class String
  @public
*/
export default {
  /**
    Formats the passed string, but first looks up the string in the localized
    strings hash. This is a convenient way to localize text.

    Note that it is traditional but not required to prefix localized string
    keys with an underscore or other character so you can easily identify
    localized strings.

    ```javascript
    Ember.STRINGS = {
      '_Hello World': 'Bonjour le monde',
      '_Hello %@ %@': 'Bonjour %@ %@'
    };

    Ember.String.loc("_Hello World");  // 'Bonjour le monde';
    Ember.String.loc("_Hello %@ %@", ["John", "Smith"]);  // "Bonjour John Smith";
    ```

    @method loc
    @param {String} str The string to format
    @param {Array} formats Optional array of parameters to interpolate into string.
    @return {String} formatted string
    @public
  */
  loc,

  /**
    Splits a string into separate units separated by spaces, eliminating any
    empty strings in the process. This is a convenience method for split that
    is mostly useful when applied to the `String.prototype`.

    ```javascript
    Ember.String.w("alpha beta gamma").forEach(function(key) {
      console.log(key);
    });

    // > alpha
    // > beta
    // > gamma
    ```

    @method w
    @param {String} str The string to split
    @return {Array} array containing the split strings
    @public
  */
  w,

  /**
    Converts a camelized string into all lower case separated by underscores.

    ```javascript
    'innerHTML'.decamelize();           // 'inner_html'
    'action_name'.decamelize();        // 'action_name'
    'css-class-name'.decamelize();     // 'css-class-name'
    'my favorite items'.decamelize();  // 'my favorite items'
    ```

    @method decamelize
    @param {String} str The string to decamelize.
    @return {String} the decamelized string.
    @public
  */
  decamelize,

  /**
    Replaces underscores, spaces, or camelCase with dashes.

    ```javascript
    'innerHTML'.dasherize();          // 'inner-html'
    'action_name'.dasherize();        // 'action-name'
    'css-class-name'.dasherize();     // 'css-class-name'
    'my favorite items'.dasherize();  // 'my-favorite-items'
    'privateDocs/ownerInvoice'.dasherize(); // 'private-docs/owner-invoice'
    ```

    @method dasherize
    @param {String} str The string to dasherize.
    @return {String} the dasherized string.
    @public
  */
  dasherize,

  /**
    Returns the lowerCamelCase form of a string.

    ```javascript
    'innerHTML'.camelize();          // 'innerHTML'
    'action_name'.camelize();        // 'actionName'
    'css-class-name'.camelize();     // 'cssClassName'
    'my favorite items'.camelize();  // 'myFavoriteItems'
    'My Favorite Items'.camelize();  // 'myFavoriteItems'
    'private-docs/owner-invoice'.camelize(); // 'privateDocs/ownerInvoice'
    ```

    @method camelize
    @param {String} str The string to camelize.
    @return {String} the camelized string.
    @public
  */
  camelize,

  /**
    Returns the UpperCamelCase form of a string.

    ```javascript
    'innerHTML'.classify();          // 'InnerHTML'
    'action_name'.classify();        // 'ActionName'
    'css-class-name'.classify();     // 'CssClassName'
    'my favorite items'.classify();  // 'MyFavoriteItems'
    'private-docs/owner-invoice'.classify(); // 'PrivateDocs/OwnerInvoice'
    ```

    @method classify
    @param {String} str the string to classify
    @return {String} the classified string
    @public
  */
  classify,

  /**
    More general than decamelize. Returns the lower\_case\_and\_underscored
    form of a string.

    ```javascript
    'innerHTML'.underscore();          // 'inner_html'
    'action_name'.underscore();        // 'action_name'
    'css-class-name'.underscore();     // 'css_class_name'
    'my favorite items'.underscore();  // 'my_favorite_items'
    'privateDocs/ownerInvoice'.underscore(); // 'private_docs/owner_invoice'
    ```

    @method underscore
    @param {String} str The string to underscore.
    @return {String} the underscored string.
    @public
  */
  underscore,

  /**
    Returns the Capitalized form of a string

    ```javascript
    'innerHTML'.capitalize()         // 'InnerHTML'
    'action_name'.capitalize()       // 'Action_name'
    'css-class-name'.capitalize()    // 'Css-class-name'
    'my favorite items'.capitalize() // 'My favorite items'
    'privateDocs/ownerInvoice'.capitalize(); // 'PrivateDocs/ownerInvoice'
    ```

    @method capitalize
    @param {String} str The string to capitalize.
    @return {String} The capitalized string.
    @public
  */
  capitalize
};

export {
  loc,
  w,
  decamelize,
  dasherize,
  camelize,
  classify,
  underscore,
  capitalize
};
