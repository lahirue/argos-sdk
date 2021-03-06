import declare from 'dojo/_base/declare';
import _WidgetBase from 'dijit/_WidgetBase';

import _Templated from '../_Templated';
import getResource from '../I18n';

const resource = getResource('busyIndicator');

/**
 * @class argos.Dialogs.BusyIndicator
 */
const __class = declare('argos.Dialogs.BusyIndicator', [_WidgetBase, _Templated], {
  widgetTemplate: new Simplate([
    '<div class="busyIndicator__container {%: $.containerClass %}" aria-live="polite" data-dojo-attach-point="busyIndicatorNode">',
    '{%! $.busyIndicatorTemplate %}',
    '{%! $.progressBarTemplate %}',
    '</div>',
  ]),
  busyIndicatorTemplate: new Simplate([
    '<div class="busy-{%: $.size %}" style="height: 100%; width: 100%;">',
    '<div class="busy-indicator-container" aria-live="polite" role="status">',
    '<div class="busy-indicator active">',
    '<div class="bar one"></div>',
    '<div class="bar two"></div>',
    '<div class="bar three"></div>',
    '<div class="bar four"></div>',
    '<div class="bar five"></div>',
    '</div>',
    '<span data-dojo-attach-point="labelNode">{%: $.label %}</span>',
    '</div>',
    '</div>',
  ]),
  progressBarTemplate: new Simplate([
    '<div class="busyIndicator__progress" data-dojo-attach-point="progressNode">',
    '</div>',
  ]),
  progressLabelTemplate: new Simplate([
    '<div class="busyIndicator__progress__label" style="text-align:center">{%: $.progressText %}</div>',
  ]),
  barTemplate: new Simplate([
    '<div class="busyIndicator__progress__bar"></div>',
  ]),

  _busyDeferred: null,
  _busyIndicator: null,
  _progressBar: null,
  containerClass: null,
  currentProgress: null,
  id: 'busyIndicator-template',
  isAsync: true,
  label: resource.loadingText,
  progressLabelNode: null,
  progressText: resource.progressText,
  size: '', // sm, xs, blank for normal
  totalProgress: null,

  complete: function complete(result = {}) {
    $(this.busyIndicatorNode).removeClass('busyIndicator--active');
    this._busyDeferred(result);
  },
  show: function show() {},
  start: function start(options = {}) {
    return new Promise((resolve) => {
      this._busyDeferred = resolve;
      $(this.busyIndicatorNode).addClass('busyIndicator--active');

      if (!this.isAsync || (options.isAsync !== undefined && !options.isAsync)) {
        this._progressBar = $(this.barTemplate.apply(this));
        this.progressLabelNode = $(this.progressLabelTemplate.apply(this));
        $(this.progressNode).append(this.progressLabelNode);
        $(this.progressNode).append(this._progressBar);
        this.currentProgress = options.current || 0;
        this.totalProgress = options.total || options.count || 0;
      }
    });
  },
  updateProgress: function updateProgress() {
    this.currentProgress = this.currentProgress + 1;
    if (this._progressBar) {
      this._progressBar.css({
        width: `${100 * this.currentProgress / this.totalProgress}%`,
      });
    }
  },
});

export default __class;
