/* Copyright (c) 2010, Sage Software, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import declare from 'dojo/_base/declare';
import lang from 'dojo/_base/lang';
import _WidgetBase from 'dijit/_WidgetBase';
import _Templated from './_Templated';
import getResource from './I18n';

const resource = getResource('searchWidget');

/**
 * @class argos.SearchWidget
 * Search Widget is an SData-enabled search component that {@link List List} uses by default for search.
 *
 * The search widget is a dijit Widget with all the Widget aspects.
 *
 * It supports two types of shortcuts:
 *
 * 1\. `#text` - The key `text` will be replaced with the matching expression. This is a "hashtag".

 * 2\. `#!Name eq 'John'` - The `Name eq 'John'` will be inserted directly, avoiding {@link List#formatSearchQuery formatSearchQuery}. This is a "custom expression".
 *
 * Multiple hashtags is supported as well as hashtags with additional text that gets sent through {@link List#formatSearchQuery formatSearchQuery}.
 *
 * To go through a full example, take this expression:
 * `#open #urgent Bob`
 *
 * `#open` is replaced with: `TicketStatus eq 1`
 *
 * `#urgent` is replaced with: `TicketUrgency gt 3`
 *
 * `Bob` is passed to `formatSearchQuery` which returns `TicketId eq ("Bob") or TicketOwner like "Bob"
 *
 * The final result is "anded" together, resulting in this final where clause:
 * `where=(TicketStatus eq 1) and (TicketUrgency gt 3) and (TicketId eq ("Bob") or TicketOwner like "Bob")
 *
 * See the [Defining Hash Tags guide](#!/guides/v2_beyond_the_guide_defining_hashtags) for more information and how it supports localization.
 * @alternateClassName SearchWidget
 * @mixins argos._Templated
 */
const __class = declare('argos.SearchWidget', [_WidgetBase, _Templated], {
  /**
   * @property {Object}
   * Provides a setter for HTML node attributes, namely the value for search text
   */
  attributeMap: {
    queryValue: {
      node: 'queryNode',
      type: 'attribute',
      attribute: 'value',
    },
  },

  /**
   * @property {Simplate}
   * Simple that defines the HTML Markup
   */
  widgetTemplate: new Simplate([`
    <span class="searchfield-wrapper">
      <input type="text" placeholder="{%= $.searchText %}" name="query" class="searchfield" autocorrect="off" autocapitalize="off" data-dojo-attach-point="queryNode" data-dojo-attach-event="onkeypress:_onKeyPress"  />
      <svg class="icon" focusable="false" aria-hidden="true" role="presentation">
        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-search"></use>
      </svg>
    </span>
    `,
  ]),

  /**
   * @property {String}
   * Text that is used when no value is in the search box - "placeholder" text.
   */
  searchText: resource.searchText,

  /**
   * @property {RegExp}
   * The regular expression used to determine if a search query is a custom search expression.  A custom search
   * expression is not processed, and directly passed to SData.
   */
  customSearchRE: /^#!/,
  /**
   * @type {RegExp}
   * The regular expression used to determine if a search query is a hash tag search.
   */
  hashTagSearchRE: /(?:#|;|,|\.)([^\s]+)/g,
  /**
   * @property {Object[]}
   * Array of hash tag definitions
   */
  hashTagQueries: null,
  /**
   * Dojo attach point to the search input
   */
  queryNode: null,

  /**
   * Sets search text to empty and removes active styling
   */
  clear: function clear() {
    this.set('queryValue', '');
  },
  /**
   * This function is invoked from the search button and it:
   *
   * * Gathers the inputted search text
   * * Determines if its a custom expression, hash tag, or normal search
   * * Calls the appropriate handler
   * * Fires the {@link #onSearchExpression onSearchExpression} event which {@link List#_onSearchExpression listens to}.
   */
  search: function search() {
    const formattedQuery = this.getFormattedSearchQuery();
    this.onSearchExpression(formattedQuery, this);
  },
  /**
   * Returns an unmodified search query which allows a user
   * to type in their own where clause
   * @param {String} query Value of search box
   * @returns {String} query Unformatted query
   */
  customSearch: function customSearch(queryValue) {
    this.customSearchRE.lastIndex = 0;
    const query = queryValue.replace(this.customSearchRE, '');
    return query;
  },
  /**
   * Returns the search query based on a hash selector
   * Any hash tags in the search are replaced by predefined search statements
   * Remaining text not preceded by a hash will receive
   * that views normal search formatting
   * @param {String} query Value of search box
   * @returns {String} query Hash resolved query
   */
  hashTagSearch: function hashTagSearch(query) {
    const hashLayout = this.hashTagQueries || [];
    const hashQueries = [];
    let additionalSearch = query;

    this.hashTagSearchRE.lastIndex = 0;
    let newQuery = query;
    let match;

    while ((match = this.hashTagSearchRE.exec(newQuery))) { // eslint-disable-line
      let hashQueryExpression = null;
      const hashTag = match[1];

      // todo: can optimize later if necessary
      for (let i = 0; i < hashLayout.length && !hashQueryExpression; i++) {
        if (hashLayout[i].tag.substr(1) === hashTag || hashLayout[i].key === hashTag) {
          hashQueryExpression = hashLayout[i].query;
        }
      }

      if (!hashQueryExpression) {
        continue;
      }

      hashQueries.push(this.expandExpression(hashQueryExpression));
      additionalSearch = additionalSearch.replace(match[0], '');
    }

    if (hashQueries.length < 1) {
      return this.formatSearchQuery(query);
    }

    newQuery = `(${hashQueries.join(') and (')})`;

    additionalSearch = additionalSearch.replace(/^\s+|\s+$/g, '');

    if (additionalSearch) {
      newQuery += ` and (${this.formatSearchQuery(additionalSearch)})`;
    }

    return newQuery;
  },
  /**
   * Configure allows the controller List view to overwrite properties as the passed object will be mixed in.
   * @param {Object} options Properties to be mixed into Search Widget
   */
  configure: function configure(options) {
    // todo: for now, we simply mixin the options
    lang.mixin(this, options);
  },
  /**
   * Expands the passed expression if it is a function.
   * @param {String/Function} expression Returns string directly, if function it is called and the result returned.
   * @return {String} String expression.
   */
  expandExpression: function expandExpression(expression) {
    if (typeof expression === 'function') {
      return expression.apply(this, Array.prototype.slice.call(arguments, 1));
    }

    return expression;
  },
  /**
   * Detects the enter/return key and fires {@link #search search}
   * @param {Event} evt Key press event
   */
  _onKeyPress: function _onKeyPress(evt) {
    if (evt.keyCode === 13 || evt.keyCode === 10) {
      evt.preventDefault();
      evt.stopPropagation();
      this.queryNode.blur();
      this.search();
    }
  },
  /**
   * @deprecated
   */
  _onClearClick: function _onClearClick() {
    console.warn('This method is deprecated.'); // eslint-disable-line
  },
  /**
   * The event that fires when the search widget provides a search query.
   * Listened to by the controlling {@link List#_onSearchExpression List View}
   * @param expression
   * @param widget
   */
  onSearchExpression: function onSearchExpression(/* expression, widget*/) {
  },
  /**
   * Gets the current search expression as a formatted query.
   * * Gathers the inputted search text
   * * Determines if its a custom expression, hash tag, or normal search
   */
  getFormattedSearchQuery: function getFormattedSearchQuery() {
    const searchQuery = this.getSearchExpression();
    const isCustomMatch = searchQuery && this.customSearchRE.test(searchQuery);
    const isHashTagMatch = searchQuery && this.hashTagSearchRE.test(searchQuery);

    let formattedQuery;

    switch (true) {
      case isCustomMatch:
        formattedQuery = this.customSearch(searchQuery);
        break;
      case isHashTagMatch:
        formattedQuery = this.hashTagSearch(searchQuery);
        break;
      default:
        formattedQuery = this.formatSearchQuery(searchQuery);
    }

    if (lang.trim(searchQuery) === '') {
      formattedQuery = null;
    }
    return formattedQuery;
  },
  /**
   * Gets the current search expression.
   * * Gathers the inputted search text
   */
  getSearchExpression: function getSearchExpression() {
    return this.queryNode.value;
  },
  disable: function disable() {
    if (this.queryNode) {
      this.queryNode.disabled = true;
      $(this.domNode).addClass('disabled');
    }
  },
  enable: function enable() {
    if (this.queryNode) {
      this.queryNode.disabled = false;
      $(this.domNode).removeClass('disabled');
    }
  },
});

export default __class;
