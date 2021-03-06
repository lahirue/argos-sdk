/*
 * See copyright file.
 */
import declare from 'dojo/_base/declare';


/**
 * @class argos._ActionMixin
 * _ActionMixin provides a click listener to the `domNode` of view it is mixed into.
 *
 * When a click event is caught by the handler it finds the closest element with `data-action`
 * and fires that function in the context of the view. When calling the function it passes a `params`
 * object with the following:
 *
 *     {
 *         $event: 'Original click event',
 *         $src: 'The HTML node that initiated the event'
 *     }
 *
 * and then it mixes it all the `data-` attributes from the node into the params object.
 *
 * @alternateClassName _ActionMixin
 */
const __class = declare('argos._ActionMixin', null, {
  /**
   * @property {String}
   * Comma separated (no spaces) list of events to listen to
   */
  actionsFrom: 'click',
  /**
   * Extends the dijit Widget `postCreate` to connect to all events defined in `actionsFrom`.
   */
  postCreate: function postCreate() {
    // todo: add delegation
    this.actionsFrom.split(',').forEach((evt) => {
      $(this.domNode).on(evt, this._initiateActionFromEvent.bind(this));
    });
  },
  /**
   * Verifies that the given HTML element is within our view.
   * @param {HTMLElement} el
   * @return {Boolean}
   */
  _isValidElementForAction: function _isValidElementForAction(el) {
    const contained = this.domNode.contains ? this.domNode !== el && this.domNode.contains(el) : !!(this.domNode.compareDocumentPosition(el) & 16);

    return (this.domNode === el) || contained;
  },
  /**
   * Takes an event and fires the closest valid `data-action` with the attached `data-` attributes
   * @param {Event} evt
   */
  _initiateActionFromEvent: function _initiateActionFromEvent(evt) {
    const el = $(evt.target).closest('[data-action]').get(0);
    const action = $(el).attr('data-action');

    if (action && this._isValidElementForAction(el) && this.hasAction(action, evt, el)) {
      const parameters = this._getParametersForAction(action, evt, el);
      this.invokeAction(action, parameters, evt, el);
      evt.stopPropagation();
    }
  },
  /**
   * Extracts the `data-` attributes of an element and adds `$event` and `$source` being the two originals values.
   * @param {String} name Name of the action/function being fired.
   * @param {Event} evt The original event
   * @param {HTMLElement} el The node that has the `data-action` attribute
   * @return {Object} Object with the original event and source along with all the `data-` attributes in pascal case.
   */
  _getParametersForAction: function _getParametersForAction(name, evt, el) {
    const parameters = {
      $event: evt,
      $source: el,
    };

    function replace($0, $1, $2) {
      return $1.toUpperCase() + $2;
    }

    for (let i = 0, attrLen = el.attributes.length; i < attrLen; i++) {
      const attributeName = el.attributes[i].name;
      if (/^((?=data-action)|(?!data))/.test(attributeName)) {
        continue;
      }

      /* transform hyphenated names to pascal case, minus the data segment, to be in line with HTML5 dataset naming conventions */
      /* see: http://dev.w3.org/html5/spec/elements.html#embedding-custom-non-visible-data */
      /* todo: remove transformation and use dataset when browser support is there */
      const parameterName = attributeName.substr('data-'.length).replace(/-(\w)(\w+)/g, replace);
      parameters[parameterName] = $(el).attr(attributeName);
    }

    return parameters;
  },
  /**
   * Determines if the view contains a function with the given name
   * @param {String} name Name of function being tested.
   * @param evt
   * @param el
   * @return {Boolean}
   */
  hasAction: function hasAction(name/* , evt, el*/) {
    return (typeof this[name] === 'function');
  },
  /**
   * Calls the given function name in the context of the view passing
   * the {@link #_getParametersForAction parameters gathered} and the event and element.
   * @param {String} name Name of function being invoked.
   * @param {Object} parameters Collection of `data-` attributes from the element.
   * @param {Event} evt The event that fired
   * @param {HTMLElement} el The HTML element that has the `data-action`
   */
  invokeAction: function invokeAction(name, parameters, evt, el) {
    return this[name].apply(this, [parameters, evt, el]);
  },
});

export default __class;
