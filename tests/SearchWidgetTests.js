/* eslint-disable */
define('tests/SearchWidgetTests', ['dojo/query','dojo/dom-class','argos/SearchWidget'], function(query, domClass, SearchWidget) {
    return describe('Sage.Platform.Mobile.SearchWidget', function() {
        it('Can empty search value on clear', function() {
            var searchWidget = new SearchWidget();

            var inputNode = query('input', searchWidget.domNode)[0];
            inputNode.value = 'test';

            searchWidget.clear();

            expect(inputNode.value).toEqual('');
        });

        it('Can return an unformatted query when custom matcher is matched', function() {
            var searchWidget = new SearchWidget();

            expect(searchWidget.customSearch('#!test')).toEqual('test');
        });

        it('Can return a preset query when hash tag is matched', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: 'query'
                    }]
                }
            );

            expect(searchWidget.hashTagSearch('#test')).toEqual('(query)');
        });
        it('Can return a dynamic query when hash tag is matched', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: function() { return 'query'; }
                    }]
                }
            );

            expect(searchWidget.hashTagSearch('#test')).toEqual('(query)');
        });


        it('Can return multiple preset queries when all are hash tag matches', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: 'query'
                    }, {
                        key: 'test1',
                        tag: 'test1',
                        query: 'query1'
                    }]
                }
            );

            expect(searchWidget.hashTagSearch('#test #test1')).toEqual('(query) and (query1)');
        });

        it('Can return a preset query when hash tag is matched and with a search term added', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: 'query'
                    }],
                    formatSearchQuery: function(val) {
                        return 'where='+val;
                    }
                }
            );
            spyOn(searchWidget, 'formatSearchQuery').and.callThrough();

            expect(searchWidget.hashTagSearch('#test john')).toEqual('(query) and (where=john)');
            expect(searchWidget.formatSearchQuery).toHaveBeenCalledWith('john');
        });

        it('Can execute search, no hashes just search term', function() {
            var searchWidget = new SearchWidget({
                formatSearchQuery: function(val) { return 'where='+val;}
            });
            searchWidget.queryNode.value = 'search';


            spyOn(searchWidget, 'formatSearchQuery').and.callThrough();
            spyOn(searchWidget, 'onSearchExpression');

            searchWidget.search();

            expect(searchWidget.formatSearchQuery).toHaveBeenCalledWith('search');
            expect(searchWidget.onSearchExpression).toHaveBeenCalledWith('where=search', searchWidget);
        });
        it('Can execute search, matching custom hash', function() {
            var searchWidget = new SearchWidget();
            searchWidget.queryNode.value = '#!test';


            spyOn(searchWidget, 'customSearch').and.callThrough();
            spyOn(searchWidget, 'onSearchExpression');

            searchWidget.search();

            expect(searchWidget.customSearch).toHaveBeenCalledWith('#!test');
            expect(searchWidget.onSearchExpression).toHaveBeenCalledWith('test', searchWidget);
        });
        xit('Can execute search, matching hash', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: 'query'
                    }],
                    formatSearchQuery: function(val) { return 'where='+val;},
                    getSearchExpression: function() {
                        return '#test';
                    }
                }
            );

            spyOn(searchWidget, 'formatSearchQuery').and.callThrough();
            spyOn(searchWidget, 'hashTagSearch').and.callThrough();
            spyOn(searchWidget, 'onSearchExpression');

            searchWidget.search();

            expect(searchWidget.hashTagSearch).toHaveBeenCalledWith('#test');
            expect(searchWidget.onSearchExpression).toHaveBeenCalledWith('(query)', searchWidget);
        });
        it('Can execute search, matching multiple hashes', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: 'query'
                    }, {
                        key: 'test1',
                        tag: 'test1',
                        query: 'query1'
                    }]
                }
            );
            searchWidget.queryNode.value = '#test #test1';

            spyOn(searchWidget, 'hashTagSearch').and.callThrough();
            spyOn(searchWidget, 'onSearchExpression');

            searchWidget.search();

            expect(searchWidget.hashTagSearch).toHaveBeenCalledWith('#test #test1');
            expect(searchWidget.onSearchExpression).toHaveBeenCalledWith('(query) and (query1)', searchWidget);
        });
        it('Can execute search, matching hash and search term', function() {
            var searchWidget = new SearchWidget(
                {
                    hashTagQueries: [{
                        key: 'test',
                        tag: 'test',
                        query: 'query'
                    }],
                    formatSearchQuery: function(val) {
                        return 'where='+val;
                    }
                }
            );
            searchWidget.queryNode.value = '#test search';

            spyOn(searchWidget, 'hashTagSearch').and.callThrough();
            spyOn(searchWidget, 'formatSearchQuery').and.callThrough();
            spyOn(searchWidget, 'onSearchExpression');

            searchWidget.search();

            expect(searchWidget.hashTagSearch).toHaveBeenCalledWith('#test search');
            expect(searchWidget.formatSearchQuery).toHaveBeenCalledWith('search');
            expect(searchWidget.onSearchExpression).toHaveBeenCalledWith('(query) and (where=search)', searchWidget);
        });


    });
});
