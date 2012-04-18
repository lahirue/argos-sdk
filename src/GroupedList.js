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

define('Sage/Platform/Mobile/GroupedList', [
    'dojo/_base/declare',
    'dojo/query',
    'dojo/string',
    'dojo/dom-class',
    'dojo/dom-construct',
    'Sage/Platform/Mobile/List'
], function(
    declare,
    query,
    string,
    domClass,
    domConstruct,
    List
) {

    return declare('Sage.Platform.Mobile.GroupedList', [List], {
        // Localization
        toggleCollapseText: 'toggle collapse',

        widgetTemplate: new Simplate([
            '<div id="{%= $.id %}" title="{%= $.titleText %}" class="list grouped-list{%= $.cls %}" {% if ($.resourceKind) { %}data-resource-kind="{%= $.resourceKind %}"{% } %}>',
            '<div data-dojo-attach-point="searchNode"></div>',
            '<a href="#" class="android-6059-fix">fix for android issue #6059</a>',
            '{%! $.emptySelectionTemplate %}',
            '<div class="group-content" data-dojo-attach-point="contentNode"></div>',
            '{%! $.moreTemplate %}',
            '</div>'
        ]),
        groupTemplate: new Simplate([
            '<h2 data-action="toggleGroup" class="{% if ($.collapsed) { %}collapsed{% } %}">',
            '{%: $.title %}<button class="collapsed-indicator" aria-label="{%: $$.toggleCollapseText %}"></button>',
            '</h2>',
            '<ul data-group="{%= $.tag %}" class="list-content {%= $.cls %}"></ul>'
        ]),
        _currentGroup: null,
        _currentGroupNode: null,
        getGroupForEntry: function(entry) {
            return {
                tag: 1,
                title: 'Default'
            };
        },
        toggleGroup: function(params) {
            var node = params.$source;
            if (node)
                domClass.toggle(node, 'collapsed');
        },
        processFeed: function(feed) {
            /// <summary>
            ///     Processes the feed result from the SData request and renders out the resource feed entries.
            /// </summary>
            /// <param name="feed" type="Object">The feed object.</param>
            if (!this.feed) this.set('listContent', '');

            this.feed = feed;

            if (this.feed['$totalResults'] === 0)
            {
                this.set('listContent', this.noDataTemplate.apply(this));               
            }
            else if (feed['$resources'])
            {
                var o = [];

                for (var i = 0; i < feed['$resources'].length; i++)
                {
                    var entry = feed['$resources'][i],
                        entryGroup = this.getGroupForEntry(entry);

                    if (entryGroup.tag != this._currentGroup)
                    {
                        if (o.length > 0)
                            domConstruct.place(o.join(''), this._currentGroupNode, 'last');

                        o = [];

                        this._currentGroup = entryGroup.tag;
                        domConstruct.place(this.groupTemplate.apply(entryGroup, this), this.contentNode, 'last');
                        this._currentGroupNode = query("> :last-child", this.contentNode)[0];
                    }

                    this.entries[entry.$key] = entry;

                    o.push(this.rowTemplate.apply(entry, this));
                }

                if (o.length > 0)
                    domConstruct.place(o.join(''), this._currentGroupNode, 'last');
            }

            // todo: add more robust handling when $totalResults does not exist, i.e., hide element completely
            if (typeof this.feed['$totalResults'] !== 'undefined')
            {
                var remaining = this.feed['$totalResults'] - (this.feed['$startIndex'] + this.feed['$itemsPerPage'] - 1);
                this.set('remainingContent', string.substitute(this.remainingText, [remaining]));
            }

            domClass.toggle(this.domNode, 'list-has-more', this.hasMoreData());
        },
        clear: function() {
            this.inherited(arguments);

            this._currentGroup = null;
            this._currentGroupNode = null;
        }
    });
});