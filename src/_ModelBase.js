/* Copyright (c) 2014 Infor. All rights reserved.
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
import Evented from 'dojo/Evented';
import Stateful from 'dojo/Stateful';

/**
 * @class argos._ModelBase
 * A base model class for views to consume
 * @alternateClassName _ModelBase
 */
export default declare('argos._ModelBase', [Evented, Stateful], {
  metadata: null,
  app: null,
  entityName: '',
  _appGetter: function _appGetter() {
    return this.app || window.App;
  },
  _appSetter: function _appSetter(value) {
    this.app = value;
  },
  _metadataGetter: function _metadataGetter() {
    return this.metadata;
  },
  _metadataSetter: function _metadataSetter(value) {
    this.metadata = value;
  },
  getEntry: function getEntry(options) { // eslint-disable-line
  },
  createStore: function createStore() {},
});
