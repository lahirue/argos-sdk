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

/**
 * @class Sage.Platform.Mobile._OfflineView
 *
 * Extends view
 *
 * @alternateClassName _OfflineView
**/
define('Sage/Platform/Mobile/OfflineView', [
    'dojo/_base/declare',
     'Sage/Platform/Mobile/_OfflineViewMixin',
     'Sage/Platform/Mobile/View'
], function(
    declare,
    _OfflineViewMixin,
    View
) {
    return declare('Sage.Platform.Mobile.OfflineView', [View, _OfflineViewMixin], {
        id: 'offline_view',
    });
});

