/*eslint-disable*/
define('tests/ReducerTests', [
  'argos/reducers/index',
  'argos/actions/index',
  'argos/actions/connection',
  'argos/actions/window',
], function(
  reducer,
  indexActions,
  connectionActions,
  windowActions
) {
  return describe('argos.reducers', function() {
    it('Can return a default state', function() {
      var state = reducer.sdk(undefined, {});
      expect(state).toEqual({
        online: false,
        maxviewports: 1,
        viewset: [],
        history: [],
      })
    });

    it('Can set the max viewports', function() {
      var state = reducer.sdk(undefined, indexActions.setMaxViewPorts(5));
      expect(state.maxviewports).toEqual(5);
    });

    it('Can handle max viewport changes on window resize', function() {
      var state = reducer.sdk(undefined, windowActions.windowResize(windowActions.BREAKPOINTS.PHONE, 0));
      expect(state.maxviewports).toEqual(1);

      state = reducer.sdk(undefined, windowActions.windowResize(windowActions.BREAKPOINTS.TABLET, 0));
      expect(state.maxviewports).toEqual(2);

      state = reducer.sdk(undefined, windowActions.windowResize(windowActions.BREAKPOINTS.DESKTOP, 0));
      expect(state.maxviewports).toEqual(2);

      state = reducer.sdk(undefined, windowActions.windowResize(windowActions.BREAKPOINTS.LARGE, 0));
      expect(state.maxviewports).toEqual(3);
    });

    it('Can show a view', function() {
      var state = reducer.sdk(undefined, indexActions.showView('view1', {}, '/view1'));
      expect(state.viewset).toEqual(['view1']);
    });

    it('Can show two views', function() {
      var state = reducer.sdk(undefined, indexActions.showView('view1', {}, '/view1'));
      expect(state.viewset).toEqual(['view1']);

      state = reducer.sdk(state, indexActions.showView('view2', {}, '/view2'));
      expect(state.viewset).toEqual(['view1', 'view2']);
    });

    it('Can show views with maxviewport constraints', function() {
      var state = reducer.sdk(undefined, {}); // default state

      // 1 viewport (phone)
      state.history = [];
      state.viewset = [];
      state.maxviewports = 1;
      state = reducer.sdk(state, indexActions.showView('view1', {}, '/view1'));
      expect(state.viewset).toEqual(['view1']);

      state = reducer.sdk(state, indexActions.showView('view2', {}, '/view2'));
      expect(state.viewset).toEqual(['view2']);

      // 2 viewports (tablet/desktop)
      state.history = [];
      state.viewset = [];
      state.maxviewports = 2;

      state = reducer.sdk(state, indexActions.showView('view1', {}, '/view1'));
      expect(state.viewset).toEqual(['view1']);
      expect(state.history[0].hash).toEqual('/view1')

      state = reducer.sdk(state, indexActions.showView('view2', {}, '/view2'));
      expect(state.viewset).toEqual(['view1', 'view2']);
      expect(state.history[1].hash).toEqual('/view2')

      state = reducer.sdk(state, indexActions.showView('view3', {}, '/view3?id=1'));
      expect(state.viewset).toEqual(['view2', 'view3']);
      expect(state.history[2].hash).toEqual('/view3?id=1')

      state = reducer.sdk(state, indexActions.showView('view3', {}, '/view3?id=2'));
      expect(state.viewset).toEqual(['view2', 'view3']);
      expect(state.history[3].hash).toEqual('/view3?id=2')

      // 3 viewports (Extra large desktop)
      state.history = [];
      state.viewset = [];
      state.maxviewports = 3;

      state = reducer.sdk(state, indexActions.showView('view1', {}, '/view1'));
      expect(state.viewset).toEqual(['view1']);

      state = reducer.sdk(state, indexActions.showView('view2', {}, '/view2'));
      expect(state.viewset).toEqual(['view1', 'view2']);

      state = reducer.sdk(state, indexActions.showView('view3', {}, '/view3'));
      expect(state.viewset).toEqual(['view1', 'view2', 'view3']);

      state = reducer.sdk(state, indexActions.showView('view4', {}, '/view4'));
      expect(state.viewset).toEqual(['view2', 'view3', 'view4']);

      state = reducer.sdk(state, indexActions.showView('view2', {}, '/view2'));
      expect(state.viewset).toEqual(['view2']);
    });
  });
});
