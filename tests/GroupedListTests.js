/* eslint-disable */
define('tests/GroupedListTests', ['dojo/query','dojo/dom-class', 'dojo/text!./feeds/GroupListFeed.json', 'argos/GroupedList'], function(query, domClass, jsonFeed, GroupedList) {
return describe('Sage.Platform.Mobile.GroupedList', function() {

    var _app = window.App;

    beforeEach(function() {
        window.App = {
            history: [],
            getCurrentPage: function() {
            },
            setCurrentPage: function(page) {
            },
            getMetricsByResourceKind: function() {
                return [];
            },
            getCustomizationsFor: function() {
            },
            getViewContainerNode: function() {
            },
            getService: function() {
            },
            enableGroups: true,
            supportsTouch: function() {
            }
        };

        this.list = new GroupedList();
        this.list.app = window.App;
    });

    afterEach(function() {
        this.list.destroy();
        window.App = _app;
    });


    it('Can return base group tag', function() {
        var group = this.list.getGroupForEntry(null);

        expect(group.tag).toEqual(1);
        expect(group.title).toEqual('Default');
    });

    // TODO: These two tests should just use a memory store
    xit('Can construct list items from feed', function() {
        var feed = JSON.parse(jsonFeed);

        this.list.processData(feed);

        expect(query('> ul > li', this.list.contentNode).length).toEqual(feed['$totalResults']);
    });

    xit('Can split list items into groups', function() {
        var feed = JSON.parse(jsonFeed);

        this.list.getGroupForEntry = function(entry) {
            return {
                tag: entry.view ? 0 : 1,
                title: entry.view ? 'Views' : 'Actions'
            }
        };

        this.list.processData(feed);

        expect(query('> ul', this.list.contentNode).length).toEqual(2);
    });


});
});
