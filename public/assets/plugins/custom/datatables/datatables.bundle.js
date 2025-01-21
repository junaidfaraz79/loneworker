/*! DataTables 2.1.2
 * © SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     2.1.2
 * @author      SpryMedia Ltd
 * @contact     www.datatables.net
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - https://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: https://www.datatables.net
 */

(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		// jQuery's factory checks for a global window - if it isn't present then it
		// returns a factory function that expects the window object
		var jq = require('jquery');

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				return factory( $, root, root.document );
			};
		}
		else {
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		window.DataTable = factory( jQuery, window, document );
	}
}(function( $, window, document ) {
	"use strict";

	
	var DataTable = function ( selector, options )
	{
		// Check if called with a window or jQuery object for DOM less applications
		// This is for backwards compatibility
		if (DataTable.factory(selector, options)) {
			return DataTable;
		}
	
		// When creating with `new`, create a new DataTable, returning the API instance
		if (this instanceof DataTable) {
			return $(selector).DataTable(options);
		}
		else {
			// Argument switching
			options = selector;
		}
	
		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;
	
		if ( emptyInit ) {
			options = {};
		}
	
		// Method to get DT API instance from jQuery object
		this.api = function ()
		{
			return new _Api( this );
		};
	
		this.each(function() {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend( o, options, true ) :
				options;
	
			
			var i=0, iLen;
			var sId = this.getAttribute( 'id' );
			var defaults = DataTable.defaults;
			var $this = $(this);
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, 'Non-table node initialisation ('+this.nodeName+')', 2 );
				return;
			}
			
			$(this).trigger( 'options.dt', oInit );
			
			/* Backwards compatibility for the defaults */
			_fnCompatOpts( defaults );
			_fnCompatCols( defaults.column );
			
			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian( defaults, defaults, true );
			_fnCamelToHungarian( defaults.column, defaults.column, true );
			
			/* Setting up the initialisation object */
			_fnCamelToHungarian( defaults, $.extend( oInit, $this.data() ), true );
			
			
			
			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for ( i=0, iLen=allSettings.length ; i<iLen ; i++ )
			{
				var s = allSettings[i];
			
				/* Base check on table node */
				if (
					s.nTable == this ||
					(s.nTHead && s.nTHead.parentNode == this) ||
					(s.nTFoot && s.nTFoot.parentNode == this)
				) {
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;
			
					if ( emptyInit || bRetrieve )
					{
						return s.oInstance;
					}
					else if ( bDestroy )
					{
						new DataTable.Api(s).destroy();
						break;
					}
					else
					{
						_fnLog( s, 0, 'Cannot reinitialise DataTable', 3 );
						return;
					}
				}
			
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( s.sTableId == this.id )
				{
					allSettings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._unique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"sDestroyWidth": $this[0].style.width,
				"sInstance":     sId,
				"sTableId":      sId,
				colgroup: $('<colgroup>').prependTo(this),
				fastData: function (row, column, type) {
					return _fnGetCellData(oSettings, row, column, type);
				}
			} );
			oSettings.nTable = this;
			oSettings.oInit  = oInit;
			
			allSettings.push( oSettings );
			
			// Make a single API instance available for internal handling
			oSettings.api = new _Api( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $this.dataTable();
			
			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts( oInit );
			
			// If the length menu is given, but the init display length is not, use the length menu
			if ( oInit.aLengthMenu && ! oInit.iDisplayLength )
			{
				oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0])
					? oInit.aLengthMenu[0][0]
					: $.isPlainObject( oInit.aLengthMenu[0] )
						? oInit.aLengthMenu[0].value
						: oInit.aLengthMenu[0];
			}
			
			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend( $.extend( true, {}, defaults ), oInit );
			
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			] );
			_fnMap( oSettings, oInit, [
				"ajax",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"iStateDuration",
				"bSortCellsTop",
				"iTabIndex",
				"sDom",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				"rowId",
				"caption",
				"layout",
				"orderDescReverse",
				[ "iCookieDuration", "iStateDuration" ], // backwards compat
				[ "oSearch", "oPreviousSearch" ],
				[ "aoSearchCols", "aoPreSearchCols" ],
				[ "iDisplayLength", "_iDisplayLength" ]
			] );
			_fnMap( oSettings.oScroll, oInit, [
				[ "sScrollX", "sX" ],
				[ "sScrollXInner", "sXInner" ],
				[ "sScrollY", "sY" ],
				[ "bScrollCollapse", "bCollapse" ]
			] );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback );
			
			oSettings.rowIdFn = _fnGetObjectDataFn( oInit.rowId );
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			var oClasses = oSettings.oClasses;
			
			$.extend( oClasses, DataTable.ext.classes, oInit.oClasses );
			$this.addClass( oClasses.table );
			
			if (! oSettings.oFeatures.bPaginate) {
				oInit.iDisplayStart = 0;
			}
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			var defer = oInit.iDeferLoading;
			if ( defer !== null )
			{
				oSettings.deferLoading = true;
			
				var tmp = Array.isArray(defer);
				oSettings._iRecordsDisplay = tmp ? defer[0] : defer;
				oSettings._iRecordsTotal = tmp ? defer[1] : defer;
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var columnsInit = [];
			var thead = this.getElementsByTagName('thead');
			var initHeaderLayout = _fnDetectHeader( oSettings, thead[0] );
			
			// If we don't have a columns array, then generate one with nulls
			if ( oInit.aoColumns ) {
				columnsInit = oInit.aoColumns;
			}
			else if ( initHeaderLayout.length ) {
				for ( i=0, iLen=initHeaderLayout[0].length ; i<iLen ; i++ ) {
					columnsInit.push( null );
				}
			}
			
			// Add the columns
			for ( i=0, iLen=columnsInit.length ; i<iLen ; i++ ) {
				_fnAddColumn( oSettings );
			}
			
			// Apply the column definitions
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, columnsInit, initHeaderLayout, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			var rowOne = $this.children('tbody').find('tr').eq(0);
			
			if ( rowOne.length ) {
				var a = function ( cell, name ) {
					return cell.getAttribute( 'data-'+name ) !== null ? name : null;
				};
			
				$( rowOne[0] ).children('th, td').each( function (i, cell) {
					var col = oSettings.aoColumns[i];
			
					if (! col) {
						_fnLog( oSettings, 0, 'Incorrect column count', 18 );
					}
			
					if ( col.mData === i ) {
						var sort = a( cell, 'sort' ) || a( cell, 'order' );
						var filter = a( cell, 'filter' ) || a( cell, 'search' );
			
						if ( sort !== null || filter !== null ) {
							col.mData = {
								_:      i+'.display',
								sort:   sort !== null   ? i+'.@data-'+sort   : undefined,
								type:   sort !== null   ? i+'.@data-'+sort   : undefined,
								filter: filter !== null ? i+'.@data-'+filter : undefined
							};
							col._isArrayHost = true;
			
							_fnColumnOptions( oSettings, i );
						}
					}
				} );
			}
			
			// Must be done after everything which can be overridden by the state saving!
			_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState );
			
			var features = oSettings.oFeatures;
			if ( oInit.bStateSave )
			{
				features.bStateSave = true;
			}
			
			// If aaSorting is not defined, then we use the first indicator in asSorting
			// in case that has been altered, so the default sort reflects that option
			if ( oInit.aaSorting === undefined ) {
				var sorting = oSettings.aaSorting;
				for ( i=0, iLen=sorting.length ; i<iLen ; i++ ) {
					sorting[i][1] = oSettings.aoColumns[ i ].asSorting[0];
				}
			}
			
			// Do a first pass on the sorting classes (allows any size changes to be taken into
			// account, and also will apply sorting disabled classes if disabled
			_fnSortingClasses( oSettings );
			
			_fnCallbackReg( oSettings, 'aoDrawCallback', function () {
				if ( oSettings.bSorted || _fnDataSource( oSettings ) === 'ssp' || features.bDeferRender ) {
					_fnSortingClasses( oSettings );
				}
			} );
			
			
			/*
			 * Table HTML init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			var caption = $this.children('caption');
			
			if ( oSettings.caption ) {
				if ( caption.length === 0 ) {
					caption = $('<caption/>').appendTo( $this );
				}
			
				caption.html( oSettings.caption );
			}
			
			// Store the caption side, so we can remove the element from the document
			// when creating the element
			if (caption.length) {
				caption[0]._captionSide = caption.css('caption-side');
				oSettings.captionNode = caption[0];
			}
			
			if ( thead.length === 0 ) {
				thead = $('<thead/>').appendTo($this);
			}
			oSettings.nTHead = thead[0];
			$('tr', thead).addClass(oClasses.thead.row);
			
			var tbody = $this.children('tbody');
			if ( tbody.length === 0 ) {
				tbody = $('<tbody/>').insertAfter(thead);
			}
			oSettings.nTBody = tbody[0];
			
			var tfoot = $this.children('tfoot');
			if ( tfoot.length === 0 ) {
				// If we are a scrolling table, and no footer has been given, then we need to create
				// a tfoot element for the caption element to be appended to
				tfoot = $('<tfoot/>').appendTo($this);
			}
			oSettings.nTFoot = tfoot[0];
			$('tr', tfoot).addClass(oClasses.tfoot.row);
			
			// Copy the data index array
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			// Initialisation complete - table can be drawn
			oSettings.bInitialised = true;
			
			// Language definitions
			var oLanguage = oSettings.oLanguage;
			$.extend( true, oLanguage, oInit.oLanguage );
			
			if ( oLanguage.sUrl ) {
				// Get the language definitions from a file
				$.ajax( {
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function ( json ) {
						_fnCamelToHungarian( defaults.oLanguage, json );
						$.extend( true, oLanguage, json, oSettings.oInit.oLanguage );
			
						_fnCallbackFire( oSettings, null, 'i18n', [oSettings], true);
						_fnInitialise( oSettings );
					},
					error: function () {
						// Error occurred loading language file
						_fnLog( oSettings, 0, 'i18n file loading error', 21 );
			
						// Continue on as best we can
						_fnInitialise( oSettings );
					}
				} );
			}
			else {
				_fnCallbackFire( oSettings, null, 'i18n', [oSettings]);
				_fnInitialise( oSettings );
			}
		} );
		_that = null;
		return this;
	};
	
	
	
	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},
	
	
		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},
	
	
		/**
		 * DataTables build type (expanded by the download builder)
		 *
		 *  @type string
		 */
		builder: "-source-",
	
	
		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",
	
	
		/**
		 * Legacy so v1 plug-ins don't throw js errors on load
		 */
		feature: [],
	
		/**
		 * Feature plug-ins.
		 * 
		 * This is an object of callbacks which provide the features for DataTables
		 * to be initialised via the `layout` option.
		 */
		features: {},
	
	
		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],
	
	
		/**
		 * Selector extensions
		 *
		 * The `selector` option can be used to extend the options available for the
		 * selector modifier options (`selector-modifier` object data type) that
		 * each of the three built in selector types offer (row, column and cell +
		 * their plural counterparts). For example the Select extension uses this
		 * mechanism to provide an option to select only rows, columns and cells
		 * that have been marked as selected by the end user (`{selected: true}`),
		 * which can be used in conjunction with the existing built in selector
		 * options.
		 *
		 * Each property is an array to which functions can be pushed. The functions
		 * take three attributes:
		 *
		 * * Settings object for the host table
		 * * Options object (`selector-modifier` object type)
		 * * Array of selected item indexes
		 *
		 * The return is an array of the resulting item indexes after the custom
		 * selector has been applied.
		 *
		 *  @type object
		 */
		selector: {
			cell: [],
			column: [],
			row: []
		},
	
	
		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},
	
	
		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},
	
	
		renderer: {
			pageButton: {},
			header: {}
		},
	
	
		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},
	
	
		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Automatic column class assignment
			 */
			className: {},
	
			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
		     *  1. `{*}` Data from the column cell to be analysed
		     *  2. `{settings}` DataTables settings object. This can be used to
		     *     perform context specific type detection - for example detection
		     *     based on language settings such as using a comma for a decimal
		     *     place. Generally speaking the options from the settings will not
		     *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! data.substring(1).match(/[0-9]/) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],
	
			/**
			 * Automatic renderer assignment
			 */
			render: {},
	
	
			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},
	
	
			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
		     *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
		     *  1. `{*}` Data to compare to the second parameter
		     *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},
	
		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,
	
	
		//
		// Depreciated
		// The following properties are retained for backwards compatibility only.
		// The should not be used in new projects and will be removed in a future
		// version
		//
	
		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,
	
	
		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};
	
	
	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend( _ext, {
		afnFiltering: _ext.search,
		aTypes:       _ext.type.detect,
		ofnSearch:    _ext.type.search,
		oSort:        _ext.type.order,
		afnSortData:  _ext.order,
		aoFeatures:   _ext.feature,
		oStdClasses:  _ext.classes,
		oPagination:  _ext.pager
	} );
	
	
	$.extend( DataTable.ext.classes, {
		container: 'dt-container',
		empty: {
			row: 'dt-empty'
		},
		info: {
			container: 'dt-info'
		},
		layout: {
			row: 'dt-layout-row',
			cell: 'dt-layout-cell',
			tableRow: 'dt-layout-table',
			tableCell: '',
			start: 'dt-layout-start',
			end: 'dt-layout-end',
			full: 'dt-layout-full'
		},
		length: {
			container: 'dt-length',
			select: 'dt-input'
		},
		order: {
			canAsc: 'dt-orderable-asc',
			canDesc: 'dt-orderable-desc',
			isAsc: 'dt-ordering-asc',
			isDesc: 'dt-ordering-desc',
			none: 'dt-orderable-none',
			position: 'sorting_'
		},
		processing: {
			container: 'dt-processing'
		},
		scrolling: {
			body: 'dt-scroll-body',
			container: 'dt-scroll',
			footer: {
				self: 'dt-scroll-foot',
				inner: 'dt-scroll-footInner'
			},
			header: {
				self: 'dt-scroll-head',
				inner: 'dt-scroll-headInner'
			}
		},
		search: {
			container: 'dt-search',
			input: 'dt-input'
		},
		table: 'dataTable',	
		tbody: {
			cell: '',
			row: ''
		},
		thead: {
			cell: '',
			row: ''
		},
		tfoot: {
			cell: '',
			row: ''
		},
		paging: {
			active: 'current',
			button: 'dt-paging-button',
			container: 'dt-paging',
			disabled: 'disabled'
		}
	} );
	
	
	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */
	
	
	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_row_indexes
	
	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural
	
	var _re_dic = {};
	var _re_new_lines = /[\r\n\u2028]/g;
	var _re_html = /<([^>]*>)/g;
	var _max_str_len = Math.pow(2, 28);
	
	// This is not strict ISO8601 - Date.parse() is quite lax, although
	// implementations differ between browsers.
	var _re_date = /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/;
	
	// Escape regular expression special characters
	var _re_escape_regex = new RegExp( '(\\' + [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ].join('|\\') + ')', 'g' );
	
	// https://en.wikipedia.org/wiki/Foreign_exchange_market
	// - \u20BD - Russian ruble.
	// - \u20a9 - South Korean Won
	// - \u20BA - Turkish Lira
	// - \u20B9 - Indian Rupee
	// - R - Brazil (R$) and South Africa
	// - fr - Swiss Franc
	// - kr - Swedish krona, Norwegian krone and Danish krone
	// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
	// - Ƀ - Bitcoin
	// - Ξ - Ethereum
	//   standards as thousands separators.
	var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;
	
	
	var _empty = function ( d ) {
		return !d || d === true || d === '-' ? true : false;
	};
	
	
	var _intVal = function ( s ) {
		var integer = parseInt( s, 10 );
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};
	
	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function ( num, decimalPoint ) {
		// Cache created regular expressions for speed as this function is called often
		if ( ! _re_dic[ decimalPoint ] ) {
			_re_dic[ decimalPoint ] = new RegExp( _fnEscapeRegex( decimalPoint ), 'g' );
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace( /\./g, '' ).replace( _re_dic[ decimalPoint ], '.' ) :
			num;
	};
	
	
	var _isNumber = function ( d, decimalPoint, formatted, allowEmpty ) {
		var type = typeof d;
		var strType = type === 'string';
	
		if ( type === 'number' || type === 'bigint') {
			return true;
		}
	
		// If empty return immediately so there must be a number if it is a
		// formatted string (this stops the string "k", or "kr", etc being detected
		// as a formatted number for currency
		if ( allowEmpty && _empty( d ) ) {
			return true;
		}
	
		if ( decimalPoint && strType ) {
			d = _numToDecimal( d, decimalPoint );
		}
	
		if ( formatted && strType ) {
			d = d.replace( _re_formatted_numeric, '' );
		}
	
		return !isNaN( parseFloat(d) ) && isFinite( d );
	};
	
	
	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function ( d ) {
		return _empty( d ) || typeof d === 'string';
	};
	
	// Is a string a number surrounded by HTML?
	var _htmlNumeric = function ( d, decimalPoint, formatted, allowEmpty ) {
		if ( allowEmpty && _empty( d ) ) {
			return true;
		}
	
		// input and select strings mean that this isn't just a number
		if (typeof d === 'string' && d.match(/<(input|select)/i)) {
			return null;
		}
	
		var html = _isHtml( d );
		return ! html ?
			null :
			_isNumber( _stripHtml( d ), decimalPoint, formatted, allowEmpty ) ?
				true :
				null;
	};
	
	
	var _pluck = function ( a, prop, prop2 ) {
		var out = [];
		var i=0, ien=a.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[i] && a[i][ prop ] ) {
					out.push( a[i][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[i] ) {
					out.push( a[i][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function ( a, order, prop, prop2 )
	{
		var out = [];
		var i=0, ien=order.length;
	
		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if ( prop2 !== undefined ) {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ][ prop ] ) {
					out.push( a[ order[i] ][ prop ][ prop2 ] );
				}
			}
		}
		else {
			for ( ; i<ien ; i++ ) {
				if ( a[ order[i] ] ) {
					out.push( a[ order[i] ][ prop ] );
				}
			}
		}
	
		return out;
	};
	
	
	var _range = function ( len, start )
	{
		var out = [];
		var end;
	
		if ( start === undefined ) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}
	
		for ( var i=start ; i<end ; i++ ) {
			out.push( i );
		}
	
		return out;
	};
	
	
	var _removeEmpty = function ( a )
	{
		var out = [];
	
		for ( var i=0, ien=a.length ; i<ien ; i++ ) {
			if ( a[i] ) { // careful - will remove all falsy values!
				out.push( a[i] );
			}
		}
	
		return out;
	};
	
	// Replaceable function in api.util
	var _stripHtml = function (input) {
		if (! input) {
			return input;
		}
	
		// Irrelevant check to workaround CodeQL's false positive on the regex
		if (input.length > _max_str_len) {
			throw new Error('Exceeded max str len');
		}
	
		var previous;
	
		input = input.replace(_re_html, ''); // Complete tags
	
		// Safety for incomplete script tag - use do / while to ensure that
		// we get all instances
		do {
			previous = input;
			input = input.replace(/<script/i, '');
		} while (input !== previous);
	
		return previous;
	};
	
	// Replaceable function in api.util
	var _escapeHtml = function ( d ) {
		if (Array.isArray(d)) {
			d = d.join(',');
		}
	
		return typeof d === 'string' ?
			d
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;') :
			d;
	};
	
	// Remove diacritics from a string by decomposing it and then removing
	// non-ascii characters
	var _normalize = function (str, both) {
		if (typeof str !== 'string') {
			return str;
		}
	
		// It is faster to just run `normalize` than it is to check if
		// we need to with a regex!
		var res = str.normalize("NFD");
	
		// Equally, here we check if a regex is needed or not
		return res.length !== str.length
			? (both === true ? str + ' ' : '' ) + res.replace(/[\u0300-\u036f]/g, "")
			: res;
	}
	
	/**
	 * Determine if all values in the array are unique. This means we can short
	 * cut the _unique method at the cost of a single loop. A sorted array is used
	 * to easily check the values.
	 *
	 * @param  {array} src Source array
	 * @return {boolean} true if all unique, false otherwise
	 * @ignore
	 */
	var _areAllUnique = function ( src ) {
		if ( src.length < 2 ) {
			return true;
		}
	
		var sorted = src.slice().sort();
		var last = sorted[0];
	
		for ( var i=1, ien=sorted.length ; i<ien ; i++ ) {
			if ( sorted[i] === last ) {
				return false;
			}
	
			last = sorted[i];
		}
	
		return true;
	};
	
	
	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function ( src )
	{
		if (Array.from && Set) {
			return Array.from(new Set(src));
		}
	
		if ( _areAllUnique( src ) ) {
			return src.slice();
		}
	
		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.app/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien=src.length,
			j, k=0;
	
		again: for ( i=0 ; i<ien ; i++ ) {
			val = src[i];
	
			for ( j=0 ; j<k ; j++ ) {
				if ( out[j] === val ) {
					continue again;
				}
			}
	
			out.push( val );
			k++;
		}
	
		return out;
	};
	
	// Surprisingly this is faster than [].concat.apply
	// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
	var _flatten = function (out, val) {
		if (Array.isArray(val)) {
			for (var i=0 ; i<val.length ; i++) {
				_flatten(out, val[i]);
			}
		}
		else {
			out.push(val);
		}
	
		return out;
	}
	
	// Similar to jQuery's addClass, but use classList.add
	function _addClass(el, name) {
		if (name) {
			name.split(' ').forEach(function (n) {
				if (n) {
					// `add` does deduplication, so no need to check `contains`
					el.classList.add(n);
				}
			});
		}
	}
	
	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Return a string with diacritic characters decomposed
		 * @param {*} mixed Function or string to normalize
		 * @param {*} both Return original string and the normalized string
		 * @returns String or undefined
		 */
		diacritics: function (mixed, both) {
			var type = typeof mixed;
	
			if (type !== 'function') {
				return _normalize(mixed, both);
			}
			_normalize = mixed;
		},
	
		/**
		 * Debounce a function
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		debounce: function ( fn, timeout ) {
			var timer;
	
			return function () {
				var that = this;
				var args = arguments;
	
				clearTimeout(timer);
	
				timer = setTimeout( function () {
					fn.apply(that, args);
				}, timeout || 250 );
			};
		},
	
		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: function ( fn, freq ) {
			var
				frequency = freq !== undefined ? freq : 200,
				last,
				timer;
	
			return function () {
				var
					that = this,
					now  = +new Date(),
					args = arguments;
	
				if ( last && now < last + frequency ) {
					clearTimeout( timer );
	
					timer = setTimeout( function () {
						last = undefined;
						fn.apply( that, args );
					}, frequency );
				}
				else {
					last = now;
					fn.apply( that, args );
				}
			};
		},
	
		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} val string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: function ( val ) {
			return val.replace( _re_escape_regex, '\\$1' );
		},
	
		/**
		 * Create a function that will write to a nested object or array
		 * @param {*} source JSON notation string
		 * @returns Write function
		 */
		set: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				/* Unlike get, only the underscore (global) option is used for for
				 * setting data since we don't know the type here. This is why an object
				 * option is not documented for `mData` (which is read/write), but it is
				 * for `mRender` which is read only.
				 */
				return DataTable.util.set( source._ );
			}
			else if ( source === null ) {
				// Nothing to do when the data source is null
				return function () {};
			}
			else if ( typeof source === 'function' ) {
				return function (data, val, meta) {
					source( data, 'set', val, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				// Like the get, we need to get data from a nested object
				var setData = function (data, val, src) {
					var a = _fnSplitObjNotation( src ), b;
					var aLast = a[a.length-1];
					var arrayNotation, funcNotation, o, innerSrc;
		
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ ) {
						// Protect against prototype pollution
						if (a[i] === '__proto__' || a[i] === 'constructor') {
							throw new Error('Cannot set prototype values');
						}
		
						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);
		
						if ( arrayNotation ) {
							a[i] = a[i].replace(__reArray, '');
							data[ a[i] ] = [];
		
							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice( 0, i+1 );
							innerSrc = b.join('.');
		
							// Traverse each entry in the array setting the properties requested
							if ( Array.isArray( val ) ) {
								for ( var j=0, jLen=val.length ; j<jLen ; j++ ) {
									o = {};
									setData( o, val[j], innerSrc );
									data[ a[i] ].push( o );
								}
							}
							else {
								// We've been asked to save data to an array, but it
								// isn't array data to be saved. Best that can be done
								// is to just save the value.
								data[ a[i] ] = val;
							}
		
							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
						else if ( funcNotation ) {
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[ a[i] ]( val );
						}
		
						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if ( data[ a[i] ] === null || data[ a[i] ] === undefined ) {
							data[ a[i] ] = {};
						}
						data = data[ a[i] ];
					}
		
					// Last item in the input - i.e, the actual set
					if ( aLast.match(__reFn ) ) {
						// Function call
						data = data[ aLast.replace(__reFn, '') ]( val );
					}
					else {
						// If array notation is used, we just want to strip it and use the property name
						// and assign the value. If it isn't used, then we get the result we want anyway
						data[ aLast.replace(__reArray, '') ] = val;
					}
				};
		
				return function (data, val) { // meta is also passed in, but not used
					return setData( data, val, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data, val) { // meta is also passed in, but not used
					data[source] = val;
				};
			}
		},
	
		/**
		 * Create a function that will read nested objects from arrays, based on JSON notation
		 * @param {*} source JSON notation string
		 * @returns Value read
		 */
		get: function ( source ) {
			if ( $.isPlainObject( source ) ) {
				// Build an object of get functions, and wrap them in a single call
				var o = {};
				$.each( source, function (key, val) {
					if ( val ) {
						o[key] = DataTable.util.get( val );
					}
				} );
		
				return function (data, type, row, meta) {
					var t = o[type] || o._;
					return t !== undefined ?
						t(data, type, row, meta) :
						data;
				};
			}
			else if ( source === null ) {
				// Give an empty string for rendering / sorting etc
				return function (data) { // type, row and meta also passed, but not used
					return data;
				};
			}
			else if ( typeof source === 'function' ) {
				return function (data, type, row, meta) {
					return source( data, type, row, meta );
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
				source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var arrayNotation, funcNotation, out, innerSrc;
		
					if ( src !== "" ) {
						var a = _fnSplitObjNotation( src );
		
						for ( var i=0, iLen=a.length ; i<iLen ; i++ ) {
							// Check if we are dealing with special notation
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);
		
							if ( arrayNotation ) {
								// Array notation
								a[i] = a[i].replace(__reArray, '');
		
								// Condition allows simply [] to be passed in
								if ( a[i] !== "" ) {
									data = data[ a[i] ];
								}
								out = [];
		
								// Get the remainder of the nested object to get
								a.splice( 0, i+1 );
								innerSrc = a.join('.');
		
								// Traverse each entry in the array getting the properties requested
								if ( Array.isArray( data ) ) {
									for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
										out.push( fetchData( data[j], type, innerSrc ) );
									}
								}
		
								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
								data = (join==="") ? out : out.join(join);
		
								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
							else if ( funcNotation ) {
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[ a[i] ]();
								continue;
							}
		
							if (data === null || data[ a[i] ] === null) {
								return null;
							}
							else if ( data === undefined || data[ a[i] ] === undefined ) {
								return undefined;
							}
	
							data = data[ a[i] ];
						}
					}
		
					return data;
				};
		
				return function (data, type) { // row and meta also passed, but not used
					return fetchData( data, type, source );
				};
			}
			else {
				// Array or flat object mapping
				return function (data) { // row and meta also passed, but not used
					return data[source];
				};
			}
		},
	
		stripHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_stripHtml = mixed;
				return;
			}
			else if (type === 'string') {
				return _stripHtml(mixed);
			}
			return mixed;
		},
	
		escapeHtml: function (mixed) {
			var type = typeof mixed;
	
			if (type === 'function') {
				_escapeHtml = mixed;
				return;
			}
			else if (type === 'string' || Array.isArray(mixed)) {
				return _escapeHtml(mixed);
			}
			return mixed;
		},
	
		unique: _unique
	};
	
	
	
	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap ( o )
	{
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};
	
		$.each( o, function (key) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);
	
			if ( match && hungarian.indexOf(match[1]+' ') !== -1 )
			{
				newKey = key.replace( match[0], match[2].toLowerCase() );
				map[ newKey ] = key;
	
				if ( match[1] === 'o' )
				{
					_fnHungarianMap( o[key] );
				}
			}
		} );
	
		o._hungarianMap = map;
	}
	
	
	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian ( src, user, force )
	{
		if ( ! src._hungarianMap ) {
			_fnHungarianMap( src );
		}
	
		var hungarianKey;
	
		$.each( user, function (key) {
			hungarianKey = src._hungarianMap[ key ];
	
			if ( hungarianKey !== undefined && (force || user[hungarianKey] === undefined) )
			{
				// For objects, we need to buzz down into the object to copy parameters
				if ( hungarianKey.charAt(0) === 'o' )
				{
					// Copy the camelCase options over to the hungarian
					if ( ! user[ hungarianKey ] ) {
						user[ hungarianKey ] = {};
					}
					$.extend( true, user[hungarianKey], user[key] );
	
					_fnCamelToHungarian( src[hungarianKey], user[hungarianKey], force );
				}
				else {
					user[hungarianKey] = user[ key ];
				}
			}
		} );
	}
	
	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function ( o, knew, old ) {
		if ( o[ knew ] !== undefined ) {
			o[ old ] = o[ knew ];
		}
	};
	
	
	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts ( init )
	{
		_fnCompatMap( init, 'ordering',      'bSort' );
		_fnCompatMap( init, 'orderMulti',    'bSortMulti' );
		_fnCompatMap( init, 'orderClasses',  'bSortClasses' );
		_fnCompatMap( init, 'orderCellsTop', 'bSortCellsTop' );
		_fnCompatMap( init, 'order',         'aaSorting' );
		_fnCompatMap( init, 'orderFixed',    'aaSortingFixed' );
		_fnCompatMap( init, 'paging',        'bPaginate' );
		_fnCompatMap( init, 'pagingType',    'sPaginationType' );
		_fnCompatMap( init, 'pageLength',    'iDisplayLength' );
		_fnCompatMap( init, 'searching',     'bFilter' );
	
		// Boolean initialisation of x-scrolling
		if ( typeof init.sScrollX === 'boolean' ) {
			init.sScrollX = init.sScrollX ? '100%' : '';
		}
		if ( typeof init.scrollX === 'boolean' ) {
			init.scrollX = init.scrollX ? '100%' : '';
		}
	
		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;
	
		if ( searchCols ) {
			for ( var i=0, ien=searchCols.length ; i<ien ; i++ ) {
				if ( searchCols[i] ) {
					_fnCamelToHungarian( DataTable.models.oSearch, searchCols[i] );
				}
			}
		}
	
		// Enable search delay if server-side processing is enabled
		if (init.serverSide && ! init.searchDelay) {
			init.searchDelay = 400;
		}
	}
	
	
	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols ( init )
	{
		_fnCompatMap( init, 'orderable',     'bSortable' );
		_fnCompatMap( init, 'orderData',     'aDataSort' );
		_fnCompatMap( init, 'orderSequence', 'asSorting' );
		_fnCompatMap( init, 'orderDataType', 'sortDataType' );
	
		// orderData can be given as an integer
		var dataSort = init.aDataSort;
		if ( typeof dataSort === 'number' && ! Array.isArray( dataSort ) ) {
			init.aDataSort = [ dataSort ];
		}
	}
	
	
	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect( settings )
	{
		// We don't need to do this every time DataTables is constructed, the values
		// calculated are specific to the browser and OS configuration which we
		// don't expect to change between initialisations
		if ( ! DataTable.__browser ) {
			var browser = {};
			DataTable.__browser = browser;
	
			// Scrolling feature / quirks detection
			var n = $('<div/>')
				.css( {
					position: 'fixed',
					top: 0,
					left: -1 * window.pageXOffset, // allow for scrolling
					height: 1,
					width: 1,
					overflow: 'hidden'
				} )
				.append(
					$('<div/>')
						.css( {
							position: 'absolute',
							top: 1,
							left: 1,
							width: 100,
							overflow: 'scroll'
						} )
						.append(
							$('<div/>')
								.css( {
									width: '100%',
									height: 10
								} )
						)
				)
				.appendTo( 'body' );
	
			var outer = n.children();
			var inner = outer.children();
	
			// Get scrollbar width
			browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;
	
			// In rtl text layout, some browsers (most, but not all) will place the
			// scrollbar on the left, rather than the right.
			browser.bScrollbarLeft = Math.round( inner.offset().left ) !== 1;
	
			n.remove();
		}
	
		$.extend( settings.oBrowser, DataTable.__browser );
		settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
	}
	
	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn( oSettings )
	{
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol,
			searchFixed: {},
			colEl: $('<col>').attr('data-dt-column', iCol)
		} );
		oSettings.aoColumns.push( oCol );
	
		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch, searchCols[ iCol ] );
	}
	
	
	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions( oSettings, iCol, oOptions )
	{
		var oCol = oSettings.aoColumns[ iCol ];
	
		/* User specified column options */
		if ( oOptions !== undefined && oOptions !== null )
		{
			// Backwards compatibility
			_fnCompatCols( oOptions );
	
			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian( DataTable.defaults.column, oOptions, true );
	
			/* Backwards compatibility for mDataProp */
			if ( oOptions.mDataProp !== undefined && !oOptions.mData )
			{
				oOptions.mData = oOptions.mDataProp;
			}
	
			if ( oOptions.sType )
			{
				oCol._sManualType = oOptions.sType;
			}
		
			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if ( oOptions.className && ! oOptions.sClass )
			{
				oOptions.sClass = oOptions.className;
			}
	
			var origClass = oCol.sClass;
	
			$.extend( oCol, oOptions );
			_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
	
			// Merge class from previously defined classes with this one, rather than just
			// overwriting it in the extend above
			if (origClass !== oCol.sClass) {
				oCol.sClass = origClass + ' ' + oCol.sClass;
			}
	
			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if ( oOptions.iDataSort !== undefined )
			{
				oCol.aDataSort = [ oOptions.iDataSort ];
			}
			_fnMap( oCol, oOptions, "aDataSort" );
		}
	
		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn( mDataSrc );
	
		// The `render` option can be given as an array to access the helper rendering methods.
		// The first element is the rendering method to use, the rest are the parameters to pass
		if ( oCol.mRender && Array.isArray( oCol.mRender ) ) {
			var copy = oCol.mRender.slice();
			var name = copy.shift();
	
			oCol.mRender = DataTable.render[name].apply(window, copy);
		}
	
		oCol._render = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
	
		var attrTest = function( src ) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject( mDataSrc ) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
		oCol._setter = null;
	
		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData( rowData, type, undefined, meta );
	
			return oCol._render && type ?
				oCol._render( innerData, type, rowData, meta ) :
				innerData;
		};
		oCol.fnSetData = function ( rowData, val, meta ) {
			return _fnSetObjectDataFn( mDataSrc )( rowData, val, meta );
		};
	
		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if ( typeof mDataSrc !== 'number' && ! oCol._isArrayHost ) {
			oSettings._rowReadObject = true;
		}
	
		/* Feature sorting overrides column specific when off */
		if ( !oSettings.oFeatures.bSort )
		{
			oCol.bSortable = false;
		}
	}
	
	
	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing ( settings )
	{
		_fnCalculateColumnWidths( settings );
		_fnColumnSizes( settings );
	
		var scroll = settings.oScroll;
		if ( scroll.sY !== '' || scroll.sX !== '') {
			_fnScrollDraw( settings );
		}
	
		_fnCallbackFire( settings, null, 'column-sizing', [settings] );
	}
	
	/**
	 * Apply column sizes
	 *
	 * @param {*} settings DataTables settings object
	 */
	function _fnColumnSizes ( settings )
	{
		var cols = settings.aoColumns;
	
		for (var i=0 ; i<cols.length ; i++) {
			var width = _fnColumnsSumWidth(settings, [i], false, false);
	
			cols[i].colEl.css('width', width);
		}
	}
	
	
	/**
	 * Convert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
	
		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}
	
	
	/**
	 * Convert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible( oSettings, iMatch )
	{
		var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		var iPos = aiVis.indexOf(iMatch);
	
		return iPos !== -1 ? iPos : null;
	}
	
	
	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns( settings )
	{
		var layout = settings.aoHeader;
		var columns = settings.aoColumns;
		var vis = 0;
	
		if ( layout.length ) {
			for ( var i=0, ien=layout[0].length ; i<ien ; i++ ) {
				if ( columns[i].bVisible && $(layout[0][i].cell).css('display') !== 'none' ) {
					vis++;
				}
			}
		}
	
		return vis;
	}
	
	
	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns( oSettings, sParam )
	{
		var a = [];
	
		oSettings.aoColumns.map( function(val, i) {
			if ( val[sParam] ) {
				a.push( i );
			}
		} );
	
		return a;
	}
	
	/**
	 * Allow the result from a type detection function to be `true` while
	 * translating that into a string. Old type detection functions will
	 * return the type name if it passes. An obect store would be better,
	 * but not backwards compatible.
	 *
	 * @param {*} typeDetect Object or function for type detection
	 * @param {*} res Result from the type detection function
	 * @returns Type name or false
	 */
	function _typeResult (typeDetect, res) {
		return res === true
			? typeDetect.name
			: res;
	}
	
	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, detectedType, cache;
	
		// If SSP then we don't have the full data set, so any type detection would be
		// unreliable and error prone
		if (_fnDataSource( settings ) === 'ssp') {
			return;
		}
	
		// For each column, spin over the data type detection functions, seeing if one matches
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			col = columns[i];
			cache = [];
	
			if ( ! col.sType && col._sManualType ) {
				col.sType = col._sManualType;
			}
			else if ( ! col.sType ) {
				for ( j=0, jen=types.length ; j<jen ; j++ ) {
					var typeDetect = types[j];
	
					// There can be either one, or three type detection functions
					var oneOf = typeDetect.oneOf;
					var allOf = typeDetect.allOf || typeDetect;
					var init = typeDetect.init;
					var one = false;
	
					detectedType = null;
	
					// Fast detect based on column assignment
					if (init) {
						detectedType = _typeResult(typeDetect, init(settings, col, i));
	
						if (detectedType) {
							col.sType = detectedType;
							break;
						}
					}
	
					for ( k=0, ken=data.length ; k<ken ; k++ ) {
						if (! data[k]) {
							continue;
						}
	
						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if ( cache[k] === undefined ) {
							cache[k] = _fnGetCellData( settings, k, i, 'type' );
						}
	
						// Only one data point in the column needs to match this function
						if (oneOf && ! one) {
							one = _typeResult(typeDetect, oneOf( cache[k], settings ));
						}
	
						// All data points need to match this function
						detectedType = _typeResult(typeDetect, allOf( cache[k], settings ));
	
						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if ( ! detectedType && j !== types.length-3 ) {
							break;
						}
	
						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string - but it
						// must not be empty
						if ( detectedType === 'html' && ! _empty(cache[k]) ) {
							break;
						}
					}
	
					// Type is valid for all data points in the column - use this
					// type
					if ( (oneOf && one && detectedType) || (!oneOf && detectedType) ) {
						col.sType = detectedType;
						break;
					}
				}
	
				// Fall back - if no type was detected, always use string
				if ( ! col.sType ) {
					col.sType = 'string';
				}
			}
	
			// Set class names for header / footer for auto type classes
			var autoClass = _ext.type.className[col.sType];
	
			if (autoClass) {
				_columnAutoClass(settings.aoHeader, i, autoClass);
				_columnAutoClass(settings.aoFooter, i, autoClass);
			}
	
			var renderer = _ext.type.render[col.sType];
	
			// This can only happen once! There is no way to remove
			// a renderer. After the first time the renderer has
			// already been set so createTr will run the renderer itself.
			if (renderer && ! col._render) {
				col._render = DataTable.util.get(renderer);
	
				_columnAutoRender(settings, i);
			}
		}
	}
	
	/**
	 * Apply an auto detected renderer to data which doesn't yet have
	 * a renderer
	 */
	function _columnAutoRender(settings, colIdx) {
		var data = settings.aoData;
	
		for (var i=0 ; i<data.length ; i++) {
			if (data[i].nTr) {
				// We have to update the display here since there is no
				// invalidation check for the data
				var display = _fnGetCellData( settings, i, colIdx, 'display' );
	
				data[i].displayData[colIdx] = display;
				_fnWriteCell(data[i].anCells[colIdx], display);
	
				// No need to update sort / filter data since it has
				// been invalidated and will be re-read with the
				// renderer now applied
			}
		}
	}
	
	/**
	 * Apply a class name to a column's header cells
	 */
	function _columnAutoClass(container, colIdx, className) {
		container.forEach(function (row) {
			if (row[colIdx] && row[colIdx].unique) {
				_addClass(row[colIdx].cell, className);
			}
		});
	}
	
	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {array} headerLayout Layout for header as it was loaded
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, headerLayout, fn )
	{
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;
	
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				if (aoCols[i] && aoCols[i].name) {
					columns[i].sName = aoCols[i].name;
				}
			}
		}
	
		// Column definitions with aTargets
		if ( aoColDefs )
		{
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
			{
				def = aoColDefs[i];
	
				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.target !== undefined
					? def.target
					: def.targets !== undefined
						? def.targets
						: def.aTargets;
	
				if ( ! Array.isArray( aTargets ) )
				{
					aTargets = [ aTargets ];
				}
	
				for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
				{
					var target = aTargets[j];
	
					if ( typeof target === 'number' && target >= 0 )
					{
						/* Add columns that we don't yet know about */
						while( columns.length <= target )
						{
							_fnAddColumn( oSettings );
						}
	
						/* Integer, basic index */
						fn( target, def );
					}
					else if ( typeof target === 'number' && target < 0 )
					{
						/* Negative integer, right to left column counting */
						fn( columns.length+target, def );
					}
					else if ( typeof target === 'string' )
					{
						for ( k=0, kLen=columns.length ; k<kLen ; k++ ) {
							if (target === '_all') {
								// Apply to all columns
								fn( k, def );
							}
							else if (target.indexOf(':name') !== -1) {
								// Column selector
								if (columns[k].sName === target.replace(':name', '')) {
									fn( k, def );
								}
							}
							else {
								// Cell selector
								headerLayout.forEach(function (row) {
									if (row[k]) {
										var cell = $(row[k].cell);
	
										// Legacy support. Note that it means that we don't support
										// an element name selector only, since they are treated as
										// class names for 1.x compat.
										if (target.match(/^[a-z][\w-]*$/i)) {
											target = '.' + target;
										}
	
										if (cell.is( target )) {
											fn( k, def );
										}
									}
								});
							}
						}
					}
				}
			}
		}
	
		// Statically defined columns array
		if ( aoCols ) {
			for ( i=0, iLen=aoCols.length ; i<iLen ; i++ ) {
				fn( i, aoCols[i] );
			}
		}
	}
	
	
	/**
	 * Get the width for a given set of columns
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} targets Columns - comma separated string or array of numbers
	 * @param {*} original Use the original width (true) or calculated (false)
	 * @param {*} incVisible Include visible columns (true) or not (false)
	 * @returns Combined CSS value
	 */
	function _fnColumnsSumWidth( settings, targets, original, incVisible ) {
		if ( ! Array.isArray( targets ) ) {
			targets = _fnColumnsFromHeader( targets );
		}
	
		var sum = 0;
		var unit;
		var columns = settings.aoColumns;
		
		for ( var i=0, ien=targets.length ; i<ien ; i++ ) {
			var column = columns[ targets[i] ];
			var definedWidth = original ?
				column.sWidthOrig :
				column.sWidth;
	
			if ( ! incVisible && column.bVisible === false ) {
				continue;
			}
	
			if ( definedWidth === null || definedWidth === undefined ) {
				return null; // can't determine a defined width - browser defined
			}
			else if ( typeof definedWidth === 'number' ) {
				unit = 'px';
				sum += definedWidth;
			}
			else {
				var matched = definedWidth.match(/([\d\.]+)([^\d]*)/);
	
				if ( matched ) {
					sum += matched[1] * 1;
					unit = matched.length === 3 ?
						matched[2] :
						'px';
				}
			}
		}
	
		return sum + unit;
	}
	
	function _fnColumnsFromHeader( cell )
	{
		var attr = $(cell).closest('[data-dt-column]').attr('data-dt-column');
	
		if ( ! attr ) {
			return [];
		}
	
		return attr.split(',').map( function (val) {
			return val * 1;
		} );
	}
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} settings dataTables settings object
	 *  @param {array} data data array to be added
	 *  @param {node} [tr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [tds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData ( settings, dataIn, tr, tds )
	{
		/* Create the object for storing information about this new row */
		var rowIdx = settings.aoData.length;
		var rowModel = $.extend( true, {}, DataTable.models.oRow, {
			src: tr ? 'dom' : 'data',
			idx: rowIdx
		} );
	
		rowModel._aData = dataIn;
		settings.aoData.push( rowModel );
	
		var columns = settings.aoColumns;
	
		for ( var i=0, iLen=columns.length ; i<iLen ; i++ )
		{
			// Invalidate the column types as the new data needs to be revalidated
			columns[i].sType = null;
		}
	
		/* Add to the display array */
		settings.aiDisplayMaster.push( rowIdx );
	
		var id = settings.rowIdFn( dataIn );
		if ( id !== undefined ) {
			settings.aIds[ id ] = rowModel;
		}
	
		/* Create the DOM information, or register it if already present */
		if ( tr || ! settings.oFeatures.bDeferRender )
		{
			_fnCreateTr( settings, rowIdx, tr, tds );
		}
	
		return rowIdx;
	}
	
	
	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr( settings, trs )
	{
		var row;
	
		// Allow an individual node to be passed in
		if ( ! (trs instanceof $) ) {
			trs = $(trs);
		}
	
		return trs.map( function (i, el) {
			row = _fnGetRowElements( settings, el );
			return _fnAddData( settings, row.data, el, row.cells );
		} );
	}
	
	
	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter|search' 'sort|order')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData( settings, rowIdx, colIdx, type )
	{
		if (type === 'search') {
			type = 'filter';
		}
		else if (type === 'order') {
			type = 'sort';
		}
	
		var row = settings.aoData[rowIdx];
	
		if (! row) {
			return undefined;
		}
	
		var draw           = settings.iDraw;
		var col            = settings.aoColumns[colIdx];
		var rowData        = row._aData;
		var defaultContent = col.sDefaultContent;
		var cellData       = col.fnGetData( rowData, type, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		} );
	
		// Allow for a node being returned for non-display types
		if (type !== 'display' && cellData && typeof cellData === 'object' && cellData.nodeName) {
			cellData = cellData.innerHTML;
		}
	
		if ( cellData === undefined ) {
			if ( settings.iDrawError != draw && defaultContent === null ) {
				_fnLog( settings, 0, "Requested unknown parameter "+
					(typeof col.mData=='function' ? '{function}' : "'"+col.mData+"'")+
					" for row "+rowIdx+", column "+colIdx, 4 );
				settings.iDrawError = draw;
			}
			return defaultContent;
		}
	
		// When the data source is null and a specific data type is requested (i.e.
		// not the original data), we can use default column data
		if ( (cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined ) {
			cellData = defaultContent;
		}
		else if ( typeof cellData === 'function' ) {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call( rowData );
		}
	
		if ( cellData === null && type === 'display' ) {
			return '';
		}
	
		if ( type === 'filter' ) {
			var fomatters = DataTable.ext.type.search;
	
			if ( fomatters[ col.sType ] ) {
				cellData = fomatters[ col.sType ]( cellData );
			}
		}
	
		return cellData;
	}
	
	
	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData( settings, rowIdx, colIdx, val )
	{
		var col     = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;
	
		col.fnSetData( rowData, val, {
			settings: settings,
			row:      rowIdx,
			col:      colIdx
		}  );
	}
	
	/**
	 * Write a value to a cell
	 * @param {*} td Cell
	 * @param {*} val Value
	 */
	function _fnWriteCell(td, val)
	{
		if (val && typeof val === 'object' && val.nodeName) {
			$(td)
				.empty()
				.append(val);
		}
		else {
			td.innerHTML = val;
		}
	}
	
	
	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;
	
	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation( str )
	{
		var parts = str.match(/(\\.|[^.])+/g) || [''];
	
		return parts.map( function ( s ) {
			return s.replace(/\\\./g, '.');
		} );
	}
	
	
	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	var _fnGetObjectDataFn = DataTable.util.get;
	
	
	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	var _fnSetObjectDataFn = DataTable.util.set;
	
	
	/**
	 * Return an array with the full table data
	 *  @param {object} oSettings dataTables settings object
	 *  @returns array {array} aData Master data array
	 *  @memberof DataTable#oApi
	 */
	function _fnGetDataMaster ( settings )
	{
		return _pluck( settings.aoData, '_aData' );
	}
	
	
	/**
	 * Nuke the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnClearTable( settings )
	{
		settings.aoData.length = 0;
		settings.aiDisplayMaster.length = 0;
		settings.aiDisplay.length = 0;
		settings.aIds = {};
	}
	
	
	/**
	 * Mark cached data as invalid such that a re-read of the data will occur when
	 * the cached data is next requested. Also update from the data source object.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {int}    rowIdx   Row index to invalidate
	 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
	 *     or 'data'
	 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
	 *     row will be invalidated
	 * @memberof DataTable#oApi
	 *
	 * @todo For the modularisation of v1.11 this will need to become a callback, so
	 *   the sort and filter methods can subscribe to it. That will required
	 *   initialisation options for sorting, which is why it is not already baked in
	 */
	function _fnInvalidate( settings, rowIdx, src, colIdx )
	{
		var row = settings.aoData[ rowIdx ];
		var i, ien;
	
		// Remove the cached data for the row
		row._aSortData = null;
		row._aFilterData = null;
		row.displayData = null;
	
		// Are we reading last data from DOM or the data object?
		if ( src === 'dom' || ((! src || src === 'auto') && row.src === 'dom') ) {
			// Read the data from the DOM
			row._aData = _fnGetRowElements(
					settings, row, colIdx, colIdx === undefined ? undefined : row._aData
				)
				.data;
		}
		else {
			// Reading from data object, update the DOM
			var cells = row.anCells;
			var display = _fnGetRowDisplay(settings, rowIdx);
	
			if ( cells ) {
				if ( colIdx !== undefined ) {
					_fnWriteCell(cells[colIdx], display[colIdx]);
				}
				else {
					for ( i=0, ien=cells.length ; i<ien ; i++ ) {
						_fnWriteCell(cells[i], display[i]);
					}
				}
			}
		}
	
		// Column specific invalidation
		var cols = settings.aoColumns;
		if ( colIdx !== undefined ) {
			// Type - the data might have changed
			cols[ colIdx ].sType = null;
	
			// Max length string. Its a fairly cheep recalculation, so not worth
			// something more complicated
			cols[ colIdx ].maxLenString = null;
		}
		else {
			for ( i=0, ien=cols.length ; i<ien ; i++ ) {
				cols[i].sType = null;
				cols[i].maxLenString = null;
			}
	
			// Update DataTables special `DT_*` attributes for the row
			_fnRowAttributes( settings, row );
		}
	}
	
	
	/**
	 * Build a data source object from an HTML row, reading the contents of the
	 * cells that are in the row.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {node|object} TR element from which to read data or existing row
	 *   object from which to re-read the data from the cells
	 * @param {int} [colIdx] Optional column index
	 * @param {array|object} [d] Data source object. If `colIdx` is given then this
	 *   parameter should also be given and will be used to write the data into.
	 *   Only the column in question will be written
	 * @returns {object} Object with two parameters: `data` the data read, in
	 *   document order, and `cells` and array of nodes (they can be useful to the
	 *   caller, so rather than needing a second traversal to get them, just return
	 *   them from here).
	 * @memberof DataTable#oApi
	 */
	function _fnGetRowElements( settings, row, colIdx, d )
	{
		var
			tds = [],
			td = row.firstChild,
			name, col, i=0, contents,
			columns = settings.aoColumns,
			objectRead = settings._rowReadObject;
	
		// Allow the data object to be passed in, or construct
		d = d !== undefined ?
			d :
			objectRead ?
				{} :
				[];
	
		var attr = function ( str, td  ) {
			if ( typeof str === 'string' ) {
				var idx = str.indexOf('@');
	
				if ( idx !== -1 ) {
					var attr = str.substring( idx+1 );
					var setter = _fnSetObjectDataFn( str );
					setter( d, td.getAttribute( attr ) );
				}
			}
		};
	
		// Read data from a cell and store into the data object
		var cellProcess = function ( cell ) {
			if ( colIdx === undefined || colIdx === i ) {
				col = columns[i];
				contents = (cell.innerHTML).trim();
	
				if ( col && col._bAttrSrc ) {
					var setter = _fnSetObjectDataFn( col.mData._ );
					setter( d, contents );
	
					attr( col.mData.sort, cell );
					attr( col.mData.type, cell );
					attr( col.mData.filter, cell );
				}
				else {
					// Depending on the `data` option for the columns the data can
					// be read to either an object or an array.
					if ( objectRead ) {
						if ( ! col._setter ) {
							// Cache the setter function
							col._setter = _fnSetObjectDataFn( col.mData );
						}
						col._setter( d, contents );
					}
					else {
						d[i] = contents;
					}
				}
			}
	
			i++;
		};
	
		if ( td ) {
			// `tr` element was passed in
			while ( td ) {
				name = td.nodeName.toUpperCase();
	
				if ( name == "TD" || name == "TH" ) {
					cellProcess( td );
					tds.push( td );
				}
	
				td = td.nextSibling;
			}
		}
		else {
			// Existing row object passed in
			tds = row.anCells;
	
			for ( var j=0, jen=tds.length ; j<jen ; j++ ) {
				cellProcess( tds[j] );
			}
		}
	
		// Read the ID from the DOM if present
		var rowNode = row.firstChild ? row : row.nTr;
	
		if ( rowNode ) {
			var id = rowNode.getAttribute( 'id' );
	
			if ( id ) {
				_fnSetObjectDataFn( settings.rowId )( d, id );
			}
		}
	
		return {
			data: d,
			cells: tds
		};
	}
	
	/**
	 * Render and cache a row's display data for the columns, if required
	 * @returns 
	 */
	function _fnGetRowDisplay (settings, rowIdx) {
		let rowModal = settings.aoData[rowIdx];
		let columns = settings.aoColumns;
	
		if (! rowModal.displayData) {
			// Need to render and cache
			rowModal.displayData = [];
		
			for ( var colIdx=0, len=columns.length ; colIdx<len ; colIdx++ ) {
				rowModal.displayData.push(
					_fnGetCellData( settings, rowIdx, colIdx, 'display' )
				);
			}
		}
	
		return rowModal.displayData;
	}
	
	/**
	 * Create a new TR element (and it's TD children) for a row
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow Row to consider
	 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @memberof DataTable#oApi
	 */
	function _fnCreateTr ( oSettings, iRow, nTrIn, anTds )
	{
		var
			row = oSettings.aoData[iRow],
			rowData = row._aData,
			cells = [],
			nTr, nTd, oCol,
			i, iLen, create,
			trClass = oSettings.oClasses.tbody.row;
	
		if ( row.nTr === null )
		{
			nTr = nTrIn || document.createElement('tr');
	
			row.nTr = nTr;
			row.anCells = cells;
	
			_addClass(nTr, trClass);
	
			/* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
			nTr._DT_RowIndex = iRow;
	
			/* Special parameters can be given by the data source to be used on the row */
			_fnRowAttributes( oSettings, row );
	
			/* Process each column */
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];
				create = nTrIn && anTds[i] ? false : true;
	
				nTd = create ? document.createElement( oCol.sCellType ) : anTds[i];
	
				if (! nTd) {
					_fnLog( oSettings, 0, 'Incorrect column count', 18 );
				}
	
				nTd._DT_CellIndex = {
					row: iRow,
					column: i
				};
				
				cells.push( nTd );
				
				var display = _fnGetRowDisplay(oSettings, iRow);
	
				// Need to create the HTML if new, or if a rendering function is defined
				if (
					create ||
					(
						(oCol.mRender || oCol.mData !== i) &&
						(!$.isPlainObject(oCol.mData) || oCol.mData._ !== i+'.display')
					)
				) {
					_fnWriteCell(nTd, display[i]);
				}
	
				// Visibility - add or remove as required
				if ( oCol.bVisible && create )
				{
					nTr.appendChild( nTd );
				}
				else if ( ! oCol.bVisible && ! create )
				{
					nTd.parentNode.removeChild( nTd );
				}
	
				if ( oCol.fnCreatedCell )
				{
					oCol.fnCreatedCell.call( oSettings.oInstance,
						nTd, _fnGetCellData( oSettings, iRow, i ), rowData, iRow, i
					);
				}
			}
	
			_fnCallbackFire( oSettings, 'aoRowCreatedCallback', 'row-created', [nTr, rowData, iRow, cells] );
		}
		else {
			_addClass(row.nTr, trClass);
		}
	}
	
	
	/**
	 * Add attributes to a row based on the special `DT_*` parameters in a data
	 * source object.
	 *  @param {object} settings DataTables settings object
	 *  @param {object} DataTables row object for the row to be modified
	 *  @memberof DataTable#oApi
	 */
	function _fnRowAttributes( settings, row )
	{
		var tr = row.nTr;
		var data = row._aData;
	
		if ( tr ) {
			var id = settings.rowIdFn( data );
	
			if ( id ) {
				tr.id = id;
			}
	
			if ( data.DT_RowClass ) {
				// Remove any classes added by DT_RowClass before
				var a = data.DT_RowClass.split(' ');
				row.__rowc = row.__rowc ?
					_unique( row.__rowc.concat( a ) ) :
					a;
	
				$(tr)
					.removeClass( row.__rowc.join(' ') )
					.addClass( data.DT_RowClass );
			}
	
			if ( data.DT_RowAttr ) {
				$(tr).attr( data.DT_RowAttr );
			}
	
			if ( data.DT_RowData ) {
				$(tr).data( data.DT_RowData );
			}
		}
	}
	
	
	/**
	 * Create the HTML header for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBuildHead( settings, side )
	{
		var classes = settings.oClasses;
		var columns = settings.aoColumns;
		var i, ien, row;
		var target = side === 'header'
			? settings.nTHead
			: settings.nTFoot;
		var titleProp = side === 'header' ? 'sTitle' : side;
	
		// Footer might be defined
		if (! target) {
			return;
		}
	
		// If no cells yet and we have content for them, then create
		if (side === 'header' || _pluck(settings.aoColumns, titleProp).join('')) {
			row = $('tr', target);
	
			// Add a row if needed
			if (! row.length) {
				row = $('<tr/>').appendTo(target)
			}
	
			// Add the number of cells needed to make up to the number of columns
			if (row.length === 1) {
				var cells = $('td, th', row);
	
				for ( i=cells.length, ien=columns.length ; i<ien ; i++ ) {
					$('<th/>')
						.html( columns[i][titleProp] || '' )
						.appendTo( row );
				}
			}
		}
	
		var detected = _fnDetectHeader( settings, target, true );
	
		if (side === 'header') {
			settings.aoHeader = detected;
		}
		else {
			settings.aoFooter = detected;
		}
	
		// ARIA role for the rows
		$(target).children('tr').attr('role', 'row');
	
		// Every cell needs to be passed through the renderer
		$(target).children('tr').children('th, td')
			.each( function () {
				_fnRenderer( settings, side )(
					settings, $(this), classes
				);
			} );
	}
	
	/**
	 * Build a layout structure for a header or footer
	 *
	 * @param {*} settings DataTables settings
	 * @param {*} source Source layout array
	 * @param {*} incColumns What columns should be included
	 * @returns Layout array
	 */
	function _fnHeaderLayout( settings, source, incColumns )
	{
		var row, column, cell;
		var local = [];
		var structure = [];
		var columns = settings.aoColumns;
		var columnCount = columns.length;
		var rowspan, colspan;
	
		if ( ! source ) {
			return;
		}
	
		// Default is to work on only visible columns
		if ( ! incColumns ) {
			incColumns = _range(columnCount)
				.filter(function (idx) {
					return columns[idx].bVisible;
				});
		}
	
		// Make a copy of the master layout array, but with only the columns we want
		for ( row=0 ; row<source.length ; row++ ) {
			// Remove any columns we haven't selected
			local[row] = source[row].slice().filter(function (cell, i) {
				return incColumns.includes(i);
			});
	
			// Prep the structure array - it needs an element for each row
			structure.push( [] );
		}
	
		for ( row=0 ; row<local.length ; row++ ) {
			for ( column=0 ; column<local[row].length ; column++ ) {
				rowspan = 1;
				colspan = 1;
	
				// Check to see if there is already a cell (row/colspan) covering our target
				// insert point. If there is, then there is nothing to do.
				if ( structure[row][column] === undefined ) {
					cell = local[row][column].cell;
	
					// Expand for rowspan
					while (
						local[row+rowspan] !== undefined &&
						local[row][column].cell == local[row+rowspan][column].cell
					) {
						structure[row+rowspan][column] = null;
						rowspan++;
					}
	
					// And for colspan
					while (
						local[row][column+colspan] !== undefined &&
						local[row][column].cell == local[row][column+colspan].cell
					) {
						// Which also needs to go over rows
						for ( var k=0 ; k<rowspan ; k++ ) {
							structure[row+k][column+colspan] = null;
						}
	
						colspan++;
					}
	
					var titleSpan = $('span.dt-column-title', cell);
	
					structure[row][column] = {
						cell: cell,
						colspan: colspan,
						rowspan: rowspan,
						title: titleSpan.length
							? titleSpan.html()
							: $(cell).html()
					};
				}
			}
		}
	
		return structure;
	}
	
	
	/**
	 * Draw the header (or footer) element based on the column visibility states.
	 *
	 *  @param object oSettings dataTables settings object
	 *  @param array aoSource Layout array from _fnDetectHeader
	 *  @memberof DataTable#oApi
	 */
	function _fnDrawHead( settings, source )
	{
		var layout = _fnHeaderLayout(settings, source);
		var tr, n;
	
		for ( var row=0 ; row<source.length ; row++ ) {
			tr = source[row].row;
	
			// All cells are going to be replaced, so empty out the row
			// Can't use $().empty() as that kills event handlers
			if (tr) {
				while( (n = tr.firstChild) ) {
					tr.removeChild( n );
				}
			}
	
			for ( var column=0 ; column<layout[row].length ; column++ ) {
				var point = layout[row][column];
	
				if (point) {
					$(point.cell)
						.appendTo(tr)
						.attr('rowspan', point.rowspan)
						.attr('colspan', point.colspan);
				}
			}
		}
	}
	
	
	/**
	 * Insert the required TR nodes into the table for display
	 *  @param {object} oSettings dataTables settings object
	 *  @param ajaxComplete true after ajax call to complete rendering
	 *  @memberof DataTable#oApi
	 */
	function _fnDraw( oSettings, ajaxComplete )
	{
		// Allow for state saving and a custom start position
		_fnStart( oSettings );
	
		/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
		var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
		if ( aPreDraw.indexOf(false) !== -1 )
		{
			_fnProcessingDisplay( oSettings, false );
			return;
		}
	
		var anRows = [];
		var iRowCount = 0;
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var aiDisplay = oSettings.aiDisplay;
		var iDisplayStart = oSettings._iDisplayStart;
		var iDisplayEnd = oSettings.fnDisplayEnd();
		var columns = oSettings.aoColumns;
		var body = $(oSettings.nTBody);
	
		oSettings.bDrawing = true;
	
		/* Server-side processing draw intercept */
		if ( oSettings.deferLoading )
		{
			oSettings.deferLoading = false;
			oSettings.iDraw++;
			_fnProcessingDisplay( oSettings, false );
		}
		else if ( !bServerSide )
		{
			oSettings.iDraw++;
		}
		else if ( !oSettings.bDestroying && !ajaxComplete)
		{
			// Show loading message for server-side processing
			if (oSettings.iDraw === 0) {
				body.empty().append(_emptyRow(oSettings));
			}
	
			_fnAjaxUpdate( oSettings );
			return;
		}
	
		if ( aiDisplay.length !== 0 )
		{
			var iStart = bServerSide ? 0 : iDisplayStart;
			var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;
	
			for ( var j=iStart ; j<iEnd ; j++ )
			{
				var iDataIndex = aiDisplay[j];
				var aoData = oSettings.aoData[ iDataIndex ];
				if ( aoData.nTr === null )
				{
					_fnCreateTr( oSettings, iDataIndex );
				}
	
				var nRow = aoData.nTr;
	
				// Add various classes as needed
				for (var i=0 ; i<columns.length ; i++) {
					var col = columns[i];
					var td = aoData.anCells[i];
	
					_addClass(td, _ext.type.className[col.sType]); // auto class
					_addClass(td, col.sClass); // column class
					_addClass(td, oSettings.oClasses.tbody.cell); // all cells
				}
	
				// Row callback functions - might want to manipulate the row
				// iRowCount and j are not currently documented. Are they at all
				// useful?
				_fnCallbackFire( oSettings, 'aoRowCallback', null,
					[nRow, aoData._aData, iRowCount, j, iDataIndex] );
	
				anRows.push( nRow );
				iRowCount++;
			}
		}
		else
		{
			anRows[ 0 ] = _emptyRow(oSettings);
		}
	
		/* Header and footer callbacks */
		_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0],
			_fnGetDataMaster( oSettings ), iDisplayStart, iDisplayEnd, aiDisplay ] );
	
		// replaceChildren is faster, but only became widespread in 2020,
		// so a fall back in jQuery is provided for older browsers.
		if (body[0].replaceChildren) {
			body[0].replaceChildren.apply(body[0], anRows);
		}
		else {
			body.children().detach();
			body.append( $(anRows) );
		}
	
		// Empty table needs a specific class
		$(oSettings.nTableWrapper).toggleClass('dt-empty-footer', $('tr', oSettings.nTFoot).length === 0);
	
		/* Call all required callback functions for the end of a draw */
		_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings], true );
	
		/* Draw is complete, sorting and filtering must be as well */
		oSettings.bSorted = false;
		oSettings.bFiltered = false;
		oSettings.bDrawing = false;
	}
	
	
	/**
	 * Redraw the table - taking account of the various features which are enabled
	 *  @param {object} oSettings dataTables settings object
	 *  @param {boolean} [holdPosition] Keep the current paging position. By default
	 *    the paging is reset to the first page
	 *  @memberof DataTable#oApi
	 */
	function _fnReDraw( settings, holdPosition, recompute )
	{
		var
			features = settings.oFeatures,
			sort     = features.bSort,
			filter   = features.bFilter;
	
		if (recompute === undefined || recompute === true) {
			// Resolve any column types that are unknown due to addition or invalidation
			_fnColumnTypes( settings );
	
			if ( sort ) {
				_fnSort( settings );
			}
	
			if ( filter ) {
				_fnFilterComplete( settings, settings.oPreviousSearch );
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}
		}
	
		if ( holdPosition !== true ) {
			settings._iDisplayStart = 0;
		}
	
		// Let any modules know about the draw hold position state (used by
		// scrolling internally)
		settings._drawHold = holdPosition;
	
		_fnDraw( settings );
	
		settings._drawHold = false;
	}
	
	
	/*
	 * Table is empty - create a row with an empty message in it
	 */
	function _emptyRow ( settings ) {
		var oLang = settings.oLanguage;
		var zero = oLang.sZeroRecords;
		var dataSrc = _fnDataSource( settings );
	
		if (
			(settings.iDraw < 1 && dataSrc === 'ssp') ||
			(settings.iDraw <= 1 && dataSrc === 'ajax')
		) {
			zero = oLang.sLoadingRecords;
		}
		else if ( oLang.sEmptyTable && settings.fnRecordsTotal() === 0 )
		{
			zero = oLang.sEmptyTable;
		}
	
		return $( '<tr/>' )
			.append( $('<td />', {
				'colSpan': _fnVisbleColumns( settings ),
				'class':   settings.oClasses.empty.row
			} ).html( zero ) )[0];
	}
	
	
	/**
	 * Expand the layout items into an object for the rendering function
	 */
	function _layoutItems (row, align, items) {
		if ( Array.isArray(items)) {
			for (var i=0 ; i<items.length ; i++) {
				_layoutItems(row, align, items[i]);
			}
	
			return;
		}
	
		var rowCell = row[align];
	
		// If it is an object, then there can be multiple features contained in it
		if ( $.isPlainObject( items ) ) {
			// A feature plugin cannot be named "features" due to this check
			if (items.features) {
				if (items.rowId) {
					row.id = items.rowId;
				}
				if (items.rowClass) {
					row.className = items.rowClass;
				}
	
				rowCell.id = items.id;
				rowCell.className = items.className;
	
				_layoutItems(row, align, items.features);
			}
			else {
				Object.keys(items).map(function (key) {
					rowCell.contents.push( {
						feature: key,
						opts: items[key]
					});
				});
			}
		}
		else {
			rowCell.contents.push(items);
		}
	}
	
	/**
	 * Find, or create a layout row
	 */
	function _layoutGetRow(rows, rowNum, align) {
		var row;
	
		// Find existing rows
		for (var i=0; i<rows.length; i++) {
			row = rows[i];
	
			if (row.rowNum === rowNum) {
				// full is on its own, but start and end share a row
				if (
					(align === 'full' && row.full) ||
					((align === 'start' || align === 'end') && (row.start || row.end))
				) {
					if (! row[align]) {
						row[align] = {
							contents: []
						};
					}
	
					return row;
				}
			}
		}
	
		// If we get this far, then there was no match, create a new row
		row = {
			rowNum: rowNum	
		};
	
		row[align] = {
			contents: []
		};
	
		rows.push(row);
	
		return row;
	}
	
	/**
	 * Convert a `layout` object given by a user to the object structure needed
	 * for the renderer. This is done twice, once for above and once for below
	 * the table. Ordering must also be considered.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} layout Layout object to convert
	 * @param {string} side `top` or `bottom`
	 * @returns Converted array structure - one item for each row.
	 */
	function _layoutArray ( settings, layout, side ) {
		var rows = [];
		
		// Split out into an array
		$.each( layout, function ( pos, items ) {
			if (items === null) {
				return;
			}
	
			var parts = pos.match(/^([a-z]+)([0-9]*)([A-Za-z]*)$/);
			var rowNum = parts[2]
				? parts[2] * 1
				: 0;
			var align = parts[3]
				? parts[3].toLowerCase()
				: 'full';
	
			// Filter out the side we aren't interested in
			if (parts[1] !== side) {
				return;
			}
	
			// Get or create the row we should attach to
			var row = _layoutGetRow(rows, rowNum, align);
	
			_layoutItems(row, align, items);
		});
	
		// Order by item identifier
		rows.sort( function ( a, b ) {
			var order1 = a.rowNum;
			var order2 = b.rowNum;
	
			// If both in the same row, then the row with `full` comes first
			if (order1 === order2) {
				var ret = a.full && ! b.full ? -1 : 1;
	
				return side === 'bottom'
					? ret * -1
					: ret;
			}
	
			return order2 - order1;
		} );
	
		// Invert for below the table
		if ( side === 'bottom' ) {
			rows.reverse();
		}
	
		for (var row = 0; row<rows.length; row++) {
			delete rows[row].rowNum;
	
			_layoutResolve(settings, rows[row]);
		}
	
		return rows;
	}
	
	
	/**
	 * Convert the contents of a row's layout object to nodes that can be inserted
	 * into the document by a renderer. Execute functions, look up plug-ins, etc.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} row Layout object for this row
	 */
	function _layoutResolve( settings, row ) {
		var getFeature = function (feature, opts) {
			if ( ! _ext.features[ feature ] ) {
				_fnLog( settings, 0, 'Unknown feature: '+ feature );
			}
	
			return _ext.features[ feature ].apply( this, [settings, opts] );
		};
	
		var resolve = function ( item ) {
			if (! row[ item ]) {
				return;
			}
	
			var line = row[ item ].contents;
	
			for ( var i=0, ien=line.length ; i<ien ; i++ ) {
				if ( ! line[i] ) {
					continue;
				}
				else if ( typeof line[i] === 'string' ) {
					line[i] = getFeature( line[i], null );
				}
				else if ( $.isPlainObject(line[i]) ) {
					// If it's an object, it just has feature and opts properties from
					// the transform in _layoutArray
					line[i] = getFeature(line[i].feature, line[i].opts);
				}
				else if ( typeof line[i].node === 'function' ) {
					line[i] = line[i].node( settings );
				}
				else if ( typeof line[i] === 'function' ) {
					var inst = line[i]( settings );
	
					line[i] = typeof inst.node === 'function' ?
						inst.node() :
						inst;
				}
			}
		};
	
		resolve('start');
		resolve('end');
		resolve('full');
	}
	
	
	/**
	 * Add the options to the page HTML for the table
	 *  @param {object} settings DataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddOptionsHtml ( settings )
	{
		var classes = settings.oClasses;
		var table = $(settings.nTable);
	
		// Wrapper div around everything DataTables controls
		var insert = $('<div/>')
			.attr({
				id:      settings.sTableId+'_wrapper',
				'class': classes.container
			})
			.insertBefore(table);
	
		settings.nTableWrapper = insert[0];
	
		if (settings.sDom) {
			// Legacy
			_fnLayoutDom(settings, settings.sDom, insert);
		}
		else {
			var top = _layoutArray( settings, settings.layout, 'top' );
			var bottom = _layoutArray( settings, settings.layout, 'bottom' );
			var renderer = _fnRenderer( settings, 'layout' );
		
			// Everything above - the renderer will actually insert the contents into the document
			top.forEach(function (item) {
				renderer( settings, insert, item );
			});
	
			// The table - always the center of attention
			renderer( settings, insert, {
				full: {
					table: true,
					contents: [ _fnFeatureHtmlTable(settings) ]
				}
			} );
	
			// Everything below
			bottom.forEach(function (item) {
				renderer( settings, insert, item );
			});
		}
	
		// Processing floats on top, so it isn't an inserted feature
		_processingHtml( settings );
	}
	
	/**
	 * Draw the table with the legacy DOM property
	 * @param {*} settings DT settings object
	 * @param {*} dom DOM string
	 * @param {*} insert Insert point
	 */
	function _fnLayoutDom( settings, dom, insert )
	{
		var parts = dom.match(/(".*?")|('.*?')|./g);
		var featureNode, option, newNode, next, attr;
	
		for ( var i=0 ; i<parts.length ; i++ ) {
			featureNode = null;
			option = parts[i];
	
			if ( option == '<' ) {
				// New container div
				newNode = $('<div/>');
	
				// Check to see if we should append an id and/or a class name to the container
				next = parts[i+1];
	
				if ( next[0] == "'" || next[0] == '"' ) {
					attr = next.replace(/['"]/g, '');
	
					var id = '', className;
	
					/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
					if ( attr.indexOf('.') != -1 ) {
						var split = attr.split('.');
	
						id = split[0];
						className = split[1];
					}
					else if ( attr[0] == "#" ) {
						id = attr;
					}
					else {
						className = attr;
					}
	
					newNode
						.attr('id', id.substring(1))
						.addClass(className);
	
					i++; // Move along the position array
				}
	
				insert.append( newNode );
				insert = newNode;
			}
			else if ( option == '>' ) {
				// End container div
				insert = insert.parent();
			}
			else if ( option == 't' ) {
				// Table
				featureNode = _fnFeatureHtmlTable( settings );
			}
			else
			{
				DataTable.ext.feature.forEach(function(feature) {
					if ( option == feature.cFeature ) {
						featureNode = feature.fnInit( settings );
					}
				});
			}
	
			// Add to the display
			if ( featureNode ) {
				insert.append( featureNode );
			}
		}
	}
	
	
	/**
	 * Use the DOM source to create up an array of header cells. The idea here is to
	 * create a layout grid (array) of rows x columns, which contains a reference
	 * to the cell that that point in the grid (regardless of col/rowspan), such that
	 * any column / row could be removed and the new grid constructed
	 *  @param {node} thead The header/footer element for the table
	 *  @returns {array} Calculated layout array
	 *  @memberof DataTable#oApi
	 */
	function _fnDetectHeader ( settings, thead, write )
	{
		var columns = settings.aoColumns;
		var rows = $(thead).children('tr');
		var row, cell;
		var i, k, l, iLen, shifted, column, colspan, rowspan;
		var isHeader = thead && thead.nodeName.toLowerCase() === 'thead';
		var layout = [];
		var unique;
		var shift = function ( a, i, j ) {
			var k = a[i];
			while ( k[j] ) {
				j++;
			}
			return j;
		};
	
		// We know how many rows there are in the layout - so prep it
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			layout.push( [] );
		}
	
		for ( i=0, iLen=rows.length ; i<iLen ; i++ ) {
			row = rows[i];
			column = 0;
	
			// For every cell in the row..
			cell = row.firstChild;
			while ( cell ) {
				if (
					cell.nodeName.toUpperCase() == 'TD' ||
					cell.nodeName.toUpperCase() == 'TH'
				) {
					var cols = [];
	
					// Get the col and rowspan attributes from the DOM and sanitise them
					colspan = cell.getAttribute('colspan') * 1;
					rowspan = cell.getAttribute('rowspan') * 1;
					colspan = (!colspan || colspan===0 || colspan===1) ? 1 : colspan;
					rowspan = (!rowspan || rowspan===0 || rowspan===1) ? 1 : rowspan;
	
					// There might be colspan cells already in this row, so shift our target
					// accordingly
					shifted = shift( layout, i, column );
	
					// Cache calculation for unique columns
					unique = colspan === 1 ?
						true :
						false;
					
					// Perform header setup
					if ( write ) {
						if (unique) {
							// Allow column options to be set from HTML attributes
							_fnColumnOptions( settings, shifted, $(cell).data() );
							
							// Get the width for the column. This can be defined from the
							// width attribute, style attribute or `columns.width` option
							var columnDef = columns[shifted];
							var width = cell.getAttribute('width') || null;
							var t = cell.style.width.match(/width:\s*(\d+[pxem%]+)/);
							if ( t ) {
								width = t[1];
							}
	
							columnDef.sWidthOrig = columnDef.sWidth || width;
	
							if (isHeader) {
								// Column title handling - can be user set, or read from the DOM
								// This happens before the render, so the original is still in place
								if ( columnDef.sTitle !== null && ! columnDef.autoTitle ) {
									cell.innerHTML = columnDef.sTitle;
								}
	
								if (! columnDef.sTitle && unique) {
									columnDef.sTitle = _stripHtml(cell.innerHTML);
									columnDef.autoTitle = true;
								}
							}
							else {
								// Footer specific operations
								if (columnDef.footer) {
									cell.innerHTML = columnDef.footer;
								}
							}
	
							// Fall back to the aria-label attribute on the table header if no ariaTitle is
							// provided.
							if (! columnDef.ariaTitle) {
								columnDef.ariaTitle = $(cell).attr("aria-label") || columnDef.sTitle;
							}
	
							// Column specific class names
							if ( columnDef.className ) {
								$(cell).addClass( columnDef.className );
							}
						}
	
						// Wrap the column title so we can write to it in future
						if ( $('span.dt-column-title', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-title')
								.append(cell.childNodes)
								.appendTo(cell);
						}
	
						if ( isHeader && $('span.dt-column-order', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-order')
								.appendTo(cell);
						}
					}
	
					// If there is col / rowspan, copy the information into the layout grid
					for ( l=0 ; l<colspan ; l++ ) {
						for ( k=0 ; k<rowspan ; k++ ) {
							layout[i+k][shifted+l] = {
								cell: cell,
								unique: unique
							};
	
							layout[i+k].row = row;
						}
	
						cols.push( shifted+l );
					}
	
					// Assign an attribute so spanning cells can still be identified
					// as belonging to a column
					cell.setAttribute('data-dt-column', _unique(cols).join(','));
				}
	
				cell = cell.nextSibling;
			}
		}
	
		return layout;
	}
	
	/**
	 * Set the start position for draw
	 *  @param {object} oSettings dataTables settings object
	 */
	function _fnStart( oSettings )
	{
		var bServerSide = _fnDataSource( oSettings ) == 'ssp';
		var iInitDisplayStart = oSettings.iInitDisplayStart;
	
		// Check and see if we have an initial draw position from state saving
		if ( iInitDisplayStart !== undefined && iInitDisplayStart !== -1 )
		{
			oSettings._iDisplayStart = bServerSide ?
				iInitDisplayStart :
				iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
					0 :
					iInitDisplayStart;
	
			oSettings.iInitDisplayStart = -1;
		}
	}
	
	/**
	 * Create an Ajax call based on the table's settings, taking into account that
	 * parameters can have multiple forms, and backwards compatibility.
	 *
	 * @param {object} oSettings dataTables settings object
	 * @param {array} data Data to send to the server, required by
	 *     DataTables - may be augmented by developer callbacks
	 * @param {function} fn Callback function to run when data is obtained
	 */
	function _fnBuildAjax( oSettings, data, fn )
	{
		var ajaxData;
		var ajax = oSettings.ajax;
		var instance = oSettings.oInstance;
		var callback = function ( json ) {
			var status = oSettings.jqXHR
				? oSettings.jqXHR.status
				: null;
	
			if ( json === null || (typeof status === 'number' && status == 204 ) ) {
				json = {};
				_fnAjaxDataSrc( oSettings, json, [] );
			}
	
			var error = json.error || json.sError;
			if ( error ) {
				_fnLog( oSettings, 0, error );
			}
	
			// Microsoft often wrap JSON as a string in another JSON object
			// Let's handle that automatically
			if (json.d && typeof json.d === 'string') {
				try {
					json = JSON.parse(json.d);
				}
				catch (e) {
					// noop
				}
			}
	
			oSettings.json = json;
	
			_fnCallbackFire( oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR], true );
			fn( json );
		};
	
		if ( $.isPlainObject( ajax ) && ajax.data )
		{
			ajaxData = ajax.data;
	
			var newData = typeof ajaxData === 'function' ?
				ajaxData( data, oSettings ) :  // fn can manipulate data or return
				ajaxData;                      // an object object or array to merge
	
			// If the function returned something, use that alone
			data = typeof ajaxData === 'function' && newData ?
				newData :
				$.extend( true, data, newData );
	
			// Remove the data property as we've resolved it already and don't want
			// jQuery to do it again (it is restored at the end of the function)
			delete ajax.data;
		}
	
		var baseAjax = {
			"url": typeof ajax === 'string' ?
				ajax :
				'',
			"data": data,
			"success": callback,
			"dataType": "json",
			"cache": false,
			"type": oSettings.sServerMethod,
			"error": function (xhr, error) {
				var ret = _fnCallbackFire( oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR], true );
	
				if ( ret.indexOf(true) === -1 ) {
					if ( error == "parsererror" ) {
						_fnLog( oSettings, 0, 'Invalid JSON response', 1 );
					}
					else if ( xhr.readyState === 4 ) {
						_fnLog( oSettings, 0, 'Ajax error', 7 );
					}
				}
	
				_fnProcessingDisplay( oSettings, false );
			}
		};
	
		// If `ajax` option is an object, extend and override our default base
		if ( $.isPlainObject( ajax ) ) {
			$.extend( baseAjax, ajax )
		}
	
		// Store the data submitted for the API
		oSettings.oAjaxData = data;
	
		// Allow plug-ins and external processes to modify the data
		_fnCallbackFire( oSettings, null, 'preXhr', [oSettings, data, baseAjax], true );
	
		if ( typeof ajax === 'function' )
		{
			// Is a function - let the caller define what needs to be done
			oSettings.jqXHR = ajax.call( instance, data, callback, oSettings );
		}
		else if (ajax.url === '') {
			// No url, so don't load any data. Just apply an empty data array
			// to the object for the callback.
			var empty = {};
	
			DataTable.util.set(ajax.dataSrc)(empty, []);
			callback(empty);
		}
		else {
			// Object to extend the base settings
			oSettings.jqXHR = $.ajax( baseAjax );
		}
	
		// Restore for next time around
		if ( ajaxData ) {
			ajax.data = ajaxData;
		}
	}
	
	
	/**
	 * Update the table using an Ajax call
	 *  @param {object} settings dataTables settings object
	 *  @returns {boolean} Block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdate( settings )
	{
		settings.iDraw++;
		_fnProcessingDisplay( settings, true );
	
		_fnBuildAjax(
			settings,
			_fnAjaxParameters( settings ),
			function(json) {
				_fnAjaxUpdateDraw( settings, json );
			}
		);
	}
	
	
	/**
	 * Build up the parameters in an object needed for a server-side processing
	 * request.
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {bool} block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxParameters( settings )
	{
		var
			columns = settings.aoColumns,
			features = settings.oFeatures,
			preSearch = settings.oPreviousSearch,
			preColSearch = settings.aoPreSearchCols,
			colData = function ( idx, prop ) {
				return typeof columns[idx][prop] === 'function' ?
					'function' :
					columns[idx][prop];
			};
	
		return {
			draw: settings.iDraw,
			columns: columns.map( function ( column, i ) {
				return {
					data: colData(i, 'mData'),
					name: column.sName,
					searchable: column.bSearchable,
					orderable: column.bSortable,
					search: {
						value: preColSearch[i].search,
						regex: preColSearch[i].regex,
						fixed: Object.keys(column.searchFixed).map( function(name) {
							return {
								name: name,
								term: column.searchFixed[name].toString()
							}
						})
					}
				};
			} ),
			order: _fnSortFlatten( settings ).map( function ( val ) {
				return {
					column: val.col,
					dir: val.dir,
					name: colData(val.col, 'sName')
				};
			} ),
			start: settings._iDisplayStart,
			length: features.bPaginate ?
				settings._iDisplayLength :
				-1,
			search: {
				value: preSearch.search,
				regex: preSearch.regex,
				fixed: Object.keys(settings.searchFixed).map( function(name) {
					return {
						name: name,
						term: settings.searchFixed[name].toString()
					}
				})
			}
		};
	}
	
	
	/**
	 * Data the data from the server (nuking the old) and redraw the table
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} json json data return from the server.
	 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
	 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
	 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
	 *  @param {array} json.aaData The data to display on this page
	 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdateDraw ( settings, json )
	{
		var data = _fnAjaxDataSrc(settings, json);
		var draw = _fnAjaxDataSrcParam(settings, 'draw', json);
		var recordsTotal = _fnAjaxDataSrcParam(settings, 'recordsTotal', json);
		var recordsFiltered = _fnAjaxDataSrcParam(settings, 'recordsFiltered', json);
	
		if ( draw !== undefined ) {
			// Protect against out of sequence returns
			if ( draw*1 < settings.iDraw ) {
				return;
			}
			settings.iDraw = draw * 1;
		}
	
		// No data in returned object, so rather than an array, we show an empty table
		if ( ! data ) {
			data = [];
		}
	
		_fnClearTable( settings );
		settings._iRecordsTotal   = parseInt(recordsTotal, 10);
		settings._iRecordsDisplay = parseInt(recordsFiltered, 10);
	
		for ( var i=0, ien=data.length ; i<ien ; i++ ) {
			_fnAddData( settings, data[i] );
		}
		settings.aiDisplay = settings.aiDisplayMaster.slice();
	
		_fnDraw( settings, true );
		_fnInitComplete( settings );
		_fnProcessingDisplay( settings, false );
	}
	
	
	/**
	 * Get the data from the JSON data source to use for drawing a table. Using
	 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
	 * source object, or from a processing function.
	 *  @param {object} settings dataTables settings object
	 *  @param  {object} json Data source object / array from the server
	 *  @return {array} Array of data to use
	 */
	function _fnAjaxDataSrc ( settings, json, write )
	{
		var dataProp = 'data';
	
		if ($.isPlainObject( settings.ajax ) && settings.ajax.dataSrc !== undefined) {
			// Could in inside a `dataSrc` object, or not!
			var dataSrc = settings.ajax.dataSrc;
	
			// string, function and object are valid types
			if (typeof dataSrc === 'string' || typeof dataSrc === 'function') {
				dataProp = dataSrc;
			}
			else if (dataSrc.data !== undefined) {
				dataProp = dataSrc.data;
			}
		}
	
		if ( ! write ) {
			if ( dataProp === 'data' ) {
				// If the default, then we still want to support the old style, and safely ignore
				// it if possible
				return json.aaData || json[dataProp];
			}
	
			return dataProp !== "" ?
				_fnGetObjectDataFn( dataProp )( json ) :
				json;
		}
		
		// set
		_fnSetObjectDataFn( dataProp )( json, write );
	}
	
	/**
	 * Very similar to _fnAjaxDataSrc, but for the other SSP properties
	 * @param {*} settings DataTables settings object
	 * @param {*} param Target parameter
	 * @param {*} json JSON data
	 * @returns Resolved value
	 */
	function _fnAjaxDataSrcParam (settings, param, json) {
		var dataSrc = $.isPlainObject( settings.ajax )
			? settings.ajax.dataSrc
			: null;
	
		if (dataSrc && dataSrc[param]) {
			// Get from custom location
			return _fnGetObjectDataFn( dataSrc[param] )( json );
		}
	
		// else - Default behaviour
		var old = '';
	
		// Legacy support
		if (param === 'draw') {
			old = 'sEcho';
		}
		else if (param === 'recordsTotal') {
			old = 'iTotalRecords';
		}
		else if (param === 'recordsFiltered') {
			old = 'iTotalDisplayRecords';
		}
	
		return json[old] !== undefined
			? json[old]
			: json[param];
	}
	
	
	/**
	 * Filter the table using both the global filter and column based filtering
	 *  @param {object} settings dataTables settings object
	 *  @param {object} input search information
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterComplete ( settings, input )
	{
		var columnsSearch = settings.aoPreSearchCols;
	
		// In server-side processing all filtering is done by the server, so no point hanging around here
		if ( _fnDataSource( settings ) != 'ssp' )
		{
			// Check if any of the rows were invalidated
			_fnFilterData( settings );
	
			// Start from the full data set
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Global filter first
			_fnFilter( settings.aiDisplay, settings, input.search, input );
	
			$.each(settings.searchFixed, function (name, term) {
				_fnFilter(settings.aiDisplay, settings, term, {});
			});
	
			// Then individual column filters
			for ( var i=0 ; i<columnsSearch.length ; i++ )
			{
				var col = columnsSearch[i];
	
				_fnFilter(
					settings.aiDisplay,
					settings,
					col.search,
					col,
					i
				);
	
				$.each(settings.aoColumns[i].searchFixed, function (name, term) {
					_fnFilter(settings.aiDisplay, settings, term, {}, i);
				});
			}
	
			// And finally global filtering
			_fnFilterCustom( settings );
		}
	
		// Tell the draw function we have been filtering
		settings.bFiltered = true;
	
		_fnCallbackFire( settings, null, 'search', [settings] );
	}
	
	
	/**
	 * Apply custom filtering functions
	 * 
	 * This is legacy now that we have named functions, but it is widely used
	 * from 1.x, so it is not yet deprecated.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCustom( settings )
	{
		var filters = DataTable.ext.search;
		var displayRows = settings.aiDisplay;
		var row, rowIdx;
	
		for ( var i=0, ien=filters.length ; i<ien ; i++ ) {
			var rows = [];
	
			// Loop over each row and see if it should be included
			for ( var j=0, jen=displayRows.length ; j<jen ; j++ ) {
				rowIdx = displayRows[ j ];
				row = settings.aoData[ rowIdx ];
	
				if ( filters[i]( settings, row._aFilterData, rowIdx, row._aData, j ) ) {
					rows.push( rowIdx );
				}
			}
	
			// So the array reference doesn't break set the results into the
			// existing array
			displayRows.length = 0;
			displayRows.push.apply(displayRows, rows);
		}
	}
	
	
	/**
	 * Filter the data table based on user input and draw the table
	 */
	function _fnFilter( searchRows, settings, input, options, column )
	{
		if ( input === '' ) {
			return;
		}
	
		var i = 0;
		var matched = [];
	
		// Search term can be a function, regex or string - if a string we apply our
		// smart filtering regex (assuming the options require that)
		var searchFunc = typeof input === 'function' ? input : null;
		var rpSearch = input instanceof RegExp
			? input
			: searchFunc
				? null
				: _fnFilterCreateSearch( input, options );
	
		// Then for each row, does the test pass. If not, lop the row from the array
		for (i=0 ; i<searchRows.length ; i++) {
			var row = settings.aoData[ searchRows[i] ];
			var data = column === undefined
				? row._sFilterRow
				: row._aFilterData[ column ];
	
			if ( (searchFunc && searchFunc(data, row._aData, searchRows[i], column)) || (rpSearch && rpSearch.test(data)) ) {
				matched.push(searchRows[i]);
			}
		}
	
		// Mutate the searchRows array
		searchRows.length = matched.length;
	
		for (i=0 ; i<matched.length ; i++) {
			searchRows[i] = matched[i];
		}
	}
	
	
	/**
	 * Build a regular expression object suitable for searching a table
	 *  @param {string} sSearch string to search for
	 *  @param {bool} bRegex treat as a regular expression or not
	 *  @param {bool} bSmart perform smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
	 *  @returns {RegExp} constructed object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCreateSearch( search, inOpts )
	{
		var not = [];
		var options = $.extend({}, {
			boundary: false,
			caseInsensitive: true,
			exact: false,
			regex: false,
			smart: true
		}, inOpts);
	
		if (typeof search !== 'string') {
			search = search.toString();
		}
	
		// Remove diacritics if normalize is set up to do so
		search = _normalize(search);
	
		if (options.exact) {
			return new RegExp(
				'^'+_fnEscapeRegex(search)+'$',
				options.caseInsensitive ? 'i' : ''
			);
		}
	
		search = options.regex ?
			search :
			_fnEscapeRegex( search );
		
		if ( options.smart ) {
			/* For smart filtering we want to allow the search to work regardless of
			 * word order. We also want double quoted text to be preserved, so word
			 * order is important - a la google. And a negative look around for
			 * finding rows which don't contain a given string.
			 * 
			 * So this is the sort of thing we want to generate:
			 * 
			 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
			 */
			var parts = search.match( /!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g ) || [''];
			var a = parts.map( function ( word ) {
				var negative = false;
				var m;
	
				// Determine if it is a "does not include"
				if ( word.charAt(0) === '!' ) {
					negative = true;
					word = word.substring(1);
				}
	
				// Strip the quotes from around matched phrases
				if ( word.charAt(0) === '"' ) {
					m = word.match( /^"(.*)"$/ );
					word = m ? m[1] : word;
				}
				else if ( word.charAt(0) === '\u201C' ) {
					// Smart quote match (iPhone users)
					m = word.match( /^\u201C(.*)\u201D$/ );
					word = m ? m[1] : word;
				}
	
				// For our "not" case, we need to modify the string that is
				// allowed to match at the end of the expression.
				if (negative) {
					if (word.length > 1) {
						not.push('(?!'+word+')');
					}
	
					word = '';
				}
	
				return word.replace(/"/g, '');
			} );
	
			var match = not.length
				? not.join('')
				: '';
	
			var boundary = options.boundary
				? '\\b'
				: '';
	
			search = '^(?=.*?'+boundary+a.join( ')(?=.*?'+boundary )+')('+match+'.)*$';
		}
	
		return new RegExp( search, options.caseInsensitive ? 'i' : '' );
	}
	
	
	/**
	 * Escape a string such that it can be used in a regular expression
	 *  @param {string} sVal string to escape
	 *  @returns {string} escaped string
	 *  @memberof DataTable#oApi
	 */
	var _fnEscapeRegex = DataTable.util.escapeRegex;
	
	var __filter_div = $('<div>')[0];
	var __filter_div_textContent = __filter_div.textContent !== undefined;
	
	// Update the filtering data for each row if needed (by invalidation or first run)
	function _fnFilterData ( settings )
	{
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var column;
		var j, jen, filterData, cellData, row;
		var wasInvalidated = false;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aFilterData ) {
				filterData = [];
	
				for ( j=0, jen=columns.length ; j<jen ; j++ ) {
					column = columns[j];
	
					if ( column.bSearchable ) {
						cellData = _fnGetCellData( settings, rowIdx, j, 'filter' );
	
						// Search in DataTables is string based
						if ( cellData === null ) {
							cellData = '';
						}
	
						if ( typeof cellData !== 'string' && cellData.toString ) {
							cellData = cellData.toString();
						}
					}
					else {
						cellData = '';
					}
	
					// If it looks like there is an HTML entity in the string,
					// attempt to decode it so sorting works as expected. Note that
					// we could use a single line of jQuery to do this, but the DOM
					// method used here is much faster https://jsperf.com/html-decode
					if ( cellData.indexOf && cellData.indexOf('&') !== -1 ) {
						__filter_div.innerHTML = cellData;
						cellData = __filter_div_textContent ?
							__filter_div.textContent :
							__filter_div.innerText;
					}
	
					if ( cellData.replace ) {
						cellData = cellData.replace(/[\r\n\u2028]/g, '');
					}
	
					filterData.push( cellData );
				}
	
				row._aFilterData = filterData;
				row._sFilterRow = filterData.join('  ');
				wasInvalidated = true;
			}
		}
	
		return wasInvalidated;
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitialise ( settings )
	{
		var i, iAjaxStart=settings.iInitDisplayStart;
		var init = settings.oInit;
		var deferLoading = settings.deferLoading;
		var dataSrc = _fnDataSource( settings );
	
		// Ensure that the table data is fully initialised
		if ( ! settings.bInitialised ) {
			setTimeout( function(){ _fnInitialise( settings ); }, 200 );
			return;
		}
	
		// Build the header / footer for the table
		_fnBuildHead( settings, 'header' );
		_fnBuildHead( settings, 'footer' );
	
		// Load the table's state (if needed) and then render around it and draw
		_fnLoadState( settings, init, function () {
			// Then draw the header / footer
			_fnDrawHead( settings, settings.aoHeader );
			_fnDrawHead( settings, settings.aoFooter );
	
			// Local data load
			// Check if there is data passing into the constructor
			if ( init.aaData ) {
				for ( i=0 ; i<init.aaData.length ; i++ ) {
					_fnAddData( settings, init.aaData[ i ] );
				}
			}
			else if ( deferLoading || dataSrc == 'dom' ) {
				// Grab the data from the page
				_fnAddTr( settings, $(settings.nTBody).children('tr') );
			}
	
			// Filter not yet applied - copy the display master
			settings.aiDisplay = settings.aiDisplayMaster.slice();
	
			// Enable features
			_fnAddOptionsHtml( settings );
			_fnSortInit( settings );
	
			_colGroup( settings );
	
			/* Okay to show that something is going on now */
			_fnProcessingDisplay( settings, true );
	
			_fnCallbackFire( settings, null, 'preInit', [settings], true );
	
			// If there is default sorting required - let's do it. The sort function
			// will do the drawing for us. Otherwise we draw the table regardless of the
			// Ajax source - this allows the table to look initialised for Ajax sourcing
			// data (show 'loading' message possibly)
			_fnReDraw( settings );
	
			// Server-side processing init complete is done by _fnAjaxUpdateDraw
			if ( dataSrc != 'ssp' || deferLoading ) {
				// if there is an ajax source load the data
				if ( dataSrc == 'ajax' ) {
					_fnBuildAjax( settings, {}, function(json) {
						var aData = _fnAjaxDataSrc( settings, json );
	
						// Got the data - add it to the table
						for ( i=0 ; i<aData.length ; i++ ) {
							_fnAddData( settings, aData[i] );
						}
	
						// Reset the init display for cookie saving. We've already done
						// a filter, and therefore cleared it before. So we need to make
						// it appear 'fresh'
						settings.iInitDisplayStart = iAjaxStart;
	
						_fnReDraw( settings );
						_fnProcessingDisplay( settings, false );
						_fnInitComplete( settings );
					}, settings );
				}
				else {
					_fnInitComplete( settings );
					_fnProcessingDisplay( settings, false );
				}
			}
		} );
	}
	
	
	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitComplete ( settings )
	{
		if (settings._bInitComplete) {
			return;
		}
	
		var args = [settings, settings.json];
	
		settings._bInitComplete = true;
	
		// Table is fully set up and we have data, so calculate the
		// column widths
		_fnAdjustColumnSizing( settings );
	
		_fnCallbackFire( settings, null, 'plugin-init', args, true );
		_fnCallbackFire( settings, 'aoInitComplete', 'init', args, true );
	}
	
	function _fnLengthChange ( settings, val )
	{
		var len = parseInt( val, 10 );
		settings._iDisplayLength = len;
	
		_fnLengthOverflow( settings );
	
		// Fire length change event
		_fnCallbackFire( settings, null, 'length', [settings, len] );
	}
	
	/**
	 * Alter the display settings to change the page
	 *  @param {object} settings DataTables settings object
	 *  @param {string|int} action Paging action to take: "first", "previous",
	 *    "next" or "last" or page number to jump to (integer)
	 *  @param [bool] redraw Automatically draw the update or not
	 *  @returns {bool} true page has changed, false - no change
	 *  @memberof DataTable#oApi
	 */
	function _fnPageChange ( settings, action, redraw )
	{
		var
			start     = settings._iDisplayStart,
			len       = settings._iDisplayLength,
			records   = settings.fnRecordsDisplay();
	
		if ( records === 0 || len === -1 )
		{
			start = 0;
		}
		else if ( typeof action === "number" )
		{
			start = action * len;
	
			if ( start > records )
			{
				start = 0;
			}
		}
		else if ( action == "first" )
		{
			start = 0;
		}
		else if ( action == "previous" )
		{
			start = len >= 0 ?
				start - len :
				0;
	
			if ( start < 0 )
			{
				start = 0;
			}
		}
		else if ( action == "next" )
		{
			if ( start + len < records )
			{
				start += len;
			}
		}
		else if ( action == "last" )
		{
			start = Math.floor( (records-1) / len) * len;
		}
		else if ( action === 'ellipsis' )
		{
			return;
		}
		else
		{
			_fnLog( settings, 0, "Unknown paging action: "+action, 5 );
		}
	
		var changed = settings._iDisplayStart !== start;
		settings._iDisplayStart = start;
	
		_fnCallbackFire( settings, null, changed ? 'page' : 'page-nc', [settings] );
	
		if ( changed && redraw ) {
			_fnDraw( settings );
		}
	
		return changed;
	}
	
	
	/**
	 * Generate the node required for the processing node
	 *  @param {object} settings DataTables settings object
	 */
	function _processingHtml ( settings )
	{
		var table = settings.nTable;
		var scrolling = settings.oScroll.sX !== '' || settings.oScroll.sY !== '';
	
		if ( settings.oFeatures.bProcessing ) {
			var n = $('<div/>', {
					'id': settings.sTableId + '_processing',
					'class': settings.oClasses.processing.container,
					'role': 'status'
				} )
				.html( settings.oLanguage.sProcessing )
				.append('<div><div></div><div></div><div></div><div></div></div>');
	
			// Different positioning depending on if scrolling is enabled or not
			if (scrolling) {
				n.prependTo( $('div.dt-scroll', settings.nTableWrapper) );
			}
			else {
				n.insertBefore( table );
			}
	
			$(table).on( 'processing.dt.DT', function (e, s, show) {
				n.css( 'display', show ? 'block' : 'none' );
			} );
		}
	}
	
	
	/**
	 * Display or hide the processing indicator
	 *  @param {object} settings DataTables settings object
	 *  @param {bool} show Show the processing indicator (true) or not (false)
	 */
	function _fnProcessingDisplay ( settings, show )
	{
		_fnCallbackFire( settings, null, 'processing', [settings, show] );
	}
	
	/**
	 * Show the processing element if an action takes longer than a given time
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} enable Do (true) or not (false) async processing (local feature enablement)
	 * @param {*} run Function to run
	 */
	function _fnProcessingRun( settings, enable, run ) {
		if (! enable) {
			// Immediate execution, synchronous
			run();
		}
		else {
			_fnProcessingDisplay(settings, true);
			
			// Allow the processing display to show if needed
			setTimeout(function () {
				run();
	
				_fnProcessingDisplay(settings, false);
			}, 0);
		}
	}
	/**
	 * Add any control elements for the table - specifically scrolling
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Node to add to the DOM
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlTable ( settings )
	{
		var table = $(settings.nTable);
	
		// Scrolling from here on in
		var scroll = settings.oScroll;
	
		if ( scroll.sX === '' && scroll.sY === '' ) {
			return settings.nTable;
		}
	
		var scrollX = scroll.sX;
		var scrollY = scroll.sY;
		var classes = settings.oClasses.scrolling;
		var caption = settings.captionNode;
		var captionSide = caption ? caption._captionSide : null;
		var headerClone = $( table[0].cloneNode(false) );
		var footerClone = $( table[0].cloneNode(false) );
		var footer = table.children('tfoot');
		var _div = '<div/>';
		var size = function ( s ) {
			return !s ? null : _fnStringToCss( s );
		};
	
		if ( ! footer.length ) {
			footer = null;
		}
	
		/*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
		var scroller = $( _div, { 'class': classes.container } )
			.append(
				$(_div, { 'class': classes.header.self } )
					.css( {
						overflow: 'hidden',
						position: 'relative',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.header.inner } )
							.css( {
								'box-sizing': 'content-box',
								width: scroll.sXInner || '100%'
							} )
							.append(
								headerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'top' ? caption : null )
									.append(
										table.children('thead')
									)
							)
					)
			)
			.append(
				$(_div, { 'class': classes.body } )
					.css( {
						position: 'relative',
						overflow: 'auto',
						width: size( scrollX )
					} )
					.append( table )
			);
	
		if ( footer ) {
			scroller.append(
				$(_div, { 'class': classes.footer.self } )
					.css( {
						overflow: 'hidden',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					} )
					.append(
						$(_div, { 'class': classes.footer.inner } )
							.append(
								footerClone
									.removeAttr('id')
									.css( 'margin-left', 0 )
									.append( captionSide === 'bottom' ? caption : null )
									.append(
										table.children('tfoot')
									)
							)
					)
			);
		}
	
		var children = scroller.children();
		var scrollHead = children[0];
		var scrollBody = children[1];
		var scrollFoot = footer ? children[2] : null;
	
		// When the body is scrolled, then we also want to scroll the headers
		$(scrollBody).on( 'scroll.DT', function () {
			var scrollLeft = this.scrollLeft;
	
			scrollHead.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollFoot.scrollLeft = scrollLeft;
			}
		} );
	
		// When focus is put on the header cells, we might need to scroll the body
		$('th, td', scrollHead).on('focus', function () {
			var scrollLeft = scrollHead.scrollLeft;
	
			scrollBody.scrollLeft = scrollLeft;
	
			if ( footer ) {
				scrollBody.scrollLeft = scrollLeft;
			}
		});
	
		$(scrollBody).css('max-height', scrollY);
		if (! scroll.bCollapse) {
			$(scrollBody).css('height', scrollY);
		}
	
		settings.nScrollHead = scrollHead;
		settings.nScrollBody = scrollBody;
		settings.nScrollFoot = scrollFoot;
	
		// On redraw - align columns
		settings.aoDrawCallback.push(_fnScrollDraw);
	
		return scroller[0];
	}
	
	
	
	/**
	 * Update the header, footer and body tables for resizing - i.e. column
	 * alignment.
	 *
	 * Welcome to the most horrible function DataTables. The process that this
	 * function follows is basically:
	 *   1. Re-create the table inside the scrolling div
	 *   2. Correct colgroup > col values if needed
	 *   3. Copy colgroup > col over to header and footer
	 *   4. Clean up
	 *
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollDraw ( settings )
	{
		// Given that this is such a monster function, a lot of variables are use
		// to try and keep the minimised size as small as possible
		var
			scroll         = settings.oScroll,
			barWidth       = scroll.iBarWidth,
			divHeader      = $(settings.nScrollHead),
			divHeaderInner = divHeader.children('div'),
			divHeaderTable = divHeaderInner.children('table'),
			divBodyEl      = settings.nScrollBody,
			divBody        = $(divBodyEl),
			divFooter      = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header         = $(settings.nTHead),
			table          = $(settings.nTable),
			footer         = settings.nTFoot && $('th, td', settings.nTFoot).length ? $(settings.nTFoot) : null,
			browser        = settings.oBrowser,
			headerCopy, footerCopy;
	
		// If the scrollbar visibility has changed from the last draw, we need to
		// adjust the column sizes as the table width will have changed to account
		// for the scrollbar
		var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;
		
		if ( settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined ) {
			settings.scrollBarVis = scrollBarVis;
			_fnAdjustColumnSizing( settings );
			return; // adjust column sizing will call this function again
		}
		else {
			settings.scrollBarVis = scrollBarVis;
		}
	
		// 1. Re-create the table inside the scrolling div
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();
	
		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo( table );
		headerCopy.find('th, td').removeAttr('tabindex');
		headerCopy.find('[id]').removeAttr('id');
	
		if ( footer ) {
			footerCopy = footer.clone().prependTo( table );
			footerCopy.find('[id]').removeAttr('id');
		}
	
		// 2. Correct colgroup > col values if needed
		// It is possible that the cell sizes are smaller than the content, so we need to
		// correct colgroup>col for such cases. This can happen if the auto width detection
		// uses a cell which has a longer string, but isn't the widest! For example 
		// "Chief Executive Officer (CEO)" is the longest string in the demo, but
		// "Systems Administrator" is actually the widest string since it doesn't collapse.
		// Note the use of translating into a column index to get the `col` element. This
		// is because of Responsive which might remove `col` elements, knocking the alignment
		// of the indexes out.
		if (settings.aiDisplay.length) {
			// Get the column sizes from the first row in the table
			var colSizes = table.children('tbody').eq(0).children('tr').eq(0).children('th, td').map(function (vis) {
				return {
					idx: _fnVisibleToColumnIndex(settings, vis),
					width: $(this).outerWidth()
				}
			});
	
			// Check against what the colgroup > col is set to and correct if needed
			for (var i=0 ; i<colSizes.length ; i++) {
				var colEl = settings.aoColumns[ colSizes[i].idx ].colEl[0];
				var colWidth = colEl.style.width.replace('px', '');
	
				if (colWidth !== colSizes[i].width) {
					colEl.style.width = colSizes[i].width + 'px';
				}
			}
		}
	
		// 3. Copy the colgroup over to the header and footer
		divHeaderTable
			.find('colgroup')
			.remove();
	
		divHeaderTable.append(settings.colgroup.clone());
	
		if ( footer ) {
			divFooterTable
				.find('colgroup')
				.remove();
	
			divFooterTable.append(settings.colgroup.clone());
		}
	
		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely.
		$('th, td', headerCopy).each(function () {
			$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
		});
	
		if ( footer ) {
			$('th, td', footerCopy).each(function () {
				$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
			});
		}
	
		// 4. Clean up
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var isScrolling = Math.floor(table.height()) > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var paddingSide = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
	
		// Set the width's of the header and footer tables
		var outerWidth = table.outerWidth();
	
		divHeaderTable.css('width', _fnStringToCss( outerWidth ));
		divHeaderInner
			.css('width', _fnStringToCss( outerWidth ))
			.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
	
		if ( footer ) {
			divFooterTable.css('width', _fnStringToCss( outerWidth ));
			divFooterInner
				.css('width', _fnStringToCss( outerWidth ))
				.css(paddingSide, isScrolling ? barWidth+"px" : "0px");
		}
	
		// Correct DOM ordering for colgroup - comes before the thead
		table.children('colgroup').prependTo(table);
	
		// Adjust the position of the header in case we loose the y-scrollbar
		divBody.trigger('scroll');
	
		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ( (settings.bSorted || settings.bFiltered) && ! settings._drawHold ) {
			divBodyEl.scrollTop = 0;
		}
	}
	
	/**
	 * Calculate the width of columns for the table
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths ( settings )
	{
		// Not interested in doing column width calculation if auto-width is disabled
		if (! settings.oFeatures.bAutoWidth) {
			return;
		}
	
		var
			table = settings.nTable,
			columns = settings.aoColumns,
			scroll = settings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			visibleColumns = _fnGetColumns( settings, 'bVisible' ),
			tableWidthAttr = table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			i, column, columnIdx;
			
		var styleWidth = table.style.width;
	
		// If there is no width applied as a CSS style or as an attribute, we assume that
		// the width is intended to be 100%, which is usually is in CSS, but it is very
		// difficult to correctly parse the rules to get the final result.
		if ( ! styleWidth && ! tableWidthAttr) {
			table.style.width = '100%';
			styleWidth = '100%';
		}
	
		if ( styleWidth && styleWidth.indexOf('%') !== -1 ) {
			tableWidthAttr = styleWidth;
		}
	
		// Let plug-ins know that we are doing a recalc, in case they have changed any of the
		// visible columns their own way (e.g. Responsive uses display:none).
		_fnCallbackFire(
			settings,
			null,
			'column-calc',
			{visible: visibleColumns},
			false
		);
	
		// Construct a single row, worst case, table with the widest
		// node in the data, assign any user defined widths, then insert it into
		// the DOM and allow the browser to do all the hard work of calculating
		// table widths
		var tmpTable = $(table.cloneNode())
			.css( 'visibility', 'hidden' )
			.removeAttr( 'id' );
	
		// Clean up the table body
		tmpTable.append('<tbody>')
		var tr = $('<tr/>').appendTo( tmpTable.find('tbody') );
	
		// Clone the table header and footer - we can't use the header / footer
		// from the cloned table, since if scrolling is active, the table's
		// real header and footer are contained in different table tags
		tmpTable
			.append( $(settings.nTHead).clone() )
			.append( $(settings.nTFoot).clone() );
	
		// Remove any assigned widths from the footer (from scrolling)
		tmpTable.find('tfoot th, tfoot td').css('width', '');
	
		// Apply custom sizing to the cloned header
		tmpTable.find('thead th, thead td').each( function () {
			// Get the `width` from the header layout
			var width = _fnColumnsSumWidth( settings, this, true, false );
	
			if ( width ) {
				this.style.width = width;
	
				// For scrollX we need to force the column width otherwise the
				// browser will collapse it. If this width is smaller than the
				// width the column requires, then it will have no effect
				if ( scrollX ) {
					$( this ).append( $('<div/>').css( {
						width: width,
						margin: 0,
						padding: 0,
						border: 0,
						height: 1
					} ) );
				}
			}
			else {
				this.style.width = '';
			}
		} );
	
		// Find the widest piece of data for each column and put it into the table
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			columnIdx = visibleColumns[i];
			column = columns[ columnIdx ];
	
			var longest = _fnGetMaxLenString(settings, columnIdx);
			var autoClass = _ext.type.className[column.sType];
			var text = longest + column.sContentPadding;
			var insert = longest.indexOf('<') === -1
				? document.createTextNode(text)
				: text
			
			$('<td/>')
				.addClass(autoClass)
				.addClass(column.sClass)
				.append(insert)
				.appendTo(tr);
		}
	
		// Tidy the temporary table - remove name attributes so there aren't
		// duplicated in the dom (radio elements for example)
		$('[name]', tmpTable).removeAttr('name');
	
		// Table has been built, attach to the document so we can work with it.
		// A holding element is used, positioned at the top of the container
		// with minimal height, so it has no effect on if the container scrolls
		// or not. Otherwise it might trigger scrolling when it actually isn't
		// needed
		var holder = $('<div/>').css( scrollX || scrollY ?
				{
					position: 'absolute',
					top: 0,
					left: 0,
					height: 1,
					right: 0,
					overflow: 'hidden'
				} :
				{}
			)
			.append( tmpTable )
			.appendTo( tableContainer );
	
		// When scrolling (X or Y) we want to set the width of the table as 
		// appropriate. However, when not scrolling leave the table width as it
		// is. This results in slightly different, but I think correct behaviour
		if ( scrollX && scrollXInner ) {
			tmpTable.width( scrollXInner );
		}
		else if ( scrollX ) {
			tmpTable.css( 'width', 'auto' );
			tmpTable.removeAttr('width');
	
			// If there is no width attribute or style, then allow the table to
			// collapse
			if ( tmpTable.width() < tableContainer.clientWidth && tableWidthAttr ) {
				tmpTable.width( tableContainer.clientWidth );
			}
		}
		else if ( scrollY ) {
			tmpTable.width( tableContainer.clientWidth );
		}
		else if ( tableWidthAttr ) {
			tmpTable.width( tableWidthAttr );
		}
	
		// Get the width of each column in the constructed table
		var total = 0;
		var bodyCells = tmpTable.find('tbody tr').eq(0).children();
	
		for ( i=0 ; i<visibleColumns.length ; i++ ) {
			// Use getBounding for sub-pixel accuracy, which we then want to round up!
			var bounding = bodyCells[i].getBoundingClientRect().width;
	
			// Total is tracked to remove any sub-pixel errors as the outerWidth
			// of the table might not equal the total given here
			total += bounding;
	
			// Width for each column to use
			columns[ visibleColumns[i] ].sWidth = _fnStringToCss( bounding );
		}
	
		table.style.width = _fnStringToCss( total );
	
		// Finished with the table - ditch it
		holder.remove();
	
		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if ( tableWidthAttr ) {
			table.style.width = _fnStringToCss( tableWidthAttr );
		}
	
		if ( (tableWidthAttr || scrollX) && ! settings._reszEvt ) {
			var bindResize = function () {
				$(window).on('resize.DT-'+settings.sInstance, DataTable.util.throttle( function () {
					if (! settings.bDestroying) {
						_fnAdjustColumnSizing( settings );
					}
				} ) );
			};
	
			bindResize();
	
			settings._reszEvt = true;
		}
	}
	
	
	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} string of the max length
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString( settings, colIdx )
	{
		var column = settings.aoColumns[colIdx];
	
		if (! column.maxLenString) {
			var s, max='', maxLen = -1;
		
			for ( var i=0, ien=settings.aiDisplayMaster.length ; i<ien ; i++ ) {
				var rowIdx = settings.aiDisplayMaster[i];
				var data = _fnGetRowDisplay(settings, rowIdx)[colIdx];
	
				var cellString = data && typeof data === 'object' && data.nodeType
					? data.innerHTML
					: data+'';
	
				// Remove id / name attributes from elements so they
				// don't interfere with existing elements
				cellString = cellString
					.replace(/id=".*?"/g, '')
					.replace(/name=".*?"/g, '');
	
				s = _stripHtml(cellString)
					.replace( /&nbsp;/g, ' ' );
		
				if ( s.length > maxLen ) {
					// We want the HTML in the string, but the length that
					// is important is the stripped string
					max = cellString;
					maxLen = s.length;
				}
			}
	
			column.maxLenString = max;
		}
	
		return column.maxLenString;
	}
	
	
	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss( s )
	{
		if ( s === null ) {
			return '0px';
		}
	
		if ( typeof s == 'number' ) {
			return s < 0 ?
				'0px' :
				s+'px';
		}
	
		// Check it has a unit character already
		return s.match(/\d$/) ?
			s+'px' :
			s;
	}
	
	/**
	 * Re-insert the `col` elements for current visibility
	 *
	 * @param {*} settings DT settings
	 */
	function _colGroup( settings ) {
		var cols = settings.aoColumns;
	
		settings.colgroup.empty();
	
		for (i=0 ; i<cols.length ; i++) {
			if (cols[i].bVisible) {
				settings.colgroup.append(cols[i].colEl);
			}
		}
	}
	
	
	function _fnSortInit( settings ) {
		var target = settings.nTHead;
		var headerRows = target.querySelectorAll('tr');
		var legacyTop = settings.bSortCellsTop;
		var notSelector = ':not([data-dt-order="disable"]):not([data-dt-order="icon-only"])';
		
		// Legacy support for `orderCellsTop`
		if (legacyTop === true) {
			target = headerRows[0];
		}
		else if (legacyTop === false) {
			target = headerRows[ headerRows.length - 1 ];
		}
	
		_fnSortAttachListener(
			settings,
			target,
			target === settings.nTHead
				? 'tr'+notSelector+' th'+notSelector+', tr'+notSelector+' td'+notSelector
				: 'th'+notSelector+', td'+notSelector
		);
	
		// Need to resolve the user input array into our internal structure
		var order = [];
		_fnSortResolve( settings, order, settings.aaSorting );
	
		settings.aaSorting = order;
	}
	
	
	function _fnSortAttachListener(settings, node, selector, column, callback) {
		_fnBindAction( node, selector, function (e) {
			var run = false;
			var columns = column === undefined
				? _fnColumnsFromHeader( e.target )
				: [column];
	
			if ( columns.length ) {
				for ( var i=0, ien=columns.length ; i<ien ; i++ ) {
					var ret = _fnSortAdd( settings, columns[i], i, e.shiftKey );
	
					if (ret !== false) {
						run = true;
					}					
	
					// If the first entry is no sort, then subsequent
					// sort columns are ignored
					if (settings.aaSorting.length === 1 && settings.aaSorting[0][1] === '') {
						break;
					}
				}
	
				if (run) {
					_fnProcessingRun(settings, true, function () {
						_fnSort( settings );
						_fnSortDisplay( settings, settings.aiDisplay );
	
						_fnReDraw( settings, false, false );
	
						if (callback) {
							callback();
						}
					});
				}
			}
		} );
	}
	
	/**
	 * Sort the display array to match the master's order
	 * @param {*} settings
	 */
	function _fnSortDisplay(settings, display) {
		if (display.length < 2) {
			return;
		}
	
		var master = settings.aiDisplayMaster;
		var masterMap = {};
		var map = {};
		var i;
	
		// Rather than needing an `indexOf` on master array, we can create a map
		for (i=0 ; i<master.length ; i++) {
			masterMap[master[i]] = i;
		}
	
		// And then cache what would be the indexOf fom the display
		for (i=0 ; i<display.length ; i++) {
			map[display[i]] = masterMap[display[i]];
		}
	
		display.sort(function(a, b){
			// Short version of this function is simply `master.indexOf(a) - master.indexOf(b);`
			return map[a] - map[b];
		});
	}
	
	
	function _fnSortResolve (settings, nestedSort, sort) {
		var push = function ( a ) {
			if ($.isPlainObject(a)) {
				if (a.idx !== undefined) {
					// Index based ordering
					nestedSort.push([a.idx, a.dir]);
				}
				else if (a.name) {
					// Name based ordering
					var cols = _pluck( settings.aoColumns, 'sName');
					var idx = cols.indexOf(a.name);
	
					if (idx !== -1) {
						nestedSort.push([idx, a.dir]);
					}
				}
			}
			else {
				// Plain column index and direction pair
				nestedSort.push(a);
			}
		};
	
		if ( $.isPlainObject(sort) ) {
			// Object
			push(sort);
		}
		else if ( sort.length && typeof sort[0] === 'number' ) {
			// 1D array
			push(sort);
		}
		else if ( sort.length ) {
			// 2D array
			for (var z=0; z<sort.length; z++) {
				push(sort[z]); // Object or array
			}
		}
	}
	
	
	function _fnSortFlatten ( settings )
	{
		var
			i, k, kLen,
			aSort = [],
			extSort = DataTable.ext.type.order,
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject( fixed ),
			nestedSort = [];
		
		if ( ! settings.oFeatures.bSort ) {
			return aSort;
		}
	
		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if ( Array.isArray( fixed ) ) {
			_fnSortResolve( settings, nestedSort, fixed );
		}
	
		if ( fixedObj && fixed.pre ) {
			_fnSortResolve( settings, nestedSort, fixed.pre );
		}
	
		_fnSortResolve( settings, nestedSort, settings.aaSorting );
	
		if (fixedObj && fixed.post ) {
			_fnSortResolve( settings, nestedSort, fixed.post );
		}
	
		for ( i=0 ; i<nestedSort.length ; i++ )
		{
			srcCol = nestedSort[i][0];
	
			if ( aoColumns[ srcCol ] ) {
				aDataSort = aoColumns[ srcCol ].aDataSort;
	
				for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
				{
					iCol = aDataSort[k];
					sType = aoColumns[ iCol ].sType || 'string';
	
					if ( nestedSort[i]._idx === undefined ) {
						nestedSort[i]._idx = aoColumns[iCol].asSorting.indexOf(nestedSort[i][1]);
					}
	
					if ( nestedSort[i][1] ) {
						aSort.push( {
							src:       srcCol,
							col:       iCol,
							dir:       nestedSort[i][1],
							index:     nestedSort[i]._idx,
							type:      sType,
							formatter: extSort[ sType+"-pre" ],
							sorter:    extSort[ sType+"-"+nestedSort[i][1] ]
						} );
					}
				}
			}
		}
	
		return aSort;
	}
	
	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSort ( oSettings, col, dir )
	{
		var
			i, ien, iLen,
			aiOrig = [],
			extSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;
	
		// Allow a specific column to be sorted, which will _not_ alter the display
		// master
		if (col !== undefined) {
			var srcCol = oSettings.aoColumns[col];
			aSort = [{
				src:       col,
				col:       col,
				dir:       dir,
				index:     0,
				type:      srcCol.sType,
				formatter: extSort[ srcCol.sType+"-pre" ],
				sorter:    extSort[ srcCol.sType+"-"+dir ]
			}];
			displayMaster = displayMaster.slice();
		}
		else {
			aSort = _fnSortFlatten( oSettings );
		}
	
		for ( i=0, ien=aSort.length ; i<ien ; i++ ) {
			sortCol = aSort[i];
	
			// Load the data needed for the sort, for each cell
			_fnSortData( oSettings, sortCol.col );
		}
	
		/* No sorting required if server-side or no sorting array */
		if ( _fnDataSource( oSettings ) != 'ssp' && aSort.length !== 0 )
		{
			// Reset the initial positions on each pass so we get a stable sort
			for ( i=0, iLen=displayMaster.length ; i<iLen ; i++ ) {
				aiOrig[ i ] = i;
			}
	
			// If the first sort is desc, then reverse the array to preserve original
			// order, just in reverse
			if (aSort.length && aSort[0].dir === 'desc' && oSettings.orderDescReverse) {
				aiOrig.reverse();
			}
	
			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var test;
			 *    test = oSort['string-asc']('data11', 'data12');
			 *      if (test !== 0)
			 *        return test;
			 *    test = oSort['numeric-desc']('data21', 'data22');
			 *    if (test !== 0)
			 *      return test;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 */
			displayMaster.sort( function ( a, b ) {
				var
					x, y, k, test, sort,
					len=aSort.length,
					dataA = aoData[a]._aSortData,
					dataB = aoData[b]._aSortData;
	
				for ( k=0 ; k<len ; k++ ) {
					sort = aSort[k];
	
					// Data, which may have already been through a `-pre` function
					x = dataA[ sort.col ];
					y = dataB[ sort.col ];
	
					if (sort.sorter) {
						// If there is a custom sorter (`-asc` or `-desc`) for this
						// data type, use it
						test = sort.sorter(x, y);
	
						if ( test !== 0 ) {
							return test;
						}
					}
					else {
						// Otherwise, use generic sorting
						test = x<y ? -1 : x>y ? 1 : 0;
	
						if ( test !== 0 ) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
				}
	
				x = aiOrig[a];
				y = aiOrig[b];
	
				return x<y ? -1 : x>y ? 1 : 0;
			} );
		}
		else if ( aSort.length === 0 ) {
			// Apply index order
			displayMaster.sort(function (x, y) {
				return x<y ? -1 : x>y ? 1 : 0;
			});
		}
	
		if (col === undefined) {
			// Tell the draw function that we have sorted the data
			oSettings.bSorted = true;
			oSettings.sortDetails = aSort;
	
			_fnCallbackFire( oSettings, null, 'order', [oSettings, aSort] );
		}
	
		return displayMaster;
	}
	
	
	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {int} addIndex Counter
	 *  @param {boolean} [shift=false] Shift click add
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAdd ( settings, colIdx, addIndex, shift )
	{
		var col = settings.aoColumns[ colIdx ];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function ( a, overflow ) {
			var idx = a._idx;
			if ( idx === undefined ) {
				idx = asSorting.indexOf(a[1]);
			}
	
			return idx+1 < asSorting.length ?
				idx+1 :
				overflow ?
					null :
					0;
		};
	
		if ( ! col.bSortable ) {
			return false;
		}
	
		// Convert to 2D array if needed
		if ( typeof sorting[0] === 'number' ) {
			sorting = settings.aaSorting = [ sorting ];
		}
	
		// If appending the sort then we are multi-column sorting
		if ( (shift || addIndex) && settings.oFeatures.bSortMulti ) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = _pluck(sorting, '0').indexOf(colIdx);
	
			if ( sortIdx !== -1 ) {
				// Yes, modify the sort
				nextSortIdx = next( sorting[sortIdx], true );
	
				if ( nextSortIdx === null && sorting.length === 1 ) {
					nextSortIdx = 0; // can't remove sorting completely
				}
	
				if ( nextSortIdx === null ) {
					sorting.splice( sortIdx, 1 );
				}
				else {
					sorting[sortIdx][1] = asSorting[ nextSortIdx ];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else if (shift) {
				// No sort on this column yet, being added by shift click
				// add it as itself
				sorting.push( [ colIdx, asSorting[0], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
			else {
				// No sort on this column yet, being added from a colspan
				// so add with same direction as first column
				sorting.push( [ colIdx, sorting[0][1], 0 ] );
				sorting[sorting.length-1]._idx = 0;
			}
		}
		else if ( sorting.length && sorting[0][0] == colIdx ) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next( sorting[0] );
	
			sorting.length = 1;
			sorting[0][1] = asSorting[ nextSortIdx ];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push( [ colIdx, asSorting[0] ] );
			sorting[0]._idx = 0;
		}
	}
	
	
	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses( settings )
	{
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.order.position;
		var sort = _fnSortFlatten( settings );
		var features = settings.oFeatures;
		var i, ien, colIdx;
	
		if ( features.bSort && features.bSortClasses ) {
			// Remove old sorting classes
			for ( i=0, ien=oldSort.length ; i<ien ; i++ ) {
				colIdx = oldSort[i].src;
	
				// Remove column sorting
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.removeClass( sortClass + (i<2 ? i+1 : 3) );
			}
	
			// Add new column sorting
			for ( i=0, ien=sort.length ; i<ien ; i++ ) {
				colIdx = sort[i].src;
	
				$( _pluck( settings.aoData, 'anCells', colIdx ) )
					.addClass( sortClass + (i<2 ? i+1 : 3) );
			}
		}
	
		settings.aLastSort = sort;
	}
	
	
	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData( settings, colIdx )
	{
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[ colIdx ];
		var customSort = DataTable.ext.order[ column.sSortDataType ];
		var customData;
	
		if ( customSort ) {
			customData = customSort.call( settings.oInstance, settings, colIdx,
				_fnColumnIndexToVisible( settings, colIdx )
			);
		}
	
		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[ column.sType+"-pre" ];
		var data = settings.aoData;
	
		for ( var rowIdx=0 ; rowIdx<data.length ; rowIdx++ ) {
			// Sparse array
			if (! data[rowIdx]) {
				continue;
			}
	
			row = data[rowIdx];
	
			if ( ! row._aSortData ) {
				row._aSortData = [];
			}
	
			if ( ! row._aSortData[colIdx] || customSort ) {
				cellData = customSort ?
					customData[rowIdx] : // If there was a custom sort function, use data from there
					_fnGetCellData( settings, rowIdx, colIdx, 'sort' );
	
				row._aSortData[ colIdx ] = formatter ?
					formatter( cellData, settings ) :
					cellData;
			}
		}
	}
	
	
	/**
	 * State information for a table
	 *
	 * @param {*} settings
	 * @returns State object
	 */
	function _fnSaveState ( settings )
	{
		if (settings._bLoadingState) {
			return;
		}
	
		/* Store the interesting variables */
		var state = {
			time:    +new Date(),
			start:   settings._iDisplayStart,
			length:  settings._iDisplayLength,
			order:   $.extend( true, [], settings.aaSorting ),
			search:  $.extend({}, settings.oPreviousSearch),
			columns: settings.aoColumns.map( function ( col, i ) {
				return {
					visible: col.bVisible,
					search: $.extend({}, settings.aoPreSearchCols[i])
				};
			} )
		};
	
		settings.oSavedState = state;
		_fnCallbackFire( settings, "aoStateSaveParams", 'stateSaveParams', [settings, state] );
		
		if ( settings.oFeatures.bStateSave && !settings.bDestroying )
		{
			settings.fnStateSaveCallback.call( settings.oInstance, settings, state );
		}	
	}
	
	
	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @param {function} callback Callback to execute when the state has been loaded
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState ( settings, init, callback )
	{
		if ( ! settings.oFeatures.bStateSave ) {
			callback();
			return;
		}
	
		var loaded = function(state) {
			_fnImplementState(settings, state, callback);
		}
	
		var state = settings.fnStateLoadCallback.call( settings.oInstance, settings, loaded );
	
		if ( state !== undefined ) {
			_fnImplementState( settings, state, callback );
		}
		// otherwise, wait for the loaded callback to be executed
	
		return true;
	}
	
	function _fnImplementState ( settings, s, callback) {
		var i, ien;
		var columns = settings.aoColumns;
		settings._bLoadingState = true;
	
		// When StateRestore was introduced the state could now be implemented at any time
		// Not just initialisation. To do this an api instance is required in some places
		var api = settings._bInitComplete ? new DataTable.Api(settings) : null;
	
		if ( ! s || ! s.time ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Reject old data
		var duration = settings.iStateDuration;
		if ( duration > 0 && s.time < +new Date() - (duration*1000) ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Allow custom and plug-in manipulation functions to alter the saved data set and
		// cancelling of loading by returning false
		var abStateLoad = _fnCallbackFire( settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s] );
		if ( abStateLoad.indexOf(false) !== -1 ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Number of columns have changed - all bets are off, no restore of settings
		if ( s.columns && columns.length !== s.columns.length ) {
			settings._bLoadingState = false;
			callback();
			return;
		}
	
		// Store the saved state so it might be accessed at any time
		settings.oLoadedState = $.extend( true, {}, s );
	
		// This is needed for ColReorder, which has to happen first to allow all
		// the stored indexes to be usable. It is not publicly documented.
		_fnCallbackFire( settings, null, 'stateLoadInit', [settings, s], true );
	
		// Page Length
		if ( s.length !== undefined ) {
			// If already initialised just set the value directly so that the select element is also updated
			if (api) {
				api.page.len(s.length)
			}
			else {
				settings._iDisplayLength   = s.length;
			}
		}
	
		// Restore key features - todo - for 1.11 this needs to be done by
		// subscribed events
		if ( s.start !== undefined ) {
			if(api === null) {
				settings._iDisplayStart    = s.start;
				settings.iInitDisplayStart = s.start;
			}
			else {
				_fnPageChange(settings, s.start/settings._iDisplayLength);
			}
		}
	
		// Order
		if ( s.order !== undefined ) {
			settings.aaSorting = [];
			$.each( s.order, function ( i, col ) {
				settings.aaSorting.push( col[0] >= columns.length ?
					[ 0, col[1] ] :
					col
				);
			} );
		}
	
		// Search
		if ( s.search !== undefined ) {
			$.extend( settings.oPreviousSearch, s.search );
		}
	
		// Columns
		if ( s.columns ) {
			for ( i=0, ien=s.columns.length ; i<ien ; i++ ) {
				var col = s.columns[i];
	
				// Visibility
				if ( col.visible !== undefined ) {
					// If the api is defined, the table has been initialised so we need to use it rather than internal settings
					if (api) {
						// Don't redraw the columns on every iteration of this loop, we will do this at the end instead
						api.column(i).visible(col.visible, false);
					}
					else {
						columns[i].bVisible = col.visible;
					}
				}
	
				// Search
				if ( col.search !== undefined ) {
					$.extend( settings.aoPreSearchCols[i], col.search );
				}
			}
			
			// If the api is defined then we need to adjust the columns once the visibility has been changed
			if (api) {
				api.columns.adjust();
			}
		}
	
		settings._bLoadingState = false;
		_fnCallbackFire( settings, 'aoStateLoaded', 'stateLoaded', [settings, s] );
		callback();
	}
	
	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog( settings, level, msg, tn )
	{
		msg = 'DataTables warning: '+
			(settings ? 'table id='+settings.sTableId+' - ' : '')+msg;
	
		if ( tn ) {
			msg += '. For more information about this error, please see '+
			'https://datatables.net/tn/'+tn;
		}
	
		if ( ! level  ) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;
	
			if ( settings ) {
				_fnCallbackFire( settings, null, 'dt-error', [ settings, tn, msg ], true );
			}
	
			if ( type == 'alert' ) {
				alert( msg );
			}
			else if ( type == 'throw' ) {
				throw new Error(msg);
			}
			else if ( typeof type == 'function' ) {
				type( settings, tn, msg );
			}
		}
		else if ( window.console && console.log ) {
			console.log( msg );
		}
	}
	
	
	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap( ret, src, name, mappedName )
	{
		if ( Array.isArray( name ) ) {
			$.each( name, function (i, val) {
				if ( Array.isArray( val ) ) {
					_fnMap( ret, src, val[0], val[1] );
				}
				else {
					_fnMap( ret, src, val );
				}
			} );
	
			return;
		}
	
		if ( mappedName === undefined ) {
			mappedName = name;
		}
	
		if ( src[name] !== undefined ) {
			ret[mappedName] = src[name];
		}
	}
	
	
	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend( out, extender, breakRefs )
	{
		var val;
	
		for ( var prop in extender ) {
			if ( Object.prototype.hasOwnProperty.call(extender, prop) ) {
				val = extender[prop];
	
				if ( $.isPlainObject( val ) ) {
					if ( ! $.isPlainObject( out[prop] ) ) {
						out[prop] = {};
					}
					$.extend( true, out[prop], val );
				}
				else if ( breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val) ) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}
	
		return out;
	}
	
	
	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object|string} selector Selector (for delegated events) or data object
	 *   to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction( n, selector, fn )
	{
		$(n)
			.on( 'click.DT', selector, function (e) {
				fn(e);
			} )
			.on( 'keypress.DT', selector, function (e){
				if ( e.which === 13 ) {
					e.preventDefault();
					fn(e);
				}
			} )
			.on( 'selectstart.DT', selector, function () {
				// Don't want a double click resulting in text selection
				return false;
			} );
	}
	
	
	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} store Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg( settings, store, fn )
	{
		if ( fn ) {
			settings[store].push(fn);
		}
	}
	
	
	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} eventName Name of the jQuery custom event to trigger. If
	 *      null no trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @param {boolean} [bubbles] True if the event should bubble
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire( settings, callbackArr, eventName, args, bubbles )
	{
		var ret = [];
	
		if ( callbackArr ) {
			ret = settings[callbackArr].slice().reverse().map( function (val) {
				return val.apply( settings.oInstance, args );
			} );
		}
	
		if ( eventName !== null) {
			var e = $.Event( eventName+'.dt' );
			var table = $(settings.nTable);
			
			// Expose the DataTables API on the event object for easy access
			e.dt = settings.api;
	
			table[bubbles ?  'trigger' : 'triggerHandler']( e, args );
	
			// If not yet attached to the document, trigger the event
			// on the body directly to sort of simulate the bubble
			if (bubbles && table.parents('body').length === 0) {
				$('body').trigger( e, args );
			}
	
			ret.push( e.result );
		}
	
		return ret;
	}
	
	
	function _fnLengthOverflow ( settings )
	{
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;
	
		/* If we have space to show extra rows (backing up from the end point - then do so */
		if ( start >= end )
		{
			start = end - len;
		}
	
		// Keep the start record on the current page
		start -= (start % len);
	
		if ( len === -1 || start < 0 )
		{
			start = 0;
		}
	
		settings._iDisplayStart = start;
	}
	
	
	function _fnRenderer( settings, type )
	{
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];
	
		if ( $.isPlainObject( renderer ) && renderer[type] ) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if ( typeof renderer === 'string' ) {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}
	
		// Use the default
		return host._;
	}
	
	
	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource ( settings )
	{
		if ( settings.oFeatures.bServerSide ) {
			return 'ssp';
		}
		else if ( settings.ajax ) {
			return 'ajax';
		}
		return 'dom';
	}
	
	/**
	 * Common replacement for language strings
	 *
	 * @param {*} settings DT settings object
	 * @param {*} str String with values to replace
	 * @param {*} entries Plural number for _ENTRIES_ - can be undefined
	 * @returns String
	 */
	function _fnMacros ( settings, str, entries )
	{
		// When infinite scrolling, we are always starting at 1. _iDisplayStart is
		// used only internally
		var
			formatter  = settings.fnFormatNumber,
			start      = settings._iDisplayStart+1,
			len        = settings._iDisplayLength,
			vis        = settings.fnRecordsDisplay(),
			max        = settings.fnRecordsTotal(),
			all        = len === -1;
	
		return str.
			replace(/_START_/g, formatter.call( settings, start ) ).
			replace(/_END_/g,   formatter.call( settings, settings.fnDisplayEnd() ) ).
			replace(/_MAX_/g,   formatter.call( settings, max ) ).
			replace(/_TOTAL_/g, formatter.call( settings, vis ) ).
			replace(/_PAGE_/g,  formatter.call( settings, all ? 1 : Math.ceil( start / len ) ) ).
			replace(/_PAGES_/g, formatter.call( settings, all ? 1 : Math.ceil( vis / len ) ) ).
			replace(/_ENTRIES_/g, settings.api.i18n('entries', '', entries) ).
			replace(/_ENTRIES-MAX_/g, settings.api.i18n('entries', '', max) ).
			replace(/_ENTRIES-TOTAL_/g, settings.api.i18n('entries', '', vis) );
	}
	
	
	
	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];
	
	
	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;
	
	
	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function ( mixed )
	{
		var idx, jq;
		var settings = DataTable.settings;
		var tables = _pluck(settings, 'nTable');
	
		if ( ! mixed ) {
			return [];
		}
		else if ( mixed.nTable && mixed.oFeatures ) {
			// DataTables settings object
			return [ mixed ];
		}
		else if ( mixed.nodeName && mixed.nodeName.toLowerCase() === 'table' ) {
			// Table node
			idx = tables.indexOf(mixed);
			return idx !== -1 ? [ settings[idx] ] : null;
		}
		else if ( mixed && typeof mixed.settings === 'function' ) {
			return mixed.settings().toArray();
		}
		else if ( typeof mixed === 'string' ) {
			// jQuery selector
			jq = $(mixed).get();
		}
		else if ( mixed instanceof $ ) {
			// jQuery object (also DataTables instance)
			jq = mixed.get();
		}
	
		if ( jq ) {
			return settings.filter(function (v, idx) {
				return jq.includes(tables[idx]);
			});
		}
	};
	
	
	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new DataTable.Api( 'table.dataTable' );
	 */
	_Api = function ( context, data )
	{
		if ( ! (this instanceof _Api) ) {
			return new _Api( context, data );
		}
	
		var settings = [];
		var ctxSettings = function ( o ) {
			var a = _toSettings( o );
			if ( a ) {
				settings.push.apply( settings, a );
			}
		};
	
		if ( Array.isArray( context ) ) {
			for ( var i=0, ien=context.length ; i<ien ; i++ ) {
				ctxSettings( context[i] );
			}
		}
		else {
			ctxSettings( context );
		}
	
		// Remove duplicates
		this.context = settings.length > 1
			? _unique( settings )
			: settings;
	
		// Initial data
		if ( data ) {
			this.push.apply(this, data);
		}
	
		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};
	
		_Api.extend( this, this, __apiStruct );
	};
	
	DataTable.Api = _Api;
	
	// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
	// isPlainObject.
	$.extend( _Api.prototype, {
		any: function ()
		{
			return this.count() !== 0;
		},
	
		context: [], // array of table settings objects
	
		count: function ()
		{
			return this.flatten().length;
		},
	
		each: function ( fn )
		{
			for ( var i=0, ien=this.length ; i<ien; i++ ) {
				fn.call( this, this[i], i, this );
			}
	
			return this;
		},
	
		eq: function ( idx )
		{
			var ctx = this.context;
	
			return ctx.length > idx ?
				new _Api( ctx[idx], this[idx] ) :
				null;
		},
	
		filter: function ( fn )
		{
			var a = __arrayProto.filter.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		flatten: function ()
		{
			var a = [];
	
			return new _Api( this.context, a.concat.apply( a, this.toArray() ) );
		},
	
		get: function ( idx )
		{
			return this[ idx ];
		},
	
		join:    __arrayProto.join,
	
		includes: function ( find ) {
			return this.indexOf( find ) === -1 ? false : true;
		},
	
		indexOf: __arrayProto.indexOf,
	
		iterator: function ( flatten, type, fn, alwaysNew ) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;
	
			// Argument shifting
			if ( typeof flatten === 'string' ) {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}
	
			for ( i=0, ien=context.length ; i<ien ; i++ ) {
				var apiInst = new _Api( context[i] );
	
				if ( type === 'table' ) {
					ret = fn.call( apiInst, context[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'columns' || type === 'rows' ) {
					// this has same length as context - one entry for each table
					ret = fn.call( apiInst, context[i], this[i], i );
	
					if ( ret !== undefined ) {
						a.push( ret );
					}
				}
				else if ( type === 'every' || type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell' ) {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];
	
					if ( type === 'column-rows' ) {
						rows = _selector_row_indexes( context[i], selector.opts );
					}
	
					for ( j=0, jen=items.length ; j<jen ; j++ ) {
						item = items[j];
	
						if ( type === 'cell' ) {
							ret = fn.call( apiInst, context[i], item.row, item.column, i, j );
						}
						else {
							ret = fn.call( apiInst, context[i], item, i, j, rows );
						}
	
						if ( ret !== undefined ) {
							a.push( ret );
						}
					}
				}
			}
	
			if ( a.length || alwaysNew ) {
				var api = new _Api( context, flatten ? a.concat.apply( [], a ) : a );
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},
	
		lastIndexOf: __arrayProto.lastIndexOf,
	
		length:  0,
	
		map: function ( fn )
		{
			var a = __arrayProto.map.call( this, fn, this );
	
			return new _Api( this.context, a );
		},
	
		pluck: function ( prop )
		{
			var fn = DataTable.util.get(prop);
	
			return this.map( function ( el ) {
				return fn(el);
			} );
		},
	
		pop:     __arrayProto.pop,
	
		push:    __arrayProto.push,
	
		reduce: __arrayProto.reduce,
	
		reduceRight: __arrayProto.reduceRight,
	
		reverse: __arrayProto.reverse,
	
		// Object with rows, columns and opts
		selector: null,
	
		shift:   __arrayProto.shift,
	
		slice: function () {
			return new _Api( this.context, this );
		},
	
		sort:    __arrayProto.sort,
	
		splice:  __arrayProto.splice,
	
		toArray: function ()
		{
			return __arrayProto.slice.call( this );
		},
	
		to$: function ()
		{
			return $( this );
		},
	
		toJQuery: function ()
		{
			return $( this );
		},
	
		unique: function ()
		{
			return new _Api( this.context, _unique(this.toArray()) );
		},
	
		unshift: __arrayProto.unshift
	} );
	
	
	function _api_scope( scope, fn, struc ) {
		return function () {
			var ret = fn.apply( scope || this, arguments );
	
			// Method extension
			_Api.extend( ret, ret, struc.methodExt );
			return ret;
		};
	}
	
	function _api_find( src, name ) {
		for ( var i=0, ien=src.length ; i<ien ; i++ ) {
			if ( src[i].name === name ) {
				return src[i];
			}
		}
		return null;
	}
	
	window.__apiStruct = __apiStruct;
	
	_Api.extend = function ( scope, obj, ext )
	{
		// Only extend API instances and static properties of the API
		if ( ! ext.length || ! obj || ( ! (obj instanceof _Api) && ! obj.__dt_wrapper ) ) {
			return;
		}
	
		var
			i, ien,
			struct;
	
		for ( i=0, ien=ext.length ; i<ien ; i++ ) {
			struct = ext[i];
	
			if (struct.name === '__proto__') {
				continue;
			}
	
			// Value
			obj[ struct.name ] = struct.type === 'function' ?
				_api_scope( scope, struct.val, struct ) :
				struct.type === 'object' ?
					{} :
					struct.val;
	
			obj[ struct.name ].__dt_wrapper = true;
	
			// Property extension
			_Api.extend( scope, obj[ struct.name ], struct.propExt );
		}
	};
	
	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]
	
	
	_Api.register = _api_register = function ( name, val )
	{
		if ( Array.isArray( name ) ) {
			for ( var j=0, jen=name.length ; j<jen ; j++ ) {
				_Api.register( name[j], val );
			}
			return;
		}
	
		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;
	
		for ( i=0, ien=heir.length ; i<ien ; i++ ) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];
	
			var src = _api_find( struct, key );
			if ( ! src ) {
				src = {
					name:      key,
					val:       {},
					methodExt: [],
					propExt:   [],
					type:      'object'
				};
				struct.push( src );
			}
	
			if ( i === ien-1 ) {
				src.val = val;
				src.type = typeof val === 'function' ?
					'function' :
					$.isPlainObject( val ) ?
						'object' :
						'other';
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};
	
	_Api.registerPlural = _api_registerPlural = function ( pluralName, singularName, val ) {
		_Api.register( pluralName, val );
	
		_Api.register( singularName, function () {
			var ret = val.apply( this, arguments );
	
			if ( ret === this ) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if ( ret instanceof _Api ) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					Array.isArray( ret[0] ) ?
						new _Api( ret.context, ret[0] ) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}
	
			// Non-API return - just fire it back
			return ret;
		} );
	};
	
	
	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function ( selector, a )
	{
		if ( Array.isArray(selector) ) {
			var result = [];
	
			selector.forEach(function (sel) {
				var inner = __table_selector(sel, a);
	
				result.push.apply(result, inner);
			});
	
			return result.filter( function (item) {
				return item;
			});
		}
	
		// Integer is used to pick out a table by index
		if ( typeof selector === 'number' ) {
			return [ a[ selector ] ];
		}
	
		// Perform a jQuery selector on the table nodes
		var nodes = a.map( function (el) {
			return el.nTable;
		} );
	
		return $(nodes)
			.filter( selector )
			.map( function () {
				// Need to translate back from the table node to the settings
				var idx = nodes.indexOf(this);
				return a[ idx ];
			} )
			.toArray();
	};
	
	
	
	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register( 'tables()', function ( selector ) {
		// A new instance is created if there was a selector specified
		return selector !== undefined && selector !== null ?
			new _Api( __table_selector( selector, this.context ) ) :
			this;
	} );
	
	
	_api_register( 'table()', function ( selector ) {
		var tables = this.tables( selector );
		var ctx = tables.context;
	
		// Truncate to the first matched table
		return ctx.length ?
			new _Api( ctx[0] ) :
			tables;
	} );
	
	// Common methods, combined to reduce size
	[
		['nodes', 'node', 'nTable'],
		['body', 'body', 'nTBody'],
		['header', 'header', 'nTHead'],
		['footer', 'footer', 'nTFoot'],
	].forEach(function (item) {
		_api_registerPlural(
			'tables().' + item[0] + '()',
			'table().' + item[1] + '()' ,
			function () {
				return this.iterator( 'table', function ( ctx ) {
					return ctx[item[2]];
				}, 1 );
			}
		);
	});
	
	// Structure methods
	[
		['header', 'aoHeader'],
		['footer', 'aoFooter'],
	].forEach(function (item) {
		_api_register( 'table().' + item[0] + '.structure()' , function (selector) {
			var indexes = this.columns(selector).indexes().flatten();
			var ctx = this.context[0];
			
			return _fnHeaderLayout(ctx, ctx[item[1]], indexes);
		} );
	})
	
	
	_api_registerPlural( 'tables().containers()', 'table().container()' , function () {
		return this.iterator( 'table', function ( ctx ) {
			return ctx.nTableWrapper;
		}, 1 );
	} );
	
	_api_register( 'tables().every()', function ( fn ) {
		var that = this;
	
		return this.iterator('table', function (s, i) {
			fn.call(that.table(i), i);
		});
	});
	
	_api_register( 'caption()', function ( value, side ) {
		var context = this.context;
	
		// Getter - return existing node's content
		if ( value === undefined ) {
			var caption = context[0].captionNode;
	
			return caption && context.length ?
				caption.innerHTML : 
				null;
		}
	
		return this.iterator( 'table', function ( ctx ) {
			var table = $(ctx.nTable);
			var caption = $(ctx.captionNode);
			var container = $(ctx.nTableWrapper);
	
			// Create the node if it doesn't exist yet
			if ( ! caption.length ) {
				caption = $('<caption/>').html( value );
				ctx.captionNode = caption[0];
	
				// If side isn't set, we need to insert into the document to let the
				// CSS decide so we can read it back, otherwise there is no way to
				// know if the CSS would put it top or bottom for scrolling
				if (! side) {
					table.prepend(caption);
	
					side = caption.css('caption-side');
				}
			}
	
			caption.html( value );
	
			if ( side ) {
				caption.css( 'caption-side', side );
				caption[0]._captionSide = side;
			}
	
			if (container.find('div.dataTables_scroll').length) {
				var selector = (side === 'top' ? 'Head' : 'Foot');
	
				container.find('div.dataTables_scroll'+ selector +' table').prepend(caption);
			}
			else {
				table.prepend(caption);
			}
		}, 1 );
	} );
	
	_api_register( 'caption.node()', function () {
		var ctx = this.context;
	
		return ctx.length ? ctx[0].captionNode : null;
	} );
	
	
	/**
	 * Redraw the tables in the current context.
	 */
	_api_register( 'draw()', function ( paging ) {
		return this.iterator( 'table', function ( settings ) {
			if ( paging === 'page' ) {
				_fnDraw( settings );
			}
			else {
				if ( typeof paging === 'string' ) {
					paging = paging === 'full-hold' ?
						false :
						true;
				}
	
				_fnReDraw( settings, paging===false );
			}
		} );
	} );
	
	
	
	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	 * Set the current page.
	 *
	 * Note that if you attempt to show a page which does not exist, DataTables will
	 * not throw an error, but rather reset the paging.
	 *
	 * @param {integer|string} action The paging action to take. This can be one of:
	 *  * `integer` - The page index to jump to
	 *  * `string` - An action to take:
	 *    * `first` - Jump to first page.
	 *    * `next` - Jump to the next page
	 *    * `previous` - Jump to previous page
	 *    * `last` - Jump to the last page.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page()', function ( action ) {
		if ( action === undefined ) {
			return this.page.info().page; // not an expensive call
		}
	
		// else, have an action to take on all tables
		return this.iterator( 'table', function ( settings ) {
			_fnPageChange( settings, action );
		} );
	} );
	
	
	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register( 'page.info()', function () {
		if ( this.context.length === 0 ) {
			return undefined;
		}
	
		var
			settings   = this.context[0],
			start      = settings._iDisplayStart,
			len        = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1;
	
		return {
			"page":           all ? 0 : Math.floor( start / len ),
			"pages":          all ? 1 : Math.ceil( visRecords / len ),
			"start":          start,
			"end":            settings.fnDisplayEnd(),
			"length":         len,
			"recordsTotal":   settings.fnRecordsTotal(),
			"recordsDisplay": visRecords,
			"serverSide":     _fnDataSource( settings ) === 'ssp'
		};
	} );
	
	
	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	 * Set the current page length.
	 *
	 * @param {integer} Page length to set. Use `-1` to show all records.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'page.len()', function ( len ) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if ( len === undefined ) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}
	
		// else, set the page length
		return this.iterator( 'table', function ( settings ) {
			_fnLengthChange( settings, len );
		} );
	} );
	
	
	
	var __reload = function ( settings, holdPosition, callback ) {
		// Use the draw event to trigger a callback
		if ( callback ) {
			var api = new _Api( settings );
	
			api.one( 'draw', function () {
				callback( api.ajax.json() );
			} );
		}
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			_fnReDraw( settings, holdPosition );
		}
		else {
			_fnProcessingDisplay( settings, true );
	
			// Cancel an existing request
			var xhr = settings.jqXHR;
			if ( xhr && xhr.readyState !== 4 ) {
				xhr.abort();
			}
	
			// Trigger xhr
			_fnBuildAjax( settings, {}, function( json ) {
				_fnClearTable( settings );
	
				var data = _fnAjaxDataSrc( settings, json );
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					_fnAddData( settings, data[i] );
				}
	
				_fnReDraw( settings, holdPosition );
				_fnInitComplete( settings );
				_fnProcessingDisplay( settings, false );
			} );
		}
	};
	
	
	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register( 'ajax.json()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].json;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register( 'ajax.params()', function () {
		var ctx = this.context;
	
		if ( ctx.length > 0 ) {
			return ctx[0].oAjaxData;
		}
	
		// else return undefined;
	} );
	
	
	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.reload()', function ( callback, resetPaging ) {
		return this.iterator( 'table', function (settings) {
			__reload( settings, resetPaging===false, callback );
		} );
	} );
	
	
	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	 * Set the Ajax URL. Note that this will set the URL for all tables in the
	 * current context.
	 *
	 * @param {string} url URL to set.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url()', function ( url ) {
		var ctx = this.context;
	
		if ( url === undefined ) {
			// get
			if ( ctx.length === 0 ) {
				return undefined;
			}
			ctx = ctx[0];
	
			return $.isPlainObject( ctx.ajax ) ?
				ctx.ajax.url :
				ctx.ajax;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( $.isPlainObject( settings.ajax ) ) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
		} );
	} );
	
	
	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'ajax.url().load()', function ( callback, resetPaging ) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator( 'table', function ( ctx ) {
			__reload( ctx, resetPaging===false, callback );
		} );
	} );
	
	
	
	
	var _selector_run = function ( type, selector, selectFn, settings, opts )
	{
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;
	
		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if ( ! selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined ) {
			selector = [ selector ];
		}
	
		for ( i=0, ien=selector.length ; i<ien ; i++ ) {
			// Only split on simple strings - complex expressions will be jQuery selectors
			a = selector[i] && selector[i].split && ! selector[i].match(/[[(:]/) ?
				selector[i].split(',') :
				[ selector[i] ];
	
			for ( j=0, jen=a.length ; j<jen ; j++ ) {
				res = selectFn( typeof a[j] === 'string' ? (a[j]).trim() : a[j] );
	
				// Remove empty items
				res = res.filter( function (item) {
					return item !== null && item !== undefined;
				});
	
				if ( res && res.length ) {
					out = out.concat( res );
				}
			}
		}
	
		// selector extensions
		var ext = _ext.selector[ type ];
		if ( ext.length ) {
			for ( i=0, ien=ext.length ; i<ien ; i++ ) {
				out = ext[i]( settings, opts, out );
			}
		}
	
		return _unique( out );
	};
	
	
	var _selector_opts = function ( opts )
	{
		if ( ! opts ) {
			opts = {};
		}
	
		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if ( opts.filter && opts.search === undefined ) {
			opts.search = opts.filter;
		}
	
		return $.extend( {
			search: 'none',
			order: 'current',
			page: 'all'
		}, opts );
	};
	
	
	// Reduce the API instance to the first item found
	var _selector_first = function ( old )
	{
		let inst = new _Api(old.context[0]);
	
		// Use a push rather than passing to the constructor, since it will
		// merge arrays down automatically, which isn't what is wanted here
		if (old.length) {
			inst.push( old[0] );
		}
	
		inst.selector = old.selector;
	
		// Limit to a single row / column / cell
		if (inst.length && inst[0].length > 1) {
			inst[0].splice(1);
		}
	
		return inst;
	};
	
	
	var _selector_row_indexes = function ( settings, opts )
	{
		var
			i, ien, tmp, a=[],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;
	
		var
			search = opts.search,  // none, applied, removed
			order  = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page   = opts.page;    // all, current
	
		if ( _fnDataSource( settings ) == 'ssp' ) {
			// In server-side processing mode, most options are irrelevant since
			// rows not shown don't exist and the index order is the applied order
			// Removed is a special case - for consistency just return an empty
			// array
			return search === 'removed' ?
				[] :
				_range( 0, displayMaster.length );
		}
	
		if ( page == 'current' ) {
			// Current page implies that order=current and filter=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for ( i=settings._iDisplayStart, ien=settings.fnDisplayEnd() ; i<ien ; i++ ) {
				a.push( displayFiltered[i] );
			}
		}
		else if ( order == 'current' || order == 'applied' ) {
			if ( search == 'none') {
				a = displayMaster.slice();
			}
			else if ( search == 'applied' ) {
				a = displayFiltered.slice();
			}
			else if ( search == 'removed' ) {
				// O(n+m) solution by creating a hash map
				var displayFilteredMap = {};
	
				for ( i=0, ien=displayFiltered.length ; i<ien ; i++ ) {
					displayFilteredMap[displayFiltered[i]] = null;
				}
	
				displayMaster.forEach(function (item) {
					if (! Object.prototype.hasOwnProperty.call(displayFilteredMap, item)) {
						a.push(item);
					}
				});
			}
		}
		else if ( order == 'index' || order == 'original' ) {
			for ( i=0, ien=settings.aoData.length ; i<ien ; i++ ) {
				if (! settings.aoData[i]) {
					continue;
				}
	
				if ( search == 'none' ) {
					a.push( i );
				}
				else { // applied | removed
					tmp = displayFiltered.indexOf(i);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( i );
					}
				}
			}
		}
		else if ( typeof order === 'number' ) {
			// Order the rows by the given column
			var ordered = _fnSort(settings, order, 'asc');
	
			if (search === 'none') {
				a = ordered;
			}
			else { // applied | removed
				for (i=0; i<ordered.length; i++) {
					tmp = displayFiltered.indexOf(ordered[i]);
	
					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0   && search == 'applied') )
					{
						a.push( ordered[i] );
					}
				}
			}
		}
	
		return a;
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	var __row_selector = function ( settings, selector, opts )
	{
		var rows;
		var run = function ( sel ) {
			var selInt = _intVal( sel );
			var aoData = settings.aoData;
	
			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if ( selInt !== null && ! opts ) {
				return [ selInt ];
			}
	
			if ( ! rows ) {
				rows = _selector_row_indexes( settings, opts );
			}
	
			if ( selInt !== null && rows.indexOf(selInt) !== -1 ) {
				// Selector - integer
				return [ selInt ];
			}
			else if ( sel === null || sel === undefined || sel === '' ) {
				// Selector - none
				return rows;
			}
	
			// Selector - function
			if ( typeof sel === 'function' ) {
				return rows.map( function (idx) {
					var row = aoData[ idx ];
					return sel( idx, row._aData, row.nTr ) ? idx : null;
				} );
			}
	
			// Selector - node
			if ( sel.nodeName ) {
				var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
				var cellIdx = sel._DT_CellIndex;
	
				if ( rowIdx !== undefined ) {
					// Make sure that the row is actually still present in the table
					return aoData[ rowIdx ] && aoData[ rowIdx ].nTr === sel ?
						[ rowIdx ] :
						[];
				}
				else if ( cellIdx ) {
					return aoData[ cellIdx.row ] && aoData[ cellIdx.row ].nTr === sel.parentNode ?
						[ cellIdx.row ] :
						[];
				}
				else {
					var host = $(sel).closest('*[data-dt-row]');
					return host.length ?
						[ host.data('dt-row') ] :
						[];
				}
			}
	
			// ID selector. Want to always be able to select rows by id, regardless
			// of if the tr element has been created or not, so can't rely upon
			// jQuery here - hence a custom implementation. This does not match
			// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
			// but to select it using a CSS selector engine (like Sizzle or
			// querySelect) it would need to need to be escaped for some characters.
			// DataTables simplifies this for row selectors since you can select
			// only a row. A # indicates an id any anything that follows is the id -
			// unescaped.
			if ( typeof sel === 'string' && sel.charAt(0) === '#' ) {
				// get row index from id
				var rowObj = settings.aIds[ sel.replace( /^#/, '' ) ];
				if ( rowObj !== undefined ) {
					return [ rowObj.idx ];
				}
	
				// need to fall through to jQuery in case there is DOM id that
				// matches
			}
			
			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order( settings.aoData, rows, 'nTr' )
			);
	
			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter( sel )
				.map( function () {
					return this._DT_RowIndex;
				} )
				.toArray();
		};
	
		var matched = _selector_run( 'row', selector, run, settings, opts );
	
		if (opts.order === 'current' || opts.order === 'applied') {
			_fnSortDisplay(settings, matched);
		}
	
		return matched;
	};
	
	
	_api_register( 'rows()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __row_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_register( 'rows().nodes()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return settings.aoData[ row ].nTr || undefined;
		}, 1 );
	} );
	
	_api_register( 'rows().data()', function () {
		return this.iterator( true, 'rows', function ( settings, rows ) {
			return _pluck_order( settings.aoData, rows, '_aData' );
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().cache()', 'row().cache()', function ( type ) {
		return this.iterator( 'row', function ( settings, row ) {
			var r = settings.aoData[ row ];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().invalidate()', 'row().invalidate()', function ( src ) {
		return this.iterator( 'row', function ( settings, row ) {
			_fnInvalidate( settings, row, src );
		} );
	} );
	
	_api_registerPlural( 'rows().indexes()', 'row().index()', function () {
		return this.iterator( 'row', function ( settings, row ) {
			return row;
		}, 1 );
	} );
	
	_api_registerPlural( 'rows().ids()', 'row().id()', function ( hash ) {
		var a = [];
		var context = this.context;
	
		// `iterator` will drop undefined values, but in this case we want them
		for ( var i=0, ien=context.length ; i<ien ; i++ ) {
			for ( var j=0, jen=this[i].length ; j<jen ; j++ ) {
				var id = context[i].rowIdFn( context[i].aoData[ this[i][j] ]._aData );
				a.push( (hash === true ? '#' : '' )+ id );
			}
		}
	
		return new _Api( context, a );
	} );
	
	_api_registerPlural( 'rows().remove()', 'row().remove()', function () {
		this.iterator( 'row', function ( settings, row ) {
			var data = settings.aoData;
			var rowData = data[ row ];
	
			// Delete from the display arrays
			var idx = settings.aiDisplayMaster.indexOf(row);
			if (idx !== -1) {
				settings.aiDisplayMaster.splice(idx, 1);
			}
	
			// For server-side processing tables - subtract the deleted row from the count
			if ( settings._iRecordsDisplay > 0 ) {
				settings._iRecordsDisplay--;
			}
	
			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow( settings );
	
			// Remove the row's ID reference if there is one
			var id = settings.rowIdFn( rowData._aData );
			if ( id !== undefined ) {
				delete settings.aIds[ id ];
			}
	
			data[row] = null;
		} );
	
		return this;
	} );
	
	
	_api_register( 'rows.add()', function ( rows ) {
		var newRows = this.iterator( 'table', function ( settings ) {
				var row, i, ien;
				var out = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
						out.push( _fnAddTr( settings, row )[0] );
					}
					else {
						out.push( _fnAddData( settings, row ) );
					}
				}
	
				return out;
			}, 1 );
	
		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows( -1 );
		modRows.pop();
		modRows.push.apply(modRows, newRows);
	
		return modRows;
	} );
	
	
	
	
	
	/**
	 *
	 */
	_api_register( 'row()', function ( selector, opts ) {
		return _selector_first( this.rows( selector, opts ) );
	} );
	
	
	_api_register( 'row().data()', function ( data ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// Get
			return ctx.length && this.length && this[0].length ?
				ctx[0].aoData[ this[0] ]._aData :
				undefined;
		}
	
		// Set
		var row = ctx[0].aoData[ this[0] ];
		row._aData = data;
	
		// If the DOM has an id, and the data source is an array
		if ( Array.isArray( data ) && row.nTr && row.nTr.id ) {
			_fnSetObjectDataFn( ctx[0].rowId )( data, row.nTr.id );
		}
	
		// Automatically invalidate
		_fnInvalidate( ctx[0], this[0], 'data' );
	
		return this;
	} );
	
	
	_api_register( 'row().node()', function () {
		var ctx = this.context;
	
		if (ctx.length && this.length && this[0].length) {
			var row = ctx[0].aoData[ this[0] ];
	
			if (row && row.nTr) {
				return row.nTr;
			}
		}
	
		return null;
	} );
	
	
	_api_register( 'row.add()', function ( row ) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if ( row instanceof $ && row.length ) {
			row = row[0];
		}
	
		var rows = this.iterator( 'table', function ( settings ) {
			if ( row.nodeName && row.nodeName.toUpperCase() === 'TR' ) {
				return _fnAddTr( settings, row )[0];
			}
			return _fnAddData( settings, row );
		} );
	
		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row( rows[0] );
	} );
	
	
	$(document).on('plugin-init.dt', function (e, context) {
		var api = new _Api( context );
	
		api.on( 'stateSaveParams.DT', function ( e, settings, d ) {
			// This could be more compact with the API, but it is a lot faster as a simple
			// internal loop
			var idFn = settings.rowIdFn;
			var rows = settings.aiDisplayMaster;
			var ids = [];
	
			for (var i=0 ; i<rows.length ; i++) {
				var rowIdx = rows[i];
				var data = settings.aoData[rowIdx];
	
				if (data._detailsShow) {
					ids.push( '#' + idFn(data._aData) );
				}
			}
	
			d.childRows = ids;
		});
	
		// For future state loads (e.g. with StateRestore)
		api.on( 'stateLoaded.DT', function (e, settings, state) {
			__details_state_load( api, state );
		});
	
		// And the initial load state
		__details_state_load( api, api.state.loaded() );
	});
	
	var __details_state_load = function (api, state)
	{
		if ( state && state.childRows ) {
			api
				.rows( state.childRows.map(function (id) {
					// Escape any `:` characters from the row id. Accounts for
					// already escaped characters.
					return id.replace(/([^:\\]*(?:\\.[^:\\]*)*):/g, "$1\\:");
				}) )
				.every( function () {
					_fnCallbackFire( api.settings()[0], null, 'requestChild', [ this ] )
				});
		}
	}
	
	var __details_add = function ( ctx, row, data, klass )
	{
		// Convert to array of TR elements
		var rows = [];
		var addRow = function ( r, k ) {
			// Recursion to allow for arrays of jQuery objects
			if ( Array.isArray( r ) || r instanceof $ ) {
				for ( var i=0, ien=r.length ; i<ien ; i++ ) {
					addRow( r[i], k );
				}
				return;
			}
	
			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if ( r.nodeName && r.nodeName.toLowerCase() === 'tr' ) {
				r.setAttribute( 'data-dt-row', row.idx );
				rows.push( r );
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td></td></tr>')
					.attr( 'data-dt-row', row.idx )
					.addClass( k );
				
				$('td', created)
					.addClass( k )
					.html( r )[0].colSpan = _fnVisbleColumns( ctx );
	
				rows.push( created[0] );
			}
		};
	
		addRow( data, klass );
	
		if ( row._details ) {
			row._details.detach();
		}
	
		row._details = $(rows);
	
		// If the children were already shown, that state should be retained
		if ( row._detailsShow ) {
			row._details.insertAfter( row.nTr );
		}
	};
	
	
	// Make state saving of child row details async to allow them to be batch processed
	var __details_state = DataTable.util.throttle(
		function (ctx) {
			_fnSaveState( ctx[0] )
		},
		500
	);
	
	
	var __details_remove = function ( api, idx )
	{
		var ctx = api.context;
	
		if ( ctx.length ) {
			var row = ctx[0].aoData[ idx !== undefined ? idx : api[0] ];
	
			if ( row && row._details ) {
				row._details.remove();
	
				row._detailsShow = undefined;
				row._details = undefined;
				$( row.nTr ).removeClass( 'dt-hasChild' );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_display = function ( api, show ) {
		var ctx = api.context;
	
		if ( ctx.length && api.length ) {
			var row = ctx[0].aoData[ api[0] ];
	
			if ( row._details ) {
				row._detailsShow = show;
	
				if ( show ) {
					row._details.insertAfter( row.nTr );
					$( row.nTr ).addClass( 'dt-hasChild' );
				}
				else {
					row._details.detach();
					$( row.nTr ).removeClass( 'dt-hasChild' );
				}
	
				_fnCallbackFire( ctx[0], null, 'childRow', [ show, api.row( api[0] ) ] )
	
				__details_events( ctx[0] );
				__details_state( ctx );
			}
		}
	};
	
	
	var __details_events = function ( settings )
	{
		var api = new _Api( settings );
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw'+namespace;
		var colvisEvent = 'column-sizing'+namespace;
		var destroyEvent = 'destroy'+namespace;
		var data = settings.aoData;
	
		api.off( drawEvent +' '+ colvisEvent +' '+ destroyEvent );
	
		if ( _pluck( data, '_details' ).length > 0 ) {
			// On each draw, insert the required elements into the document
			api.on( drawEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				api.rows( {page:'current'} ).eq(0).each( function (idx) {
					// Internal data grab
					var row = data[ idx ];
	
					if ( row._detailsShow ) {
						row._details.insertAfter( row.nTr );
					}
				} );
			} );
	
			// Column visibility change - update the colspan
			api.on( colvisEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns( ctx );
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					row = data[i];
	
					if ( row && row._details ) {
						row._details.each(function () {
							var el = $(this).children('td');
	
							if (el.length == 1) {
								el.attr('colspan', visible);
							}
						});
					}
				}
			} );
	
			// Table destroyed - nuke any child rows
			api.on( destroyEvent, function ( e, ctx ) {
				if ( settings !== ctx ) {
					return;
				}
	
				for ( var i=0, ien=data.length ; i<ien ; i++ ) {
					if ( data[i] && data[i]._details ) {
						__details_remove( api, i );
					}
				}
			} );
		}
	};
	
	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp+'row().child';
	var _child_mth = _child_obj+'()';
	
	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register( _child_mth, function ( data, klass ) {
		var ctx = this.context;
	
		if ( data === undefined ) {
			// get
			return ctx.length && this.length && ctx[0].aoData[ this[0] ]
				? ctx[0].aoData[ this[0] ]._details
				: undefined;
		}
		else if ( data === true ) {
			// show
			this.child.show();
		}
		else if ( data === false ) {
			// remove
			__details_remove( this );
		}
		else if ( ctx.length && this.length ) {
			// set
			__details_add( ctx[0], ctx[0].aoData[ this[0] ], data, klass );
		}
	
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.show()',
		_child_mth+'.show()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, true );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.hide()',
		_child_mth+'.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display( this, false );
		return this;
	} );
	
	
	_api_register( [
		_child_obj+'.remove()',
		_child_mth+'.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove( this );
		return this;
	} );
	
	
	_api_register( _child_obj+'.isShown()', function () {
		var ctx = this.context;
	
		if ( ctx.length && this.length && ctx[0].aoData[ this[0] ] ) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[ this[0] ]._detailsShow || false;
		}
		return false;
	} );
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */
	
	// can be an array of these items, comma separated list, or an array of comma
	// separated lists
	
	var __re_column_selector = /^([^:]+)?:(name|title|visIdx|visible)$/;
	
	
	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function ( settings, column, r1, r2, rows, type ) {
		var a = [];
		for ( var row=0, ien=rows.length ; row<ien ; row++ ) {
			a.push( _fnGetCellData( settings, rows[row], column, type ) );
		}
		return a;
	};
	
	
	var __column_header = function ( settings, column, row ) {
		var header = settings.aoHeader;
		var target = row !== undefined
			? row
			: settings.bSortCellsTop // legacy support
				? 0
				: header.length - 1;
	
		return header[target][column].cell;
	};
	
	var __column_selector = function ( settings, selector, opts )
	{
		var
			columns = settings.aoColumns,
			names = _pluck( columns, 'sName' ),
			titles = _pluck( columns, 'sTitle' ),
			cells = DataTable.util.get('[].[].cell')(settings.aoHeader),
			nodes = _unique( _flatten([], cells) );
		
		var run = function ( s ) {
			var selInt = _intVal( s );
	
			// Selector - all
			if ( s === '' ) {
				return _range( columns.length );
			}
	
			// Selector - index
			if ( selInt !== null ) {
				return [ selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}
	
			// Selector = function
			if ( typeof s === 'function' ) {
				var rows = _selector_row_indexes( settings, opts );
	
				return columns.map(function (col, idx) {
					return s(
							idx,
							__columnData( settings, idx, 0, 0, rows ),
							__column_header( settings, idx )
						) ? idx : null;
				});
			}
	
			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match( __re_column_selector ) :
				'';
	
			if ( match ) {
				switch( match[2] ) {
					case 'visIdx':
					case 'visible':
						if (match[1]) {
							var idx = parseInt( match[1], 10 );
							// Visible index given, convert to column index
							if ( idx < 0 ) {
								// Counting from the right
								var visColumns = columns.map( function (col,i) {
									return col.bVisible ? i : null;
								} );
								return [ visColumns[ visColumns.length + idx ] ];
							}
							// Counting from the left
							return [ _fnVisibleToColumnIndex( settings, idx ) ];
						}
						
						// `:visible` on its own
						return columns.map( function (col, i) {
							return col.bVisible ? i : null;
						} );
	
					case 'name':
						// match by name. `names` is column index complete and in order
						return names.map( function (name, i) {
							return name === match[1] ? i : null;
						} );
	
					case 'title':
						// match by column title
						return titles.map( function (title, i) {
							return title === match[1] ? i : null;
						} );
	
					default:
						return [];
				}
			}
	
			// Cell in the table body
			if ( s.nodeName && s._DT_CellIndex ) {
				return [ s._DT_CellIndex.column ];
			}
	
			// jQuery selector on the TH elements for the columns
			var jqResult = $( nodes )
				.filter( s )
				.map( function () {
					return _fnColumnsFromHeader( this ); // `nodes` is column index complete and in order
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise a node which might have a `dt-column` data attribute, or be
			// a child or such an element
			var host = $(s).closest('*[data-dt-column]');
			return host.length ?
				[ host.data('dt-column') ] :
				[];
		};
	
		return _selector_run( 'column', selector, run, settings, opts );
	};
	
	
	var __setColumnVis = function ( settings, column, vis ) {
		var
			cols = settings.aoColumns,
			col  = cols[ column ],
			data = settings.aoData,
			cells, i, ien, tr;
	
		// Get
		if ( vis === undefined ) {
			return col.bVisible;
		}
	
		// Set
		// No change
		if ( col.bVisible === vis ) {
			return false;
		}
	
		if ( vis ) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = _pluck(cols, 'bVisible').indexOf(true, column+1);
	
			for ( i=0, ien=data.length ; i<ien ; i++ ) {
				if (data[i]) {
					tr = data[i].nTr;
					cells = data[i].anCells;
	
					if ( tr ) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore( cells[ column ], cells[ insertBefore ] || null );
					}
				}
			}
		}
		else {
			// Remove column
			$( _pluck( settings.aoData, 'anCells', column ) ).detach();
		}
	
		// Common actions
		col.bVisible = vis;
	
		_colGroup(settings);
		
		return true;
	};
	
	
	_api_register( 'columns()', function ( selector, opts ) {
		// argument shifting
		if ( selector === undefined ) {
			selector = '';
		}
		else if ( $.isPlainObject( selector ) ) {
			opts = selector;
			selector = '';
		}
	
		opts = _selector_opts( opts );
	
		var inst = this.iterator( 'table', function ( settings ) {
			return __column_selector( settings, selector, opts );
		}, 1 );
	
		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;
	
		return inst;
	} );
	
	_api_registerPlural( 'columns().header()', 'column().header()', function ( row ) {
		return this.iterator( 'column', function (settings, column) {
			return __column_header(settings, column, row);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().footer()', 'column().footer()', function ( row ) {
		return this.iterator( 'column', function ( settings, column ) {
			var footer = settings.aoFooter;
	
			if (! footer.length) {
				return null;
			}
	
			return settings.aoFooter[row !== undefined ? row : 0][column].cell;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().data()', 'column().data()', function () {
		return this.iterator( 'column-rows', __columnData, 1 );
	} );
	
	_api_registerPlural( 'columns().render()', 'column().render()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return __columnData( settings, column, i, j, rows, type );
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column].mData;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().cache()', 'column().cache()', function ( type ) {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().init()', 'column().init()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			return settings.aoColumns[column];
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().nodes()', 'column().nodes()', function () {
		return this.iterator( 'column-rows', function ( settings, column, i, j, rows ) {
			return _pluck_order( settings.aoData, rows, 'anCells', column ) ;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().titles()', 'column().title()', function (title, row) {
		return this.iterator( 'column', function ( settings, column ) {
			// Argument shifting
			if (typeof title === 'number') {
				row = title;
				title = undefined;
			}
	
			var span = $('span.dt-column-title', this.column(column).header(row));
	
			if (title !== undefined) {
				span.html(title);
				return this;
			}
	
			return span.html();
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().types()', 'column().type()', function () {
		return this.iterator( 'column', function ( settings, column ) {
			var type = settings.aoColumns[column].sType;
	
			// If the type was invalidated, then resolve it. This actually does
			// all columns at the moment. Would only happen once if getting all
			// column's data types.
			if (! type) {
				_fnColumnTypes(settings);
			}
	
			return type;
		}, 1 );
	} );
	
	_api_registerPlural( 'columns().visible()', 'column().visible()', function ( vis, calc ) {
		var that = this;
		var changed = [];
		var ret = this.iterator( 'column', function ( settings, column ) {
			if ( vis === undefined ) {
				return settings.aoColumns[ column ].bVisible;
			} // else
			
			if (__setColumnVis( settings, column, vis )) {
				changed.push(column);
			}
		} );
	
		// Group the column visibility changes
		if ( vis !== undefined ) {
			this.iterator( 'table', function ( settings ) {
				// Redraw the header after changes
				_fnDrawHead( settings, settings.aoHeader );
				_fnDrawHead( settings, settings.aoFooter );
		
				// Update colspan for no records display. Child rows and extensions will use their own
				// listeners to do this - only need to update the empty table item here
				if ( ! settings.aiDisplay.length ) {
					$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
				}
		
				_fnSaveState( settings );
	
				// Second loop once the first is done for events
				that.iterator( 'column', function ( settings, column ) {
					if (changed.includes(column)) {
						_fnCallbackFire( settings, null, 'column-visibility', [settings, column, vis, calc] );
					}
				} );
	
				if ( changed.length && (calc === undefined || calc) ) {
					that.columns.adjust();
				}
			});
		}
	
		return ret;
	} );
	
	_api_registerPlural( 'columns().widths()', 'column().width()', function () {
		// Injects a fake row into the table for just a moment so the widths can
		// be read, regardless of colspan in the header and rows being present in
		// the body
		var columns = this.columns(':visible').count();
		var row = $('<tr>').html('<td>' + Array(columns).join('</td><td>') + '</td>');
	
		$(this.table().body()).append(row);
	
		var widths = row.children().map(function () {
			return $(this).outerWidth();
		});
	
		row.remove();
		
		return this.iterator( 'column', function ( settings, column ) {
			var visIdx = _fnColumnIndexToVisible( settings, column );
	
			return visIdx !== null ? widths[visIdx] : 0;
		}, 1);
	} );
	
	_api_registerPlural( 'columns().indexes()', 'column().index()', function ( type ) {
		return this.iterator( 'column', function ( settings, column ) {
			return type === 'visible' ?
				_fnColumnIndexToVisible( settings, column ) :
				column;
		}, 1 );
	} );
	
	_api_register( 'columns.adjust()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnAdjustColumnSizing( settings );
		}, 1 );
	} );
	
	_api_register( 'column.index()', function ( type, idx ) {
		if ( this.context.length !== 0 ) {
			var ctx = this.context[0];
	
			if ( type === 'fromVisible' || type === 'toData' ) {
				return _fnVisibleToColumnIndex( ctx, idx );
			}
			else if ( type === 'fromData' || type === 'toVisible' ) {
				return _fnColumnIndexToVisible( ctx, idx );
			}
		}
	} );
	
	_api_register( 'column()', function ( selector, opts ) {
		return _selector_first( this.columns( selector, opts ) );
	} );
	
	var __cell_selector = function ( settings, selector, opts )
	{
		var data = settings.aoData;
		var rows = _selector_row_indexes( settings, opts );
		var cells = _removeEmpty( _pluck_order( data, rows, 'anCells' ) );
		var allCells = $(_flatten( [], cells ));
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;
	
		var run = function ( s ) {
			var fnSelector = typeof s === 'function';
	
			if ( s === null || s === undefined || fnSelector ) {
				// All cells and function selectors
				a = [];
	
				for ( i=0, ien=rows.length ; i<ien ; i++ ) {
					row = rows[i];
	
					for ( j=0 ; j<columns ; j++ ) {
						o = {
							row: row,
							column: j
						};
	
						if ( fnSelector ) {
							// Selector - function
							host = data[ row ];
	
							if ( s( o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null ) ) {
								a.push( o );
							}
						}
						else {
							// Selector - all
							a.push( o );
						}
					}
				}
	
				return a;
			}
			
			// Selector - index
			if ( $.isPlainObject( s ) ) {
				// Valid cell index and its in the array of selectable rows
				return s.column !== undefined && s.row !== undefined && rows.indexOf(s.row) !== -1 ?
					[s] :
					[];
			}
	
			// Selector - jQuery filtered cells
			var jqResult = allCells
				.filter( s )
				.map( function (i, el) {
					return { // use a new object, in case someone changes the values
						row:    el._DT_CellIndex.row,
						column: el._DT_CellIndex.column
					};
				} )
				.toArray();
	
			if ( jqResult.length || ! s.nodeName ) {
				return jqResult;
			}
	
			// Otherwise the selector is a node, and there is one last option - the
			// element might be a child of an element which has dt-row and dt-column
			// data attributes
			host = $(s).closest('*[data-dt-row]');
			return host.length ?
				[ {
					row: host.data('dt-row'),
					column: host.data('dt-column')
				} ] :
				[];
		};
	
		return _selector_run( 'cell', selector, run, settings, opts );
	};
	
	
	
	
	_api_register( 'cells()', function ( rowSelector, columnSelector, opts ) {
		// Argument shifting
		if ( $.isPlainObject( rowSelector ) ) {
			// Indexes
			if ( rowSelector.row === undefined ) {
				// Selector options in first parameter
				opts = rowSelector;
				rowSelector = null;
			}
			else {
				// Cell index objects in first parameter
				opts = columnSelector;
				columnSelector = null;
			}
		}
		if ( $.isPlainObject( columnSelector ) ) {
			opts = columnSelector;
			columnSelector = null;
		}
	
		// Cell selector
		if ( columnSelector === null || columnSelector === undefined ) {
			return this.iterator( 'table', function ( settings ) {
				return __cell_selector( settings, rowSelector, _selector_opts( opts ) );
			} );
		}
	
		// The default built in options need to apply to row and columns
		var internalOpts = opts ? {
			page: opts.page,
			order: opts.order,
			search: opts.search
		} : {};
	
		// Row + column selector
		var columns = this.columns( columnSelector, internalOpts );
		var rows = this.rows( rowSelector, internalOpts );
		var i, ien, j, jen;
	
		var cellsNoOpts = this.iterator( 'table', function ( settings, idx ) {
			var a = [];
	
			for ( i=0, ien=rows[idx].length ; i<ien ; i++ ) {
				for ( j=0, jen=columns[idx].length ; j<jen ; j++ ) {
					a.push( {
						row:    rows[idx][i],
						column: columns[idx][j]
					} );
				}
			}
	
			return a;
		}, 1 );
	
		// There is currently only one extension which uses a cell selector extension
		// It is a _major_ performance drag to run this if it isn't needed, so this is
		// an extension specific check at the moment
		var cells = opts && opts.selected ?
			this.cells( cellsNoOpts, opts ) :
			cellsNoOpts;
	
		$.extend( cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		} );
	
		return cells;
	} );
	
	
	_api_registerPlural( 'cells().nodes()', 'cell().node()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			var data = settings.aoData[ row ];
	
			return data && data.anCells ?
				data.anCells[ column ] :
				undefined;
		}, 1 );
	} );
	
	
	_api_register( 'cells().data()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().cache()', 'cell().cache()', function ( type ) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';
	
		return this.iterator( 'cell', function ( settings, row, column ) {
			return settings.aoData[ row ][ type ][ column ];
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().render()', 'cell().render()', function ( type ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return _fnGetCellData( settings, row, column, type );
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().indexes()', 'cell().index()', function () {
		return this.iterator( 'cell', function ( settings, row, column ) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible( settings, column )
			};
		}, 1 );
	} );
	
	
	_api_registerPlural( 'cells().invalidate()', 'cell().invalidate()', function ( src ) {
		return this.iterator( 'cell', function ( settings, row, column ) {
			_fnInvalidate( settings, row, src, column );
		} );
	} );
	
	
	
	_api_register( 'cell()', function ( rowSelector, columnSelector, opts ) {
		return _selector_first( this.cells( rowSelector, columnSelector, opts ) );
	} );
	
	
	_api_register( 'cell().data()', function ( data ) {
		var ctx = this.context;
		var cell = this[0];
	
		if ( data === undefined ) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData( ctx[0], cell[0].row, cell[0].column ) :
				undefined;
		}
	
		// Set
		_fnSetCellData( ctx[0], cell[0].row, cell[0].column, data );
		_fnInvalidate( ctx[0], cell[0].row, 'data', cell[0].column );
	
		return this;
	} );
	
	
	
	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {integer} order Column index to sort upon.
	 * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 1D array of sorting information to be applied.
	 * @param {array} [...] Optional additional sorting conditions
	 * @returns {DataTables.Api} this
	 *//**
	 * Set the ordering for the table.
	 *
	 * @param {array} order 2D array of sorting information to be applied.
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order()', function ( order, dir ) {
		var ctx = this.context;
		var args = Array.prototype.slice.call( arguments );
	
		if ( order === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}
	
		// set
		if ( typeof order === 'number' ) {
			// Simple column / direction passed in
			order = [ [ order, dir ] ];
		}
		else if ( args.length > 1 ) {
			// Arguments passed in (list of 1D arrays)
			order = args;
		}
		// otherwise a 2D array was passed in
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSorting = Array.isArray(order) ? order.slice() : order;
		} );
	} );
	
	
	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register( 'order.listener()', function ( node, column, callback ) {
		return this.iterator( 'table', function ( settings ) {
			_fnSortAttachListener(settings, node, {}, column, callback);
		} );
	} );
	
	
	_api_register( 'order.fixed()', function ( set ) {
		if ( ! set ) {
			var ctx = this.context;
			var fixed = ctx.length ?
				ctx[0].aaSortingFixed :
				undefined;
	
			return Array.isArray( fixed ) ?
				{ pre: fixed } :
				fixed;
		}
	
		return this.iterator( 'table', function ( settings ) {
			settings.aaSortingFixed = $.extend( true, {}, set );
		} );
	} );
	
	
	// Order by the selected column(s)
	_api_register( [
		'columns().order()',
		'column().order()'
	], function ( dir ) {
		var that = this;
	
		if ( ! dir ) {
			return this.iterator( 'column', function ( settings, idx ) {
				var sort = _fnSortFlatten( settings );
	
				for ( var i=0, ien=sort.length ; i<ien ; i++ ) {
					if ( sort[i].col === idx ) {
						return sort[i].dir;
					}
				}
	
				return null;
			}, 1 );
		}
		else {
			return this.iterator( 'table', function ( settings, i ) {
				settings.aaSorting = that[i].map( function (col) {
					return [ col, dir ];
				} );
			} );
		}
	} );
	
	_api_registerPlural('columns().orderable()', 'column().orderable()', function ( directions ) {
		return this.iterator( 'column', function ( settings, idx ) {
			var col = settings.aoColumns[idx];
	
			return directions ?
				col.asSorting :
				col.bSortable;
		}, 1 );
	} );
	
	
	_api_register( 'processing()', function ( show ) {
		return this.iterator( 'table', function ( ctx ) {
			_fnProcessingDisplay( ctx, show );
		} );
	} );
	
	
	_api_register( 'search()', function ( input, regex, smart, caseInsen ) {
		var ctx = this.context;
	
		if ( input === undefined ) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.search :
				undefined;
		}
	
		// set
		return this.iterator( 'table', function ( settings ) {
			if ( ! settings.oFeatures.bFilter ) {
				return;
			}
	
			if (typeof regex === 'object') {
				// New style options to pass to the search builder
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, regex, {
					search: input
				} ) );
			}
			else {
				// Compat for the old options
				_fnFilterComplete( settings, $.extend( settings.oPreviousSearch, {
					search: input,
					regex:  regex === null ? false : regex,
					smart:  smart === null ? true  : smart,
					caseInsensitive: caseInsen === null ? true : caseInsen
				} ) );
			}
		} );
	} );
	
	_api_register( 'search.fixed()', function ( name, search ) {
		var ret = this.iterator( true, 'table', function ( settings ) {
			var fixed = settings.searchFixed;
	
			if (! name) {
				return Object.keys(fixed)
			}
			else if (search === undefined) {
				return fixed[name];
			}
			else if (search === null) {
				delete fixed[name];
			}
			else {
				fixed[name] = search;
			}
	
			return this;
		} );
	
		return name !== undefined && search === undefined
			? ret[0]
			: ret;
	} );
	
	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function ( input, regex, smart, caseInsen ) {
			return this.iterator( 'column', function ( settings, column ) {
				var preSearch = settings.aoPreSearchCols;
	
				if ( input === undefined ) {
					// get
					return preSearch[ column ].search;
				}
	
				// set
				if ( ! settings.oFeatures.bFilter ) {
					return;
				}
	
				if (typeof regex === 'object') {
					// New style options to pass to the search builder
					$.extend( preSearch[ column ], regex, {
						search: input
					} );
				}
				else {
					// Old style (with not all options available)
					$.extend( preSearch[ column ], {
						search: input,
						regex:  regex === null ? false : regex,
						smart:  smart === null ? true  : smart,
						caseInsensitive: caseInsen === null ? true : caseInsen
					} );
				}
	
				_fnFilterComplete( settings, settings.oPreviousSearch );
			} );
		}
	);
	
	_api_register([
			'columns().search.fixed()',
			'column().search.fixed()'
		],
		function ( name, search ) {
			var ret = this.iterator( true, 'column', function ( settings, colIdx ) {
				var fixed = settings.aoColumns[colIdx].searchFixed;
	
				if (! name) {
					return Object.keys(fixed)
				}
				else if (search === undefined) {
					return fixed[name];
				}
				else if (search === null) {
					delete fixed[name];
				}
				else {
					fixed[name] = search;
				}
	
				return this;
			} );
	
			return name !== undefined && search === undefined
				? ret[0]
				: ret;
		}
	);
	/*
	 * State API methods
	 */
	
	_api_register( 'state()', function ( set, ignoreTime ) {
		// getter
		if ( ! set ) {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		}
	
		var setMutate = $.extend( true, {}, set );
	
		// setter
		return this.iterator( 'table', function ( settings ) {
			if ( ignoreTime !== false ) {
				setMutate.time = +new Date() + 100;
			}
	
			_fnImplementState( settings, setMutate, function(){} );
		} );
	} );
	
	
	_api_register( 'state.clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			// Save an empty object
			settings.fnStateSaveCallback.call( settings.oInstance, settings, {} );
		} );
	} );
	
	
	_api_register( 'state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	} );
	
	
	_api_register( 'state.save()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnSaveState( settings );
		} );
	} );
	
	/**
	 * Set the libraries that DataTables uses, or the global objects.
	 * Note that the arguments can be either way around (legacy support)
	 * and the second is optional. See docs.
	 */
	DataTable.use = function (arg1, arg2) {
		// Reverse arguments for legacy support
		var module = typeof arg1 === 'string'
			? arg2
			: arg1;
		var type = typeof arg2 === 'string'
			? arg2
			: arg1;
	
		// Getter
		if (module === undefined && typeof type === 'string') {
			switch (type) {
				case 'lib':
				case 'jq':
					return $;
	
				case 'win':
					return window;
	
				case 'datetime':
					return DataTable.DateTime;
	
				case 'luxon':
					return __luxon;
	
				case 'moment':
					return __moment;
	
				default:
					return null;
			}
		}
	
		// Setter
		if (type === 'lib' || type === 'jq' || (module && module.fn && module.fn.jquery)) {
			$ = module;
		}
		else if (type == 'win' || (module && module.document)) {
			window = module;
			document = module.document;
		}
		else if (type === 'datetime' || (module && module.type === 'DateTime')) {
			DataTable.DateTime = module;
		}
		else if (type === 'luxon' || (module && module.FixedOffsetZone)) {
			__luxon = module;
		}
		else if (type === 'moment' || (module && module.isMoment)) {
			__moment = module;
		}
	}
	
	/**
	 * CommonJS factory function pass through. This will check if the arguments
	 * given are a window object or a jQuery object. If so they are set
	 * accordingly.
	 * @param {*} root Window
	 * @param {*} jq jQUery
	 * @returns {boolean} Indicator
	 */
	DataTable.factory = function (root, jq) {
		var is = false;
	
		// Test if the first parameter is a window object
		if (root && root.document) {
			window = root;
			document = root.document;
		}
	
		// Test if the second parameter is a jQuery object
		if (jq && jq.fn && jq.fn.jquery) {
			$ = jq;
			is = true;
		}
	
		return is;
	}
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @param {string} [version2=current DataTables version] As above, but optional.
	 *   If not given the current DataTables version will be used.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = function( version, version2 )
	{
		var aThis = version2 ?
			version2.split('.') :
			DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;
	
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ ) {
			iThis = parseInt( aThis[i], 10 ) || 0;
			iThat = parseInt( aThat[i], 10 ) || 0;
	
			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}
	
			// Parts are different, return immediately
			return iThis > iThat;
		}
	
		return true;
	};
	
	
	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = function ( table )
	{
		var t = $(table).get(0);
		var is = false;
	
		if ( table instanceof DataTable.Api ) {
			return true;
		}
	
		$.each( DataTable.settings, function (i, o) {
			var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
			var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;
	
			if ( o.nTable === t || head === t || foot === t ) {
				is = true;
			}
		} );
	
		return is;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = function ( visible )
	{
		var api = false;
	
		if ( $.isPlainObject( visible ) ) {
			api = visible.api;
			visible = visible.visible;
		}
	
		var a = DataTable.settings
			.filter( function (o) {
				return !visible || (visible && $(o.nTable).is(':visible')) 
					? true
					: false;
			} )
			.map( function (o) {
				return o.nTable;
			});
	
		return api ?
			new _Api( a ) :
			a;
	};
	
	
	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;
	
	
	
	/**
	 *
	 */
	_api_register( '$()', function ( selector, opts ) {
		var
			rows   = this.rows( opts ).nodes(), // Get all rows
			jqRows = $(rows);
	
		return $( [].concat(
			jqRows.filter( selector ).toArray(),
			jqRows.find( selector ).toArray()
		) );
	} );
	
	
	// jQuery functions to operate on the tables
	$.each( [ 'on', 'one', 'off' ], function (i, key) {
		_api_register( key+'()', function ( /* event, handler */ ) {
			var args = Array.prototype.slice.call(arguments);
	
			// Add the `dt` namespace automatically if it isn't already present
			args[0] = args[0].split( /\s/ ).map( function ( e ) {
				return ! e.match(/\.dt\b/) ?
					e+'.dt' :
					e;
				} ).join( ' ' );
	
			var inst = $( this.tables().nodes() );
			inst[key].apply( inst, args );
			return this;
		} );
	} );
	
	
	_api_register( 'clear()', function () {
		return this.iterator( 'table', function ( settings ) {
			_fnClearTable( settings );
		} );
	} );
	
	
	_api_register( 'error()', function (msg) {
		return this.iterator( 'table', function ( settings ) {
			_fnLog( settings, 0, msg );
		} );
	} );
	
	
	_api_register( 'settings()', function () {
		return new _Api( this.context, this.context );
	} );
	
	
	_api_register( 'init()', function () {
		var ctx = this.context;
		return ctx.length ? ctx[0].oInit : null;
	} );
	
	
	_api_register( 'data()', function () {
		return this.iterator( 'table', function ( settings ) {
			return _pluck( settings.aoData, '_aData' );
		} ).flatten();
	} );
	
	
	_api_register( 'trigger()', function ( name, args, bubbles ) {
		return this.iterator( 'table', function ( settings ) {
			return _fnCallbackFire( settings, null, name, args, bubbles );
		} ).flatten();
	} );
	
	
	_api_register( 'ready()', function ( fn ) {
		var ctx = this.context;
	
		// Get status of first table
		if (! fn) {
			return ctx.length
				? (ctx[0]._bInitComplete || false)
				: null;
		}
	
		// Function to run either once the table becomes ready or
		// immediately if it is already ready.
		return this.tables().every(function () {
			if (this.context[0]._bInitComplete) {
				fn.call(this);
			}
			else {
				this.on('init', function () {
					fn.call(this);
				});
			}
		} );
	} );
	
	
	_api_register( 'destroy()', function ( remove ) {
		remove = remove || false;
	
		return this.iterator( 'table', function ( settings ) {
			var classes   = settings.oClasses;
			var table     = settings.nTable;
			var tbody     = settings.nTBody;
			var thead     = settings.nTHead;
			var tfoot     = settings.nTFoot;
			var jqTable   = $(table);
			var jqTbody   = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows      = settings.aoData.map( function (r) { return r ? r.nTr : null; } );
			var orderClasses = classes.order;
	
			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;
	
			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire( settings, "aoDestroyCallback", "destroy", [settings], true );
	
			// If not being removed from the document, make all columns visible
			if ( ! remove ) {
				new _Api( settings ).columns().visible( true );
			}
	
			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
			$(window).off('.DT-'+settings.sInstance);
	
			// When scrolling we had to break the table up - restore it
			if ( table != thead.parentNode ) {
				jqTable.children('thead').detach();
				jqTable.append( thead );
			}
	
			if ( tfoot && table != tfoot.parentNode ) {
				jqTable.children('tfoot').detach();
				jqTable.append( tfoot );
			}
	
			settings.colgroup.remove();
	
			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses( settings );
	
			$('th, td', thead)
				.removeClass(
					orderClasses.canAsc + ' ' +
					orderClasses.canDesc + ' ' +
					orderClasses.isAsc + ' ' +
					orderClasses.isDesc
				)
				.css('width', '');
	
			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append( rows );
	
			var orig = settings.nTableWrapper.parentNode;
			var insertBefore = settings.nTableWrapper.nextSibling;
	
			// Remove the DataTables generated nodes, events and classes
			var removedMethod = remove ? 'remove' : 'detach';
			jqTable[ removedMethod ]();
			jqWrapper[ removedMethod ]();
	
			// If we need to reattach the table to the document
			if ( ! remove && orig ) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore( table, insertBefore );
	
				// Restore the width of the original table - was read from the style property,
				// so we can restore directly to that
				jqTable
					.css( 'width', settings.sDestroyWidth )
					.removeClass( classes.table );
			}
	
			/* Remove the settings object from the settings array */
			var idx = DataTable.settings.indexOf(settings);
			if ( idx !== -1 ) {
				DataTable.settings.splice( idx, 1 );
			}
		} );
	} );
	
	
	// Add the `every()` method for rows, columns and cells in a compact form
	$.each( [ 'column', 'row', 'cell' ], function ( i, type ) {
		_api_register( type+'s().every()', function ( fn ) {
			var opts = this.selector.opts;
			var api = this;
			var inst;
			var counter = 0;
	
			return this.iterator( 'every', function ( settings, selectedIdx, tableIdx ) {
				inst = api[ type ](selectedIdx, opts);
	
				if (type === 'cell') {
					fn.call(inst, inst[0][0].row, inst[0][0].column, tableIdx, counter);
				}
				else {
					fn.call(inst, selectedIdx, tableIdx, counter);
				}
	
				counter++;
			} );
		} );
	} );
	
	
	// i18n method for extensions to be able to use the language object from the
	// DataTable
	_api_register( 'i18n()', function ( token, def, plural ) {
		var ctx = this.context[0];
		var resolved = _fnGetObjectDataFn( token )( ctx.oLanguage );
	
		if ( resolved === undefined ) {
			resolved = def;
		}
	
		if ( $.isPlainObject( resolved ) ) {
			resolved = plural !== undefined && resolved[ plural ] !== undefined ?
				resolved[ plural ] :
				resolved._;
		}
	
		return typeof resolved === 'string'
			? resolved.replace( '%d', plural ) // nb: plural might be undefined,
			: resolved;
	} );
	
	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See https://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "2.1.2";
	
	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];
	
	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 */
		"caseInsensitive": true,
	
		/**
		 * Applied search term
		 */
		"search": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 */
		"regex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 */
		"smart": true,
	
		/**
		 * Flag to indicate if DataTables should only trigger a search when
		 * the return key is pressed.
		 */
		"return": false
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 */
		"nTr": null,
	
		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 */
		"anCells": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 */
		"_aSortData": null,
	
		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 */
		"_aFilterData": null,
	
		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 */
		"_sFilterRow": null,
	
		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 */
		"src": null,
	
		/**
		 * Index in the aoData array. This saves an indexOf lookup when we have the
		 * object, but want to know the index
		 */
		"idx": -1,
	
		/**
		 * Cached display value
		 */
		displayData: null
	};
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index.
		 */
		"idx": null,
	
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 */
		"asSorting": null,
	
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 */
		"bSearchable": null,
	
		/**
		 * Flag to indicate if the column is sortable or not.
		 */
		"bSortable": null,
	
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 */
		"bVisible": null,
	
		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 */
		"_sManualType": null,
	
		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 */
		"_bAttrSrc": false,
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 */
		"fnGetData": null,
	
		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 */
		"fnSetData": null,
	
		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 */
		"mData": null,
	
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 */
		"mRender": null,
	
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 */
		"sClass": null,
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 */
		"sContentPadding": null,
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 */
		"sName": null,
	
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 */
		"sSortDataType": 'std',
	
		/**
		 * Class to be applied to the header element when sorting on this column
		 */
		"sSortingClass": null,
	
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 */
		"sTitle": null,
	
		/**
		 * Column sorting and filtering type
		 */
		"sType": null,
	
		/**
		 * Width of the column
		 */
		"sWidth": null,
	
		/**
		 * Width of the column when it was first "encountered"
		 */
		"sWidthOrig": null,
	
		/** Cached string which is the longest in the column */
		maxLenString: null,
	
		/**
		 * Store for named searches
		 */
		searchFixed: null
	};
	
	
	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would add around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit).
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 */
		"aaData": null,
	
	
		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 */
		"aaSortingFixed": [],
	
	
		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 */
		"ajax": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 */
		"aoSearchCols": [],
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 */
		"bDeferRender": true,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 */
		"bFilter": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bInfo": true,
	
		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bLengthChange": true,
	
		/**
		 * Enable or disable pagination.
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 */
		"bRetrieve": false,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 */
		"bSort": true,
	
	
		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 */
		"bSortMulti": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 */
		"bSortCellsTop": null,
	
	
		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 */
		"bStateSave": false,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 */
		"fnFormatNumber": function ( toFormat ) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 */
		"fnRowCallback": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateLoadCallback": function ( settings ) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_'+settings.sInstance+'_'+location.pathname
					)
				);
			} catch (e) {
				return {};
			}
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 */
		"fnStateLoadParams": null,
	
	
		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 */
		"fnStateLoaded": null,
	
	
		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored By default DataTables will use `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateSaveCallback": function ( settings, data ) {
			try {
				(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
					'DataTables_'+settings.sInstance+'_'+location.pathname,
					JSON.stringify( data )
				);
			} catch (e) {
				// noop
			}
		},
	
	
		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the `stateSaveParams` event to save parameters for a plug-in.
		 */
		"fnStateSaveParams": null,
	
	
		/**
		 * Duration for which the saved state information is considered valid. After this period
		 * has elapsed the state will be returned to the default.
		 * Value is given in seconds.
		 */
		"iStateDuration": 7200,
	
	
		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (`lengthChange`) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 */
		"iDisplayLength": 10,
	
	
		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 */
		"iDisplayStart": 0,
	
	
		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a `tabindex` attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 */
		"iTabIndex": 0,
	
	
		/**
		 * Classes that DataTables assigns to the various components and features
		 * that it adds to the HTML table. This allows classes to be configured
		 * during initialisation in addition to through the static
		 * {@link DataTable.ext.oStdClasses} object).
		 */
		"oClasses": {},
	
	
		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be sorted
				 */
				"orderable": ": Activate to sort",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being sorted
				 */
				"orderableReverse": ": Activate to invert sorting",
	
				/**
				 * ARIA label that is added to the table headers when the column is currently being 
				 * sorted and next step is to remove sorting
				 */
				"orderableRemove": ": Activate to remove sorting",
	
				paginate: {
					first: 'First',
					last: 'Last',
					next: 'Next',
					previous: 'Previous',
					number: ''
				}
			},
	
			/**
			 * Pagination string used by DataTables for the built-in pagination
			 * control types.
			 */
			"oPaginate": {
				/**
				 * Label and character for first page button («)
				 */
				"sFirst": "\u00AB",
	
				/**
				 * Last page button (»)
				 */
				"sLast": "\u00BB",
	
				/**
				 * Next page button (›)
				 */
				"sNext": "\u203A",
	
				/**
				 * Previous page button (‹)
				 */
				"sPrevious": "\u2039",
			},
	
			/**
			 * Plural object for the data type the table is showing
			 */
			entries: {
				_: "entries",
				1: "entry"
			},
	
			/**
			 * This string is shown in preference to `zeroRecords` when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of `zeroRecords` will be used
			 * instead (either the default or given value).
			 */
			"sEmptyTable": "No data available in table",
	
	
			/**
			 * This string gives information to the end user about the information
			 * that is current on display on the page. The following tokens can be
			 * used in the string and will be dynamically replaced as the table
			 * display updates. This tokens can be placed anywhere in the string, or
			 * removed as needed by the language requires:
			 *
			 * * `\_START\_` - Display index of the first record on the current page
			 * * `\_END\_` - Display index of the last record on the current page
			 * * `\_TOTAL\_` - Number of records in the table after filtering
			 * * `\_MAX\_` - Number of records in the table without filtering
			 * * `\_PAGE\_` - Current page number
			 * * `\_PAGES\_` - Total number of pages of data in the table
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",
	
	
			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match `info`.
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",
	
	
			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (`info`) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 */
			"sInfoFiltered": "(filtered from _MAX_ total _ENTRIES-MAX_)",
	
	
			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
			 * being used) at all times.
			 */
			"sInfoPostFix": "",
	
	
			/**
			 * This decimal place operator is a little different from the other
			 * language options since DataTables doesn't output floating point
			 * numbers, so it won't ever use this for display of a number. Rather,
			 * what this parameter does is modify the sort methods of the table so
			 * that numbers which are in a format which has a character other than
			 * a period (`.`) as a decimal place will be sorted numerically.
			 *
			 * Note that numbers with different decimal places cannot be shown in
			 * the same table and still be sortable, the table must be consistent.
			 * However, multiple different tables on the page can use different
			 * decimal place characters.
			 */
			"sDecimal": "",
	
	
			/**
			 * DataTables has a build in number formatter (`formatNumber`) which is
			 * used to format large numbers that are used in the table information.
			 * By default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 */
			"sThousands": ",",
	
	
			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 */
			"sLengthMenu": "_MENU_ _ENTRIES_ per page",
	
	
			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 */
			"sLoadingRecords": "Loading...",
	
	
			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 */
			"sProcessing": "",
	
	
			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 */
			"sSearch": "Search:",
	
	
			/**
			 * Assign a `placeholder` attribute to the search `input` element
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.searchPlaceholder
			 */
			"sSearchPlaceholder": "",
	
	
			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 */
			"sUrl": "",
	
	
			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. `emptyTable` is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 */
			"sZeroRecords": "No matching records found"
		},
	
	
		/** The initial data order is reversed when `desc` ordering */
		orderDescReverse: true,
	
	
		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the `search` parameter must be
		 * defined, but all other parameters are optional. When `regex` is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When `smart`
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),
	
	
		/**
		 * Table and control layout. This replaces the legacy `dom` option.
		 */
		layout: {
			topStart: 'pageLength',
			topEnd: 'search',
			bottomStart: 'info',
			bottomEnd: 'paging'
		},
	
	
		/**
		 * Legacy DOM layout option
		 */
		"sDom": null,
	
	
		/**
		 * Search delay option. This will throttle full table searches that use the
		 * DataTables provided search input element (it does not effect calls to
		 * `dt-api search()`, providing a delay before the search is made.
		 */
		"searchDelay": null,
	
	
		/**
		 * DataTables features six different built-in options for the buttons to
		 * display for pagination control:
		 *
		 * * `numbers` - Page number buttons only
		 * * `simple` - 'Previous' and 'Next' buttons only
		 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
		 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
		 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
		 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
		 */
		"sPaginationType": "",
	
	
		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a
		 * certain layout, or you have a large number of columns in the table, you
		 * can enable x-scrolling to show the table in a viewport, which can be
		 * scrolled. This property can be `true` which will allow the table to
		 * scroll horizontally when needed, or any CSS unit, or a number (in which
		 * case it will be treated as a pixel measurement). Setting as simply `true`
		 * is recommended.
		 */
		"sScrollX": "",
	
	
		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 */
		"sScrollXInner": "",
	
	
		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 */
		"sScrollY": "",
	
	
		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 */
		"sServerMethod": "GET",
	
	
		/**
		 * DataTables makes use of renderers when displaying HTML elements for
		 * a table. These renderers can be added or modified by plug-ins to
		 * generate suitable mark-up for a site. For example the Bootstrap
		 * integration plug-in for DataTables uses a paging button renderer to
		 * display pagination buttons in the mark-up required by Bootstrap.
		 *
		 * For further information about the renderers available see
		 * DataTable.ext.renderer
		 */
		"renderer": null,
	
	
		/**
		 * Set the data property name that DataTables should use to get a row's id
		 * to set as the `id` property in the node.
		 */
		"rowId": "DT_RowId",
	
	
		/**
		 * Caption value
		 */
		"caption": null,
	
	
		/**
		 * For server-side processing - use the data from the DOM for the first draw
		 */
		iDeferLoading: null
	};
	
	_fnHungarianMap( DataTable.defaults );
	
	
	
	/*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */
	
	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.column = {
		/**
		 * Define which column(s) an order will occur on for this column. This
		 * allows a column's ordering to take multiple columns into account when
		 * doing a sort or use the data from a different column. For example first
		 * name / last name columns make sense to do a multi-column sort over the
		 * two columns.
		 */
		"aDataSort": null,
		"iDataSort": -1,
	
		ariaTitle: '',
	
	
		/**
		 * You can control the default ordering direction, and even alter the
		 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
		 * using this parameter.
		 */
		"asSorting": [ 'asc', 'desc', '' ],
	
	
		/**
		 * Enable or disable filtering on the data in this column.
		 */
		"bSearchable": true,
	
	
		/**
		 * Enable or disable ordering on this column.
		 */
		"bSortable": true,
	
	
		/**
		 * Enable or disable the display of this column.
		 */
		"bVisible": true,
	
	
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,
	
	
		/**
		 * This property can be used to read data from any data source property,
		 * including deeply nested objects / properties. `data` can be given in a
		 * number of different ways which effect its behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object. Note that
		 *      function notation is recommended for use in `render` rather than
		 *      `data` as it is much simpler to use as a renderer.
		 * * `null` - use the original data source for the row rather than plucking
		 *   data directly from it. This action has effects on two other
		 *   initialisation options:
		 *    * `defaultContent` - When null is given as the `data` option and
		 *      `defaultContent` is specified for the column, the value defined by
		 *      `defaultContent` will be used for the cell.
		 *    * `render` - When null is used for the `data` option and the `render`
		 *      option is specified for the column, the whole data source for the
		 *      row is used for the renderer.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * `{array|object}` The data source for the row
		 *      * `{string}` The type call data requested - this will be 'set' when
		 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
		 *        when gathering data. Note that when `undefined` is given for the
		 *        type DataTables expects to get the raw data for the object back<
		 *      * `{*}` Data to set when the second parameter is 'set'.
		 *    * Return:
		 *      * The return value from the function is not required when 'set' is
		 *        the type of call, but otherwise the return is what will be used
		 *        for the data requested.
		 *
		 * Note that `data` is a getter and setter option. If you just require
		 * formatting of data for output, you will likely want to use `render` which
		 * is simply a getter and thus simpler to use.
		 *
		 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
		 * name change reflects the flexibility of this property and is consistent
		 * with the naming of mRender. If 'mDataProp' is given, then it will still
		 * be used by DataTables, as it automatically maps the old name to the new
		 * if required.
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 */
		"sClass": "",
	
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because `data`
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,
	
	
		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 */
		"sName": "",
	
	
		/**
		 * Defines a data source type for the ordering which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to ordering. This allows ordering to occur on user
		 * editable elements such as form inputs.
		 */
		"sSortDataType": "std",
	
	
		/**
		 * The title of this column.
		 */
		"sTitle": null,
	
	
		/**
		 * The type allows you to specify how the data for this column will be
		 * ordered. Four types (string, numeric, date and html (which will strip
		 * HTML tags before ordering)) are currently available. Note that only date
		 * formats understood by Javascript's Date() object will be accepted as type
		 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
		 * 'numeric', 'date' or 'html' (by default). Further types can be adding
		 * through plug-ins.
		 */
		"sType": null,
	
	
		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 */
		"sWidth": null
	};
	
	_fnHungarianMap( DataTable.defaults.column );
	
	
	
	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 */
		"oFeatures": {
	
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all for DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bDeferRender": null,
	
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bFilter": null,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bInfo": true,
	
			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bLengthChange": true,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bPaginate": null,
	
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bProcessing": null,
	
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bServerSide": null,
	
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSort": null,
	
			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortMulti": null,
	
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortClasses": null,
	
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bStateSave": null
		},
	
	
		/**
		 * Scrolling settings for a table.
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bCollapse": null,
	
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 */
			"iBarWidth": 0,
	
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sX": null,
	
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @deprecated
			 */
			"sXInner": null,
	
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sY": null
		},
	
		/**
		 * Language information for the table.
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 */
			"fnInfoCallback": null
		},
	
		/**
		 * Browser support parameters
		 */
		"oBrowser": {
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 */
			"bScrollbarLeft": false,
	
			/**
			 * Browser scrollbar width
			 */
			"barWidth": 0
		},
	
	
		"ajax": null,
	
	
		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 */
		"aanFeatures": [],
	
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 */
		"aoData": [],
	
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 */
		"aiDisplay": [],
	
		/**
		 * Array of indexes for display - no filtering
		 */
		"aiDisplayMaster": [],
	
		/**
		 * Map of row ids to data indexes
		 */
		"aIds": {},
	
		/**
		 * Store information about each column that is in use
		 */
		"aoColumns": [],
	
		/**
		 * Store information about the table's header
		 */
		"aoHeader": [],
	
		/**
		 * Store information about the table's footer
		 */
		"aoFooter": [],
	
		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"oPreviousSearch": {},
	
		/**
		 * Store for named searches
		 */
		searchFixed: {},
	
		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 */
		"aoPreSearchCols": [],
	
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSorting": null,
	
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSortingFixed": [],
	
		/**
		 * If restoring a table - we should restore its width
		 */
		"sDestroyWidth": 0,
	
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 */
		"aoRowCallback": [],
	
		/**
		 * Callback functions for the header on each draw.
		 */
		"aoHeaderCallback": [],
	
		/**
		 * Callback function for the footer on each draw.
		 */
		"aoFooterCallback": [],
	
		/**
		 * Array of callback functions for draw callback functions
		 */
		"aoDrawCallback": [],
	
		/**
		 * Array of callback functions for row created function
		 */
		"aoRowCreatedCallback": [],
	
		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 */
		"aoPreDrawCallback": [],
	
		/**
		 * Callback functions for when the table has been initialised.
		 */
		"aoInitComplete": [],
	
	
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 */
		"aoStateSaveParams": [],
	
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 */
		"aoStateLoadParams": [],
	
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 */
		"aoStateLoaded": [],
	
		/**
		 * Cache the table ID for quick access
		 */
		"sTableId": "",
	
		/**
		 * The TABLE node for the main table
		 */
		"nTable": null,
	
		/**
		 * Permanent ref to the thead element
		 */
		"nTHead": null,
	
		/**
		 * Permanent ref to the tfoot element - if it exists
		 */
		"nTFoot": null,
	
		/**
		 * Permanent ref to the tbody element
		 */
		"nTBody": null,
	
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 */
		"nTableWrapper": null,
	
		/**
		 * Indicate if all required information has been read in
		 */
		"bInitialised": false,
	
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 */
		"aoOpenRows": [],
	
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sDom": null,
	
		/**
		 * Search delay (in mS)
		 */
		"searchDelay": null,
	
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sPaginationType": "two_button",
	
		/**
		 * Number of paging controls on the page. Only used for backwards compatibility
		 */
		pagingControls: 0,
	
		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"iStateDuration": 0,
	
		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateSave": [],
	
		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateLoad": [],
	
		/**
		 * State that was saved. Useful for back reference
		 */
		"oSavedState": null,
	
		/**
		 * State that was loaded. Useful for back reference
		 */
		"oLoadedState": null,
	
		/**
		 * Note if draw should be blocked while getting data
		 */
		"bAjaxDataGet": true,
	
		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 */
		"jqXHR": null,
	
		/**
		 * JSON returned from the server in the last Ajax request
		 */
		"json": undefined,
	
		/**
		 * Data submitted as part of the last Ajax request
		 */
		"oAjaxData": undefined,
	
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sServerMethod": null,
	
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"fnFormatNumber": null,
	
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aLengthMenu": null,
	
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 */
		"iDraw": 0,
	
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 */
		"bDrawing": false,
	
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 */
		"iDrawError": -1,
	
		/**
		 * Paging display length
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsDisplay": 0,
	
		/**
		 * The classes to use for the table
		 */
		"oClasses": {},
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bFiltered": false,
	
		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bSorted": false,
	
		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"bSortCellsTop": null,
	
		/**
		 * Initialisation object that is used for the table
		 */
		"oInit": null,
	
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 */
		"aoDestroyCallback": [],
	
	
		/**
		 * Get the number of records in the current record set, before filtering
		 */
		"fnRecordsTotal": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},
	
		/**
		 * Get the number of records in the current record set, after filtering
		 */
		"fnRecordsDisplay": function ()
		{
			return _fnDataSource( this ) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},
	
		/**
		 * Get the display end point - aiDisplay index
		 */
		"fnDisplayEnd": function ()
		{
			var
				len      = this._iDisplayLength,
				start    = this._iDisplayStart,
				calc     = start + len,
				records  = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;
	
			if ( features.bServerSide ) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min( start+len, this._iRecordsDisplay );
			}
			else {
				return ! paginate || calc>records || len===-1 ?
					records :
					calc;
			}
		},
	
		/**
		 * The DataTables object for this table
		 */
		"oInstance": null,
	
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,
	
		/**
		 * Last applied sort
		 */
		"aLastSort": [],
	
		/**
		 * Stored plug-in instances
		 */
		"oPlugins": {},
	
		/**
		 * Function used to get a row's id from the row's data
		 */
		"rowIdFn": null,
	
		/**
		 * Data location where to store a row's id
		 */
		"rowId": null,
	
		caption: '',
	
		captionNode: null,
	
		colgroup: null,
	
		/** Delay loading of data */
		deferLoading: null
	};
	
	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	
	
	var extPagination = DataTable.ext.pager;
	
	// Paging buttons configuration
	$.extend( extPagination, {
		simple: function () {
			return [ 'previous', 'next' ];
		},
	
		full: function () {
			return [ 'first', 'previous', 'next', 'last' ];
		},
	
		numbers: function () {
			return [ 'numbers' ];
		},
	
		simple_numbers: function () {
			return [ 'previous', 'numbers', 'next' ];
		},
	
		full_numbers: function () {
			return [ 'first', 'previous', 'numbers', 'next', 'last' ];
		},
	
		first_last: function () {
			return ['first', 'last'];
		},
	
		first_last_numbers: function () {
			return ['first', 'numbers', 'last'];
		},
	
		// For testing and plug-ins to use
		_numbers: _pagingNumbers,
	
		// Number of number buttons - legacy, use `numbers` option for paging feature
		numbers_length: 7
	} );
	
	
	$.extend( true, DataTable.ext.renderer, {
		pagingButton: {
			_: function (settings, buttonType, content, active, disabled) {
				var classes = settings.oClasses.paging;
				var btnClasses = [classes.button];
				var btn;
	
				if (active) {
					btnClasses.push(classes.active);
				}
	
				if (disabled) {
					btnClasses.push(classes.disabled)
				}
	
				if (buttonType === 'ellipsis') {
					btn = $('<span class="ellipsis"></span>').html(content)[0];
				}
				else {
					btn = $('<button>', {
						class: btnClasses.join(' '),
						role: 'link',
						type: 'button'
					}).html(content);
				}
	
				return {
					display: btn,
					clicker: btn
				}
			}
		},
	
		pagingContainer: {
			_: function (settings, buttons) {
				// No wrapping element - just append directly to the host
				return buttons;
			}
		}
	} );
	
	// Common function to remove new lines, strip HTML and diacritic control
	var _filterString = function (stripHtml, normalize) {
		return function (str) {
			if (_empty(str) || typeof str !== 'string') {
				return str;
			}
	
			str = str.replace( _re_new_lines, " " );
	
			if (stripHtml) {
				str = _stripHtml(str);
			}
	
			if (normalize) {
				str = _normalize(str, false);
			}
	
			return str;
		};
	}
	
	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */
	
	/**
	 * Common logic for moment, luxon or a date action.
	 *
	 * Happens after __mldObj, so don't need to call `resolveWindowsLibs` again
	 */
	function __mld( dtLib, momentFn, luxonFn, dateFn, arg1 ) {
		if (__moment) {
			return dtLib[momentFn]( arg1 );
		}
		else if (__luxon) {
			return dtLib[luxonFn]( arg1 );
		}
		
		return dateFn ? dtLib[dateFn]( arg1 ) : dtLib;
	}
	
	
	var __mlWarning = false;
	var __luxon; // Can be assigned in DateTeble.use()
	var __moment; // Can be assigned in DateTeble.use()
	
	/**
	 * 
	 */
	function resolveWindowLibs() {
		if (window.luxon && ! __luxon) {
			__luxon = window.luxon;
		}
		
		if (window.moment && ! __moment) {
			__moment = window.moment;
		}
	}
	
	function __mldObj (d, format, locale) {
		var dt;
	
		resolveWindowLibs();
	
		if (__moment) {
			dt = __moment.utc( d, format, locale, true );
	
			if (! dt.isValid()) {
				return null;
			}
		}
		else if (__luxon) {
			dt = format && typeof d === 'string'
				? __luxon.DateTime.fromFormat( d, format )
				: __luxon.DateTime.fromISO( d );
	
			if (! dt.isValid) {
				return null;
			}
	
			dt.setLocale(locale);
		}
		else if (! format) {
			// No format given, must be ISO
			dt = new Date(d);
		}
		else {
			if (! __mlWarning) {
				alert('DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17');
			}
	
			__mlWarning = true;
		}
	
		return dt;
	}
	
	// Wrapper for date, datetime and time which all operate the same way with the exception of
	// the output string for auto locale support
	function __mlHelper (localeString) {
		return function ( from, to, locale, def ) {
			// Luxon and Moment support
			// Argument shifting
			if ( arguments.length === 0 ) {
				locale = 'en';
				to = null; // means toLocaleString
				from = null; // means iso8601
			}
			else if ( arguments.length === 1 ) {
				locale = 'en';
				to = from;
				from = null;
			}
			else if ( arguments.length === 2 ) {
				locale = to;
				to = from;
				from = null;
			}
	
			var typeName = 'datetime' + (to ? '-' + to : '');
	
			// Add type detection and sorting specific to this date format - we need to be able to identify
			// date type columns as such, rather than as numbers in extensions. Hence the need for this.
			if (! DataTable.ext.type.order[typeName]) {
				DataTable.type(typeName, {
					detect: function (d) {
						// The renderer will give the value to type detect as the type!
						return d === typeName ? typeName : false;
					},
					order: {
						pre: function (d) {
							// The renderer gives us Moment, Luxon or Date obects for the sorting, all of which have a
							// `valueOf` which gives milliseconds epoch
							return d.valueOf();
						}
					},
					className: 'dt-right'
				});
			}
		
			return function ( d, type ) {
				// Allow for a default value
				if (d === null || d === undefined) {
					if (def === '--now') {
						// We treat everything as UTC further down, so no changes are
						// made, as such need to get the local date / time as if it were
						// UTC
						var local = new Date();
						d = new Date( Date.UTC(
							local.getFullYear(), local.getMonth(), local.getDate(),
							local.getHours(), local.getMinutes(), local.getSeconds()
						) );
					}
					else {
						d = '';
					}
				}
	
				if (type === 'type') {
					// Typing uses the type name for fast matching
					return typeName;
				}
	
				if (d === '') {
					return type !== 'sort'
						? ''
						: __mldObj('0000-01-01 00:00:00', null, locale);
				}
	
				// Shortcut. If `from` and `to` are the same, we are using the renderer to
				// format for ordering, not display - its already in the display format.
				if ( to !== null && from === to && type !== 'sort' && type !== 'type' && ! (d instanceof Date) ) {
					return d;
				}
	
				var dt = __mldObj(d, from, locale);
	
				if (dt === null) {
					return d;
				}
	
				if (type === 'sort') {
					return dt;
				}
				
				var formatted = to === null
					? __mld(dt, 'toDate', 'toJSDate', '')[localeString]()
					: __mld(dt, 'format', 'toFormat', 'toISOString', to);
	
				// XSS protection
				return type === 'display' ?
					_escapeHtml( formatted ) :
					formatted;
			};
		}
	}
	
	// Based on locale, determine standard number formatting
	// Fallback for legacy browsers is US English
	var __thousands = ',';
	var __decimal = '.';
	
	if (window.Intl !== undefined) {
		try {
			var num = new Intl.NumberFormat().formatToParts(100000.1);
		
			for (var i=0 ; i<num.length ; i++) {
				if (num[i].type === 'group') {
					__thousands = num[i].value;
				}
				else if (num[i].type === 'decimal') {
					__decimal = num[i].value;
				}
			}
		}
		catch (e) {
			// noop
		}
	}
	
	// Formatted date time detection - use by declaring the formats you are going to use
	DataTable.datetime = function ( format, locale ) {
		var typeName = 'datetime-' + format;
	
		if (! locale) {
			locale = 'en';
		}
	
		if (! DataTable.ext.type.order[typeName]) {
			DataTable.type(typeName, {
				detect: function (d) {
					var dt = __mldObj(d, format, locale);
					return d === '' || dt ? typeName : false;
				},
				order: {
					pre: function (d) {
						return __mldObj(d, format, locale) || 0;
					}
				},
				className: 'dt-right'
			});
		}
	}
	
	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `moment` - Uses the MomentJS library to convert from a given format into another.
	 * This renderer has three overloads:
	 *   * 1 parameter:
	 *     * `string` - Format to convert to (assumes input is ISO8601 and locale is `en`)
	 *   * 2 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to. Assumes `en` locale
	 *   * 3 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to
	 *     * `string` - Locale
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 5 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *   * `string` (optional) - Postfix (/suffix).
	 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
	 *   parameters.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		date: __mlHelper('toLocaleDateString'),
		datetime: __mlHelper('toLocaleString'),
		time: __mlHelper('toLocaleTimeString'),
		number: function ( thousands, decimal, precision, prefix, postfix ) {
			// Auto locale detection
			if (thousands === null || thousands === undefined) {
				thousands = __thousands;
			}
	
			if (decimal === null || decimal === undefined) {
				decimal = __decimal;
			}
	
			return {
				display: function ( d ) {
					if ( typeof d !== 'number' && typeof d !== 'string' ) {
						return d;
					}
	
					if (d === '' || d === null) {
						return d;
					}
	
					var negative = d < 0 ? '-' : '';
					var flo = parseFloat( d );
					var abs = Math.abs(flo);
	
					// Scientific notation for large and small numbers
					if (abs >= 100000000000 || (abs < 0.0001 && abs !== 0) ) {
						var exp = flo.toExponential(precision).split(/e\+?/);
						return exp[0] + ' x 10<sup>' + exp[1] + '</sup>';
					}
	
					// If NaN then there isn't much formatting that we can do - just
					// return immediately, escaping any HTML (this was supposed to
					// be a number after all)
					if ( isNaN( flo ) ) {
						return _escapeHtml( d );
					}
	
					flo = flo.toFixed( precision );
					d = Math.abs( flo );
	
					var intPart = parseInt( d, 10 );
					var floatPart = precision ?
						decimal+(d - intPart).toFixed( precision ).substring( 2 ):
						'';
	
					// If zero, then can't have a negative prefix
					if (intPart === 0 && parseFloat(floatPart) === 0) {
						negative = '';
					}
	
					return negative + (prefix||'') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart +
						(postfix||'');
				}
			};
		},
	
		text: function () {
			return {
				display: _escapeHtml,
				filter: _escapeHtml
			};
		}
	};
	
	
	var _extTypes = DataTable.ext.type;
	
	// Get / set type
	DataTable.type = function (name, prop, val) {
		if (! prop) {
			return {
				className: _extTypes.className[name],
				detect: _extTypes.detect.find(function (fn) {
					return fn.name === name;
				}),
				order: {
					pre: _extTypes.order[name + '-pre'],
					asc: _extTypes.order[name + '-asc'],
					desc: _extTypes.order[name + '-desc']
				},
				render: _extTypes.render[name],
				search: _extTypes.search[name]
			};
		}
	
		var setProp = function(prop, propVal) {
			_extTypes[prop][name] = propVal;
		};
		var setDetect = function (detect) {
			// `detect` can be a function or an object - we set a name
			// property for either - that is used for the detection
			Object.defineProperty(detect, "name", {value: name});
	
			var idx = _extTypes.detect.findIndex(function (item) {
				return item.name === name;
			});
	
			if (idx === -1) {
				_extTypes.detect.unshift(detect);
			}
			else {
				_extTypes.detect.splice(idx, 1, detect);
			}
		};
		var setOrder = function (obj) {
			_extTypes.order[name + '-pre'] = obj.pre; // can be undefined
			_extTypes.order[name + '-asc'] = obj.asc; // can be undefined
			_extTypes.order[name + '-desc'] = obj.desc; // can be undefined
		};
	
		// prop is optional
		if (val === undefined) {
			val = prop;
			prop = null;
		}
	
		if (prop === 'className') {
			setProp('className', val);
		}
		else if (prop === 'detect') {
			setDetect(val);
		}
		else if (prop === 'order') {
			setOrder(val);
		}
		else if (prop === 'render') {
			setProp('render', val);
		}
		else if (prop === 'search') {
			setProp('search', val);
		}
		else if (! prop) {
			if (val.className) {
				setProp('className', val.className);
			}
	
			if (val.detect !== undefined) {
				setDetect(val.detect);
			}
	
			if (val.order) {
				setOrder(val.order);
			}
	
			if (val.render !== undefined) {
				setProp('render', val.render);
			}
	
			if (val.search !== undefined) {
				setProp('search', val.search);
			}
		}
	}
	
	// Get a list of types
	DataTable.types = function () {
		return _extTypes.detect.map(function (fn) {
			return fn.name;
		});
	};
	
	var __diacriticSort = function (a, b) {
		a = a.toString().toLowerCase();
		b = b.toString().toLowerCase();
	
		// Checked for `navigator.languages` support in `oneOf` so this code can't execute in old
		// Safari and thus can disable this check
		// eslint-disable-next-line compat/compat
		return a.localeCompare(b, navigator.languages[0] || navigator.language, {
			numeric: true,
			ignorePunctuation: true,
		});
	}
	
	//
	// Built in data types
	//
	
	DataTable.type('string', {
		detect: function () {
			return 'string';
		},
		order: {
			pre: function ( a ) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						! a.toString ?
							'' :
							a.toString();
			}
		},
		search: _filterString(false, true)
	});
	
	DataTable.type('string-utf8', {
		detect: {
			allOf: function ( d ) {
				return true;
			},
			oneOf: function ( d ) {
				// At least one data point must contain a non-ASCII character
				// This line will also check if navigator.languages is supported or not. If not (Safari 10.0-)
				// this data type won't be supported.
				// eslint-disable-next-line compat/compat
				return ! _empty( d ) && navigator.languages && typeof d === 'string' && d.match(/[^\x00-\x7F]/);
			}
		},
		order: {
			asc: __diacriticSort,
			desc: function (a, b) {
				return __diacriticSort(a, b) * -1;
			}
		},
		search: _filterString(false, true)
	});
	
	
	DataTable.type('html', {
		detect: {
			allOf: function ( d ) {
				return _empty( d ) || (typeof d === 'string' && d.indexOf('<') !== -1);
			},
			oneOf: function ( d ) {
				// At least one data point must contain a `<`
				return ! _empty( d ) && typeof d === 'string' && d.indexOf('<') !== -1;
			}
		},
		order: {
			pre: function ( a ) {
				return _empty(a) ?
					'' :
					a.replace ?
						_stripHtml(a).trim().toLowerCase() :
						a+'';
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('date', {
		className: 'dt-type-date',
		detect: {
			allOf: function ( d ) {
				// V8 tries _very_ hard to make a string passed into `Date.parse()`
				// valid, so we need to use a regex to restrict date formats. Use a
				// plug-in for anything other than ISO8601 style strings
				if ( d && !(d instanceof Date) && ! _re_date.test(d) ) {
					return null;
				}
				var parsed = Date.parse(d);
				return (parsed !== null && !isNaN(parsed)) || _empty(d);
			},
			oneOf: function ( d ) {
				// At least one entry must be a date or a string with a date
				return (d instanceof Date) || (typeof d === 'string' && _re_date.test(d));
			}
		},
		order: {
			pre: function ( d ) {
				var ts = Date.parse( d );
				return isNaN(ts) ? -Infinity : ts;
			}
		}
	});
	
	
	DataTable.type('html-num-fmt', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true, false );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, true, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html, _re_formatted_numeric );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('html-num', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, false, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric( d, decimal, false, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_html );
			}
		},
		search: _filterString(true, true)
	});
	
	
	DataTable.type('num-fmt', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, true, false );
			}
		},
		order: {
			pre: function ( d, s ) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp, _re_formatted_numeric );
			}
		}
	});
	
	
	DataTable.type('num', {
		className: 'dt-type-numeric',
		detect: {
			allOf: function ( d, settings ) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, false, true );
			},
			oneOf: function (d, settings) {
				// At least one data point must contain a numeric value
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber( d, decimal, false, false );
			}
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace( d, dp );
			}
		}
	});
	
	
	
	
	var __numericReplace = function ( d, decimalPlace, re1, re2 ) {
		if ( d !== 0 && (!d || d === '-') ) {
			return -Infinity;
		}
		
		var type = typeof d;
	
		if (type === 'number' || type === 'bigint') {
			return d;
		}
	
		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if ( decimalPlace ) {
			d = _numToDecimal( d, decimalPlace );
		}
	
		if ( d.replace ) {
			if ( re1 ) {
				d = d.replace( re1, '' );
			}
	
			if ( re2 ) {
				d = d.replace( re2, '' );
			}
		}
	
		return d * 1;
	};
	
	
	$.extend( true, DataTable.ext.renderer, {
		footer: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.tfoot.cell);
			}
		},
	
		header: {
			_: function ( settings, cell, classes ) {
				cell.addClass(classes.thead.cell);
	
				if (! settings.oFeatures.bSort) {
					cell.addClass(classes.order.none);
				}
	
				var legacyTop = settings.bSortCellsTop;
				var headerRows = cell.closest('thead').find('tr');
				var rowIdx = cell.parent().index();
	
				// Conditions to not apply the ordering icons
				if (
					// Cells and rows which have the attribute to disable the icons
					cell.attr('data-dt-order') === 'disable' ||
					cell.parent().attr('data-dt-order') === 'disable' ||
	
					// Legacy support for `orderCellsTop`. If it is set, then cells
					// which are not in the top or bottom row of the header (depending
					// on the value) do not get the sorting classes applied to them
					(legacyTop === true && rowIdx !== 0) ||
					(legacyTop === false && rowIdx !== headerRows.length - 1)
				) {
					return;
				}
	
				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on( 'order.dt.DT column-visibility.dt.DT', function ( e, ctx ) {
					if ( settings !== ctx ) { // need to check this this is the host
						return;               // table, not a nested one
					}
	
					var i;
					var orderClasses = classes.order;
					var columns = ctx.api.columns( cell );
					var col = settings.aoColumns[columns.flatten()[0]];
					var orderable = columns.orderable().includes(true);
					var ariaType = '';
					var indexes = columns.indexes();
					var sortDirs = columns.orderable(true).flatten();
					var sorting = ctx.sortDetails;
					var orderedColumns = _pluck(sorting, 'col');
	
					cell
						.removeClass(
							orderClasses.isAsc +' '+
							orderClasses.isDesc
						)
						.toggleClass( orderClasses.none, ! orderable )
						.toggleClass( orderClasses.canAsc, orderable && sortDirs.includes('asc') )
						.toggleClass( orderClasses.canDesc, orderable && sortDirs.includes('desc') );
	
					// Determine if all of the columns that this cell covers are included in the
					// current ordering
					var isOrdering = true;
					
					for (i=0; i<indexes.length; i++) {
						if (! orderedColumns.includes(indexes[i])) {
							isOrdering = false;
						}
					}
	
					if ( isOrdering ) {
						// Get the ordering direction for the columns under this cell
						// Note that it is possible for a cell to be asc and desc sorting
						// (column spanning cells)
						var orderDirs = columns.order();
	
						cell.addClass(
							orderDirs.includes('asc') ? orderClasses.isAsc : '' +
							orderDirs.includes('desc') ? orderClasses.isDesc : ''
						);
					}
	
					// Find the first visible column that has ordering applied to it - it get's
					// the aria information, as the ARIA spec says that only one column should
					// be marked with aria-sort
					var firstVis = -1; // column index
	
					for (i=0; i<orderedColumns.length; i++) {
						if (settings.aoColumns[orderedColumns[i]].bVisible) {
							firstVis = orderedColumns[i];
							break;
						}
					}
	
					if (indexes[0] == firstVis) {
						var firstSort = sorting[0];
						var sortOrder = col.asSorting;
	
						cell.attr('aria-sort', firstSort.dir === 'asc' ? 'ascending' : 'descending');
	
						// Determine if the next click will remove sorting or change the sort
						ariaType = ! sortOrder[firstSort.index + 1] ? 'Remove' : 'Reverse';
					}
					else {
						cell.removeAttr('aria-sort');
					}
	
					cell.attr('aria-label', orderable
						? col.ariaTitle + ctx.api.i18n('oAria.orderable' + ariaType)
						: col.ariaTitle
					);
	
					// Make the headers tab-able for keyboard navigation
					if (orderable) {
						cell.find('.dt-column-title').attr('role', 'button');
						cell.attr('tabindex', 0)
					}
				} );
			}
		},
	
		layout: {
			_: function ( settings, container, items ) {
				var classes = settings.oClasses.layout;
				var row = $('<div/>')
					.attr('id', items.id || null)
					.addClass(items.className || classes.row)
					.appendTo( container );
	
				$.each( items, function (key, val) {
					if (key === 'id' || key === 'className') {
						return;
					}
	
					var klass = '';
	
					if (val.table) {
						row.addClass(classes.tableRow);
						klass += classes.tableCell + ' ';
					}
	
					if (key === 'start') {
						klass += classes.start;
					}
					else if (key === 'end') {
						klass += classes.end;
					}
					else {
						klass += classes.full;
					}
	
					$('<div/>')
						.attr({
							id: val.id || null,
							"class": val.className
								? val.className
								: classes.cell + ' ' + klass
						})
						.append( val.contents )
						.appendTo( row );
				} );
			}
		}
	} );
	
	
	DataTable.feature = {};
	
	// Third parameter is internal only!
	DataTable.feature.register = function ( name, cb, legacy ) {
		DataTable.ext.features[ name ] = cb;
	
		if (legacy) {
			_ext.feature.push({
				cFeature: legacy,
				fnInit: cb
			});
		}
	};
	
	function _divProp(el, prop, val) {
		if (val) {
			el[prop] = val;
		}
	}
	
	DataTable.feature.register( 'div', function ( settings, opts ) {
		var n = $('<div>')[0];
	
		if (opts) {
			_divProp(n, 'className', opts.className);
			_divProp(n, 'id', opts.id);
			_divProp(n, 'innerHTML', opts.html);
			_divProp(n, 'textContent', opts.text);
		}
	
		return n;
	} );
	
	DataTable.feature.register( 'info', function ( settings, opts ) {
		// For compatibility with the legacy `info` top level option
		if (! settings.oFeatures.bInfo) {
			return null;
		}
	
		var
			lang  = settings.oLanguage,
			tid = settings.sTableId,
			n = $('<div/>', {
				'class': settings.oClasses.info.container,
			} );
	
		opts = $.extend({
			callback: lang.fnInfoCallback,
			empty: lang.sInfoEmpty,
			postfix: lang.sInfoPostFix,
			search: lang.sInfoFiltered,
			text: lang.sInfo,
		}, opts);
	
	
		// Update display on each draw
		settings.aoDrawCallback.push(function (s) {
			_fnUpdateInfo(s, opts, n);
		});
	
		// For the first info display in the table, we add a callback and aria information.
		if (! settings._infoEl) {
			n.attr({
				'aria-live': 'polite',
				id: tid+'_info',
				role: 'status'
			});
	
			// Table is described by our info div
			$(settings.nTable).attr( 'aria-describedby', tid+'_info' );
	
			settings._infoEl = n;
		}
	
		return n;
	}, 'i' );
	
	/**
	 * Update the information elements in the display
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnUpdateInfo ( settings, opts, node )
	{
		var
			start = settings._iDisplayStart+1,
			end   = settings.fnDisplayEnd(),
			max   = settings.fnRecordsTotal(),
			total = settings.fnRecordsDisplay(),
			out   = total
				? opts.text
				: opts.empty;
	
		if ( total !== max ) {
			// Record set after filtering
			out += ' ' + opts.search;
		}
	
		// Convert the macros
		out += opts.postfix;
		out = _fnMacros( settings, out );
	
		if ( opts.callback ) {
			out = opts.callback.call( settings.oInstance,
				settings, start, end, max, total, out
			);
		}
	
		node.html( out );
	
		_fnCallbackFire(settings, null, 'info', [settings, node[0], out]);
	}
	
	var __searchCounter = 0;
	
	// opts
	// - text
	// - placeholder
	DataTable.feature.register( 'search', function ( settings, opts ) {
		// Don't show the input if filtering isn't available on the table
		if (! settings.oFeatures.bFilter) {
			return null;
		}
	
		var classes = settings.oClasses.search;
		var tableId = settings.sTableId;
		var language = settings.oLanguage;
		var previousSearch = settings.oPreviousSearch;
		var input = '<input type="search" class="'+classes.input+'"/>';
	
		opts = $.extend({
			placeholder: language.sSearchPlaceholder,
			processing: false,
			text: language.sSearch
		}, opts);
	
		// The _INPUT_ is optional - is appended if not present
		if (opts.text.indexOf('_INPUT_') === -1) {
			opts.text += '_INPUT_';
		}
	
		opts.text = _fnMacros(settings, opts.text);
	
		// We can put the <input> outside of the label if it is at the start or end
		// which helps improve accessability (not all screen readers like implicit
		// for elements).
		var end = opts.text.match(/_INPUT_$/);
		var start = opts.text.match(/^_INPUT_/);
		var removed = opts.text.replace(/_INPUT_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_INPUT_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_INPUT_';
		}
	
		var filter = $('<div>')
			.addClass(classes.container)
			.append(str.replace(/_INPUT_/, input));
	
		// add for and id to label and input
		filter.find('label').attr('for', 'dt-search-' + __searchCounter);
		filter.find('input').attr('id', 'dt-search-' + __searchCounter);
		__searchCounter++;
	
		var searchFn = function(event) {
			var val = this.value;
	
			if(previousSearch.return && event.key !== "Enter") {
				return;
			}
	
			/* Now do the filter */
			if ( val != previousSearch.search ) {
				_fnProcessingRun(settings, opts.processing, function () {
					previousSearch.search = val;
			
					_fnFilterComplete( settings, previousSearch );
			
					// Need to redraw, without resorting
					settings._iDisplayStart = 0;
					_fnDraw( settings );
				});
			}
		};
	
		var searchDelay = settings.searchDelay !== null ?
			settings.searchDelay :
			0;
	
		var jqFilter = $('input', filter)
			.val( previousSearch.search )
			.attr( 'placeholder', opts.placeholder )
			.on(
				'keyup.DT search.DT input.DT paste.DT cut.DT',
				searchDelay ?
					DataTable.util.debounce( searchFn, searchDelay ) :
					searchFn
			)
			.on( 'mouseup.DT', function(e) {
				// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
				// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
				// checks the value to see if it has changed. In other browsers it won't have.
				setTimeout( function () {
					searchFn.call(jqFilter[0], e);
				}, 10);
			} )
			.on( 'keypress.DT', function(e) {
				/* Prevent form submission */
				if ( e.keyCode == 13 ) {
					return false;
				}
			} )
			.attr('aria-controls', tableId);
	
		// Update the input elements whenever the table is filtered
		$(settings.nTable).on( 'search.dt.DT', function ( ev, s ) {
			if ( settings === s && jqFilter[0] !== document.activeElement ) {
				jqFilter.val( typeof previousSearch.search !== 'function'
					? previousSearch.search
					: ''
				);
			}
		} );
	
		return filter;
	}, 'f' );
	
	// opts
	// - type - button configuration
	// - buttons - number of buttons to show - must be odd
	DataTable.feature.register( 'paging', function ( settings, opts ) {
		// Don't show the paging input if the table doesn't have paging enabled
		if (! settings.oFeatures.bPaginate) {
			return null;
		}
	
		opts = $.extend({
			buttons: DataTable.ext.pager.numbers_length,
			type: settings.sPaginationType,
			boundaryNumbers: true,
			firstLast: true,
			previousNext: true,
			numbers: true
		}, opts);
	
		var host = $('<div/>')
			.addClass(settings.oClasses.paging.container + (opts.type ? ' paging_' + opts.type : ''))
			.append('<nav>');
		var draw = function () {
			_pagingDraw(settings, host.children(), opts);
		};
	
		settings.aoDrawCallback.push(draw);
	
		// Responsive redraw of paging control
		$(settings.nTable).on('column-sizing.dt.DT', draw);
	
		return host;
	}, 'p' );
	
	/**
	 * Dynamically create the button type array based on the configuration options.
	 * This will only happen if the paging type is not defined.
	 */
	function _pagingDynamic(opts) {
		var out = [];
	
		if (opts.numbers) {
			out.push('numbers');
		}
	
		if (opts.previousNext) {
			out.unshift('previous');
			out.push('next');
		}
	
		if (opts.firstLast) {
			out.unshift('first');
			out.push('last');
		}
	
		return out;
	}
	
	function _pagingDraw(settings, host, opts) {
		if (! settings._bInitComplete) {
			return;
		}
	
		var
			plugin = opts.type
				? DataTable.ext.pager[ opts.type ]
				: _pagingDynamic,
			aria = settings.oLanguage.oAria.paginate || {},
			start      = settings._iDisplayStart,
			len        = settings._iDisplayLength,
			visRecords = settings.fnRecordsDisplay(),
			all        = len === -1,
			page = all ? 0 : Math.ceil( start / len ),
			pages = all ? 1 : Math.ceil( visRecords / len ),
			buttons = plugin(opts)
				.map(function (val) {
					return val === 'numbers'
						? _pagingNumbers(page, pages, opts.buttons, opts.boundaryNumbers)
						: val;
				})
				.flat();
	
		var buttonEls = [];
	
		for (var i=0 ; i<buttons.length ; i++) {
			var button = buttons[i];
	
			var btnInfo = _pagingButtonInfo(settings, button, page, pages);
			var btn = _fnRenderer( settings, 'pagingButton' )(
				settings,
				button,
				btnInfo.display,
				btnInfo.active,
				btnInfo.disabled
			);
	
			var ariaLabel = typeof button === 'string'
				? aria[ button ]
				: aria.number
					? aria.number + (button+1)
					: null;
	
			// Common attributes
			$(btn.clicker).attr({
				'aria-controls': settings.sTableId,
				'aria-disabled': btnInfo.disabled ? 'true' : null,
				'aria-current': btnInfo.active ? 'page' : null,
				'aria-label': ariaLabel,
				'data-dt-idx': button,
				'tabIndex': btnInfo.disabled
					? -1
					: settings.iTabIndex
						? settings.iTabIndex
						: null, // `0` doesn't need a tabIndex since it is the default
			});
	
			if (typeof button !== 'number') {
				$(btn.clicker).addClass(button);
			}
	
			_fnBindAction(
				btn.clicker, {action: button}, function(e) {
					e.preventDefault();
	
					_fnPageChange( settings, e.data.action, true );
				}
			);
	
			buttonEls.push(btn.display);
		}
	
		var wrapped = _fnRenderer(settings, 'pagingContainer')(
			settings, buttonEls
		);
	
		var activeEl = host.find(document.activeElement).data('dt-idx');
	
		host.empty().append(wrapped);
	
		if ( activeEl !== undefined ) {
			host.find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
		}
	
		// Responsive - check if the buttons are over two lines based on the
		// height of the buttons and the container.
		if (
			buttonEls.length && // any buttons
			opts.buttons > 1 && // prevent infinite
			$(host).height() >= ($(buttonEls[0]).outerHeight() * 2) - 10
		) {
			_pagingDraw(settings, host, $.extend({}, opts, { buttons: opts.buttons - 2 }));
		}
	}
	
	/**
	 * Get properties for a button based on the current paging state of the table
	 *
	 * @param {*} settings DT settings object
	 * @param {*} button The button type in question
	 * @param {*} page Table's current page
	 * @param {*} pages Number of pages
	 * @returns Info object
	 */
	function _pagingButtonInfo(settings, button, page, pages) {
		var lang = settings.oLanguage.oPaginate;
		var o = {
			display: '',
			active: false,
			disabled: false
		};
	
		switch ( button ) {
			case 'ellipsis':
				o.display = '&#x2026;';
				o.disabled = true;
				break;
	
			case 'first':
				o.display = lang.sFirst;
	
				if (page === 0) {
					o.disabled = true;
				}
				break;
	
			case 'previous':
				o.display = lang.sPrevious;
	
				if ( page === 0 ) {
					o.disabled = true;
				}
				break;
	
			case 'next':
				o.display = lang.sNext;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			case 'last':
				o.display = lang.sLast;
	
				if ( pages === 0 || page === pages-1 ) {
					o.disabled = true;
				}
				break;
	
			default:
				if ( typeof button === 'number' ) {
					o.display = settings.fnFormatNumber( button + 1 );
					
					if (page === button) {
						o.active = true;
					}
				}
				break;
		}
	
		return o;
	}
	
	/**
	 * Compute what number buttons to show in the paging control
	 *
	 * @param {*} page Current page
	 * @param {*} pages Total number of pages
	 * @param {*} buttons Target number of number buttons
	 * @param {boolean} addFirstLast Indicate if page 1 and end should be included
	 * @returns Buttons to show
	 */
	function _pagingNumbers ( page, pages, buttons, addFirstLast ) {
		var
			numbers = [],
			half = Math.floor(buttons / 2),
			before = addFirstLast ? 2 : 1,
			after = addFirstLast ? 1 : 0;
	
		if ( pages <= buttons ) {
			numbers = _range(0, pages);
		}
		else if (buttons === 1) {
			// Single button - current page only
			numbers = [page];
		}
		else if (buttons === 3) {
			// Special logic for just three buttons
			if (page <= 1) {
				numbers = [0, 1, 'ellipsis'];
			}
			else if (page >= pages - 2) {
				numbers = _range(pages-2, pages);
				numbers.unshift('ellipsis');
			}
			else {
				numbers = ['ellipsis', page, 'ellipsis'];
			}
		}
		else if ( page <= half ) {
			numbers = _range(0, buttons-before);
			numbers.push('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
			}
		}
		else if ( page >= pages - 1 - half ) {
			numbers = _range(pages-(buttons-before), pages);
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.unshift(0);
			}
		}
		else {
			numbers = _range(page-half+before, page+half-after);
			numbers.push('ellipsis');
			numbers.unshift('ellipsis');
	
			if (addFirstLast) {
				numbers.push(pages-1);
				numbers.unshift(0);
			}
		}
	
		return numbers;
	}
	
	var __lengthCounter = 0;
	
	// opts
	// - menu
	// - text
	DataTable.feature.register( 'pageLength', function ( settings, opts ) {
		var features = settings.oFeatures;
	
		// For compatibility with the legacy `pageLength` top level option
		if (! features.bPaginate || ! features.bLengthChange) {
			return null;
		}
	
		opts = $.extend({
			menu: settings.aLengthMenu,
			text: settings.oLanguage.sLengthMenu
		}, opts);
	
		var
			classes  = settings.oClasses.length,
			tableId  = settings.sTableId,
			menu     = opts.menu,
			lengths  = [],
			language = [],
			i;
	
		// Options can be given in a number of ways
		if (Array.isArray( menu[0] )) {
			// Old 1.x style - 2D array
			lengths = menu[0];
			language = menu[1];
		}
		else {
			for ( i=0 ; i<menu.length ; i++ ) {
				// An object with different label and value
				if ($.isPlainObject(menu[i])) {
					lengths.push(menu[i].value);
					language.push(menu[i].label);
				}
				else {
					// Or just a number to display and use
					lengths.push(menu[i]);
					language.push(menu[i]);
				}
			}
		}
	
		// We can put the <select> outside of the label if it is at the start or
		// end which helps improve accessability (not all screen readers like
		// implicit for elements).
		var end = opts.text.match(/_MENU_$/);
		var start = opts.text.match(/^_MENU_/);
		var removed = opts.text.replace(/_MENU_/, '');
		var str = '<label>' + opts.text + '</label>';
	
		if (start) {
			str = '_MENU_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_MENU_';
		}
	
		// Wrapper element - use a span as a holder for where the select will go
		var tmpId = 'tmp-' + (+new Date())
		var div = $('<div/>')
			.addClass( classes.container )
			.append(
				str.replace( '_MENU_', '<span id="'+tmpId+'"></span>' )
			);
	
		// Save text node content for macro updating
		var textNodes = [];
		div.find('label')[0].childNodes.forEach(function (el) {
			if (el.nodeType === Node.TEXT_NODE) {
				textNodes.push({
					el: el,
					text: el.textContent
				});
			}
		})
	
		// Update the label text in case it has an entries value
		var updateEntries = function (len) {
			textNodes.forEach(function (node) {
				node.el.textContent = _fnMacros(settings, node.text, len);
			});
		}
	
		// Next, the select itself, along with the options
		var select = $('<select/>', {
			'name':          tableId+'_length',
			'aria-controls': tableId,
			'class':         classes.select
		} );
	
		for ( i=0 ; i<lengths.length ; i++ ) {
			select[0][ i ] = new Option(
				typeof language[i] === 'number' ?
					settings.fnFormatNumber( language[i] ) :
					language[i],
				lengths[i]
			);
		}
	
		// add for and id to label and input
		div.find('label').attr('for', 'dt-length-' + __lengthCounter);
		select.attr('id', 'dt-length-' + __lengthCounter);
		__lengthCounter++;
	
		// Swap in the select list
		div.find('#' + tmpId).replaceWith(select);
	
		// Can't use `select` variable as user might provide their own and the
		// reference is broken by the use of outerHTML
		$('select', div)
			.val( settings._iDisplayLength )
			.on( 'change.DT', function() {
				_fnLengthChange( settings, $(this).val() );
				_fnDraw( settings );
			} );
	
		// Update node value whenever anything changes the table's length
		$(settings.nTable).on( 'length.dt.DT', function (e, s, len) {
			if ( settings === s ) {
				$('select', div).val( len );
	
				// Resolve plurals in the text for the new length
				updateEntries(len);
			}
		} );
	
		updateEntries(settings._iDisplayLength);
	
		return div;
	}, 'l' );
	
	// jQuery access
	$.fn.dataTable = DataTable;
	
	// Provide access to the host jQuery object (circular reference)
	DataTable.$ = $;
	
	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;
	
	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function ( opts ) {
		return $(this).dataTable( opts ).api();
	};
	
	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each( DataTable, function ( prop, val ) {
		$.fn.DataTable[ prop ] = val;
	} );

	return DataTable;
}));

/*! DataTables Bootstrap 5 integration
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



/**
 * DataTables integration for Bootstrap 5.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See https://datatables.net/manual/styling/bootstrap
 * for further information.
 */

/* Set the defaults for DataTables initialisation */
$.extend( true, DataTable.defaults, {
	renderer: 'bootstrap'
} );


/* Default class modification */
$.extend( true, DataTable.ext.classes, {
	container: "dt-container dt-bootstrap5",
	search: {
		input: "form-control form-control-sm"
	},
	length: {
		select: "form-select form-select-sm"
	},
	processing: {
		container: "dt-processing card"
	},
	layout: {
		row: 'row mt-2 justify-content-between',
		cell: 'd-md-flex justify-content-between align-items-center',
		tableCell: 'col-12',
		start: 'dt-layout-start col-md-auto me-auto',
		end: 'dt-layout-end col-md-auto ms-auto',
		full: 'dt-layout-full col-md'
	}
} );


/* Bootstrap paging button renderer */
DataTable.ext.renderer.pagingButton.bootstrap = function (settings, buttonType, content, active, disabled) {
	var btnClasses = ['dt-paging-button', 'page-item'];

	if (active) {
		btnClasses.push('active');
	}

	if (disabled) {
		btnClasses.push('disabled')
	}

	var li = $('<li>').addClass(btnClasses.join(' '));
	var a = $('<button>', {
		'class': 'page-link',
		role: 'link',
		type: 'button'
	})
		.html(content)
		.appendTo(li);

	return {
		display: li,
		clicker: a
	};
};

DataTable.ext.renderer.pagingContainer.bootstrap = function (settings, buttonEls) {
	return $('<ul/>').addClass('pagination').append(buttonEls);
};

// DataTable.ext.renderer.layout.bootstrap = function ( settings, container, items ) {
// 	var row = $( '<div/>', {
// 			"class": items.full ?
// 				'row mt-2 justify-content-md-center' :
// 				'row mt-2 justify-content-between'
// 		} )
// 		.appendTo( container );

// 	$.each( items, function (key, val) {
// 		var klass;
// 		var cellClass = '';

// 		// Apply start / end (left / right when ltr) margins
// 		if (val.table) {
// 			klass = 'col-12';
// 		}
// 		else if (key === 'start') {
// 			klass = '' + cellClass;
// 		}
// 		else if (key === 'end') {
// 			klass = '' + cellClass;
// 		}
// 		else {
// 			klass = ' ' + cellClass;
// 		}

// 		$( '<div/>', {
// 				id: val.id || null,
// 				"class": klass + ' ' + (val.className || '')
// 			} )
// 			.append( val.contents )
// 			.appendTo( row );
// 	} );
// };


return DataTable;
}));

"use strict";

//
// Datatables.net Initialization
//

// Set Defaults

var defaults = {
	"language": {		
		"info": "Showing _START_ to _END_ of _TOTAL_ records",
    "infoEmpty": "Showing no records",
		"lengthMenu": "_MENU_",
		"processing": '<span class="spinner-border w-15px h-15px text-muted align-middle me-2"></span> <span class="text-gray-600">Loading...</span>',
		"paginate": {
			"first": '<i class="kt-outline kt-double-left"></i>',
			"last": '<i class="kt-outline kt-double-right"></i>',
			"next": '<i class="next"></i>',
			"previous": '<i class="previous"></i>'
		}
	}
};

$.extend(true, $.fn.dataTable.defaults, defaults);

/*! DataTables Bootstrap 4 integration
 * ©2011-2017 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 4. This requires Bootstrap 4 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				// Require DataTables, which attaches to jQuery, including
				// jQuery if needed and have a $ property so we can access the
				// jQuery object that is used
				$ = require('datatables.net')(root, $).$;
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


/* Set the defaults for DataTables initialisation */
$.extend( true, DataTable.defaults, {
	pagingType: 'simple_numbers',
	dom: 
		"<'table-responsive'tr>" +
		"<'row'" + 
		"<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start dt-toolbar'li>" + 
		"<'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>" +
		">",	
	renderer: 'bootstrap'
} );


/* Default class modification */
$.extend( DataTable.ext.classes, {
	sWrapper:      "dataTables_wrapper dt-bootstrap4",
	sFilterInput:  "form-control form-control-sm form-control-solid",
	sLengthSelect: "form-select form-select-sm form-select-solid",
	sProcessing:   "dataTables_processing",
	sPageButton:   "paginate_button page-item",
	search: {
		input: "form-control form-control-solid form-control-sm"
	},
	length: {
		select: "form-select form-select-solid form-select-sm"
	}
} );

/* Bootstrap paging button renderer */
DataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
	var api     = new DataTable.Api( settings );
	var classes = settings.oClasses;
	var lang    = settings.oLanguage.oPaginate;
	var aria = settings.oLanguage.oAria.paginate || {};
	var btnDisplay, btnClass, counter=0;

	var attach = function( container, buttons ) {
		var i, ien, node, button;
		var clickHandler = function ( e ) {
			e.preventDefault();
			if ( !$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action ) {
				api.page( e.data.action ).draw( 'page' );
			}
		};

		for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
			button = buttons[i];

			if ( Array.isArray( button ) ) {	
				attach( container, button );
			} else {
				btnDisplay = '';
				btnClass = '';

				switch ( button ) {
					case 'ellipsis':
						btnDisplay = '&#x2026;';
						btnClass = 'disabled';
						break;

					case 'first':
						btnDisplay = lang.sFirst;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'previous':
						btnDisplay = lang.sPrevious;
						btnClass = button + (page > 0 ?
							'' : ' disabled');
						break;

					case 'next':
						btnDisplay = lang.sNext;
						btnClass = button + (page < pages-1 ?
							'' : ' disabled');
						break;

					case 'last':
						btnDisplay = lang.sLast;
						btnClass = button + (page < pages-1 ?
							'' : ' disabled');
						break;

					default:
						btnDisplay = button + 1;
						btnClass = page === button ?
							'active' : '';
						break;
				}

				if ( btnDisplay ) {
					node = $('<li>', {
							'class': classes.sPageButton+' '+btnClass,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId +'_'+ button :
								null
						} )
						.append( $('<a>', {
								'href': '#',
								'aria-controls': settings.sTableId,
								'aria-label': aria[ button ],
								'data-dt-idx': counter,
								'tabindex': settings.iTabIndex,
								'class': 'page-link'
							} )
							.html( btnDisplay )
						)
						.appendTo( container );

					settings.oApi._fnBindAction(
						node, {action: button}, clickHandler
					);

					counter++;
				}
			}
		}
	};

	// IE9 throws an 'unknown error' if document.activeElement is used
	// inside an iframe or frame.
	var activeEl;

	try {
		// Because this approach is destroying and recreating the paging
		// elements, focus is lost on the select button which is bad for
		// accessibility. So we want to restore focus once the draw has
		// completed
		activeEl = $(host).find(document.activeElement).data('dt-idx');
	}
	catch (e) {}

	attach(
		$(host).empty().html('<ul class="pagination"/>').children('ul'),
		buttons
	);

	if ( activeEl !== undefined ) {
		$(host).find( '[data-dt-idx='+activeEl+']' ).trigger('focus');
	}
};


return DataTable;
}));

/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).JSZip=e()}}(function(){return function s(a,o,h){function u(r,e){if(!o[r]){if(!a[r]){var t="function"==typeof require&&require;if(!e&&t)return t(r,!0);if(l)return l(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=o[r]={exports:{}};a[r][0].call(i.exports,function(e){var t=a[r][1][e];return u(t||e)},i,i.exports,s,a,o,h)}return o[r].exports}for(var l="function"==typeof require&&require,e=0;e<h.length;e++)u(h[e]);return u}({1:[function(e,t,r){"use strict";var d=e("./utils"),c=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,a,o,h=[],u=0,l=e.length,f=l,c="string"!==d.getTypeOf(e);u<e.length;)f=l-u,n=c?(t=e[u++],r=u<l?e[u++]:0,u<l?e[u++]:0):(t=e.charCodeAt(u++),r=u<l?e.charCodeAt(u++):0,u<l?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,a=1<f?(15&r)<<2|n>>6:64,o=2<f?63&n:64,h.push(p.charAt(i)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(e){var t,r,n,i,s,a,o=0,h=0,u="data:";if(e.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&f--,e.charAt(e.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=c.uint8array?new Uint8Array(0|f):new Array(0|f);o<e.length;)t=p.indexOf(e.charAt(o++))<<2|(i=p.indexOf(e.charAt(o++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(o++)))>>2,n=(3&s)<<6|(a=p.indexOf(e.charAt(o++))),l[h++]=t,64!==s&&(l[h++]=r),64!==a&&(l[h++]=n);return l}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),a=e("./stream/DataLengthProbe");function o(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}o.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",t)},t.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils");var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}(0|t,e,e.length,0):function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t.charCodeAt(a))];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n=null;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),a=e("./stream/GenericWorker"),o=n?"uint8array":"array";function h(e,t){a.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,e.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new h("Deflate",e)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function A(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function n(e,t,r,n,i,s){var a,o,h=e.file,u=e.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),c=I.transformTo("string",O.utf8encode(h.name)),d=h.comment,p=I.transformTo("string",s(d)),m=I.transformTo("string",O.utf8encode(d)),_=c.length!==h.name.length,g=m.length!==d.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===i?(C=798,z|=function(e,t){var r=e;return e||(r=t?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(e){return 63&(e||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+c,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(n,4)+f+b+p}}var I=e("../utils"),i=e("../stream/GenericWorker"),O=e("../utf8"),B=e("../crc32"),R=e("../signature");function s(e,t,r,n){i.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,i),s.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,i.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},s.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=n(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,r=n(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),t)this.push({data:function(e){return R.DATA_DESCRIPTOR+A(e.crc32,4)+A(e.compressedSize,4)+A(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r=this.bytesWritten-e,n=function(e,t,r,n,i){var s=I.transformTo("string",i(n));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(e,2)+A(e,2)+A(t,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,e,this.zipComment,this.encodeFileName);this.push({data:n,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(e){var t=this._sources;if(!i.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},s.prototype.lock=function(){i.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,a,t){var o=new n(a.streamFiles,t,a.platform,a.encodeFileName),h=0;try{e.forEach(function(e,t){h++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,a.compression),n=t.options.compressionOptions||a.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(e){o.error(e)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.10.1",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var u=e("./utils"),i=e("./external"),n=e("./utf8"),s=e("./zipEntries"),a=e("./stream/Crc32Probe"),l=e("./nodejsUtils");function f(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new a);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),l.isNode&&l.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",e,!0,o.optimizedBinaryString,o.base64).then(function(e){var t=new s(o);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(o.checkCRC32)for(var n=0;n<r.length;n++)t.push(f(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n],s=i.fileNameStr,a=u.resolve(i.fileNameStr);h.file(a,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:o.createFolders}),i.dir||(h.file(a).unsafeOriginalName=s)}return t.zipComment.length&&(h.comment=t.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=u.getTypeOf(t),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=g(e)),s.createFolders&&(n=_(e))&&b.call(this,n,!0);var a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string");var o=null;o=t instanceof c||t instanceof l?t:p.isNode&&p.isStream(t)?new m(e,t):u.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var h=new d(e,o,s);this.files[e]=h}var i=e("./utf8"),u=e("./utils"),l=e("./stream/GenericWorker"),a=e("./stream/StreamHelper"),f=e("./defaults"),c=e("./compressedObject"),d=e("./zipObject"),o=e("./generate"),p=e("./nodejsUtils"),m=e("./nodejs/NodejsStreamInputAdapter"),_=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""},g=function(e){return"/"!==e.slice(-1)&&(e+="/"),e},b=function(e,t){return t=void 0!==t?t:f.createFolders,e=g(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function h(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n)},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(h(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=b.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=u.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=o.generateWorker(this,r,n)}catch(e){(t=new l("error")).error(e)}return new a(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){"use strict";t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),a=e("./StringReader"),o=e("./NodeBufferReader"),h=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new o(e):i.uint8array?new h(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new a(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var h=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),u=e("../base64"),n=e("../support"),a=e("../external"),o=null;if(n.nodestream)try{o=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function l(e,o){return new a.Promise(function(t,r){var n=[],i=e._internalType,s=e._outputType,a=e._mimeType;e.on("data",function(e,t){n.push(e),o&&o(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return h.newBlob(h.transformTo("arraybuffer",t),r);case"base64":return u.encode(t);default:return h.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),a);t(e)}catch(e){r(e)}n=[]}).resume()})}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,h.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return l(this,e)},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){h.delay(t,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var o=e("./utils"),h=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;u[254]=u[254]=1;function a(){n.call(this,"utf-8 decode"),this.leftOver=null}function l(){n.call(this,"utf-8 encode")}s.utf8encode=function(e){return h.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=h.uint8array?new Uint8Array(o):new Array(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return h.nodebuffer?o.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,a=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)a[r++]=n;else if(4<(i=u[n]))a[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?a[r++]=65533:n<65536?a[r++]=n:(n-=65536,a[r++]=55296|n>>10&1023,a[r++]=56320|1023&n)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(e=o.transformTo(h.uint8array?"uint8array":"array",e))},o.inherits(a,n),a.prototype.processChunk=function(e){var t=o.transformTo(h.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(h.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,n),l.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var o=e("./support"),h=e("./base64"),r=e("./nodejsUtils"),u=e("./external");function n(e){return e}function l(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}e("setimmediate"),a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var i={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function s(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=i.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=i.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return i.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return i.stringifyByChar(e)}function f(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=s;var c={};c.string={string:n,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:function(e){return l(e,r.allocBuffer(e.length))}},c.array={string:s,array:n,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return s(new Uint8Array(e))},array:function(e){return f(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:n,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:n,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return f(e,new Uint8Array(e.length))},nodebuffer:n},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.resolve=function(e){for(var t=e.split("/"),r=[],n=0;n<t.length;n++){var i=t[n];"."===i||""===i&&0!==n&&n!==t.length-1||(".."===i?r.pop():r.push(i))}return r.join("/")},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":o.nodebuffer&&r.isBuffer(e)?"nodebuffer":o.uint8array&&e instanceof Uint8Array?"uint8array":o.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!o[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){setImmediate(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(r,e,n,i,s){return u.Promise.resolve(e).then(function(n){return o.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new u.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t=a.getTypeOf(e);return t?("arraybuffer"===t?e=a.transformTo("uint8array",e):"string"===t&&(s?e=h.decode(e):n&&!0!==i&&(e=function(e){return l(e,o.uint8array?new Uint8Array(e.length):new Array(e.length))}(e))),e):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),a=e("./zipEntry"),o=e("./support");function h(e){this.files=[],this.loadOptions=e}h.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=o.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),a=e("./crc32"),o=e("./utf8"),h=e("./compressions"),u=e("./support");function l(e,t){this.options=e,this.loadOptions=t}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in h)if(Object.prototype.hasOwnProperty.call(h,t)&&h[t].magic===e)return h[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileName)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileComment)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null}},t.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),a=e("./utf8"),o=e("./compressedObject"),h=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new a.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new a.Utf8DecodeWorker))}catch(e){(t=new h("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof o&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)n.prototype[u[f]]=l;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,l,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),a=t.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var o=new t.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var e,t;n=!0;for(var r=h.length;r;){for(t=h,h=[],e=-1;++e<r;)t[e]();r=h.length}n=!1}l.exports=function(e){1!==h.push(e)||n||r()}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],n=["PENDING"];function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&d(this,e)}function h(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return l.reject(t,e)}e===t?l.reject(t,new TypeError("Cannot resolve promise with itself")):l.resolve(t,e)})}function c(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function d(t,e){var r=!1;function n(e){r||(r=!0,l.reject(t,e))}function i(e){r||(r=!0,l.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=o).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===a||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);this.state!==n?f(r,this.state===a?e:t,this.outcome):this.queue.push(new h(r,e,t));return r},h.prototype.callFulfilled=function(e){l.resolve(this.promise,e)},h.prototype.otherCallFulfilled=function(e){f(this.promise,this.onFulfilled,e)},h.prototype.callRejected=function(e){l.reject(this.promise,e)},h.prototype.otherCallRejected=function(e){f(this.promise,this.onRejected,e)},l.resolve=function(e,t){var r=p(c,t);if("error"===r.status)return l.reject(e,r.value);var n=r.value;if(n)d(e,n);else{e.state=a,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},l.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},o.resolve=function(e){if(e instanceof this)return e;return l.resolve(new this(u),e)},o.reject=function(e){var t=new this(u);return l.reject(t,e)},o.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);var s=new Array(n),a=0,t=-1,o=new this(u);for(;++t<n;)h(e[t],t);return o;function h(e,t){r.resolve(e).then(function(e){s[t]=e,++a!==n||i||(i=!0,l.resolve(o,s))},function(e){i||(i=!0,l.reject(o,e))})}},o.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,n=!1;if(!r)return this.resolve([]);var i=-1,s=new this(u);for(;++i<r;)a=e[i],t.resolve(a).then(function(e){n||(n=!0,l.resolve(s,e))},function(e){n||(n=!0,l.reject(s,e))});var a;return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var a=e("./zlib/deflate"),o=e("./utils/common"),h=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,c=0,d=8;function p(e){if(!(this instanceof p))return new p(e);this.options=o.assign({level:f,method:d,chunkSize:16384,windowBits:15,memLevel:8,strategy:c,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==l)throw new Error(i[r]);if(t.header&&a.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?h.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=a.deflateSetDictionary(this.strm,n))!==l)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=h.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new o.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=a.deflate(i,n))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(i.output,i.next_out))):this.onData(o.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==n||(this.onEnd(l),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var c=e("./zlib/inflate"),d=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function a(e){if(!(this instanceof a))return new a(e);this.options=d.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=c.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,c.inflateGetHeader(this.strm,this.header)}function o(e,t){var r=new a(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}a.prototype.push=function(e,t){var r,n,i,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?h.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new d.Buf8(u),h.next_out=0,h.avail_out=u),(r=c.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=c.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(h.output,h.next_out),s=h.next_out-i,a=p.buf2string(h.output,i),h.next_out=s,h.avail_out=u-s,s&&d.arraySet(h.output,h.output,i,s,0),this.onData(a)):this.onData(d.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=c.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(e){this.chunks.push(e)},a.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=d.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,o(e,t)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,a;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(a=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],a.set(s,i),i+=s.length;return a}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var h=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new h.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function l(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,h.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=new h.Buf8(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return l(e,e.length)},r.binstring2buf=function(e){for(var t=new h.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,a=t||e.length,o=new Array(2*a);for(r=n=0;r<a;)if((i=e[r++])<128)o[n++]=i;else if(4<(s=u[i]))o[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<a;)i=i<<6|63&e[r++],s--;1<s?o[n++]=65533:i<65536?o[n++]=i:(i-=65536,o[n++]=55296|i>>10&1023,o[n++]=56320|1023&i)}return l(o,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--a;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}},{}],46:[function(e,t,r){"use strict";var h,c=e("../utils/common"),u=e("./trees"),d=e("./adler32"),p=e("./crc32"),n=e("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,i=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(e,t){return e.msg=n[t],t}function T(e){return(e<<1)-(4<e?9:0)}function D(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(c.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function N(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function U(e,t){e.pending_buf[e.pending++]=t}function P(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function L(e,t){var r,n,i=e.max_chain_length,s=e.strstart,a=e.prev_length,o=e.nice_match,h=e.strstart>e.w_size-z?e.strstart-(e.w_size-z):0,u=e.window,l=e.w_mask,f=e.prev,c=e.strstart+S,d=u[s+a-1],p=u[s+a];e.prev_length>=e.good_match&&(i>>=2),o>e.lookahead&&(o=e.lookahead);do{if(u[(r=t)+a]===p&&u[r+a-1]===d&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<c);if(n=S-(c-s),s=c-S,a<n){if(e.match_start=t,o<=(a=n))break;d=u[s+a-1],p=u[s+a]}}}while((t=f[t&l])>h&&0!=--i);return a<=e.lookahead?a:e.lookahead}function j(e){var t,r,n,i,s,a,o,h,u,l,f=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=f+(f-z)){for(c.arraySet(e.window,e.window,f,f,0),e.match_start-=f,e.strstart-=f,e.block_start-=f,t=r=e.hash_size;n=e.head[--t],e.head[t]=f<=n?n-f:0,--r;);for(t=r=f;n=e.prev[--t],e.prev[t]=f<=n?n-f:0,--r;);i+=f}if(0===e.strm.avail_in)break;if(a=e.strm,o=e.window,h=e.strstart+e.lookahead,u=i,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,c.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=d(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),e.lookahead+=r,e.lookahead+e.insert>=x)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+x-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<x)););}while(e.lookahead<z&&0!==e.strm.avail_in)}function Z(e,t){for(var r,n;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r)),e.match_length>=x)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-x),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=x){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function W(e,t){for(var r,n,i;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=x-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===x&&4096<e.strstart-e.match_start)&&(e.match_length=x-1)),e.prev_length>=x&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-x,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-x),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=x-1,e.strstart++,n&&(N(e,!1),0===e.strm.avail_out))return A}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&N(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return A}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function M(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new c.Buf16(2*w),this.dyn_dtree=new c.Buf16(2*(2*a+1)),this.bl_tree=new c.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new c.Buf16(k+1),this.heap=new c.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new c.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?C:E,e.adler=2===t.wrap?0:1,t.last_flush=l,u._tr_init(t),m):R(e,_)}function K(e){var t=G(e);return t===m&&function(e){e.window_size=2*e.w_size,D(e.head),e.max_lazy_match=h[e.level].max_lazy,e.good_match=h[e.level].good_length,e.nice_match=h[e.level].nice_length,e.max_chain_length=h[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0}(e.state),t}function Y(e,t,r,n,i,s){if(!e)return _;var a=1;if(t===g&&(t=6),n<0?(a=0,n=-n):15<n&&(a=2,n-=16),i<1||y<i||r!==v||n<8||15<n||t<0||9<t||s<0||b<s)return R(e,_);8===n&&(n=9);var o=new H;return(e.state=o).strm=e,o.wrap=a,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=i+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new c.Buf8(2*o.w_size),o.head=new c.Buf16(o.hash_size),o.prev=new c.Buf16(o.w_size),o.lit_bufsize=1<<i+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new c.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=r,K(e)}h=[new M(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(j(e),0===e.lookahead&&t===l)return A;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,N(e,!1),0===e.strm.avail_out))return A;if(e.strstart-e.block_start>=e.w_size-z&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):(e.strstart>e.block_start&&(N(e,!1),e.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(e,t){return Y(e,t,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?_:(e.state.gzhead=t,m):_},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?R(e,_):_;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&t!==f)return R(e,0===e.avail_out?-5:_);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===C)if(2===n.wrap)e.adler=0,U(n,31),U(n,139),U(n,8),n.gzhead?(U(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),U(n,255&n.gzhead.time),U(n,n.gzhead.time>>8&255),U(n,n.gzhead.time>>16&255),U(n,n.gzhead.time>>24&255),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(U(n,255&n.gzhead.extra.length),U(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(U(n,0),U(n,0),U(n,0),U(n,0),U(n,0),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,3),n.status=E);else{var a=v+(n.w_bits-8<<4)<<8;a|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(a|=32),a+=31-a%31,n.status=E,P(n,a),0!==n.strstart&&(P(n,e.adler>>>16),P(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending!==n.pending_buf_size));)U(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&F(e),n.pending+2<=n.pending_buf_size&&(U(n,255&e.adler),U(n,e.adler>>8&255),e.adler=0,n.status=E)):n.status=E),0!==n.pending){if(F(e),0===e.avail_out)return n.last_flush=-1,m}else if(0===e.avail_in&&T(t)<=T(r)&&t!==f)return R(e,-5);if(666===n.status&&0!==e.avail_in)return R(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==l&&666!==n.status){var o=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(j(e),0===e.lookahead)){if(t===l)return A;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,a=e.window;;){if(e.lookahead<=S){if(j(e),e.lookahead<=S&&t===l)return A;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=x&&0<e.strstart&&(n=a[i=e.strstart-1])===a[++i]&&n===a[++i]&&n===a[++i]){s=e.strstart+S;do{}while(n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&i<s);e.match_length=S-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=x?(r=u._tr_tally(e,1,e.match_length-x),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):h[n.level].func(n,t);if(o!==O&&o!==B||(n.status=666),o===A||o===O)return 0===e.avail_out&&(n.last_flush=-1),m;if(o===I&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(D(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),F(e),0===e.avail_out))return n.last_flush=-1,m}return t!==f?m:n.wrap<=0?1:(2===n.wrap?(U(n,255&e.adler),U(n,e.adler>>8&255),U(n,e.adler>>16&255),U(n,e.adler>>24&255),U(n,255&e.total_in),U(n,e.total_in>>8&255),U(n,e.total_in>>16&255),U(n,e.total_in>>24&255)):(P(n,e.adler>>>16),P(n,65535&e.adler)),F(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?m:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==C&&69!==t&&73!==t&&91!==t&&103!==t&&t!==E&&666!==t?R(e,_):(e.state=null,t===E?R(e,-3):m):_},r.deflateSetDictionary=function(e,t){var r,n,i,s,a,o,h,u,l=t.length;if(!e||!e.state)return _;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(e.adler=d(e.adler,t,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new c.Buf8(r.w_size),c.arraySet(u,t,l-r.w_size,r.w_size,0),t=u,l=r.w_size),a=e.avail_in,o=e.next_in,h=e.input,e.avail_in=l,e.next_in=0,e.input=t,j(r);r.lookahead>=x;){for(n=r.strstart,i=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+x-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,e.next_in=o,e.input=h,e.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C;r=e.state,n=e.next_in,z=e.input,i=n+(e.avail_in-5),s=e.next_out,C=e.output,a=s-(t-e.avail_out),o=s+(e.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,c=r.window,d=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=m[d&g];t:for(;;){if(d>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(d&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}w=65535&v,(y&=15)&&(p<y&&(d+=z[n++]<<p,p+=8),w+=d&(1<<y)-1,d>>>=y,p-=y),p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=_[d&b];r:for(;;){if(d>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(d&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&v,p<(y&=15)&&(d+=z[n++]<<p,(p+=8)<y&&(d+=z[n++]<<p,p+=8)),h<(k+=d&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=c,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=c[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=c[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(n<i&&s<o);n-=w=p>>3,d&=(1<<(p-=w<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<o?o-s+257:257-(s-o),r.hold=d,r.bits=p}},{}],49:[function(e,t,r){"use strict";var I=e("../utils/common"),O=e("./adler32"),B=e("./crc32"),R=e("./inffast"),T=e("./inftrees"),D=1,F=2,N=0,U=-2,P=1,n=852,i=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=P,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new I.Buf32(n),t.distcode=t.distdyn=new I.Buf32(i),t.sane=1,t.back=-1,N):U}function o(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,a(e)):U}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,o(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=h(e,t))!==N&&(e.state=null),r):U}var l,f,c=!0;function j(e){if(c){var t;for(l=new I.Buf32(512),f=new I.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(D,e.lens,0,288,l,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,f,0,e.work,{bits:5}),c=!1}e.lencode=l,e.lenbits=9,e.distcode=f,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),n>=s.wsize?(I.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),I.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(I.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,f=o,c=h,x=N;e:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(d=r.length)&&(d=o),d&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,n,s,d,k)),512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,r.length-=d),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}e.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,l-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(d=r.length){if(o<d&&(d=o),h<d&&(d=h),0===d)break e;I.arraySet(i,n,s,d,a),o-=d,s+=d,h-=d,a+=d,r.length-=d;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],d=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+d>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;d--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=o&&258<=h){e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,R(e,c),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){e.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break e;if(d=c-h,r.offset>d){if((d=r.offset-d)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=d>r.wnext?(d-=r.wnext,r.wsize-d):r.wnext-d,d>r.length&&(d=r.length),m=r.window}else m=i,p=a-r.offset,d=r.length;for(h<d&&(d=h),h-=d,r.length-=d;i[a++]=m[p++],--d;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break e;i[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break e;o--,u|=n[s++]<<l,l+=8}if(c-=h,e.total_out+=c,r.total+=c,c&&(e.adler=r.check=r.flags?B(r.check,i,c,a-c):O(r.check,i,c,a-c)),c=h,(r.flags?u:L(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,(r.wsize||c!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,c-e.avail_out)?(r.mode=31,-4):(f-=e.avail_in,c-=e.avail_out,e.total_in+=f,e.total_out+=c,r.total+=c,r.wrap&&c&&(e.adler=r.check=r.flags?B(r.check,i,c,e.next_out-c):O(r.check,i,c,e.next_out-c)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===c||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var D=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,a,o){var h,u,l,f,c,d,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<n;v++)O[t[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return i[s++]=20971520,i[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===e||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<n;v++)0!==t[r+v]&&(a[B[t[r+v]]++]=v);if(d=0===e?(A=R=a,19):1===e?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,c=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===e&&852<C||2===e&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<d?(m=0,a[v]):a[v]>d?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;i[c+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=t[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),c+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===e&&852<C||2===e&&592<C)return 1;i[l=E&f]=k<<24|x<<16|c-s|0}}return 0!==E&&(i[c+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var i=e("../utils/common"),o=0,h=1;function n(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,a=29,u=256,l=u+1+a,f=30,c=19,_=2*l+1,g=15,d=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));n(z);var C=new Array(2*f);n(C);var E=new Array(512);n(E);var A=new Array(256);n(A);var I=new Array(a);n(I);var O,B,R,T=new Array(f);function D(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function N(e){return e<256?E[e]:E[256+(e>>>7)]}function U(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,r){e.bi_valid>d-r?(e.bi_buf|=t<<e.bi_valid&65535,U(e,e.bi_buf),e.bi_buf=t>>d-e.bi_valid,e.bi_valid+=r-d):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function L(e,t,r){P(e,r[2*t],r[2*t+1])}function j(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function Z(e,t,r){var n,i,s=new Array(g+1),a=0;for(n=1;n<=g;n++)s[n]=a=a+r[n-1]<<1;for(i=0;i<=t;i++){var o=e[2*i+1];0!==o&&(e[2*i]=j(s[o]++,o))}}function W(e){var t;for(t=0;t<l;t++)e.dyn_ltree[2*t]=0;for(t=0;t<f;t++)e.dyn_dtree[2*t]=0;for(t=0;t<c;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*m]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function M(e){8<e.bi_valid?U(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function H(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function G(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&H(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!H(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function K(e,t,r){var n,i,s,a,o=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],i=e.pending_buf[e.l_buf+o],o++,0===n?L(e,i,t):(L(e,(s=A[i])+u+1,t),0!==(a=w[s])&&P(e,i-=I[s],a),L(e,s=N(--n),r),0!==(a=k[s])&&P(e,n-=T[s],a)),o<e.last_lit;);L(e,m,t)}function Y(e,t){var r,n,i,s=t.dyn_tree,a=t.stat_desc.static_tree,o=t.stat_desc.has_stree,h=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,o&&(e.static_len-=a[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)G(e,s,r);for(i=h;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],G(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,G(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,a,o,h=t.dyn_tree,u=t.max_code,l=t.stat_desc.static_tree,f=t.stat_desc.has_stree,c=t.stat_desc.extra_bits,d=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=g;s++)e.bl_count[s]=0;for(h[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<_;r++)p<(s=h[2*h[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),h[2*n+1]=s,u<n||(e.bl_count[s]++,a=0,d<=n&&(a=c[n-d]),o=h[2*n],e.opt_len+=o*(s+a),f&&(e.static_len+=o*(l[2*n+1]+a)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(h[2*i+1]!==s&&(e.opt_len+=(s-h[2*i+1])*h[2*i],h[2*i+1]=s),n--)}}(e,t),Z(s,u,e.bl_count)}function X(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=a,a=t[2*(n+1)+1],++o<h&&i===a||(o<u?e.bl_tree[2*i]+=o:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[2*b]++):o<=10?e.bl_tree[2*v]++:e.bl_tree[2*y]++,s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4))}function V(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),n=0;n<=r;n++)if(i=a,a=t[2*(n+1)+1],!(++o<h&&i===a)){if(o<u)for(;L(e,i,e.bl_tree),0!=--o;);else 0!==i?(i!==s&&(L(e,i,e.bl_tree),o--),L(e,b,e.bl_tree),P(e,o-3,2)):o<=10?(L(e,v,e.bl_tree),P(e,o-3,3)):(L(e,y,e.bl_tree),P(e,o-11,7));s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4)}}n(T);var q=!1;function J(e,t,r,n){P(e,(s<<1)+(n?1:0),3),function(e,t,r,n){M(e),n&&(U(e,r),U(e,~r)),i.arraySet(e.pending_buf,e.window,t,r,e.pending),e.pending+=r}(e,t,r,!0)}r._tr_init=function(e){q||(function(){var e,t,r,n,i,s=new Array(g+1);for(n=r=0;n<a-1;n++)for(I[n]=r,e=0;e<1<<w[n];e++)A[r++]=n;for(A[r-1]=n,n=i=0;n<16;n++)for(T[n]=i,e=0;e<1<<k[n];e++)E[i++]=n;for(i>>=7;n<f;n++)for(T[n]=i<<7,e=0;e<1<<k[n]-7;e++)E[256+i++]=n;for(t=0;t<=g;t++)s[t]=0;for(e=0;e<=143;)z[2*e+1]=8,e++,s[8]++;for(;e<=255;)z[2*e+1]=9,e++,s[9]++;for(;e<=279;)z[2*e+1]=7,e++,s[7]++;for(;e<=287;)z[2*e+1]=8,e++,s[8]++;for(Z(z,l+1,s),e=0;e<f;e++)C[2*e+1]=5,C[2*e]=j(e,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,c,p)}(),q=!0),e.l_desc=new F(e.dyn_ltree,O),e.d_desc=new F(e.dyn_dtree,B),e.bl_desc=new F(e.bl_tree,R),e.bi_buf=0,e.bi_valid=0,W(e)},r._tr_stored_block=J,r._tr_flush_block=function(e,t,r,n){var i,s,a=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return o;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return h;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return h;return o}(e)),Y(e,e.l_desc),Y(e,e.d_desc),a=function(e){var t;for(X(e,e.dyn_ltree,e.l_desc.max_code),X(e,e.dyn_dtree,e.d_desc.max_code),Y(e,e.bl_desc),t=c-1;3<=t&&0===e.bl_tree[2*S[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?J(e,t,r,n):4===e.strategy||s===i?(P(e,2+(n?1:0),3),K(e,z,C)):(P(e,4+(n?1:0),3),function(e,t,r,n){var i;for(P(e,t-257,5),P(e,r-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*S[i]+1],3);V(e,e.dyn_ltree,t-1),V(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,a+1),K(e,e.dyn_ltree,e.dyn_dtree)),W(e),n&&M(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(A[r]+u+1)]++,e.dyn_dtree[2*N(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){P(e,2,3),L(e,m,z),function(e){16===e.bi_valid?(U(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){(function(e){!function(r,n){"use strict";if(!r.setImmediate){var i,s,t,a,o=1,h={},u=!1,l=r.document,e=Object.getPrototypeOf&&Object.getPrototypeOf(r);e=e&&e.setTimeout?e:r,i="[object process]"==={}.toString.call(r.process)?function(e){process.nextTick(function(){c(e)})}:function(){if(r.postMessage&&!r.importScripts){var e=!0,t=r.onmessage;return r.onmessage=function(){e=!1},r.postMessage("","*"),r.onmessage=t,e}}()?(a="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",d,!1):r.attachEvent("onmessage",d),function(e){r.postMessage(a+e,"*")}):r.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){c(e.data)},function(e){t.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(s=l.documentElement,function(e){var t=l.createElement("script");t.onreadystatechange=function(){c(e),t.onreadystatechange=null,s.removeChild(t),t=null},s.appendChild(t)}):function(e){setTimeout(c,0,e)},e.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var n={callback:e,args:t};return h[o]=n,i(o),o++},e.clearImmediate=f}function f(e){delete h[e]}function c(e){if(u)setTimeout(c,0,e);else{var t=h[e];if(t){u=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{f(e),u=!1}}}}function d(e){e.source===r&&"string"==typeof e.data&&0===e.data.indexOf(a)&&c(+e.data.slice(a.length))}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[10])(10)});
/*! pdfmake v0.2.10, @license MIT, @link http://pdfmake.org */

this.pdfMake = this.pdfMake || {}; this.pdfMake.vfs = {
  "Roboto-Italic.ttf": "AAEAAAARAQAABAAQR0RFRqbzo4gAAddgAAACWEdQT1N/jKrdAAHZuAAAWMBHU1VCm18k/AACMngAABX2T1MvMpeDsUwAAAGYAAAAYGNtYXDTfF9iAAAWnAAABoJjdnQgO/gmfQAAL3gAAAD+ZnBnbagFhDIAAB0gAAAPhmdhc3AACAAZAAHXVAAAAAxnbHlmNN3JWAAAOswAAZmmaGVhZAh9pEIAAAEcAAAANmhoZWEMnBKkAAABVAAAACRobXR4VUzdowAAAfgAABSkbG9jYV8SwLgAADB4AAAKVG1heHAI2RDGAAABeAAAACBuYW1lOSJt5gAB1HQAAALAcG9zdP9hAGQAAdc0AAAAIHByZXB5WM7TAAAsqAAAAs4AAQAAAAMCDJn8J2NfDzz1ABsIAAAAAADE8BEuAAAAAODgRcL6N/3VCUMIcwACAAkAAgAAAAAAAAABAAAHbP4MAAAJA/o3/mwJQwgAAbMAAAAAAAAAAAAAAAAFKQABAAAFKQCpABUAdgAHAAIAEAAvAJoAAALmD3UAAwABAAQEiQGQAAUAAAWaBTMAAAEfBZoFMwAAA9EAZgIAAAACAAAAAAAAAAAA4AAC/1AAIFsAAAAgAAAAAEdPT0cAAQAA//0GAP4AAGYHmgIAIAABnwAAAAAEOgWwAAAAIAADA5YAZAAAAAAAAAAAAfcAAAH3AAACAABEAnwAyQTHAFIEXABJBa8AugTUADkBWwCsAqgAbQK0/5ADWABrBGcATAGH/48CJQAaAgwANAM0/5AEXABqBFwA+gRcABgEXAA1BFwABQRcAHIEXABtBFwAnQRcAEAEXACUAesAKQGu/5sD8gBCBEIAcAQPADsDqwClBvgAQQUQ/68E1gA7BQ0AcAUYADsEaQA7BEoAOwVJAHQFiQA7AhwASQRIAAcE3gA7BC4AOwbGADsFiQA7BVcAcwTlADsFVwBrBMgAOwScACkEoQCpBQgAYwTxAKUG4gDDBN3/1ASpAKgEpv/sAg8AAAMwAMACD/97Az4ATwOA/4ECZgDQBDkAMQRcAB8EEABGBGAARwQdAEUCswB1BFwAAwRGACAB4wAvAdv/EwPvACAB4wAvBs4AHgRJACAEbQBGBFz/1wRpAEYCoQAgBAEALgKKAEMERwBbA8IAbgXVAIAD2v/FA6z/qgPa/+4CoAA3AeUAIgKg/40FRwBpAeX/8QQ/AFAEg//zBYkAEgQUAEMB3f/4BML/2gM/ANoGGQBeA3kAwwOuAFYETACBBhoAXQOPAPgC5gDoBCYAJgLiAF0C4gBvAm8A1QRm/+YDzAB4AgcApQHt/8gC4gDgA4gAvwOtABEFuQC6Bg8AtQYTAJ4Drf/RB0H/gwQkACgFVwAgBJYAOQSdAB8GjgATBI0AXARvAEQEZgA6BHn/4ASjAEYFcAA2AewALwRSAC4ELgAjAhkAJAVgADUEZgAlB2YAVQcMAEcB7QA0BV0AUgKl/0cFVQBmBHAAQwVlAGMEzQBbAfX/CQQYAD8DpwEYA3MBKAOZAPgDUQEHAeMBDgKZAQECGv+uA6kA3gLlAMMCSP/pAAD9agAA/eoAAP0LAAD99AAA/NsAAPy6Af4BIwPtAPQCEQClBFEARAV5/7IFSABnBRf/xARvAAwFiQBEBG//2wWPAFYFXgCFBSkACgRjAEgEmf/xA+QAhQRmAEUEMAApBAUAigRmACUEawB1AoQAhARN/7gDzgBABKAAYARm/90ELQBKBGUASAQMAIcEPABoBXgAQAVvAE4GZABnBH4AUgQiAGcGGABoBdIAogU8AHMIUP/NCGMARAZRALQFiABCBO4ANgXW/4wHC/+rBJwAJQWJAEQFf//LBOEAlAX+AFsFrQBBBVAAywdNAEIHhABCBeMAigbAAEQE3gA2BTwAdgb6AEkE8f/pBEsARwRwADEDQgAuBK//jQXy/6cD8QAgBHsAMAQyADAEfP/IBcEAMQR6ADAEewAwA7sAYAWhAEkEmgAwBDkAeQZHADAGbAAlBNEAVgYQADEENwAxBC0AMgZWADEEQv+/BEYAIAQtAE4Glf/DBq8AMARwACAEewAwBtMAbgX9AE8ENgAvBvUASgXLAC0Erv+6BCb/ogbWAFsF3gBPBp4AJgW1ACoIwABJB5UALwQE/80Dvf/JBUgAZwRpAEME5ACtA+UAhQVIAGcEZgBDBssAdAX1AFIG0wBuBf0ATwUKAGkEJwBMBNgAQAAA/OcAAP0KAAD+FgAA/jsAAPo3AAD6TgXlAEQE0QAwBDYALwT0ADsEZ//XBEIANQN2ACUEwABEA+cAJQdx/6sGOv+nBXkARASeADAE4wA2BFwALgZaALwFWgB2BdsAOwS+ADAHkwA7BYgAJQf8AEIGvwAlBcEAawSvAFwE+//UBBT/xQb2AKwFNABXBZoAywR9AHkFRgDKBEkAlAVGABwGAACIBJoABATjADYEOQAuBdr/ywTT/8gFhwBEBGYAJQXtADsE0AAwByEAOwYYADEFXQBSBIQAPASE//0Env/5A5n/6QUQ/9QEKf/FBNEALgZiADEGsABIBiYArQUEAGgEKQCwA+kAoAeG/+AGRP/aB74APAZvACME0QBlA/4ATQWCAJsE+gB9BTwAaAXe/8sE1//IAwkA8wP/AAAH9AAAA/8AAAf0AAACrgAAAgQAAAFcAAAEZgAAAikAAAGfAAABAgAAANUAAAAAAAACLQAaAi0AGgUiAKYGGQCYA4r/XgGOALABjgCJAYz/lwGOANICyAC4AtAAlQKt/5QESAB3BG3/9gKeAKEDsQA4BTsAOAF0AFIHbwCWAlUAXQJVAAQDh//wAuIAjwLiAGQC4gCKAuIAkALiAKIC4gB7AuIAqgMfAIgC4QCJAuEAcwHiAI8B4gA+A0cAfgLi/9wC4gAtAuL/qwLi/7wC4v+yAuL/2ALi/94C4v/wAuL/yQLi//gDKf/cAuv/3QLr/8cB4v/oAeL/nQSD//MGJQAKBl8AOQg/ADsFvgAJBfwAHwRcAFEFrQBDBAMASgRSAAsFH//yBSb/5QW7AMwDsQBLB/sANQTbAOsE8QB/BgEAtgasAJIGpQCQBkMAvgRtAE0FZAAkBIv/rQRwAKsEoABBB/sASwH9/xUEXwAzBEIAcAP8/9MEGQAYA+kAQgJEAHcCfABxAfX/5ATXAHUETQBZBGgAdQagAHUGoAB1BMgAdQZoACgAAAAAB/X/qwg1AFwC2P/qAtgAbALYABwD8QBpA/EAJwPxAHAD8ABLA/EASgPx//cD8QAXA/H//QPxAL0D8QBGBAP/3QQLAHUEM/+3BeYAlARGAHkEWwBCBAcAbgQAABIEKQAdBJgARgQ7AB4EmABMBL0AHgXUAB4DmQAeBDQAHgOy//YB2gArBL4AHgSIAEwDrwAeBAAAEgQUAAYDhQAZA5MAHgRG/7AEmABMBEb/sANu/9MEqgAeA9L/1gU+AFIE8AB9BM0ADgVJAG0EWgBIBwr/wwcYAB4FSgBuBKkAHgQ5ACAE/f+JBd3/rwQfABIExgAgBC0AHwSc/8QEAABaBQEAHgRIAFYGIAAeBnkAHgT2AFEFzQAgBC4AIARaACAGRQAeBGT/4APz//oGGP+vBFcAHwTjAB8FDwBqBZcAUARHAHUEhP+3BjEAbQRIAFUESAAeBZgALgSmAEAEHwASBJwARgQUAAADxgAfB+QAHgSH/94C2P/7Atj/8QLYABcC2AAdAtgALwLYAAgC2AA3A3sAkwKgAQsDyAAeBBr/mQSfAEgFIwBEBP0ARAP1ACYFFQBEA/AAJgRdAB4EWgBIBDAAHgRj/6YB7wD8A4kBEgAA/SoD0gDTA9YAIgPwAM4D1wDNA5MAHgOEARIDgwETAuIAjwLiAGQC4gCKAuIAkALiAKIC4gB7AuIAqgVYAIAFgwCBBWgARAWzAIMFtgCDA7gAvARfADkEN/+BBKr/0wRJ/9UEDgArA4kBFAGG/74GcQBMBJYAPgHt/w8EZv+sBGb/4wRm/7gEZgAsBGYAVgRmACQEZgBmBGYAGwRmAEAEZgENAgD/CQH//wkB9gAvAfb/eAH2AC8EMAAeBNoAZAQBAGIEXAAfBBMARARwAEMEaQAjBHwAQgRr/9cEeQBCBB0ARgRcADUETv+/A2gAqQSxACwDmf/pBgr/mgPaAB4EmP/0BL0AHgS9AB4B9wAAAiUAGgU2AC8FNgAvBGQAPgShAKkCiv/0BRD/rwUQ/68FEP+vBRD/rwUQ/68FEP+vBRD/rwUNAHAEaQA7BGkAOwRpADsEaQA7AhwASQIcAEkCHABJAhwASQWJADsFVwBzBVcAcwVXAHMFVwBzBVcAcwUIAGMFCABjBQgAYwUIAGMEqQCoBDkAMQQ5ADEEOQAxBDkAMQQ5ADEEOQAxBDkAMQQQAEYEHQBFBB0ARQQdAEUEHQBFAewALwHsAC8B7AAvAewALwRJACAEbQBGBG0ARgRtAEYEbQBGBG0ARgRHAFsERwBbBEcAWwRHAFsDrP+qA6z/qgUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUNAHAEEABGBQ0AcAQQAEYFDQBwBBAARgUNAHAEEABGBRgAOwT2AEcEaQA7BB0ARQRpADsEHQBFBGkAOwQdAEUEaQA7BB0ARQRpADsEHQBFBUkAdARcAAMFSQB0BFwAAwVJAHQEXAADBUkAdARcAAMFiQA7BEYAIAIcAEkB7AARAhwASQHsAC4CHABJAewALwIc/4sB4/9tAhwASQZkAEkDvgAvBEgABwH1/wkE3gA7A+8AIAQuADsB4wAvBC4AOwHj/6IELgA7AnkALwQuADsCvwAvBYkAOwRJACAFiQA7BEkAIAWJADsESQAgBEkAIAVXAHMEbQBGBVcAcwRtAEYFVwBzBG0ARgTIADsCoQAgBMgAOwKh/58EyAA7AqEAIAScACkEAQAuBJwAKQQBAC4EnAApBAEALgScACkEAQAuBJwAKQQBAC4EoQCpAooAQwShAKkCigBDBKEAqQKyAEMFCABjBEcAWwUIAGMERwBbBQgAYwRHAFsFCABjBEcAWwUIAGMERwBbBQgAYwRHAFsG4gDDBdUAgASpAKgDrP+qBKkAqASm/+wD2v/uBKb/7APa/+4Epv/sA9r/7gdB/4MGjgATBVcAIARmADoEXf+vBF3/rwQHAG4EY/+mBGP/pgRj/6YEY/+mBGP/pgRj/6YEY/+mBFoASAPIAB4DyAAeA8gAHgPIAB4B2gArAdoAKwHaACsB2gArBL0AHgSYAEwEmABMBJgATASYAEwEmABMBFsAQgRbAEIEWwBCBFsAQgQLAHUEY/+mBGP/pgRj/6YEWgBIBFoASARaAEgEWgBIBF0AHgPIAB4DyAAeA8gAHgPIAB4DyAAeBIgATASIAEwEiABMBIgATAS+AB4B2gAOAdoAKwHaACsB5P+CAdoAKwOy//YENAAeA5kAHgOZAB4DmQAeA5kAHgS9AB4EvQAeBL0AHgSYAEwEmABMBJgATAQpAB0EKQAdBCkAHQQAABIEAAASBAAAEgQAABIEBwBuBAcAbgQHAG4EWwBCBFsAQgRbAEIEWwBCBFsAQgRbAEIF5gCUBAsAdQQLAHUEA//dBAP/3QQD/90FEP+vBM0AAwXtABECgAAXBWsAawUN/+0FPQAeAoQAIAUQ/68E1gA7BGkAOwSm/+wFiQA7AhwASQTeADsGxgA7BYkAOwVXAHME5QA7BKEAqQSpAKgE3f/UAhwASQSpAKgEYwBIBDAAKQRmACUChACEBDwAaARSAC4EbQBGBGb/5gPCAG4ETv+/AoQAZQQ8AGgEbQBGBDwAaAZkAGcEaQA7BFEARAScACkCHABJAhwASQRIAAcE/QBEBN4AOwThAJQFEP+vBNYAOwRRAEQEaQA7BYkARAbGADsFiQA7BVcAcwWJAEQE5QA7BQ0AcAShAKkE3f/UBDkAMQQdAEUEewAwBG0ARgRc/9cEEABGA6z/qgPa/8UEHQBFA0IALgQBAC4B4wAvAewALwHb/xMEMgAwA6z/qgbiAMMF1QCABuIAwwXVAIAG4gDDBdUAgASpAKgDrP+qAVsArAJ8AMkEAABEAfX/CQGOAIkGxgA7Bs4AHgUQ/68EOQAxBGkAOwWJAEQEHQBFBHsAMAVeAIUFbwBOBOQArQPlAIUIGQBGCQMAcwScACUD8QAgBQ0AcAQQAEYEqQCoA+QAhQIcAEkHC/+rBfL/pwIcAEkFEP+vBDkAMQUQ/68EOQAxB0H/gwaOABMEaQA7BB0ARQVdAFIEGAA/BBgAPwcL/6sF8v+nBJwAJQPxACAFiQBEBHsAMAWJAEQEewAwBVcAcwRtAEYFSABnBGkAQwVIAGcEaQBDBTwAdgQtADIE4QCUA6z/qgThAJQDrP+qBOEAlAOs/6oFUADLBDkAeQbAAEQGEAAxBGAARwUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQUQ/68EOQAxBRD/rwQ5ADEFEP+vBDkAMQRpADsEHQBFBGkAOwQdAEUEaQA7BB0ARQRpADsEHQBFBGkAOwQdAEUEaQA7BB0ARQRpADsEHQBFBGkAOwQdAEUCHABJAewALwIcAA0B4//wBVcAcwRtAEYFVwBzBG0ARgVXAHMEbQBGBVcAcwRtAEYFVwBzBG0ARgVXAHMEbQBGBVcAcwRtAEYFVQBmBHAAQwVVAGYEcABDBVUAZgRwAEMFVQBmBHAAQwVVAGYEcABDBQgAYwRHAFsFCABjBEcAWwVlAGMEzQBbBWUAYwTNAFsFZQBjBM0AWwVlAGMEzQBbBWUAYwTNAFsEqQCoA6z/qgSpAKgDrP+qBKkAqAOs/6oEfgAABKEAqQO7AGAFUADLBDkAeQRRAEQDQgAuBgAAiASaAAQERgAgBN4ALATeACwEUQARA0L/5wURAFgECQA6BKkAqAPkAF4E3f/UA9r/xQQwACkESv/XBhkAmARcABgEXAA1BFwABQRcAHIEcACBBIQAVARwAJQEhAB+BUkAdARcAAMFiQA7BEkAIAUQ/68EOQAxBGkAOwQdAEUCHP/gAez/jQVXAHMEbQBGBMgAOwKhACAFCABjBEcAWwSG/7EE1gA7BFwAHwUYADsEYABHBRgAOwRgAEcFiQA7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AGUAcwAvAEwASQBDAEUATgBTAEUALQAyAC4AMAADAAD/9AAA/2oAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAgAIAAj//wAPAAEAAgAOAAAAAAAAAigAAgBZACUAPgABAEQAXgABAGoAagABAHAAcAABAHUAdQABAIEAgQABAIMAgwABAIYAhgABAIkAiQABAIsAlgABAJgAnwABAKEAowABAKUApgABAKgArQADALEAsQABALoAuwABAL8AvwABAMEAwQABAMMAxAABAMcAxwABAMsAywABAM0AzgABANAA0QABANMA0wABANoA3gABAOEA4QABAOUA5QABAOcA6QABAOsA+wABAP0A/QABAP8BAQABAQMBAwABAQgBCQABARYBGgABARwBHAABASABIgABASQBJwADASoBKwABATMBNAABATYBNgABATsBPAABAUEBRAABAUcBSAABAUsBTQABAVEBUQABAVQBWAABAV0BXgABAWIBYgABAWQBZAABAWgBaAABAWoBbAABAW4BbgABAXABcAABAdUB2wACAewCAAABAgQCBAABAg0CDQABAg8CDwABAhYCGAABAhoCGwABAh0CHQABAiECIQABAiMCJQABAisCKwABAjACMgABAjQCNAABAkICQgABAkUCRQABAkcCRwABAkoCTQABAnkCfQABAo0CkgABApUC/QABAwADvwABA8EDwQABA8MDzQABA88D2AABA9oD9QABA/kD+QABA/sEAgABBAQEBgABBAkEDQABBA8EmgABBJ0EngABBKAEoQABBKMEpgABBLAFDAABBQ4FGAABBRsFKAABAAEAAwAAABAAAAAWAAAAIAABAAEArQACAAEAqACsAAAAAgACAKgArAAAASQBJwAFAAEAAAAWADAACgAFAEYATgBYAGIAbAAEREZMVABqY3lybABuZ3JlawBybGF0bgB2AAVjcHNwAGBrZXJuAGxrZXJuAGZrZXJuAHRrZXJuAHwAAQAAAAEAZAACAAgAAgEyCAgAAgAIAAIAzAQuAAIACAACAjIP/AACAAgAAgBIAIAATgAAAFQAAABaAAAAYAAAAAAAAQAAAAAAAQAEAAAAAgAEAAMAAAACAAQAAQAAAAIABAACAAErTAAFACQASAABGRIABAAAAAMZBhkcGQwAAP//AAIAAAACAAD//wACAAAAAwAA//8AAgAAAAQAAP//AAIAAAABAAIZDgAEAAAZVBt4AAQABQAA/5UAAAAA/4gAAP9WAAAAAAAAAAAAAAAAAAAAAAAA/4gAAAAAAAAAARv2AAQAAAApGXwZihlKGtgZ2BmmGgQZtBnuGlYafBj+GcYZBByiGRYdBBukGqoZChkQHWoZVBoaGgQZphxMGgQZXhloGaYZmBsKHEwaNBxMGRYZchnGGXIZpgABLrQABAAAAIUeQh4IHYwdkh3QHwYgAjbCMNQ08ih8Hn4x6izCH9AlEB5+Hn4hHB5+Hn4efimMJBQefh+mJJIjJB5cJ9IiZB28JzQdmB98I5ovwh4sIN4lkiG4HyweLCIOH1IhZiA4HywgpB7CHewdsh98HiwmHB28H9AdmCBuIG4gbh5+H9AdmB5+Hn4d+h28H9AdmCLCJhwefh5+IG4gbiEcIKQdniYcHn4efh36Hd4eGiamH9AeoB2oHsIeLB2yHZgdqB28HbIdqB3sHbIeGh7kHbIefh/QHZgefiCkHqAgpB6gHagdqB2oH9AdmB36HsIewh4sIRwdsiEcHbIhHB2yJqYmHB28HcYfpiYcIG4e5AABOcYABAAAAPQswChIKEgy9CzWK2goTit2PCArhCzsKE4objUkMi4tMiyuLQIoWjHwK6AycBemN8IXpjccF6YXphemK5IzOihULRgoVDKyKE4ziCycKEg4nChIKEgoSChCLVQteig8KGQoNitaKDYraChOKE4oTihOLTIs1izWLNYs1izWLNYs1itoK3Yrdit2K3YoTihOKE4oTihOMfAXphemF6YXphemF6YXphemF6YXpihUKFQs1izWLNYraCtoK2graChOK3YXpit2F6YrdhemK3YXpit2F6YXpiuELOws7CzsLOwXphemF6YXpihOF6YoThemKE4XpiuSK5Irki0yLTItMi0CMfAoVDHwK6AroCugKDwoPChCKDYoNig2KDYoNig2KDYoPCg8KDwoPCg8KDYoNig2KDwoZChkKGQoZCg8KDwoPChCLQItAi0CMfAoVChIKEgoSBemLNYs1izWLNYs1izWLNYs1izWLNYs1izWLNYrdhemK3YXpit2F6YrdhemK3YXpit2F6YrdhemK3YXpihOF6YoThemKE4XpihOF6YoThemKE4XpihOF6YXpjHwKFQx8ChUMfAoVBemLNYrdihO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/58AOgCyAA8A0v/mANQADgDW/+YA2QATANoADgDdAA4A3gALAOH/5QDm/+YA5//0AO0AEgDyAA8A9v/nAPn/6AD+AAABBAAPAQ0ADwEZ/+YBMwAOATn/5gE6/+cBQwAOAUX/5gFH/+UBSP/oAUn/5QFK/+gBTP/kAVAADgFRAA8BXQAOAWL/5gFk/+YBZgAOAWz/5gFt/+cBbwAOAXAADwPQAAsD0QAPA9z/5gPdAA4EBf/mBA3/5gQQAA4EEwAPBBUADwQeAA4ELgALBDAACwQyAAsENP/lBDX/6ASS/+YElP/lBJX/6ASh/+YAAQD6AAgACgAUABUAFgAXABgAGQAaABsAHAAdACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgBlAGcAgQCDAIQAjACPAJEAkwCxALIAswC0ALUAtgC3ALgAuQC6ANIA0wDUANUA1gDXANgA2QDaANsA3ADdAN4A3wDgAOEA4gDjAOQA5QDmAOcA6ADpAS8BMwE1ATcBOQE7AUEBQwFFAUkBSwFMAVgBWQGxAbcBvAG/ApUClgKYApoCmwKcAp0CngKfAqACoQKiAqMCpAKlAqYCpwKoAqkCqgKrAqwCrQKuAq8CsAKxArICswK0AtEC0wLVAtcC2QLbAt0C3wLhAuMC5QLnAukC6wLtAu8C8QLzAvUC9wL5AvsC/QL+AwADAgMEAwYDCAMKAwwDDgMQAxMDFQMXAxkDGwMdAx8DIQMjAyUDJwMpAysDLQMvAzEDMwM1AzcDOQM7Az0DPwNAA0IDRANGA0gDoQOiA6MDpAOlA6YDpwOpA6oDqwOsA60DrgOvA7ADsQOyA7MDtAO1A7YDtwO4A8gDyQPKA8sDzAPNA84DzwPQA9ED0gPTA9QD1QPWA9cD2APZA9oD2wPcA90D7gPwA/ID9AQJBAsEDQQiBCgELgSYBJ0EoQUiBSQAAwHv//UB8P/uA5v/9QADAA3/5gBB//QAYf/vAAMASv/uAFv/6gHw//AAAwBb/8EB///mAkv/6AADAEoADwBYADIAWwARAAMAW//lAf//6wJL/+0AOwCyABAA0v/gANP/6ADUABAA1v/gANkAFADdABAA4f/hAOb/4ADtABMA8gAQAPn/4AEEABABCP/oAQ0AEAEX/+gBGf/gARv/6AEd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/8oBif/KA9D/7QPc/9ID3f/0A+D/0QPi/9ED5P/mA+X/7wPn/9ED7P/RA+3/5gP2/8oD9//KA/r/ygQC/9EEBf/UBAb/5gQN/9MEDv/mBBD/9AQR/+8EHv/0BB//7wQj/9EEJf/RBC7/7QQv/+YEMP/tBDH/5gQy/+0EM//mBDT/4QQ3/9EEkv/SBJT/4QSX/9EEof/TACkAR//sAEj/7ABJ/+wAS//sAFX/7ACU/+wAmf/sArz/7AK9/+wCvv/sAr//7ALA/+wC2P/sAtr/7ALc/+wC3v/sAuD/7ALi/+wC5P/sAub/7ALo/+wC6v/sAuz/7ALu/+wC8P/sAvL/7ARS/+wEVP/sBFb/7ARY/+wEWv/sBFz/7ARe/+wEYP/sBHT/7AR2/+wEeP/sBHz/7AS3/+wExP/sBMb/7AA2AAYAEAALABAADQAUAEEAEgBH/+gASP/oAEn/6ABL/+gAVf/oAGEAEwCU/+gAmf/oAYQAEAGFABABhwAQAYgAEAGJABACvP/oAr3/6AK+/+gCv//oAsD/6ALY/+gC2v/oAtz/6ALe/+gC4P/oAuL/6ALk/+gC5v/oAuj/6ALq/+gC7P/oAu7/6ALw/+gC8v/oA/YAEAP3ABAD+gAQBFL/6ARU/+gEVv/oBFj/6ARa/+gEXP/oBF7/6ARg/+gEdP/oBHb/6AR4/+gEfP/oBLf/6ATE/+gExv/oAEoAR//FAEj/xQBJ/8UAS//FAEwAIABPACAAUAAgAFP/gABV/8UAV/+QAFsACwCU/8UAmf/FAdv/kAK8/8UCvf/FAr7/xQK//8UCwP/FAsb/gALH/4ACyP+AAsn/gALK/4AC2P/FAtr/xQLc/8UC3v/FAuD/xQLi/8UC5P/FAub/xQLo/8UC6v/FAuz/xQLu/8UC8P/FAvL/xQMU/4ADFv+AAxj/gAMg/5ADIv+QAyT/kAMm/5ADKP+QBFL/xQRU/8UEVv/FBFj/xQRa/8UEXP/FBF7/xQRg/8UEZv+ABGj/gARq/4AEbP+ABG7/gARw/4AEcv+ABHT/xQR2/8UEeP/FBHr/gAR8/8UEt//FBLv/gATE/8UExv/FBMgAIATKACAEzAAgBNn/kAABAPQABAAGAAsADAAlACcAKAApACoALwAwADMANAA1ADYAOAA6ADsAPAA9AD4APwBJAEoATABPAFEAUgBTAFYAWABaAFsAXQBfAJYAnQCyAYQBhQGHAYgBiQHyAfQB9QH3AfoCBQJKAk0CXwJhAmIClQKWApgCmgKbApwCnQKeAp8CoAKhAqICowKkAqUCqwKsAq0CrgKvArQCvQK+Ar8CwALFAsYCxwLIAskCygLPAtAC0QLTAtUC1wLZAtsC3QLfAuEC4gLjAuQC5QLmAucC6ALpAuoC9AMCAwQDBgMIAwoDDQMPAxEDEgMTAxQDFQMWAxcDGAMaAxwDHgMpAysDLQM7Az0DPgM/A0ADQgNEA0oDSwNMA00DTgNPA1ADUQNSA1MDXgNfA2ADYQNiA2gDaQNqA28DgQOCA4MDhAOIA4kDigOTA+4D8APyA/QD9QP2A/cD+gP8A/0EOQQ7BD0EPwRBBEMERQRHBEkESwRNBE8EUQRSBFMEVARVBFYEVwRYBFkEWgRbBFwEXQReBF8EYARlBGYEZwRoBGkEagRrBGwEbQRuBG8EcARxBHIEegSLBIwEjQSOBI8EkASzBLQEtgS6BLsEvQTDBMUEyATJBMsEzQTQBNIE0wTUBNcE2gTdBN4E3wTgBOEE4wABADUABgALAJYAsQCyALMAtAC9AMEAxwGEAYUBhwGIAYkCBQIGAgcDoQOiA6MDpAOlA6YDqQOqA6sDrAOtA64DrwOwA7EDsgOzA7QDtQO2A7cDuAO7A78DwQPFA/YD9wP6BOUE5gTqBO0E8wT4AKcAEP8WABL/FgAl/1YALv74ADgAFABF/94AR//rAEj/6wBJ/+sAS//rAFP/6wBV/+sAVv/mAFn/6gBa/+gAXf/oAJT/6wCZ/+sAm//qALL/VgGG/xYBiv8WAY7/FgGP/xYCBf/AAk3/wAKa/1YCm/9WApz/VgKd/1YCnv9WAp//VgKg/1YCtf/eArb/3gK3/94CuP/eArn/3gK6/94Cu//eArz/6wK9/+sCvv/rAr//6wLA/+sCxv/rAsf/6wLI/+sCyf/rAsr/6wLL/+oCzP/qAs3/6gLO/+oCz//oAtD/6ALR/1YC0v/eAtP/VgLU/94C1f9WAtb/3gLY/+sC2v/rAtz/6wLe/+sC4P/rAuL/6wLk/+sC5v/rAuj/6wLq/+sC7P/rAu7/6wLw/+sC8v/rAwD++AMU/+sDFv/rAxj/6wMpABQDKwAUAy0AFAMw/+oDMv/qAzT/6gM2/+oDOP/qAzr/6gM+/+gDTf/A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AiQCJQIOAg8CEAIRAhICEwJVAicCKAIpAioFEwIrAi0CLgIvAjECMwKRA0wDTQNOA08DUANRA1IDUwNUA1UDVgNXA1gDWQNaA1sDXANdA14DXwNgA2EDYgNjA2QDZQNmA2cDnQNoA2kDagNrA2wDbQNuA28DcANxA3IDcwN0A3UDdgN3A3gDeQN6A3sDfAN9BRoDfwOAA4EDggODA4QDhQOGA4cDiAOJA4oDiwOMA40DjgOPA5AFHQORA5IDlAOTA5UDlgOXA5gDmQOaA5sDnAOeA58DoAUbBRwE5gTnBOgE6QTzBPYE9AT1BPoE+wT8BOoE6wTsBQUFCAUJBQwFDgUPAhsFEQT9BP4E/wUABQEFAgUDBQQFHgUfBSAFIQUSBRQFFQIyBRcCNAUYBRYCMAImAiwFJgUnAAIHAAD6AgECjAHrAeoB6QHoAecB5gHlAeQB4wHiAk0CTAJLAkoCQgIAAf8B/gH9AfwB+wH6AfkB+AH3AfYB9QH0AfMB8gHxAfAB7wHuAe0B7AICAgMCjgKQAo8CkQKNApICbAIEAgUCBgIHAggCCQIKAgsCDAINAg4CDwIQAhECEgITAhQCFQIWAhcCGAIaAhsFGQIcAh0CHgIfAiACIQIiAiMCJAIlAlUCJwIoAikCKgUTAisCLQIuAi8CMAIxAjICMwI1AjYCOAI3A0oDSwNMA00DTgNPA1ADUQNSA1MDVANVA1YDVwNYA1kDWgNbA1wDXQNeA18DYANhA2IDYwNkA2UDZgNnA2gDaQNqA2sDbANtA24DbwNwA3EDcgNzA3QDdQN2A3cDeAN5A3oDewN8A30DfgUaA38DgAOBA4IDgwOEA4UDhgOHA4gDiQOKA4sDjAONA44DjwOQBR0DkQOSA5QDkwOVA5YDlwOYA5kDmgObA5wDnQOeA58DoAUbBRwE5gTnBOgE6QTqBOsE7ATtBO4E7wTwBPEE8gTzBPQE9QT2BPcE+AT5BPoE+wT8BP0E/gT/BQAFAQUCAhkFAwUEBQUFBgUHBQgFCQUKBQsFDAUNBQ4FDwUQBREFHgUfBSAFIQUSBRQFFQUXAjQFGAUWAiYCLAUmBScAAQABAXsAAQABAEsAAQABALsAAQABADYAAQABABMAAQACAyMDJAACBuQG2AACBuYG2AABBu4AAQbwAAEG8gACAAEAFAAdAAAAAQACAC8ATwABAAMASQBLAoQAAgAAAAEG3gABAAYC1QLWAucC6ANqA3MAAQAGAE0ATgL8A+kD6wRkAAIAAwGUAZQAAAHfAeEAAQI5Aj8ABAACAAIAqACsAAEBJAEnAAEAAQAMACcAKAArADMANQBGAEcASABLAFMAVABVAAIAAgAUAB0AAAJvAngACgACAAYATQBNAAYATgBOAAQC/AL8AAUD6QPpAAMD6wPrAAIEZARkAAEAAgAEABQAHQAAAoACgAAKAosCiwALBKgErwAMAAIABgAaABoAAAAcABwAAQJkAmkAAgJtAm0ACAJvAngACQJ/An8AEwABABQAGgAcAmQCZQJmAmcCaAJpAm0CfwKAAosEqASpBKoEqwSsBK0ErgSvAAEF3gABBeAAAQXiAAEF5AABBeYAAQXoAAEF6gABBewAAQXuAAEF8AABBfIAAQX0AAEF9gABBfgAAQX6AAIF/AYCAAIGAgYIAAIGCAYOAAIGDgYUAAIGFAYaAAIGGgYgAAIGIAYmAAIGJgYsAAIGLAYyAAIGMgY4AAIGOAY+AAMGPgZEBkoAAwZIBk4GVAADBlIGWAZeAAMGXAZiBmgAAwZmBmwGcgADBnAGdgZ8AAMGegaABoYAAwaEBooGkAAEBo4GlAaaBqAABAacBqIGqAauAAUGqgawBrYGvAbCAAUGvAbCBsgGzgbUAAUGzgbUBtoG4AbmAAUG4AbmBuwG8gb4AAUG8gb4Bv4HBAcKAAUHBAcKBxAHFgccAAUHFgccByIHKAcuAAUHKAcuBzQHOgdAAAUHOgdAB0YHTAdSAAYHTAdSB1gHXgdkB2oABgdiB2gHbgd0B3oHgAAGB3gHfgeEB4oHkAeWAAYHjgeUB5oHoAemB6wABgekB6oHsAe2B7wHwgAGB7oHwAfGB8wH0gfYAAYH0AfWB9wH4gfoB+4ABwguB+YH7AfyB/gH/ggEAAcIJgf6CAAIBggMCBIIGAABAOsACgBFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AhQCGAIcAiQCKAIsAjQCQAJIAlAC7ALwAvQC+AL8AwADBAMIAwwDEAMUAxgDHAMgAyQDKAMsAzADNAM4A6gDrAOwA7QDuAO8A8ADxAPIA8wD0APUA9gD3APgA+QD6APsA/AD9AP4A/wEAAQEBAgEDAQQBBQEGAQcBMAE0ATYBOAE6ATwBQgFEAUYBSgFNAVoClwKZArUCtgK3ArgCuQK6ArsCvAK9Ar4CvwLAAsECwgLDAsQCxQLGAscCyALJAsoCywLMAs0CzgLPAtAC0gLUAtYC2ALaAtwC3gLgAuIC5ALmAugC6gLsAu4C8ALyAvQC9gL4AvoC/AL/AwEDAwMFAwcDCQMLAw0DDwMRAxQDFgMYAxoDHAMeAyADIgMkAyYDKAMqAywDLgMwAzIDNAM2AzgDOgM8Az4DQQNDA0UDRwNJA7kDugO7A7wDvgO/A8ADwQPCA8MDxAPFA8YDxwPeA98D4APhA+ID4wPkA+UD5gPnA+gD6QPqA+sD7APtA+8D8QPzA/UECgQMBA4EHAQjBCkELwSZBJoEngSiBSMFJQABAPoACAAKABQAFQAWABcAGAAZABoAGwAcAB0AJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AGUAZwCBAIMAhACMAI8AkQCTALEAsgCzALQAtQC2ALcAuAC5ALoA0gDTANQA1QDWANcA2ADZANoA2wDcAN0A3gDfAOAA4QDiAOMA5ADlAOYA5wDoAOkBLwEzATUBNwE5ATsBQQFDAUUBSQFLAUwBWAFZAbEBtwG8Ab8ClQKWApgCmgKbApwCnQKeAp8CoAKhAqICowKkAqUCpgKnAqgCqQKqAqsCrAKtAq4CrwKwArECsgKzArQC0QLTAtUC1wLZAtsC3QLfAuEC4wLlAucC6QLrAu0C7wLxAvMC9QL3AvkC+wL9Av4DAAMCAwQDBgMIAwoDDAMOAxADEwMVAxcDGQMbAx0DHwMhAyMDJQMnAykDKwMtAy8DMQMzAzUDNwM5AzsDPQM/A0ADQgNEA0YDSAOhA6IDowOkA6UDpgOnA6kDqgOrA6wDrQOuA68DsAOxA7IDswO0A7UDtgO3A7gDyAPJA8oDywPMA80DzgPPA9AD0QPSA9MD1APVA9YD1wPYA9kD2gPbA9wD3QPuA/AD8gP0BAkECwQNBCIEKAQuBJgEnQShBSIFJAHWAAIATQHXAAIAUAHYAAMASgBNAdkAAwBKAFAAAQABAEoB1QACAEoB2wACAFgB2gACAFgAAQADAEoAVwCVAAAAAQABAAEAAQAAAAMEwQACAK0C1wACAKkExwACAK0E1AACAKkEwgACAK0C2AACAKkEsQACAKkEyAACAK0EZAACAK0E1QACAKkDRgACAKkDSAACAKkDRwACAKkDSQACAKkEwAACAKkExQACAdQEwwACAK0EsAACAKkC8QACAdQD+wACAKkEzwACAK0DKQACAdQE2gACAK0E3wACAK0E3QACAKoDQAACAKkE4wACAK0ExgACAdQExAACAK0D/AACAKkE0AACAK0DKgACAdQE2wACAK0E4AACAK0E3gACAKoDQQACAKkE5AACAK0EyQACAKkDAgACAdQEywACAK0DBAACAKkDBgACAdQEzQACAK0DHwACAKkDJQACAdQE2AACAK0D8AACAKkE4QACAK0D7gACAKgEygACAKkDAwACAdQEzAACAK0DBQACAKkDBwACAdQEzgACAK0DIAACAKkDJgACAdQE2QACAK0D8QACAKkE4gACAK0D7wACAKgDGQACAKkDGwACAdQE1gACAK0EvAACAKwDGgACAKkDHAACAdQE1wACAK0EvQACAKwDDAACAKkDDgACAdQE0QACAK0EsgACAKgCqgACAKoCtAACAKkEiwACAK0D9AACAKgEjQACAKsEjwACAKoDDQACAKkDDwACAdQE0gACAK0EswACAKgCxQACAKoCzwACAKkEjAACAK0D9QACAKgEjgACAKsEkAACAKoCwgACAKkCwQACAKgEYgACAKsC9gACAKoEuQACAKwEcwACAKkEewACAK0EdQACAKgEdwACAKsEeQACAKoEdAACAKkEfAACAK0EdgACAKgEeAACAKsEegACAKoEgQACAKkEiQACAK0EgwACAKgEhQACAKsEhwACAKoEggACAKkEigACAK0EhAACAKgEhgACAKsEiAACAKoCmwACAKkEOQACAK0CmgACAKgEOwACAKsCnQACAKoEtAACAKwCowACAKkEUQACAK0CogACAKgEUwACAKsEVQACAKoEtgACAKwCpwACAKkEYwACAK0CpgACAKgEYQACAKsC9QACAKoEuAACAKwCtgACAKkEOgACAK0CtQACAKgEPAACAKsCuAACAKoEtQACAKwCvgACAKkEUgACAK0CvQACAKgEVAACAKsEVgACAKoEtwACAKwCxwACAKkEZgACAK0CxgACAKgEaAACAKsCyQACAKoEuwACAKwCzAACAKkEfgACAK0CywACAKgEgAACAKsDMAACAKoEvwACAKwCrAACAKkEZQACAK0CqwACAKgEZwACAKsCrgACAKoEugACAKwCsQACAKkEfQACAK0CsAACAKgEfwACAKsDLwACAKoEvgACAKwE0wADAKoAqQTcAAMAqgCpAAIAEQAlACkAAAArAC0ABQAvADQACAA2ADsADgA9AD4AFABFAEkAFgBLAE0AGwBPAFQAHgBWAFsAJABdAF4AKgCBAIEALACDAIMALQCGAIYALgCJAIkALwCNAI0AMACYAJsAMQDQANAANQAA",
};
/*! Buttons for DataTables 3.1.0
 * © SpryMedia Ltd - datatables.net/license
 */
!function(e){var o,i;"function"==typeof define&&define.amd?define(["jquery","datatables.net"],function(t){return e(t,window,document)}):"object"==typeof exports?(o=require("jquery"),i=function(t,n){n.fn.dataTable||require("datatables.net")(t,n)},"undefined"==typeof window?module.exports=function(t,n){return t=t||window,n=n||o(t),i(t,n),e(n,t,t.document)}:(i(window,o),module.exports=e(o,window,window.document))):e(jQuery,window,document)}(function(x,g,m){"use strict";var e=x.fn.dataTable,o=0,C=0,w=e.ext.buttons,i=null;function v(t,n,e){x.fn.animate?t.stop().fadeIn(n,e):(t.css("display","block"),e&&e.call(t))}function y(t,n,e){x.fn.animate?t.stop().fadeOut(n,e):(t.css("display","none"),e&&e.call(t))}function _(n,t){if(!e.versionCheck("2"))throw"Warning: Buttons requires DataTables 2 or newer";if(!(this instanceof _))return function(t){return new _(t,n).container()};!0===(t=void 0===t?{}:t)&&(t={}),Array.isArray(t)&&(t={buttons:t}),this.c=x.extend(!0,{},_.defaults,t),t.buttons&&(this.c.buttons=t.buttons),this.s={dt:new e.Api(n),buttons:[],listenKeys:"",namespace:"dtb"+o++},this.dom={container:x("<"+this.c.dom.container.tag+"/>").addClass(this.c.dom.container.className)},this._constructor()}x.extend(_.prototype,{action:function(t,n){t=this._nodeToButton(t);return void 0===n?t.conf.action:(t.conf.action=n,this)},active:function(t,n){var t=this._nodeToButton(t),e=this.c.dom.button.active,o=x(t.node);return t.inCollection&&this.c.dom.collection.button&&void 0!==this.c.dom.collection.button.active&&(e=this.c.dom.collection.button.active),void 0===n?o.hasClass(e):(o.toggleClass(e,void 0===n||n),this)},add:function(t,n,e){var o=this.s.buttons;if("string"==typeof n){for(var i=n.split("-"),s=this.s,r=0,a=i.length-1;r<a;r++)s=s.buttons[+i[r]];o=s.buttons,n=+i[i.length-1]}return this._expandButton(o,t,void 0!==t?t.split:void 0,(void 0===t||void 0===t.split||0===t.split.length)&&void 0!==s,!1,n),void 0!==e&&!0!==e||this._draw(),this},collectionRebuild:function(t,n){var e=this._nodeToButton(t);if(void 0!==n){for(var o=e.buttons.length-1;0<=o;o--)this.remove(e.buttons[o].node);for(e.conf.prefixButtons&&n.unshift.apply(n,e.conf.prefixButtons),e.conf.postfixButtons&&n.push.apply(n,e.conf.postfixButtons),o=0;o<n.length;o++){var i=n[o];this._expandButton(e.buttons,i,void 0!==i&&void 0!==i.config&&void 0!==i.config.split,!0,void 0!==i.parentConf&&void 0!==i.parentConf.split,null,i.parentConf)}}this._draw(e.collection,e.buttons)},container:function(){return this.dom.container},disable:function(t){t=this._nodeToButton(t);return x(t.node).addClass(this.c.dom.button.disabled).prop("disabled",!0),this},destroy:function(){x("body").off("keyup."+this.s.namespace);for(var t=this.s.buttons.slice(),n=0,e=t.length;n<e;n++)this.remove(t[n].node);this.dom.container.remove();var o=this.s.dt.settings()[0];for(n=0,e=o.length;n<e;n++)if(o.inst===this){o.splice(n,1);break}return this},enable:function(t,n){return!1===n?this.disable(t):(n=this._nodeToButton(t),x(n.node).removeClass(this.c.dom.button.disabled).prop("disabled",!1),this)},index:function(t,n,e){n||(n="",e=this.s.buttons);for(var o=0,i=e.length;o<i;o++){var s=e[o].buttons;if(e[o].node===t)return n+o;if(s&&s.length){s=this.index(t,o+"-",s);if(null!==s)return s}}return null},name:function(){return this.c.name},node:function(t){return t?(t=this._nodeToButton(t),x(t.node)):this.dom.container},processing:function(t,n){var e=this.s.dt,o=this._nodeToButton(t);return void 0===n?x(o.node).hasClass("processing"):(x(o.node).toggleClass("processing",n),x(e.table().node()).triggerHandler("buttons-processing.dt",[n,e.button(t),e,x(t),o.conf]),this)},remove:function(t){var n=this._nodeToButton(t),e=this._nodeToHost(t),o=this.s.dt;if(n.buttons.length)for(var i=n.buttons.length-1;0<=i;i--)this.remove(n.buttons[i].node);n.conf.destroying=!0,n.conf.destroy&&n.conf.destroy.call(o.button(t),o,x(t),n.conf),this._removeKey(n.conf),x(n.node).remove();o=x.inArray(n,e);return e.splice(o,1),this},text:function(t,n){function e(t){return"function"==typeof t?t(i,s,o.conf):t}var o=this._nodeToButton(t),t=o.textNode,i=this.s.dt,s=x(o.node);return void 0===n?e(o.conf.text):(o.conf.text=n,t.html(e(n)),this)},_constructor:function(){var e=this,t=this.s.dt,o=t.settings()[0],n=this.c.buttons;o._buttons||(o._buttons=[]),o._buttons.push({inst:this,name:this.c.name});for(var i=0,s=n.length;i<s;i++)this.add(n[i]);t.on("destroy",function(t,n){n===o&&e.destroy()}),x("body").on("keyup."+this.s.namespace,function(t){var n;m.activeElement&&m.activeElement!==m.body||(n=String.fromCharCode(t.keyCode).toLowerCase(),-1!==e.s.listenKeys.toLowerCase().indexOf(n)&&e._keypress(n,t))})},_addKey:function(t){t.key&&(this.s.listenKeys+=(x.isPlainObject(t.key)?t.key:t).key)},_draw:function(t,n){t||(t=this.dom.container,n=this.s.buttons),t.children().detach();for(var e=0,o=n.length;e<o;e++)t.append(n[e].inserter),t.append(" "),n[e].buttons&&n[e].buttons.length&&this._draw(n[e].collection,n[e].buttons)},_expandButton:function(t,n,e,o,i,s,r){for(var a,l=this.s.dt,c=this.c.dom.collection,u=Array.isArray(n)?n:[n],d=0,f=(u=void 0===n?Array.isArray(e)?e:[e]:u).length;d<f;d++){var p=this._resolveExtends(u[d]);if(p)if(a=!(!p.config||!p.config.split),Array.isArray(p))this._expandButton(t,p,void 0!==h&&void 0!==h.conf?h.conf.split:void 0,o,void 0!==r&&void 0!==r.split,s,r);else{var h=this._buildButton(p,o,void 0!==p.split||void 0!==p.config&&void 0!==p.config.split,i);if(h){if(null!=s?(t.splice(s,0,h),s++):t.push(h),h.conf.buttons&&(h.collection=x("<"+c.container.content.tag+"/>"),h.conf._collection=h.collection,x(h.node).append(c.action.dropHtml),this._expandButton(h.buttons,h.conf.buttons,h.conf.split,!a,a,s,h.conf)),h.conf.split){h.collection=x("<"+c.container.tag+"/>"),h.conf._collection=h.collection;for(var b=0;b<h.conf.split.length;b++){var g=h.conf.split[b];"object"==typeof g&&(g.parent=r,void 0===g.collectionLayout&&(g.collectionLayout=h.conf.collectionLayout),void 0===g.dropup&&(g.dropup=h.conf.dropup),void 0===g.fade)&&(g.fade=h.conf.fade)}this._expandButton(h.buttons,h.conf.buttons,h.conf.split,!a,a,s,h.conf)}h.conf.parent=r,p.init&&p.init.call(l.button(h.node),l,x(h.node),p)}}}},_buildButton:function(n,t,e,o){function i(t){return"function"==typeof t?t(f,c,n):t}var s,r,a,l,c,u=this,d=this.c.dom,f=this.s.dt,p=x.extend(!0,{},d.button);if(t&&e&&d.collection.split?x.extend(!0,p,d.collection.split.action):o||t?x.extend(!0,p,d.collection.button):e&&x.extend(!0,p,d.split.button),n.spacer)return d=x("<"+p.spacer.tag+"/>").addClass("dt-button-spacer "+n.style+" "+p.spacer.className).html(i(n.text)),{conf:n,node:d,inserter:d,buttons:[],inCollection:t,isSplit:e,collection:null,textNode:d};if(n.available&&!n.available(f,n)&&!n.html)return!1;n.html?c=x(n.html):(r=function(t,n,e,o,i){o.action.call(n.button(e),t,n,e,o,i),x(n.table().node()).triggerHandler("buttons-action.dt",[n.button(e),n,e,o])},a=function(t,n,e,o){o.async?(u.processing(e[0],!0),setTimeout(function(){r(t,n,e,o,function(){u.processing(e[0],!1)})},o.async)):r(t,n,e,o,function(){})},d=n.tag||p.tag,l=void 0===n.clickBlurs||n.clickBlurs,c=x("<"+d+"/>").addClass(p.className).attr("tabindex",this.s.dt.settings()[0].iTabIndex).attr("aria-controls",this.s.dt.table().node().id).on("click.dtb",function(t){t.preventDefault(),!c.hasClass(p.disabled)&&n.action&&a(t,f,c,n),l&&c.trigger("blur")}).on("keypress.dtb",function(t){13===t.keyCode&&(t.preventDefault(),!c.hasClass(p.disabled))&&n.action&&a(t,f,c,n)}),"a"===d.toLowerCase()&&c.attr("href","#"),"button"===d.toLowerCase()&&c.attr("type","button"),s=p.liner.tag?(d=x("<"+p.liner.tag+"/>").html(i(n.text)).addClass(p.liner.className),"a"===p.liner.tag.toLowerCase()&&d.attr("href","#"),c.append(d),d):(c.html(i(n.text)),c),!1===n.enabled&&c.addClass(p.disabled),n.className&&c.addClass(n.className),n.titleAttr&&c.attr("title",i(n.titleAttr)),n.attr&&c.attr(n.attr),n.namespace||(n.namespace=".dt-button-"+C++),void 0!==n.config&&n.config.split&&(n.split=n.config.split));var h,b,g,m,v,y,d=this.c.dom.buttonContainer,d=d&&d.tag?x("<"+d.tag+"/>").addClass(d.className).append(c):c;return this._addKey(n),this.c.buttonCreated&&(d=this.c.buttonCreated(n,d)),e&&(b=(h=t?x.extend(!0,this.c.dom.split,this.c.dom.collection.split):this.c.dom.split).wrapper,g=x("<"+b.tag+"/>").addClass(b.className).append(c),m=x.extend(n,{align:h.dropdown.align,attr:{"aria-haspopup":"dialog","aria-expanded":!1},className:h.dropdown.className,closeButton:!1,splitAlignClass:h.dropdown.splitAlignClass,text:h.dropdown.text}),this._addKey(m),v=function(t,n,e,o){w.split.action.call(n.button(g),t,n,e,o),x(n.table().node()).triggerHandler("buttons-action.dt",[n.button(e),n,e,o]),e.attr("aria-expanded",!0)},y=x('<button class="'+h.dropdown.className+' dt-button"></button>').html(h.dropdown.dropHtml).on("click.dtb",function(t){t.preventDefault(),t.stopPropagation(),y.hasClass(p.disabled)||v(t,f,y,m),l&&y.trigger("blur")}).on("keypress.dtb",function(t){13===t.keyCode&&(t.preventDefault(),y.hasClass(p.disabled)||v(t,f,y,m))}),0===n.split.length&&y.addClass("dtb-hide-drop"),g.append(y).attr(m.attr)),{conf:n,node:(e?g:c).get(0),inserter:e?g:d,buttons:[],inCollection:t,isSplit:e,inSplit:o,collection:null,textNode:s}},_nodeToButton:function(t,n){for(var e=0,o=(n=n||this.s.buttons).length;e<o;e++){if(n[e].node===t)return n[e];if(n[e].buttons.length){var i=this._nodeToButton(t,n[e].buttons);if(i)return i}}},_nodeToHost:function(t,n){for(var e=0,o=(n=n||this.s.buttons).length;e<o;e++){if(n[e].node===t)return n;if(n[e].buttons.length){var i=this._nodeToHost(t,n[e].buttons);if(i)return i}}},_keypress:function(s,r){var a;r._buttonsHandled||(a=function(t){for(var n,e,o=0,i=t.length;o<i;o++)n=t[o].conf,e=t[o].node,!n.key||n.key!==s&&(!x.isPlainObject(n.key)||n.key.key!==s||n.key.shiftKey&&!r.shiftKey||n.key.altKey&&!r.altKey||n.key.ctrlKey&&!r.ctrlKey||n.key.metaKey&&!r.metaKey)||(r._buttonsHandled=!0,x(e).click()),t[o].buttons.length&&a(t[o].buttons)})(this.s.buttons)},_removeKey:function(t){var n;t.key&&(t=(x.isPlainObject(t.key)?t.key:t).key,n=this.s.listenKeys.split(""),t=x.inArray(t,n),n.splice(t,1),this.s.listenKeys=n.join(""))},_resolveExtends:function(e){function t(t){for(var n=0;!x.isPlainObject(t)&&!Array.isArray(t);){if(void 0===t)return;if("function"==typeof t){if(!(t=t.call(i,s,e)))return!1}else if("string"==typeof t){if(!w[t])return{html:t};t=w[t]}if(30<++n)throw"Buttons: Too many iterations"}return Array.isArray(t)?t:x.extend({},t)}var n,o,i=this,s=this.s.dt;for(e=t(e);e&&e.extend;){if(!w[e.extend])throw"Cannot extend unknown button type: "+e.extend;var r=t(w[e.extend]);if(Array.isArray(r))return r;if(!r)return!1;var a=r.className;void 0!==e.config&&void 0!==r.config&&(e.config=x.extend({},r.config,e.config)),e=x.extend({},r,e),a&&e.className!==a&&(e.className=a+" "+e.className),e.extend=r.extend}var l=e.postfixButtons;if(l)for(e.buttons||(e.buttons=[]),n=0,o=l.length;n<o;n++)e.buttons.push(l[n]);var c=e.prefixButtons;if(c)for(e.buttons||(e.buttons=[]),n=0,o=c.length;n<o;n++)e.buttons.splice(n,0,c[n]);return e},_popover:function(o,t,n){function i(){f=!0,y(x(h),p.fade,function(){x(this).detach()}),x(u.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()).attr("aria-expanded","false"),x("div.dt-button-background").off("click.dtb-collection"),_.background(!1,p.backgroundClassName,p.fade,b),x(g).off("resize.resize.dtb-collection"),x("body").off(".dtb-collection"),u.off("buttons-action.b-internal"),u.off("destroy")}var e,s,r,a,l,c,u=t,d=this.c,f=!1,p=x.extend({align:"button-left",autoClose:!1,background:!0,backgroundClassName:"dt-button-background",closeButton:!0,containerClassName:d.dom.collection.container.className,contentClassName:d.dom.collection.container.content.className,collectionLayout:"",collectionTitle:"",dropup:!1,fade:400,popoverTitle:"",rightAlignClassName:"dt-button-right",tag:d.dom.collection.container.tag},n),h=p.tag+"."+p.containerClassName.replace(/ /g,"."),b=t.node();!1===o?i():((d=x(u.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes())).length&&(b.closest(h).length&&(b=d.eq(0)),i()),n=x(".dt-button",o).length,d="",3===n?d="dtb-b3":2===n?d="dtb-b2":1===n&&(d="dtb-b1"),e=x("<"+p.tag+"/>").addClass(p.containerClassName).addClass(p.collectionLayout).addClass(p.splitAlignClass).addClass(d).css("display","none").attr({"aria-modal":!0,role:"dialog"}),o=x(o).addClass(p.contentClassName).attr("role","menu").appendTo(e),b.attr("aria-expanded","true"),b.parents("body")[0]!==m.body&&(b=m.body.lastChild),p.popoverTitle?e.prepend('<div class="dt-button-collection-title">'+p.popoverTitle+"</div>"):p.collectionTitle&&e.prepend('<div class="dt-button-collection-title">'+p.collectionTitle+"</div>"),p.closeButton&&e.prepend('<div class="dtb-popover-close">&times;</div>').addClass("dtb-collection-closeable"),v(e.insertAfter(b),p.fade),n=x(t.table().container()),d=e.css("position"),"container"!==p.span&&"dt-container"!==p.align||(b=b.parent(),e.css("width",n.width())),"absolute"===d?(t=x(b[0].offsetParent),n=b.position(),d=b.offset(),a=t.offset(),s=t.position(),r=g.getComputedStyle(t[0]),a.height=t.outerHeight(),a.width=t.width()+parseFloat(r.paddingLeft),a.right=a.left+a.width,a.bottom=a.top+a.height,t=n.top+b.outerHeight(),a=n.left,e.css({top:t,left:a}),r=g.getComputedStyle(e[0]),(l=e.offset()).height=e.outerHeight(),l.width=e.outerWidth(),l.right=l.left+l.width,l.bottom=l.top+l.height,l.marginTop=parseFloat(r.marginTop),l.marginBottom=parseFloat(r.marginBottom),p.dropup&&(t=n.top-l.height-l.marginTop-l.marginBottom),"button-right"!==p.align&&!e.hasClass(p.rightAlignClassName)||(a=n.left-l.width+b.outerWidth()),"dt-container"!==p.align&&"container"!==p.align||a<n.left&&(a=-n.left),s.left+a+l.width>x(g).width()&&(a=x(g).width()-l.width-s.left),d.left+a<0&&(a=-d.left),s.top+t+l.height>x(g).height()+x(g).scrollTop()&&(t=n.top-l.height-l.marginTop-l.marginBottom),s.top+t<x(g).scrollTop()&&(t=n.top+b.outerHeight()),e.css({top:t,left:a})):((c=function(){var t=x(g).height()/2,n=e.height()/2;e.css("marginTop",-1*(n=t<n?t:n))})(),x(g).on("resize.dtb-collection",function(){c()})),p.background&&_.background(!0,p.backgroundClassName,p.fade,p.backgroundHost||b),x("div.dt-button-background").on("click.dtb-collection",function(){}),p.autoClose&&setTimeout(function(){u.on("buttons-action.b-internal",function(t,n,e,o){o[0]!==b[0]&&i()})},0),x(e).trigger("buttons-popover.dt"),u.on("destroy",i),setTimeout(function(){f=!1,x("body").on("click.dtb-collection",function(t){var n,e;!f&&(n=x.fn.addBack?"addBack":"andSelf",e=x(t.target).parent()[0],!x(t.target).parents()[n]().filter(o).length&&!x(e).hasClass("dt-buttons")||x(t.target).hasClass("dt-button-background"))&&i()}).on("keyup.dtb-collection",function(t){27===t.keyCode&&i()}).on("keydown.dtb-collection",function(t){var n=x("a, button",o),e=m.activeElement;9===t.keyCode&&(-1===n.index(e)?(n.first().focus(),t.preventDefault()):t.shiftKey?e===n[0]&&(n.last().focus(),t.preventDefault()):e===n.last()[0]&&(n.first().focus(),t.preventDefault()))})},0))}}),_.background=function(t,n,e,o){void 0===e&&(e=400),o=o||m.body,t?v(x("<div/>").addClass(n).css("display","none").insertAfter(o),e):y(x("div."+n),e,function(){x(this).removeClass(n).remove()})},_.instanceSelector=function(t,s){var r,a,l;return null==t?x.map(s,function(t){return t.inst}):(r=[],a=x.map(s,function(t){return t.name}),(l=function(t){var n;if(Array.isArray(t))for(var e=0,o=t.length;e<o;e++)l(t[e]);else if("string"==typeof t)-1!==t.indexOf(",")?l(t.split(",")):-1!==(n=x.inArray(t.trim(),a))&&r.push(s[n].inst);else if("number"==typeof t)r.push(s[t].inst);else if("object"==typeof t&&t.nodeName)for(var i=0;i<s.length;i++)s[i].inst.dom.container[0]===t&&r.push(s[i].inst);else"object"==typeof t&&r.push(t)})(t),r)},_.buttonSelector=function(t,n){for(var c=[],u=function(t,n,e){for(var o,i,s=0,r=n.length;s<r;s++)(o=n[s])&&(t.push({node:o.node,name:o.conf.name,idx:i=void 0!==e?e+s:s+""}),o.buttons)&&u(t,o.buttons,i+"-")},d=function(t,n){var e=[],o=(u(e,n.s.buttons),x.map(e,function(t){return t.node}));if(Array.isArray(t)||t instanceof x)for(s=0,r=t.length;s<r;s++)d(t[s],n);else if(null==t||"*"===t)for(s=0,r=e.length;s<r;s++)c.push({inst:n,node:e[s].node});else if("number"==typeof t)n.s.buttons[t]&&c.push({inst:n,node:n.s.buttons[t].node});else if("string"==typeof t)if(-1!==t.indexOf(","))for(var i=t.split(","),s=0,r=i.length;s<r;s++)d(i[s].trim(),n);else if(t.match(/^\d+(\-\d+)*$/)){var a=x.map(e,function(t){return t.idx});c.push({inst:n,node:e[x.inArray(t,a)].node})}else if(-1!==t.indexOf(":name")){var l=t.replace(":name","");for(s=0,r=e.length;s<r;s++)e[s].name===l&&c.push({inst:n,node:e[s].node})}else x(o).filter(t).each(function(){c.push({inst:n,node:this})});else"object"==typeof t&&t.nodeName&&-1!==(a=x.inArray(t,o))&&c.push({inst:n,node:o[a]})},e=0,o=t.length;e<o;e++){var i=t[e];d(n,i)}return c},_.stripData=function(t,n){return t="string"==typeof t&&(t=_.stripHtmlScript(t),t=_.stripHtmlComments(t),n&&!n.stripHtml||(t=e.util.stripHtml(t)),n&&!n.trim||(t=t.trim()),n&&!n.stripNewlines||(t=t.replace(/\n/g," ")),!n||n.decodeEntities)?i?i(t):(c.innerHTML=t,c.value):t},_.entityDecoder=function(t){i=t},_.stripHtmlComments=function(t){for(var n;(t=(n=t).replace(/(<!--.*?--!?>)|(<!--[\S\s]+?--!?>)|(<!--[\S\s]*?$)/g,""))!==n;);return t},_.stripHtmlScript=function(t){for(var n;(t=(n=t).replace(/<script\b[^<]*(?:(?!<\/script[^>]*>)<[^<]*)*<\/script[^>]*>/gi,""))!==n;);return t},_.defaults={buttons:["copy","excel","csv","pdf","print"],name:"main",tabIndex:0,dom:{container:{tag:"div",className:"dt-buttons"},collection:{action:{dropHtml:'<span class="dt-button-down-arrow">&#x25BC;</span>'},container:{className:"dt-button-collection",content:{className:"",tag:"div"},tag:"div"}},button:{tag:"button",className:"dt-button",active:"dt-button-active",disabled:"disabled",spacer:{className:"dt-button-spacer",tag:"span"},liner:{tag:"span",className:""}},split:{action:{className:"dt-button-split-drop-button dt-button",tag:"button"},dropdown:{align:"split-right",className:"dt-button-split-drop",dropHtml:'<span class="dt-button-down-arrow">&#x25BC;</span>',splitAlignClass:"dt-button-split-left",tag:"button"},wrapper:{className:"dt-button-split",tag:"div"}}}},x.extend(w,{collection:{text:function(t){return t.i18n("buttons.collection","Collection")},className:"buttons-collection",closeButton:!(_.version="3.1.0"),init:function(t,n){n.attr("aria-expanded",!1)},action:function(t,n,e,o){o._collection.parents("body").length?this.popover(!1,o):this.popover(o._collection,o),"keypress"===t.type&&x("a, button",o._collection).eq(0).focus()},attr:{"aria-haspopup":"dialog"}},split:{text:function(t){return t.i18n("buttons.split","Split")},className:"buttons-split",closeButton:!1,init:function(t,n){return n.attr("aria-expanded",!1)},action:function(t,n,e,o){this.popover(o._collection,o)},attr:{"aria-haspopup":"dialog"}},copy:function(){if(w.copyHtml5)return"copyHtml5"},csv:function(t,n){if(w.csvHtml5&&w.csvHtml5.available(t,n))return"csvHtml5"},excel:function(t,n){if(w.excelHtml5&&w.excelHtml5.available(t,n))return"excelHtml5"},pdf:function(t,n){if(w.pdfHtml5&&w.pdfHtml5.available(t,n))return"pdfHtml5"},pageLength:function(t){var n=t.settings()[0].aLengthMenu,e=[],o=[];if(Array.isArray(n[0]))e=n[0],o=n[1];else for(var i=0;i<n.length;i++){var s=n[i];x.isPlainObject(s)?(e.push(s.value),o.push(s.label)):(e.push(s),o.push(s))}return{extend:"collection",text:function(t){return t.i18n("buttons.pageLength",{"-1":"Show all rows",_:"Show %d rows"},t.page.len())},className:"buttons-page-length",autoClose:!0,buttons:x.map(e,function(s,t){return{text:o[t],className:"button-page-length",action:function(t,n){n.page.len(s).draw()},init:function(t,n,e){function o(){i.active(t.page.len()===s)}var i=this;t.on("length.dt"+e.namespace,o),o()},destroy:function(t,n,e){t.off("length.dt"+e.namespace)}}}),init:function(t,n,e){var o=this;t.on("length.dt"+e.namespace,function(){o.text(e.text)})},destroy:function(t,n,e){t.off("length.dt"+e.namespace)}}},spacer:{style:"empty",spacer:!0,text:function(t){return t.i18n("buttons.spacer","")}}}),e.Api.register("buttons()",function(n,e){void 0===e&&(e=n,n=void 0),this.selector.buttonGroup=n;var t=this.iterator(!0,"table",function(t){if(t._buttons)return _.buttonSelector(_.instanceSelector(n,t._buttons),e)},!0);return t._groupSelector=n,t}),e.Api.register("button()",function(t,n){t=this.buttons(t,n);return 1<t.length&&t.splice(1,t.length),t}),e.Api.registerPlural("buttons().active()","button().active()",function(n){return void 0===n?this.map(function(t){return t.inst.active(t.node)}):this.each(function(t){t.inst.active(t.node,n)})}),e.Api.registerPlural("buttons().action()","button().action()",function(n){return void 0===n?this.map(function(t){return t.inst.action(t.node)}):this.each(function(t){t.inst.action(t.node,n)})}),e.Api.registerPlural("buttons().collectionRebuild()","button().collectionRebuild()",function(e){return this.each(function(t){for(var n=0;n<e.length;n++)"object"==typeof e[n]&&(e[n].parentConf=t);t.inst.collectionRebuild(t.node,e)})}),e.Api.register(["buttons().enable()","button().enable()"],function(n){return this.each(function(t){t.inst.enable(t.node,n)})}),e.Api.register(["buttons().disable()","button().disable()"],function(){return this.each(function(t){t.inst.disable(t.node)})}),e.Api.register("button().index()",function(){var n=null;return this.each(function(t){t=t.inst.index(t.node);null!==t&&(n=t)}),n}),e.Api.registerPlural("buttons().nodes()","button().node()",function(){var n=x();return x(this.each(function(t){n=n.add(t.inst.node(t.node))})),n}),e.Api.registerPlural("buttons().processing()","button().processing()",function(n){return void 0===n?this.map(function(t){return t.inst.processing(t.node)}):this.each(function(t){t.inst.processing(t.node,n)})}),e.Api.registerPlural("buttons().text()","button().text()",function(n){return void 0===n?this.map(function(t){return t.inst.text(t.node)}):this.each(function(t){t.inst.text(t.node,n)})}),e.Api.registerPlural("buttons().trigger()","button().trigger()",function(){return this.each(function(t){t.inst.node(t.node).trigger("click")})}),e.Api.register("button().popover()",function(n,e){return this.map(function(t){return t.inst._popover(n,this.button(this[0].node),e)})}),e.Api.register("buttons().containers()",function(){var i=x(),s=this._groupSelector;return this.iterator(!0,"table",function(t){if(t._buttons)for(var n=_.instanceSelector(s,t._buttons),e=0,o=n.length;e<o;e++)i=i.add(n[e].container())}),i}),e.Api.register("buttons().container()",function(){return this.containers().eq(0)}),e.Api.register("button().add()",function(t,n,e){var o=this.context;return o.length&&(o=_.instanceSelector(this._groupSelector,o[0]._buttons)).length&&o[0].add(n,t,e),this.button(this._groupSelector,t)}),e.Api.register("buttons().destroy()",function(){return this.pluck("inst").unique().each(function(t){t.destroy()}),this}),e.Api.registerPlural("buttons().remove()","buttons().remove()",function(){return this.each(function(t){t.inst.remove(t.node)}),this}),e.Api.register("buttons.info()",function(t,n,e){var o=this;return!1===t?(this.off("destroy.btn-info"),y(x("#datatables_buttons_info"),400,function(){x(this).remove()}),clearTimeout(s),s=null):(s&&clearTimeout(s),x("#datatables_buttons_info").length&&x("#datatables_buttons_info").remove(),t=t?"<h2>"+t+"</h2>":"",v(x('<div id="datatables_buttons_info" class="dt-button-info"/>').html(t).append(x("<div/>")["string"==typeof n?"html":"append"](n)).css("display","none").appendTo("body")),void 0!==e&&0!==e&&(s=setTimeout(function(){o.buttons.info(!1)},e)),this.on("destroy.btn-info",function(){o.buttons.info(!1)})),this}),e.Api.register("buttons.exportData()",function(t){if(this.context.length)return u(new e.Api(this.context[0]),t)}),e.Api.register("buttons.exportInfo()",function(t){return{filename:n(t=t||{},this),title:a(t,this),messageTop:l(this,t,t.message||t.messageTop,"top"),messageBottom:l(this,t,t.messageBottom,"bottom")}});var s,n=function(t,n){var e;return null==(e="function"==typeof(e="*"===t.filename&&"*"!==t.title&&void 0!==t.title&&null!==t.title&&""!==t.title?t.title:t.filename)?e(t,n):e)?null:(e=(e=-1!==e.indexOf("*")?e.replace(/\*/g,x("head > title").text()).trim():e).replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g,""))+(r(t.extension,t,n)||"")},r=function(t,n,e){return null==t?null:"function"==typeof t?t(n,e):t},a=function(t,n){t=r(t.title,t,n);return null===t?null:-1!==t.indexOf("*")?t.replace(/\*/g,x("head > title").text()||"Exported data"):t},l=function(t,n,e,o){e=r(e,n,t);return null===e?null:(n=x("caption",t.table().container()).eq(0),"*"===e?n.css("caption-side")!==o?null:n.length?n.text():"":e)},c=x("<textarea/>")[0],u=function(i,t){for(var s=x.extend(!0,{},{rows:null,columns:"",modifier:{search:"applied",order:"applied"},orthogonal:"display",stripHtml:!0,stripNewlines:!0,decodeEntities:!0,trim:!0,format:{header:function(t){return _.stripData(t,s)},footer:function(t){return _.stripData(t,s)},body:function(t){return _.stripData(t,s)}},customizeData:null,customizeZip:null},t),t=i.columns(s.columns).indexes().map(function(t){var n=i.column(t);return s.format.header(n.title(),t,n.header())}).toArray(),n=i.table().footer()?i.columns(s.columns).indexes().map(function(t){var n,e=i.column(t).footer(),o="";return e&&(o=((n=x(".dt-column-title",e)).length?n:x(e)).html()),s.format.footer(o,t,e)}).toArray():null,e=x.extend({},s.modifier),o=(i.select&&"function"==typeof i.select.info&&void 0===e.selected&&i.rows(s.rows,x.extend({selected:!0},e)).any()&&x.extend(e,{selected:!0}),i.rows(s.rows,e).indexes().toArray()),o=i.cells(o,s.columns,{order:e.order}),r=o.render(s.orthogonal).toArray(),a=o.nodes().toArray(),l=o.indexes().toArray(),c=i.columns(s.columns).count(),u=[],d=0,f=0,p=0<c?r.length/c:0;f<p;f++){for(var h=[c],b=0;b<c;b++)h[b]=s.format.body(r[d],l[d].row,l[d].column,a[d]),d++;u[f]=h}e={header:t,headerStructure:A(s.format.header,i.table().header.structure(s.columns)),footer:n,footerStructure:A(s.format.footer,i.table().footer.structure(s.columns)),body:u};return s.customizeData&&s.customizeData(e),e};function A(t,n){for(var e=0;e<n.length;e++)for(var o=0;o<n[e].length;o++){var i=n[e][o];i&&(i.title=t(i.title,o,i.cell))}return n}function t(t,n){t=new e.Api(t),n=n||t.init().buttons||e.defaults.buttons;return new _(t,n).container()}return x.fn.dataTable.Buttons=_,x.fn.DataTable.Buttons=_,x(m).on("init.dt plugin-init.dt",function(t,n){"dt"===t.namespace&&(t=n.oInit.buttons||e.defaults.buttons)&&!n._buttons&&new _(n,t).container()}),e.ext.feature.push({fnInit:t,cFeature:"B"}),e.feature&&e.feature.register("buttons",t),e});
/*! Bootstrap integration for DataTables' Buttons
 * © SpryMedia Ltd - datatables.net/license
 */
!function(o){var e,a;"function"==typeof define&&define.amd?define(["jquery","datatables.net-bs5","datatables.net-buttons"],function(t){return o(t,window,document)}):"object"==typeof exports?(e=require("jquery"),a=function(t,n){n.fn.dataTable||require("datatables.net-bs5")(t,n),n.fn.dataTable.Buttons||require("datatables.net-buttons")(t,n)},"undefined"==typeof window?module.exports=function(t,n){return t=t||window,n=n||e(t),a(t,n),o(n,0,t.document)}:(a(window,e),module.exports=o(e,window,window.document))):o(jQuery,window,document)}(function(o,t,n){"use strict";var e=o.fn.dataTable;return o.extend(!0,e.Buttons.defaults,{dom:{container:{className:"dt-buttons btn-group flex-wrap"},button:{className:"btn btn-secondary",active:"active"},collection:{action:{dropHtml:""},container:{tag:"div",className:"dropdown-menu dt-button-collection"},closeButton:!1,button:{tag:"a",className:"dt-button dropdown-item",active:"dt-button-active",disabled:"disabled",spacer:{className:"dropdown-divider",tag:"hr"}}},split:{action:{tag:"a",className:"btn btn-secondary dt-button-split-drop-button",closeButton:!1},dropdown:{tag:"button",dropHtml:"",className:"btn btn-secondary dt-button-split-drop dropdown-toggle dropdown-toggle-split",closeButton:!1,align:"split-left",splitAlignClass:"dt-button-split-left"},wrapper:{tag:"div",className:"dt-button-split btn-group",closeButton:!1}}},buttonCreated:function(t,n){return t.buttons?o('<div class="btn-group"/>').append(n):n}}),e.ext.buttons.collection.className+=" dropdown-toggle",e.ext.buttons.collection.rightAlignClassName="dropdown-menu-right",e});
/*!
 * Column visibility buttons for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



$.extend(DataTable.ext.buttons, {
	// A collection of column visibility buttons
	colvis: function (dt, conf) {
		var node = null;
		var buttonConf = {
			extend: 'collection',
			init: function (dt, n) {
				node = n;
			},
			text: function (dt) {
				return dt.i18n('buttons.colvis', 'Column visibility');
			},
			className: 'buttons-colvis',
			closeButton: false,
			buttons: [
				{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}
			]
		};

		// Rebuild the collection with the new column structure if columns are reordered
		dt.on('column-reorder.dt' + conf.namespace, function () {
			dt.button(null, dt.button(null, node).node()).collectionRebuild([
				{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}
			]);
		});

		return buttonConf;
	},

	// Selected columns with individual buttons - toggle column visibility
	columnsToggle: function (dt, conf) {
		var columns = dt
			.columns(conf.columns)
			.indexes()
			.map(function (idx) {
				return {
					extend: 'columnToggle',
					columns: idx,
					columnText: conf.columnText
				};
			})
			.toArray();

		return columns;
	},

	// Single button to toggle column visibility
	columnToggle: function (dt, conf) {
		return {
			extend: 'columnVisibility',
			columns: conf.columns,
			columnText: conf.columnText
		};
	},

	// Selected columns with individual buttons - set column visibility
	columnsVisibility: function (dt, conf) {
		var columns = dt
			.columns(conf.columns)
			.indexes()
			.map(function (idx) {
				return {
					extend: 'columnVisibility',
					columns: idx,
					visibility: conf.visibility,
					columnText: conf.columnText
				};
			})
			.toArray();

		return columns;
	},

	// Single button to set column visibility
	columnVisibility: {
		columns: undefined, // column selector
		text: function (dt, button, conf) {
			return conf._columnText(dt, conf);
		},
		className: 'buttons-columnVisibility',
		action: function (e, dt, button, conf) {
			var col = dt.columns(conf.columns);
			var curr = col.visible();

			col.visible(
				conf.visibility !== undefined ? conf.visibility : !(curr.length ? curr[0] : false)
			);
		},
		init: function (dt, button, conf) {
			var that = this;
			button.attr('data-cv-idx', conf.columns);

			dt.on('column-visibility.dt' + conf.namespace, function (e, settings) {
				if (!settings.bDestroying && settings.nTable == dt.settings()[0].nTable) {
					that.active(dt.column(conf.columns).visible());
				}
			}).on('column-reorder.dt' + conf.namespace, function () {
				// Button has been removed from the DOM
				if (conf.destroying) {
					return;
				}

				if (dt.columns(conf.columns).count() !== 1) {
					return;
				}

				// This button controls the same column index but the text for the column has
				// changed
				that.text(conf._columnText(dt, conf));

				// Since its a different column, we need to check its visibility
				that.active(dt.column(conf.columns).visible());
			});

			this.active(dt.column(conf.columns).visible());
		},
		destroy: function (dt, button, conf) {
			dt.off('column-visibility.dt' + conf.namespace).off(
				'column-reorder.dt' + conf.namespace
			);
		},

		_columnText: function (dt, conf) {
			if (typeof conf.text === 'string') {
				return conf.text;
			}

			var title = dt.column(conf.columns).title();
			var idx = dt.column(conf.columns).index();

			title = title
				.replace(/\n/g, ' ') // remove new lines
				.replace(/<br\s*\/?>/gi, ' ') // replace line breaks with spaces
				.replace(/<select(.*?)<\/select\s*>/gi, ''); // remove select tags, including options text

			// Strip HTML comments
			title = DataTable.Buttons.stripHtmlComments(title);

			// Use whatever HTML stripper DataTables is configured for
			title = DataTable.util.stripHtml(title).trim();

			return conf.columnText ? conf.columnText(dt, idx, title) : title;
		}
	},

	colvisRestore: {
		className: 'buttons-colvisRestore',

		text: function (dt) {
			return dt.i18n('buttons.colvisRestore', 'Restore visibility');
		},

		init: function (dt, button, conf) {
			// Use a private parameter on the column. This gets moved around with the
			// column if ColReorder changes the order
			dt.columns().every(function () {
				var init = this.init();

				if (init.__visOriginal === undefined) {
					init.__visOriginal = this.visible();
				}
			});
		},

		action: function (e, dt, button, conf) {
			dt.columns().every(function (i) {
				var init = this.init();

				this.visible(init.__visOriginal);
			});
		}
	},

	colvisGroup: {
		className: 'buttons-colvisGroup',

		action: function (e, dt, button, conf) {
			dt.columns(conf.show).visible(true, false);
			dt.columns(conf.hide).visible(false, false);

			dt.columns.adjust();
		},

		show: [],

		hide: []
	}
});


return DataTable;
}));

/*!
 * HTML5 export buttons for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 *
 * FileSaver.js (1.3.3) - MIT license
 * Copyright © 2016 Eli Grey - http://eligrey.com
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



// Allow the constructor to pass in JSZip and PDFMake from external requires.
// Otherwise, use globally defined variables, if they are available.
var useJszip;
var usePdfmake;

function _jsZip() {
	return useJszip || window.JSZip;
}
function _pdfMake() {
	return usePdfmake || window.pdfMake;
}

DataTable.Buttons.pdfMake = function (_) {
	if (!_) {
		return _pdfMake();
	}
	usePdfmake = _;
};

DataTable.Buttons.jszip = function (_) {
	if (!_) {
		return _jsZip();
	}
	useJszip = _;
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FileSaver.js dependency
 */

/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

var _saveAs = (function (view) {
	'use strict';
	// IE <10 is explicitly unsupported
	if (
		typeof view === 'undefined' ||
		(typeof navigator !== 'undefined' &&
			/MSIE [1-9]\./.test(navigator.userAgent))
	) {
		return;
	}
	var doc = view.document,
		// only get URL when necessary in case Blob.js hasn't overridden it yet
		get_URL = function () {
			return view.URL || view.webkitURL || view;
		},
		save_link = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
		can_use_save_link = 'download' in save_link,
		click = function (node) {
			var event = new MouseEvent('click');
			node.dispatchEvent(event);
		},
		is_safari = /constructor/i.test(view.HTMLElement) || view.safari,
		is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent),
		throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function () {
				throw ex;
			}, 0);
		},
		force_saveable_type = 'application/octet-stream',
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		arbitrary_revoke_timeout = 1000 * 40, // in ms
		revoke = function (file) {
			var revoker = function () {
				if (typeof file === 'string') {
					// file is an object URL
					get_URL().revokeObjectURL(file);
				}
				else {
					// file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		},
		dispatch = function (filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver['on' + event_types[i]];
				if (typeof listener === 'function') {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		},
		auto_bom = function (blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (
				/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
					blob.type
				)
			) {
				return new Blob([String.fromCharCode(0xfeff), blob], {
					type: blob.type
				});
			}
			return blob;
		},
		FileSaver = function (blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var filesaver = this,
				type = blob.type,
				force = type === force_saveable_type,
				object_url,
				dispatch_all = function () {
					dispatch(
						filesaver,
						'writestart progress write writeend'.split(' ')
					);
				},
				// on any filesys errors revert to saving with object URLs
				fs_error = function () {
					if (
						(is_chrome_ios || (force && is_safari)) &&
						view.FileReader
					) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function () {
							var url = is_chrome_ios
								? reader.result
								: reader.result.replace(
										/^data:[^;]*;/,
										'data:attachment/file;'
								);
							var popup = view.open(url, '_blank');
							if (!popup) view.location.href = url;
							url = undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					}
					else {
						var opened = view.open(object_url, '_blank');
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				};
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function () {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		},
		FS_proto = FileSaver.prototype,
		saveAs = function (blob, name, no_auto_bom) {
			return new FileSaver(
				blob,
				name || blob.name || 'download',
				no_auto_bom
			);
		};
	// IE 10+ (native saveAs)
	if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
		return function (blob, name, no_auto_bom) {
			name = name || blob.name || 'download';

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function () {};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
		FS_proto.onwritestart =
		FS_proto.onprogress =
		FS_proto.onwrite =
		FS_proto.onabort =
		FS_proto.onerror =
		FS_proto.onwriteend =
			null;

	return saveAs;
})(
	(typeof self !== 'undefined' && self) ||
		(typeof window !== 'undefined' && window) ||
		this.content
);

// Expose file saver on the DataTables API. Can't attach to `DataTables.Buttons`
// since this file can be loaded before Button's core!
DataTable.fileSave = _saveAs;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Local (private) functions
 */

/**
 * Get the sheet name for Excel exports.
 *
 * @param {object}	config Button configuration
 */
var _sheetname = function (config) {
	var sheetName = 'Sheet1';

	if (config.sheetName) {
		sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
	}

	return sheetName;
};

/**
 * Get the newline character(s)
 *
 * @param {object}	config Button configuration
 * @return {string}				Newline character
 */
var _newLine = function (config) {
	return config.newline
		? config.newline
		: navigator.userAgent.match(/Windows/)
		? '\r\n'
		: '\n';
};

/**
 * Combine the data from the `buttons.exportData` method into a string that
 * will be used in the export file.
 *
 * @param	{DataTable.Api} dt		 DataTables API instance
 * @param	{object}				config Button configuration
 * @return {object}							 The data to export
 */
var _exportData = function (dt, config) {
	var newLine = _newLine(config);
	var data = dt.buttons.exportData(config.exportOptions);
	var boundary = config.fieldBoundary;
	var separator = config.fieldSeparator;
	var reBoundary = new RegExp(boundary, 'g');
	var escapeChar = config.escapeChar !== undefined ? config.escapeChar : '\\';
	var join = function (a) {
		var s = '';

		// If there is a field boundary, then we might need to escape it in
		// the source data
		for (var i = 0, ien = a.length; i < ien; i++) {
			if (i > 0) {
				s += separator;
			}

			s += boundary
				? boundary +
				('' + a[i]).replace(reBoundary, escapeChar + boundary) +
				boundary
				: a[i];
		}

		return s;
	};

	var header = '';
	var footer = '';
	var body = [];

	if (config.header) {
		header =
			data.headerStructure
				.map(function (row) {
					return join(
						row.map(function (cell) {
							return cell ? cell.title : '';
						})
					);
				})
				.join(newLine) + newLine;
	}

	if (config.footer && data.footer) {
		footer =
			data.footerStructure
				.map(function (row) {
					return join(
						row.map(function (cell) {
							return cell ? cell.title : '';
						})
					);
				})
				.join(newLine) + newLine;
	}

	for (var i = 0, ien = data.body.length; i < ien; i++) {
		body.push(join(data.body[i]));
	}

	return {
		str: header + body.join(newLine) + newLine + footer,
		rows: body.length
	};
};

/**
 * Older versions of Safari (prior to tech preview 18) don't support the
 * download option required.
 *
 * @return {Boolean} `true` if old Safari
 */
var _isDuffSafari = function () {
	var safari =
		navigator.userAgent.indexOf('Safari') !== -1 &&
		navigator.userAgent.indexOf('Chrome') === -1 &&
		navigator.userAgent.indexOf('Opera') === -1;

	if (!safari) {
		return false;
	}

	var version = navigator.userAgent.match(/AppleWebKit\/(\d+\.\d+)/);
	if (version && version.length > 1 && version[1] * 1 < 603.1) {
		return true;
	}

	return false;
};

/**
 * Convert from numeric position to letter for column names in Excel
 * @param  {int} n Column number
 * @return {string} Column letter(s) name
 */
function createCellPos(n) {
	var ordA = 'A'.charCodeAt(0);
	var ordZ = 'Z'.charCodeAt(0);
	var len = ordZ - ordA + 1;
	var s = '';

	while (n >= 0) {
		s = String.fromCharCode((n % len) + ordA) + s;
		n = Math.floor(n / len) - 1;
	}

	return s;
}

try {
	var _serialiser = new XMLSerializer();
	var _ieExcel;
} catch (t) {
	// noop
}

/**
 * Recursively add XML files from an object's structure to a ZIP file. This
 * allows the XSLX file to be easily defined with an object's structure matching
 * the files structure.
 *
 * @param {JSZip} zip ZIP package
 * @param {object} obj Object to add (recursive)
 */
function _addToZip(zip, obj) {
	if (_ieExcel === undefined) {
		// Detect if we are dealing with IE's _awful_ serialiser by seeing if it
		// drop attributes
		_ieExcel =
			_serialiser
				.serializeToString(
					new window.DOMParser().parseFromString(
						excelStrings['xl/worksheets/sheet1.xml'],
						'text/xml'
					)
				)
				.indexOf('xmlns:r') === -1;
	}

	$.each(obj, function (name, val) {
		if ($.isPlainObject(val)) {
			var newDir = zip.folder(name);
			_addToZip(newDir, val);
		}
		else {
			if (_ieExcel) {
				// IE's XML serialiser will drop some name space attributes from
				// from the root node, so we need to save them. Do this by
				// replacing the namespace nodes with a regular attribute that
				// we convert back when serialised. Edge does not have this
				// issue
				var worksheet = val.childNodes[0];
				var i, ien;
				var attrs = [];

				for (i = worksheet.attributes.length - 1; i >= 0; i--) {
					var attrName = worksheet.attributes[i].nodeName;
					var attrValue = worksheet.attributes[i].nodeValue;

					if (attrName.indexOf(':') !== -1) {
						attrs.push({ name: attrName, value: attrValue });

						worksheet.removeAttribute(attrName);
					}
				}

				for (i = 0, ien = attrs.length; i < ien; i++) {
					var attr = val.createAttribute(
						attrs[i].name.replace(':', '_dt_b_namespace_token_')
					);
					attr.value = attrs[i].value;
					worksheet.setAttributeNode(attr);
				}
			}

			var str = _serialiser.serializeToString(val);

			// Fix IE's XML
			if (_ieExcel) {
				// IE doesn't include the XML declaration
				if (str.indexOf('<?xml') === -1) {
					str =
						'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
						str;
				}

				// Return namespace attributes to being as such
				str = str.replace(/_dt_b_namespace_token_/g, ':');

				// Remove testing name space that IE puts into the space preserve attr
				str = str.replace(/xmlns:NS[\d]+="" NS[\d]+:/g, '');
			}

			// Safari, IE and Edge will put empty name space attributes onto
			// various elements making them useless. This strips them out
			str = str.replace(/<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>');

			zip.file(name, str);
		}
	});
}

/**
 * Create an XML node and add any children, attributes, etc without needing to
 * be verbose in the DOM.
 *
 * @param  {object} doc      XML document
 * @param  {string} nodeName Node name
 * @param  {object} opts     Options - can be `attr` (attributes), `children`
 *   (child nodes) and `text` (text content)
 * @return {node}            Created node
 */
function _createNode(doc, nodeName, opts) {
	var tempNode = doc.createElement(nodeName);

	if (opts) {
		if (opts.attr) {
			$(tempNode).attr(opts.attr);
		}

		if (opts.children) {
			$.each(opts.children, function (key, value) {
				tempNode.appendChild(value);
			});
		}

		if (opts.text !== null && opts.text !== undefined) {
			tempNode.appendChild(doc.createTextNode(opts.text));
		}
	}

	return tempNode;
}

/**
 * Get the width for an Excel column based on the contents of that column
 * @param  {object} data Data for export
 * @param  {int}    col  Column index
 * @return {int}         Column width
 */
function _excelColWidth(data, col) {
	var max = data.header[col].length;
	var len, lineSplit, str;

	if (data.footer && data.footer[col] && data.footer[col].length > max) {
		max = data.footer[col].length;
	}

	for (var i = 0, ien = data.body.length; i < ien; i++) {
		var point = data.body[i][col];
		str = point !== null && point !== undefined ? point.toString() : '';

		// If there is a newline character, workout the width of the column
		// based on the longest line in the string
		if (str.indexOf('\n') !== -1) {
			lineSplit = str.split('\n');
			lineSplit.sort(function (a, b) {
				return b.length - a.length;
			});

			len = lineSplit[0].length;
		}
		else {
			len = str.length;
		}

		if (len > max) {
			max = len;
		}

		// Max width rather than having potentially massive column widths
		if (max > 40) {
			return 54; // 40 * 1.35
		}
	}

	max *= 1.35;

	// And a min width
	return max > 6 ? max : 6;
}

// Excel - Pre-defined strings to build a basic XLSX file
var excelStrings = {
	'_rels/.rels':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
		'</Relationships>',

	'xl/_rels/workbook.xml.rels':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
		'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
		'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
		'</Relationships>',

	'[Content_Types].xml':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
		'<Default Extension="xml" ContentType="application/xml" />' +
		'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
		'<Default Extension="jpeg" ContentType="image/jpeg" />' +
		'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
		'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
		'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />' +
		'</Types>',

	'xl/workbook.xml':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
		'<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>' +
		'<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>' +
		'<bookViews>' +
		'<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>' +
		'</bookViews>' +
		'<sheets>' +
		'<sheet name="Sheet1" sheetId="1" r:id="rId1"/>' +
		'</sheets>' +
		'<definedNames/>' +
		'</workbook>',

	'xl/worksheets/sheet1.xml':
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
		'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
		'<sheetData/>' +
		'<mergeCells count="0"/>' +
		'</worksheet>',

	'xl/styles.xml':
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
		'<numFmts count="6">' +
		'<numFmt numFmtId="164" formatCode="[$$-409]#,##0.00;-[$$-409]#,##0.00"/>' +
		'<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>' +
		'<numFmt numFmtId="166" formatCode="[$€-2] #,##0.00"/>' +
		'<numFmt numFmtId="167" formatCode="0.0%"/>' +
		'<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>' +
		'<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>' +
		'</numFmts>' +
		'<fonts count="5" x14ac:knownFonts="1">' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<color rgb="FFFFFFFF" />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<b />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<i />' +
		'</font>' +
		'<font>' +
		'<sz val="11" />' +
		'<name val="Calibri" />' +
		'<u />' +
		'</font>' +
		'</fonts>' +
		'<fills count="6">' +
		'<fill>' +
		'<patternFill patternType="none" />' +
		'</fill>' +
		'<fill>' + // Excel appears to use this as a dotted background regardless of values but
		'<patternFill patternType="none" />' + // to be valid to the schema, use a patternFill
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="FFD9D9D9" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="FFD99795" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="ffc6efce" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'<fill>' +
		'<patternFill patternType="solid">' +
		'<fgColor rgb="ffc6cfef" />' +
		'<bgColor indexed="64" />' +
		'</patternFill>' +
		'</fill>' +
		'</fills>' +
		'<borders count="2">' +
		'<border>' +
		'<left />' +
		'<right />' +
		'<top />' +
		'<bottom />' +
		'<diagonal />' +
		'</border>' +
		'<border diagonalUp="false" diagonalDown="false">' +
		'<left style="thin">' +
		'<color auto="1" />' +
		'</left>' +
		'<right style="thin">' +
		'<color auto="1" />' +
		'</right>' +
		'<top style="thin">' +
		'<color auto="1" />' +
		'</top>' +
		'<bottom style="thin">' +
		'<color auto="1" />' +
		'</bottom>' +
		'<diagonal />' +
		'</border>' +
		'</borders>' +
		'<cellStyleXfs count="1">' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />' +
		'</cellStyleXfs>' +
		'<cellXfs count="68">' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="left"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="center"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="right"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment horizontal="fill"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment textRotation="90"/>' +
		'</xf>' +
		'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
		'<alignment wrapText="1"/>' +
		'</xf>' +
		'<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="1" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="2" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'<xf numFmtId="14" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
		'</cellXfs>' +
		'<cellStyles count="1">' +
		'<cellStyle name="Normal" xfId="0" builtinId="0" />' +
		'</cellStyles>' +
		'<dxfs count="0" />' +
		'<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />' +
		'</styleSheet>'
};
// Note we could use 3 `for` loops for the styles, but when gzipped there is
// virtually no difference in size, since the above can be easily compressed

// Pattern matching for special number formats. Perhaps this should be exposed
// via an API in future?
// Ref: section 3.8.30 - built in formatters in open spreadsheet
//   https://www.ecma-international.org/news/TC45_current_work/Office%20Open%20XML%20Part%204%20-%20Markup%20Language%20Reference.pdf
var _excelSpecials = [
	{
		match: /^\-?\d+\.\d%$/,
		style: 60,
		fmt: function (d) {
			return d / 100;
		}
	}, // Percent with d.p.
	{
		match: /^\-?\d+\.?\d*%$/,
		style: 56,
		fmt: function (d) {
			return d / 100;
		}
	}, // Percent
	{ match: /^\-?\$[\d,]+.?\d*$/, style: 57 }, // Dollars
	{ match: /^\-?£[\d,]+.?\d*$/, style: 58 }, // Pounds
	{ match: /^\-?€[\d,]+.?\d*$/, style: 59 }, // Euros
	{ match: /^\-?\d+$/, style: 65 }, // Numbers without thousand separators
	{ match: /^\-?\d+\.\d{2}$/, style: 66 }, // Numbers 2 d.p. without thousands separators
	{
		match: /^\([\d,]+\)$/,
		style: 61,
		fmt: function (d) {
			return -1 * d.replace(/[\(\)]/g, '');
		}
	}, // Negative numbers indicated by brackets
	{
		match: /^\([\d,]+\.\d{2}\)$/,
		style: 62,
		fmt: function (d) {
			return -1 * d.replace(/[\(\)]/g, '');
		}
	}, // Negative numbers indicated by brackets - 2d.p.
	{ match: /^\-?[\d,]+$/, style: 63 }, // Numbers with thousand separators
	{ match: /^\-?[\d,]+\.\d{2}$/, style: 64 },
	{
		match: /^(19\d\d|[2-9]\d\d\d)\-(0\d|1[012])\-[0123][\d]$/,
		style: 67,
		fmt: function (d) {
			return Math.round(25569 + Date.parse(d) / (86400 * 1000));
		}
	} //Date yyyy-mm-dd
];

var _excelMergeCells = function (rels, row, column, rowspan, colspan) {
	var mergeCells = $('mergeCells', rels);

	mergeCells[0].appendChild(
		_createNode(rels, 'mergeCell', {
			attr: {
				ref:
					createCellPos(column) +
					row +
					':' +
					createCellPos(column + colspan - 1) +
					(row + rowspan - 1)
			}
		})
	);

	mergeCells.attr('count', parseFloat(mergeCells.attr('count')) + 1);
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Buttons
 */

//
// Copy to clipboard
//
DataTable.ext.buttons.copyHtml5 = {
	className: 'buttons-copy buttons-html5',

	text: function (dt) {
		return dt.i18n('buttons.copy', 'Copy');
	},

	action: function (e, dt, button, config, cb) {
		var exportData = _exportData(dt, config);
		var info = dt.buttons.exportInfo(config);
		var newline = _newLine(config);
		var output = exportData.str;
		var hiddenDiv = $('<div/>').css({
			height: 1,
			width: 1,
			overflow: 'hidden',
			position: 'fixed',
			top: 0,
			left: 0
		});

		if (info.title) {
			output = info.title + newline + newline + output;
		}

		if (info.messageTop) {
			output = info.messageTop + newline + newline + output;
		}

		if (info.messageBottom) {
			output = output + newline + newline + info.messageBottom;
		}

		if (config.customize) {
			output = config.customize(output, config, dt);
		}

		var textarea = $('<textarea readonly/>')
			.val(output)
			.appendTo(hiddenDiv);

		// For browsers that support the copy execCommand, try to use it
		if (document.queryCommandSupported('copy')) {
			hiddenDiv.appendTo(dt.table().container());
			textarea[0].focus();
			textarea[0].select();

			try {
				var successful = document.execCommand('copy');
				hiddenDiv.remove();

				if (successful) {
					dt.buttons.info(
						dt.i18n('buttons.copyTitle', 'Copy to clipboard'),
						dt.i18n(
							'buttons.copySuccess',
							{
								1: 'Copied one row to clipboard',
								_: 'Copied %d rows to clipboard'
							},
							exportData.rows
						),
						2000
					);

					cb();
					return;
				}
			} catch (t) {
				// noop
			}
		}

		// Otherwise we show the text box and instruct the user to use it
		var message = $(
			'<span>' +
				dt.i18n(
					'buttons.copyKeys',
					'Press <i>ctrl</i> or <i>\u2318</i> + <i>C</i> to copy the table data<br>to your system clipboard.<br><br>' +
						'To cancel, click this message or press escape.'
				) +
				'</span>'
		).append(hiddenDiv);

		dt.buttons.info(
			dt.i18n('buttons.copyTitle', 'Copy to clipboard'),
			message,
			0
		);

		// Select the text so when the user activates their system clipboard
		// it will copy that text
		textarea[0].focus();
		textarea[0].select();

		// Event to hide the message when the user is done
		var container = $(message).closest('.dt-button-info');
		var close = function () {
			container.off('click.buttons-copy');
			$(document).off('.buttons-copy');
			dt.buttons.info(false);
		};

		container.on('click.buttons-copy', close);
		$(document)
			.on('keydown.buttons-copy', function (e) {
				if (e.keyCode === 27) {
					// esc
					close();
					cb();
				}
			})
			.on('copy.buttons-copy cut.buttons-copy', function () {
				close();
				cb();
			});
	},

	async: 100,

	exportOptions: {},

	fieldSeparator: '\t',

	fieldBoundary: '',

	header: true,

	footer: true,

	title: '*',

	messageTop: '*',

	messageBottom: '*'
};

//
// CSV export
//
DataTable.ext.buttons.csvHtml5 = {
	bom: false,

	className: 'buttons-csv buttons-html5',

	available: function () {
		return window.FileReader !== undefined && window.Blob;
	},

	text: function (dt) {
		return dt.i18n('buttons.csv', 'CSV');
	},

	action: function (e, dt, button, config, cb) {
		// Set the text
		var output = _exportData(dt, config).str;
		var info = dt.buttons.exportInfo(config);
		var charset = config.charset;

		if (config.customize) {
			output = config.customize(output, config, dt);
		}

		if (charset !== false) {
			if (!charset) {
				charset = document.characterSet || document.charset;
			}

			if (charset) {
				charset = ';charset=' + charset;
			}
		}
		else {
			charset = '';
		}

		if (config.bom) {
			output = String.fromCharCode(0xfeff) + output;
		}

		_saveAs(
			new Blob([output], { type: 'text/csv' + charset }),
			info.filename,
			true
		);

		cb();
	},

	async: 100,

	filename: '*',

	extension: '.csv',

	exportOptions: {},

	fieldSeparator: ',',

	fieldBoundary: '"',

	escapeChar: '"',

	charset: null,

	header: true,

	footer: true
};

//
// Excel (xlsx) export
//
DataTable.ext.buttons.excelHtml5 = {
	className: 'buttons-excel buttons-html5',

	available: function () {
		return (
			window.FileReader !== undefined &&
			_jsZip() !== undefined &&
			!_isDuffSafari() &&
			_serialiser
		);
	},

	text: function (dt) {
		return dt.i18n('buttons.excel', 'Excel');
	},

	action: function (e, dt, button, config, cb) {
		var rowPos = 0;
		var dataStartRow, dataEndRow;
		var getXml = function (type) {
			var str = excelStrings[type];

			//str = str.replace( /xmlns:/g, 'xmlns_' ).replace( /mc:/g, 'mc_' );

			return $.parseXML(str);
		};
		var rels = getXml('xl/worksheets/sheet1.xml');
		var relsGet = rels.getElementsByTagName('sheetData')[0];

		var xlsx = {
			_rels: {
				'.rels': getXml('_rels/.rels')
			},
			xl: {
				_rels: {
					'workbook.xml.rels': getXml('xl/_rels/workbook.xml.rels')
				},
				'workbook.xml': getXml('xl/workbook.xml'),
				'styles.xml': getXml('xl/styles.xml'),
				worksheets: {
					'sheet1.xml': rels
				}
			},
			'[Content_Types].xml': getXml('[Content_Types].xml')
		};

		var data = dt.buttons.exportData(config.exportOptions);
		var currentRow, rowNode;
		var addRow = function (row) {
			currentRow = rowPos + 1;
			rowNode = _createNode(rels, 'row', { attr: { r: currentRow } });

			for (var i = 0, ien = row.length; i < ien; i++) {
				// Concat both the Cell Columns as a letter and the Row of the cell.
				var cellId = createCellPos(i) + '' + currentRow;
				var cell = null;

				// For null, undefined of blank cell, continue so it doesn't create the _createNode
				if (row[i] === null || row[i] === undefined || row[i] === '') {
					if (config.createEmptyCells === true) {
						row[i] = '';
					}
					else {
						continue;
					}
				}

				var originalContent = row[i];
				row[i] =
					typeof row[i].trim === 'function' ? row[i].trim() : row[i];

				// Special number formatting options
				for (var j = 0, jen = _excelSpecials.length; j < jen; j++) {
					var special = _excelSpecials[j];

					// TODO Need to provide the ability for the specials to say
					// if they are returning a string, since at the moment it is
					// assumed to be a number
					if (
						row[i].match &&
						!row[i].match(/^0\d+/) &&
						row[i].match(special.match)
					) {
						var val = row[i].replace(/[^\d\.\-]/g, '');

						if (special.fmt) {
							val = special.fmt(val);
						}

						cell = _createNode(rels, 'c', {
							attr: {
								r: cellId,
								s: special.style
							},
							children: [_createNode(rels, 'v', { text: val })]
						});

						break;
					}
				}

				if (!cell) {
					if (
						typeof row[i] === 'number' ||
						(row[i].match &&
							row[i].match(/^-?\d+(\.\d+)?([eE]\-?\d+)?$/) && // Includes exponential format
							!row[i].match(/^0\d+/))
					) {
						// Detect numbers - don't match numbers with leading zeros
						// or a negative anywhere but the start
						cell = _createNode(rels, 'c', {
							attr: {
								t: 'n',
								r: cellId
							},
							children: [_createNode(rels, 'v', { text: row[i] })]
						});
					}
					else {
						// String output - replace non standard characters for text output
						/*eslint no-control-regex: "off"*/
						var text = !originalContent.replace
							? originalContent
							: originalContent.replace(
									/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g,
									''
							);

						cell = _createNode(rels, 'c', {
							attr: {
								t: 'inlineStr',
								r: cellId
							},
							children: {
								row: _createNode(rels, 'is', {
									children: {
										row: _createNode(rels, 't', {
											text: text,
											attr: {
												'xml:space': 'preserve'
											}
										})
									}
								})
							}
						});
					}
				}

				rowNode.appendChild(cell);
			}

			relsGet.appendChild(rowNode);
			rowPos++;
		};

		var addHeader = function (structure) {
			structure.forEach(function (row) {
				addRow(
					row.map(function (cell) {
						return cell ? cell.title : '';
					}),
					rowPos
				);
				$('row:last c', rels).attr('s', '2'); // bold

				// Add any merge cells
				row.forEach(function (cell, columnCounter) {
					if (cell && (cell.colSpan > 1 || cell.rowSpan > 1)) {
						_excelMergeCells(
							rels,
							rowPos,
							columnCounter,
							cell.rowSpan,
							cell.colSpan
						);
					}
				});
			});
		};

		if (config.customizeData) {
			config.customizeData(data);
		}

		// Title and top messages
		var exportInfo = dt.buttons.exportInfo(config);
		if (exportInfo.title) {
			addRow([exportInfo.title], rowPos);
			_excelMergeCells(rels, rowPos, 0, 1, data.header.length);
			$('row:last c', rels).attr('s', '51'); // centre
		}

		if (exportInfo.messageTop) {
			addRow([exportInfo.messageTop], rowPos);
			_excelMergeCells(rels, rowPos, 0, 1, data.header.length);
		}

		// Table header
		if (config.header) {
			addHeader(data.headerStructure);
		}

		dataStartRow = rowPos;

		// Table body
		for (var n = 0, ie = data.body.length; n < ie; n++) {
			addRow(data.body[n], rowPos);
		}

		dataEndRow = rowPos;

		// Table footer
		if (config.footer && data.footer) {
			addHeader(data.footerStructure);
		}

		// Below the table
		if (exportInfo.messageBottom) {
			addRow([exportInfo.messageBottom], rowPos);
			_excelMergeCells(rels, rowPos, 0, 1, data.header.length);
		}

		// Set column widths
		var cols = _createNode(rels, 'cols');
		$('worksheet', rels).prepend(cols);

		for (var i = 0, ien = data.header.length; i < ien; i++) {
			cols.appendChild(
				_createNode(rels, 'col', {
					attr: {
						min: i + 1,
						max: i + 1,
						width: _excelColWidth(data, i),
						customWidth: 1
					}
				})
			);
		}

		// Workbook modifications
		var workbook = xlsx.xl['workbook.xml'];

		$('sheets sheet', workbook).attr('name', _sheetname(config));

		// Auto filter for columns
		if (config.autoFilter) {
			$('mergeCells', rels).before(
				_createNode(rels, 'autoFilter', {
					attr: {
						ref:
							'A' +
							dataStartRow +
							':' +
							createCellPos(data.header.length - 1) +
							dataEndRow
					}
				})
			);

			$('definedNames', workbook).append(
				_createNode(workbook, 'definedName', {
					attr: {
						name: '_xlnm._FilterDatabase',
						localSheetId: '0',
						hidden: 1
					},
					text:
						'\'' +
						_sheetname(config).replace(/'/g, '\'\'') +
						'\'!$A$' +
						dataStartRow +
						':' +
						createCellPos(data.header.length - 1) +
						dataEndRow
				})
			);
		}

		// Let the developer customise the document if they want to
		if (config.customize) {
			config.customize(xlsx, config, dt);
		}

		// Excel doesn't like an empty mergeCells tag
		if ($('mergeCells', rels).children().length === 0) {
			$('mergeCells', rels).remove();
		}

		var jszip = _jsZip();
		var zip = new jszip();
		var zipConfig = {
			compression: 'DEFLATE',
			type: 'blob',
			mimeType:
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		};

		_addToZip(zip, xlsx);

		// Modern Excel has a 218 character limit on the file name + path of the file (why!?)
		// https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
		// So we truncate to allow for this.
		var filename = exportInfo.filename;

		if (filename > 175) {
			filename = filename.substr(0, 175);
		}

		// Let the developer customize the final zip file if they want to before it is generated and sent to the browser
		if (config.customizeZip) {
			config.customizeZip(zip, data, filename);
		}


		if (zip.generateAsync) {
			// JSZip 3+
			zip.generateAsync(zipConfig).then(function (blob) {
				_saveAs(blob, filename);
				cb();
			});
		}
		else {
			// JSZip 2.5
			_saveAs(zip.generate(zipConfig), filename);
			cb();
		}
	},

	async: 100,

	filename: '*',

	extension: '.xlsx',

	exportOptions: {},

	header: true,

	footer: true,

	title: '*',

	messageTop: '*',

	messageBottom: '*',

	createEmptyCells: false,

	autoFilter: false,

	sheetName: ''
};

//
// PDF export - using pdfMake - http://pdfmake.org
//
DataTable.ext.buttons.pdfHtml5 = {
	className: 'buttons-pdf buttons-html5',

	available: function () {
		return window.FileReader !== undefined && _pdfMake();
	},

	text: function (dt) {
		return dt.i18n('buttons.pdf', 'PDF');
	},

	action: function (e, dt, button, config, cb) {
		var data = dt.buttons.exportData(config.exportOptions);
		var info = dt.buttons.exportInfo(config);
		var rows = [];

		if (config.header) {
			data.headerStructure.forEach(function (row) {
				rows.push(
					row.map(function (cell) {
						return cell
							? {
									text: cell.title,
									colSpan: cell.colspan,
									rowSpan: cell.rowspan,
									style: 'tableHeader'
							}
							: {};
					})
				);
			});
		}

		for (var i = 0, ien = data.body.length; i < ien; i++) {
			rows.push(
				data.body[i].map(function (d) {
					return {
						text:
							d === null || d === undefined
								? ''
								: typeof d === 'string'
								? d
								: d.toString()
					};
				})
			);
		}

		if (config.footer) {
			data.footerStructure.forEach(function (row) {
				rows.push(
					row.map(function (cell) {
						return cell
							? {
									text: cell.title,
									colSpan: cell.colspan,
									rowSpan: cell.rowspan,
									style: 'tableHeader'
							}
							: {};
					})
				);
			});
		}

		var doc = {
			pageSize: config.pageSize,
			pageOrientation: config.orientation,
			content: [
				{
					style: 'table',
					table: {
						headerRows: data.headerStructure.length,
						footerRows: data.footerStructure.length, // Used for styling, doesn't do anything in pdfmake
						body: rows
					},
					layout: {
						hLineWidth: function (i, node) {
							if (i === 0 || i === node.table.body.length) {
								return 0;
							}
							return 0.5;
						},
						vLineWidth: function () {
							return 0;
						},
						hLineColor: function (i, node) {
							return i === node.table.headerRows ||
								i ===
									node.table.body.length -
										node.table.footerRows
								? '#333'
								: '#ddd';
						},
						fillColor: function (rowIndex) {
							if (rowIndex < data.headerStructure.length) {
								return '#fff';
							}
							return rowIndex % 2 === 0 ? '#f3f3f3' : null;
						},
						paddingTop: function () {
							return 5;
						},
						paddingBottom: function () {
							return 5;
						}
					}
				}
			],
			styles: {
				tableHeader: {
					bold: true,
					fontSize: 11,
					alignment: 'center'
				},
				tableFooter: {
					bold: true,
					fontSize: 11
				},
				table: {
					margin: [0, 5, 0, 5]
				},
				title: {
					alignment: 'center',
					fontSize: 13
				},
				message: {}
			},
			defaultStyle: {
				fontSize: 10
			}
		};

		if (info.messageTop) {
			doc.content.unshift({
				text: info.messageTop,
				style: 'message',
				margin: [0, 0, 0, 12]
			});
		}

		if (info.messageBottom) {
			doc.content.push({
				text: info.messageBottom,
				style: 'message',
				margin: [0, 0, 0, 12]
			});
		}

		if (info.title) {
			doc.content.unshift({
				text: info.title,
				style: 'title',
				margin: [0, 0, 0, 12]
			});
		}

		if (config.customize) {
			config.customize(doc, config, dt);
		}

		var pdf = _pdfMake().createPdf(doc);

		if (config.download === 'open' && !_isDuffSafari()) {
			pdf.open();
		}
		else {
			pdf.download(info.filename);
		}

		cb();
	},

	async: 100,

	title: '*',

	filename: '*',

	extension: '.pdf',

	exportOptions: {},

	orientation: 'portrait',

	// This isn't perfect, but it is close
	pageSize:
		navigator.language === 'en-US' || navigator.language === 'en-CA'
			? 'LETTER'
			: 'A4',

	header: true,

	footer: true,

	messageTop: '*',

	messageBottom: '*',

	customize: null,

	download: 'download'
};


return DataTable;
}));

/*!
 * Print button for Buttons and DataTables.
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net', 'datatables.net-buttons'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}

			if ( ! $.fn.dataTable.Buttons ) {
				require('datatables.net-buttons')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;



var _link = document.createElement('a');

/**
 * Clone link and style tags, taking into account the need to change the source
 * path.
 *
 * @param  {node}     el Element to convert
 */
var _styleToAbs = function (el) {
	var clone = $(el).clone()[0];

	if (clone.nodeName.toLowerCase() === 'link') {
		clone.href = _relToAbs(clone.href);
	}

	return clone.outerHTML;
};

/**
 * Convert a URL from a relative to an absolute address so it will work
 * correctly in the popup window which has no base URL.
 *
 * @param  {string} href URL
 */
var _relToAbs = function (href) {
	// Assign to a link on the original page so the browser will do all the
	// hard work of figuring out where the file actually is
	_link.href = href;
	var linkHost = _link.host;

	// IE doesn't have a trailing slash on the host
	// Chrome has it on the pathname
	if (linkHost.indexOf('/') === -1 && _link.pathname.indexOf('/') !== 0) {
		linkHost += '/';
	}

	return _link.protocol + '//' + linkHost + _link.pathname + _link.search;
};

DataTable.ext.buttons.print = {
	className: 'buttons-print',

	text: function (dt) {
		return dt.i18n('buttons.print', 'Print');
	},

	action: function (e, dt, button, config, cb) {
		var data = dt.buttons.exportData(
			$.extend({ decodeEntities: false }, config.exportOptions) // XSS protection
		);
		var exportInfo = dt.buttons.exportInfo(config);

		// Get the classes for the columns from the header cells
		var columnClasses = dt
			.columns(config.exportOptions.columns)
			.nodes()
			.map(function (n) {
				return n.className;
			})
			.toArray();

		var addRow = function (d, tag) {
			var str = '<tr>';

			for (var i = 0, ien = d.length; i < ien; i++) {
				// null and undefined aren't useful in the print output
				var dataOut = d[i] === null || d[i] === undefined ? '' : d[i];
				var classAttr = columnClasses[i]
					? 'class="' + columnClasses[i] + '"'
					: '';

				str +=
					'<' +
					tag +
					' ' +
					classAttr +
					'>' +
					dataOut +
					'</' +
					tag +
					'>';
			}

			return str + '</tr>';
		};

		// Construct a table for printing
		var html = '<table class="' + dt.table().node().className + '">';

		if (config.header) {
			var headerRows = data.headerStructure.map(function (row) {
				return (
					'<tr>' +
					row
						.map(function (cell) {
							return cell
								? '<th colspan="' +
										cell.colspan +
										'" rowspan="' +
										cell.rowspan +
										'">' +
										cell.title +
										'</th>'
								: '';
						})
						.join('') +
					'</tr>'
				);
			});

			html += '<thead>' + headerRows.join('') + '</thead>';
		}

		html += '<tbody>';
		for (var i = 0, ien = data.body.length; i < ien; i++) {
			html += addRow(data.body[i], 'td');
		}
		html += '</tbody>';

		if (config.footer && data.footer) {
			var footerRows = data.footerStructure.map(function (row) {
				return (
					'<tr>' +
					row
						.map(function (cell) {
							return cell
								? '<th colspan="' +
										cell.colspan +
										'" rowspan="' +
										cell.rowspan +
										'">' +
										cell.title +
										'</th>'
								: '';
						})
						.join('') +
					'</tr>'
				);
			});

			html += '<tfoot>' + footerRows.join('') + '</tfoot>';
		}
		html += '</table>';

		// Open a new window for the printable table
		var win = window.open('', '');

		if (!win) {
			dt.buttons.info(
				dt.i18n('buttons.printErrorTitle', 'Unable to open print view'),
				dt.i18n(
					'buttons.printErrorMsg',
					'Please allow popups in your browser for this site to be able to view the print view.'
				),
				5000
			);

			return;
		}

		win.document.close();

		// Inject the title and also a copy of the style and link tags from this
		// document so the table can retain its base styling. Note that we have
		// to use string manipulation as IE won't allow elements to be created
		// in the host document and then appended to the new window.
		var head = '<title>' + exportInfo.title + '</title>';
		$('style, link').each(function () {
			head += _styleToAbs(this);
		});

		try {
			win.document.head.innerHTML = head; // Work around for Edge
		} catch (e) {
			$(win.document.head).html(head); // Old IE
		}

		// Add any custom scripts (for example for paged.js)
		if (config.customScripts) {
			config.customScripts.forEach(function (script) {
				var tag = win.document.createElement("script");
				tag.src = script;
				win.document.getElementsByTagName("head")[0].appendChild(tag);
			});
		}

		// Inject the table and other surrounding information
		win.document.body.innerHTML =
			'<h1>' +
			exportInfo.title +
			'</h1>' +
			'<div>' +
			(exportInfo.messageTop || '') +
			'</div>' +
			html +
			'<div>' +
			(exportInfo.messageBottom || '') +
			'</div>';

		$(win.document.body).addClass('dt-print-view');

		$('img', win.document.body).each(function (i, img) {
			img.setAttribute('src', _relToAbs(img.getAttribute('src')));
		});

		if (config.customize) {
			config.customize(win, config, dt);
		}

		// Allow stylesheets time to load
		var autoPrint = function () {
			if (config.autoPrint) {
				win.print(); // blocking - so close will not
				win.close(); // execute until this is done
			}
		};

		win.setTimeout(autoPrint, 1000);

		cb();
	},

	async: 100,

	title: '*',

	messageTop: '*',

	messageBottom: '*',

	exportOptions: {},

	header: true,

	footer: true,

	autoPrint: true,

	customize: null
};


return DataTable;
}));

/*! ColReorder 2.0.3
 * © SpryMedia Ltd - datatables.net/license
 */
!function(r){var o,n;"function"==typeof define&&define.amd?define(["jquery","datatables.net"],function(t){return r(t,window,document)}):"object"==typeof exports?(o=require("jquery"),n=function(t,e){e.fn.dataTable||require("datatables.net")(t,e)},"undefined"==typeof window?module.exports=function(t,e){return t=t||window,e=e||o(t),n(t,e),r(e,0,t.document)}:(n(window,o),module.exports=r(o,window,window.document))):r(jQuery,window,document)}(function(u,t,h){"use strict";var n=u.fn.dataTable;function f(t,e,r,o){var n=t.splice(e,r);n.unshift(0),n.unshift(o<e?o:o-r+1),t.splice.apply(t,n)}function l(t){t.rows().invalidate("data"),t.column(0).visible(t.column(0).visible()),t.columns.adjust();var e=t.colReorder.order();t.trigger("columns-reordered",[{order:e,mapping:g(e)}])}function s(t){return t.settings()[0].aoColumns.map(function(t){return t._crOriginalIdx})}function p(t,e,r,o){for(var n=[],s=0;s<t.length;s++){var i=t[s];f(i,r[0],r.length,o);for(var l=0;l<i.length;l++){var a,d=i[l].cell;n.includes(d)||(a=d.getAttribute("data-dt-column").split(",").map(function(t){return e[t]}).join(","),d.setAttribute("data-dt-column",a),n.push(d))}}}function i(t){t.columns().iterator("column",function(t,e){t=t.aoColumns;void 0===t[e]._crOriginalIdx&&(t[e]._crOriginalIdx=e)})}function g(t){for(var e=[],r=0;r<t.length;r++)e[t[r]]=r;return e}function a(t,e,r){var o,n=t.settings()[0],s=n.aoColumns,i=s.map(function(t,e){return e});if(!e.includes(r)){f(i,e[0],e.length,r);var l=g(i);for(f(s,e[0],e.length,r),o=0;o<n.aoData.length;o++){var a=n.aoData[o];if(a){var d=a.anCells;if(d)for(f(d,e[0],e.length,r),u=0;u<d.length;u++)a.nTr&&d[u]&&s[u].bVisible&&a.nTr.appendChild(d[u]),d[u]&&d[u]._DT_CellIndex&&(d[u]._DT_CellIndex.column=u)}}for(o=0;o<s.length;o++){for(var c=s[o],u=0;u<c.aDataSort.length;u++)c.aDataSort[u]=l[c.aDataSort[u]];c.idx=l[c.idx],c.bVisible&&n.colgroup.append(c.colEl)}p(n.aoHeader,l,e,r),p(n.aoFooter,l,e,r),f(n.aoPreSearchCols,e[0],e.length,r),m(l,n.aaSorting),Array.isArray(n.aaSortingFixed)?m(l,n.aaSortingFixed):(n.aaSortingFixed.pre||n.aaSortingFixed.post)&&m(l,n.aaSortingFixed.pre),n.aLastSort.forEach(function(t){t.src=l[t.src]}),t.trigger("column-reorder",[t.settings()[0],{from:e,to:r,mapping:l}])}}function m(t,e){if(e)for(var r=0;r<e.length;r++){var o=e[r];"number"==typeof o?e[r]=t[o]:u.isPlainObject(o)&&void 0!==o.idx?o.idx=t[o.idx]:Array.isArray(o)&&"number"==typeof o[0]&&(o[0]=t[o[0]])}}function d(t,e,r){var o=!1;if(e.length!==t.columns().count())t.error("ColReorder - column count mismatch");else{for(var n=g(e=r?c(t,e,"toCurrent"):e),s=0;s<n.length;s++){var i=n.indexOf(s);s!==i&&(f(n,i,1,s),a(t,[i],s),o=!0)}o&&l(t)}}function c(t,e,r){var o=t.colReorder.order(),n=t.settings()[0].aoColumns;return"toCurrent"===r||"fromOriginal"===r?Array.isArray(e)?e.map(function(t){return o.indexOf(t)}):o.indexOf(e):Array.isArray(e)?e.map(function(t){return n[t]._crOriginalIdx}):n[e]._crOriginalIdx}function v(t,e,r){var o=t.columns().count();return!(e[0]<r&&r<e[e.length]||e[0]<0&&e[e.length-1]>o||r<0&&o<r||!e.includes(r)&&(!y(t.table().header.structure(),e,r)||!y(t.table().footer.structure(),e,r)))}function y(t,e,r){for(var o=function(t){for(var e=[],r=0;r<t.length;r++){e.push([]);for(var o=0;o<t[r].length;o++){var n=t[r][o];if(n)for(var s=0;s<n.rowspan;s++){e[r+s]||(e[r+s]=[]);for(var i=0;i<n.colspan;i++)e[r+s][o+i]=n.cell}}}return e}(t),n=0;n<o.length;n++)f(o[n],e[0],e.length,r);for(n=0;n<o.length;n++)for(var s=[],i=0;i<o[n].length;i++){var l=o[n][i];if(s.includes(l)){if(s[s.length-1]!==l)return}else s.push(l)}return 1}_.prototype.disable=function(){return this.c.enable=!1,this},_.prototype.enable=function(t){return!1===(t=void 0===t?!0:t)?this.disable():(this.c.enable=!0,this)},_.prototype._addListener=function(t){var e=this;u(t).on("selectstart.colReorder",function(){return!1}).on("mousedown.colReorder touchstart.colReorder",function(t){"mousedown"===t.type&&1!==t.which||e.c.enable&&e._mouseDown(t,this)})},_.prototype._createDragNode=function(){var t=this.s.mouse.target,e=t.parent(),r=e.parent(),o=r.parent(),n=t.clone();this.dom.drag=u(o[0].cloneNode(!1)).addClass("dtcr-cloned").append(u(r[0].cloneNode(!1)).append(u(e[0].cloneNode(!1)).append(n[0]))).css({position:"absolute",top:0,left:0,width:u(t).outerWidth(),height:u(t).outerHeight()}).appendTo("body")},_.prototype._cursorPosition=function(t,e){return(-1!==t.type.indexOf("touch")?t.originalEvent.touches[0]:t)[e]},_.prototype._mouseDown=function(t,e){for(var r=this,o=u(t.target).closest("th, td"),n=o.offset(),s=this.dt.columns(this.c.columns).indexes().toArray(),i=u(e).attr("data-dt-column").split(",").map(function(t){return parseInt(t,10)}),l=0;l<i.length;l++)if(!s.includes(i[l]))return!1;this.s.mouse.start.x=this._cursorPosition(t,"pageX"),this.s.mouse.start.y=this._cursorPosition(t,"pageY"),this.s.mouse.offset.x=this._cursorPosition(t,"pageX")-n.left,this.s.mouse.offset.y=this._cursorPosition(t,"pageY")-n.top,this.s.mouse.target=o,this.s.mouse.targets=i;for(var a=0;a<i.length;a++){var d=this.dt.cells(null,i[a],{page:"current"}).nodes().to$(),c="dtcr-moving";0===a&&(c+=" dtcr-moving-first"),a===i.length-1&&(c+=" dtcr-moving-last"),d.addClass(c)}this._regions(i),this._scrollRegions(),u(h).on("mousemove.colReorder touchmove.colReorder",function(t){r._mouseMove(t)}).on("mouseup.colReorder touchend.colReorder",function(t){r._mouseUp(t)})},_.prototype._mouseMove=function(t){if(null===this.dom.drag){if(Math.pow(Math.pow(this._cursorPosition(t,"pageX")-this.s.mouse.start.x,2)+Math.pow(this._cursorPosition(t,"pageY")-this.s.mouse.start.y,2),.5)<5)return;u(h.body).addClass("dtcr-dragging"),this._createDragNode()}this.dom.drag.css({left:this._cursorPosition(t,"pageX")-this.s.mouse.offset.x,top:this._cursorPosition(t,"pageY")-this.s.mouse.offset.y});var e=u(this.dt.table().node()).offset().left,r=this._cursorPosition(t,"pageX")-e,e=this.s.dropZones.find(function(t){return t.left<=r&&r<=t.left+t.width});this.s.mouse.absLeft=this._cursorPosition(t,"pageX"),e&&!e.self&&this._move(e,r)},_.prototype._mouseUp=function(t){u(h).off(".colReorder"),u(h.body).removeClass("dtcr-dragging"),this.dom.drag&&(this.dom.drag.remove(),this.dom.drag=null),this.s.scrollInterval&&clearInterval(this.s.scrollInterval),this.dt.cells(".dtcr-moving").nodes().to$().removeClass("dtcr-moving dtcr-moving-first dtcr-moving-last")},_.prototype._move=function(t,e){var r,o,n=this,s=(this.dt.colReorder.move(this.s.mouse.targets,t.colIdx),this.s.mouse.targets=u(this.s.mouse.target).attr("data-dt-column").split(",").map(function(t){return parseInt(t,10)}),this._regions(this.s.mouse.targets),this.s.mouse.targets.filter(function(t){return n.dt.column(t).visible()})),t=this.s.dropZones.find(function(t){return t.colIdx===s[0]}),i=this.s.dropZones.indexOf(t);t.left>e&&(o=t.left-e,r=this.s.dropZones[i-1],t.left-=o,t.width+=o,r)&&(r.width-=o),(t=this.s.dropZones.find(function(t){return t.colIdx===s[s.length-1]})).left+t.width<e&&(r=e-(t.left+t.width),o=this.s.dropZones[i+1],t.width+=r,o)&&(o.left+=r,o.width-=r)},_.prototype._regions=function(n){var s=this,i=[],l=0,a=0,d=this.dt.columns(this.c.columns).indexes().toArray(),c=this.dt.columns().widths();this.dt.columns().every(function(t,e,r){var o;this.visible()&&(o=c[t],d.includes(t)&&(v(s.dt,n,t)?i.push({colIdx:t,left:l-a,self:n[0]<=t&&t<=n[n.length-1],width:o+a}):t<n[0]?i.length&&(i[i.length-1].width+=o):t>n[n.length-1]&&(a+=o)),l+=o)}),this.s.dropZones=i},_.prototype._isScrolling=function(){return this.dt.table().body().parentNode!==this.dt.table().header().parentNode},_.prototype._scrollRegions=function(){var e,r,o,n;this._isScrolling()&&(r=u((e=this).dt.table().container()).position().left,o=u(this.dt.table().container()).outerWidth(),n=this.dt.table().body().parentElement.parentElement,this.s.scrollInterval=setInterval(function(){var t=e.s.mouse.absLeft;t<r+75&&n.scrollLeft?n.scrollLeft-=5:r+o-75<t&&n.scrollLeft<n.scrollWidth&&(n.scrollLeft+=5)},25))},_.defaults={columns:"",enable:!0,order:null},_.version="2.0.3";
/*! ColReorder 2.0.3
 * © SpryMedia Ltd - datatables.net/license
 */var b=_;function _(o,t){this.dom={drag:null},this.c={columns:null,enable:null,order:null},this.s={dropZones:[],mouse:{absLeft:-1,offset:{x:-1,y:-1},start:{x:-1,y:-1},target:null,targets:[]},scrollInterval:null};var e,r=this;o.settings()[0]._colReorder||((o.settings()[0]._colReorder=this).dt=o,u.extend(this.c,_.defaults,t),i(o),o.on("stateSaveParams",function(t,e,r){r.colReorder=s(o)}),o.on("destroy",function(){o.off(".colReorder"),o.colReorder.reset()}),t=o.state.loaded(),e=this.c.order,(e=t&&t.colReorder?t.colReorder:e)&&o.ready(function(){d(o,e,!0)}),o.table().header.structure().forEach(function(t){for(var e=0;e<t.length;e++)t[e]&&t[e].cell&&r._addListener(t[e].cell)}))}return n.Api.register("colReorder.enable()",function(e){return this.iterator("table",function(t){t._colReorder&&t._colReorder.enable(e)})}),n.Api.register("colReorder.disable()",function(){return this.iterator("table",function(t){t._colReorder&&t._colReorder.disable()})}),n.Api.register("colReorder.move()",function(t,e){return i(this),v(this,t=Array.isArray(t)?t:[t],e)?this.tables().every(function(){a(this,t,e),l(this)}):(this.error("ColReorder - invalid move"),this)}),n.Api.register("colReorder.order()",function(t,e){return i(this),t?this.tables().every(function(){d(this,t,e)}):this.context.length?s(this):null}),n.Api.register("colReorder.reset()",function(){return i(this),this.tables().every(function(){var t=this.columns().every(function(t){return t}).flatten().toArray();d(this,t,!0)})}),n.Api.register("colReorder.transpose()",function(t,e){return i(this),c(this,t,e=e||"toCurrent")}),n.ColReorder=b,u(h).on("stateLoadInit.dt",function(t,e,r){if("dt"===t.namespace){t=new n.Api(e);if(r.colReorder)if(t.ready())d(t,r.colReorder,!0);else{m(g(r.colReorder),r.order);for(var o=0;o<r.columns.length;o++)r.columns[o]._cr_sort=r.colReorder[o];r.columns.sort(function(t,e){return t._cr_sort-e._cr_sort})}}}),u(h).on("preInit.dt",function(t,e){var r,o;"dt"===t.namespace&&(t=e.oInit.colReorder,o=n.defaults.colReorder,t||o)&&(r=u.extend({},o,t),!1!==t)&&(o=new n.Api(e),new b(o,r))}),n});
/*! Bootstrap 5 styling wrapper for ColReorder
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-colreorder'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.ColReorder ) {
				require('datatables.net-colreorder')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;




return DataTable;
}));

/*! FixedColumns 5.0.0
 * © SpryMedia Ltd - datatables.net/license
 */
!function(s){var i,o;"function"==typeof define&&define.amd?define(["jquery","datatables.net"],function(t){return s(t,window,document)}):"object"==typeof exports?(i=require("jquery"),o=function(t,e){e.fn.dataTable||require("datatables.net")(t,e)},"undefined"==typeof window?module.exports=function(t,e){return t=t||window,e=e||i(t),o(t,e),s(e,0,t.document)}:(o(window,i),module.exports=s(i,window,window.document))):s(jQuery,window,document)}(function(o,t,e){"use strict";var h,l,s,i,n=o.fn.dataTable;function d(t,e){var s,i=this;if(l&&l.versionCheck&&l.versionCheck("2"))return t=new l.Api(t),this.classes=h.extend(!0,{},d.classes),this.c=h.extend(!0,{},d.defaults,e),this.s={dt:t,rtl:"rtl"===h(t.table().node()).css("direction")},e&&void 0!==e.leftColumns&&(e.left=e.leftColumns),e&&void 0!==e.left&&(this.c[this.s.rtl?"end":"start"]=e.left),e&&void 0!==e.rightColumns&&(e.right=e.rightColumns),e&&void 0!==e.right&&(this.c[this.s.rtl?"start":"end"]=e.right),this.dom={bottomBlocker:h("<div>").addClass(this.classes.bottomBlocker),topBlocker:h("<div>").addClass(this.classes.topBlocker),scroller:h("div.dt-scroll-body",this.s.dt.table().container())},this.s.dt.settings()[0]._bInitComplete?(this._addStyles(),this._setKeyTableListener()):t.one("init.dt.dtfc",function(){i._addStyles(),i._setKeyTableListener()}),t.on("column-sizing.dt.dtfc column-reorder.dt.dtfc draw.dt.dtfc",function(){return i._addStyles()}),s=l.util.debounce(function(){i._addStyles()},50),t.on("column-visibility.dt.dtfc",function(){s()}),this.dom.scroller.on("scroll.dtfc",function(){return i._scroll()}),this._scroll(),t.settings()[0]._fixedColumns=this,t.on("destroy",function(){return i._destroy()}),this;throw new Error("FixedColumns requires DataTables 2 or newer")}function r(t,e){void 0===e&&(e=null);t=new n.Api(t),e=e||t.init().fixedColumns||n.defaults.fixedColumns;new s(t,e)}return d.prototype.end=function(t){return void 0!==t?(0<=t&&t<=this.s.dt.columns().count()&&(this.c.end=t,this._addStyles()),this):this.c.end},d.prototype.left=function(t){return this.s.rtl?this.end(t):this.start(t)},d.prototype.right=function(t){return this.s.rtl?this.start(t):this.end(t)},d.prototype.start=function(t){return void 0!==t?(0<=t&&t<=this.s.dt.columns().count()&&(this.c.start=t,this._addStyles()),this):this.c.start},d.prototype._addStyles=function(){var s=this.s.dt,i=this,o=this.s.dt.columns(":visible").count(),l=s.table().header.structure(":visible"),n=s.table().footer.structure(":visible"),d=s.columns(":visible").widths().toArray(),t=h(s.table().node()).closest("div.dt-scroll"),e=h(s.table().node()).closest("div.dt-scroll-body")[0],r=this.s.rtl,c=this.c.start,a=this.c.end,f=r?a:c,r=r?c:a,u=s.settings()[0].oBrowser.barWidth;if(0===t.length)return this;e.offsetWidth===e.clientWidth&&(u=0),s.columns(":visible").every(function(t){var e,t=s.column.index("toVisible",t);t<c?(e=i._sum(d,t),i._fixColumn(t,e,"start",l,n,u)):o-a<=t?(e=i._sum(d,o-t-1,!0),i._fixColumn(t,e,"end",l,n,u)):i._fixColumn(t,0,"none",l,n,u)}),h(s.table().node()).toggleClass(i.classes.tableFixedStart,0<c).toggleClass(i.classes.tableFixedEnd,0<a).toggleClass(i.classes.tableFixedLeft,0<f).toggleClass(i.classes.tableFixedRight,0<r);e=s.table().header(),f=s.table().footer(),r=h(e).outerHeight(),e=h(f).outerHeight();this.dom.topBlocker.appendTo(t).css("top",0).css(this.s.rtl?"left":"right",0).css("height",r).css("width",u+1).css("display",u?"block":"none"),f&&this.dom.bottomBlocker.appendTo(t).css("bottom",0).css(this.s.rtl?"left":"right",0).css("height",e).css("width",u+1).css("display",u?"block":"none")},d.prototype._destroy=function(){this.s.dt.off(".dtfc"),this.dom.scroller.off(".dtfc"),h(this.s.dt.table().node()).removeClass(this.classes.tableScrollingEnd+" "+this.classes.tableScrollingLeft+" "+this.classes.tableScrollingStart+" "+this.classes.tableScrollingRight),this.dom.bottomBlocker.remove(),this.dom.topBlocker.remove()},d.prototype._fixColumn=function(e,o,l,t,s,n){function i(t,e){var s,i;"none"===l?t.css("position","").css("left","").css("right","").removeClass(d.classes.fixedEnd+" "+d.classes.fixedLeft+" "+d.classes.fixedRight+" "+d.classes.fixedStart):(s="start"===l?"left":"right",d.s.rtl&&(s="start"===l?"right":"left"),i=o,"end"!==l||"header"!==e&&"footer"!==e||(i+=n),t.css("position","sticky").css(s,i).addClass("start"===l?d.classes.fixedStart:d.classes.fixedEnd).addClass("left"===s?d.classes.fixedLeft:d.classes.fixedRight))}var d=this,r=this.s.dt;t.forEach(function(t){t[e]&&i(h(t[e].cell),"header")}),i(r.column(e+":visible",{page:"current"}).nodes().to$(),"body"),s&&s.forEach(function(t){t[e]&&i(h(t[e].cell),"footer")})},d.prototype._scroll=function(){var t,e,s,i,o=this.dom.scroller[0];o&&(t=h(this.s.dt.table().node()).add(this.s.dt.table().header().parentNode).add(this.s.dt.table().footer().parentNode).add("div.dt-scroll-headInner table",this.s.dt.table().container()).add("div.dt-scroll-footInner table",this.s.dt.table().container()),e=o.scrollLeft,s=!this.s.rtl,i=0!==e,o=o.scrollWidth>o.clientWidth+Math.abs(e)+1,t.toggleClass(this.classes.tableScrollingStart,i),t.toggleClass(this.classes.tableScrollingEnd,o),t.toggleClass(this.classes.tableScrollingLeft,i&&s||o&&!s),t.toggleClass(this.classes.tableScrollingRight,o&&s||i&&!s))},d.prototype._setKeyTableListener=function(){var c=this;this.s.dt.on("key-focus.dt.dtfc",function(t,e,s){var i,o,l,n=h(s.node()).offset(),d=c.dom.scroller[0],r=h(h(c.s.dt.table().node()).closest("div.dt-scroll-body"));0<c.c.start&&(l=(o=h(c.s.dt.column(c.c.start-1).header())).offset(),o=o.outerWidth(),h(s.node()).hasClass(c.classes.fixedLeft)?r.scrollLeft(0):n.left<l.left+o&&(i=r.scrollLeft(),r.scrollLeft(i-(l.left+o-n.left)))),0<c.c.end&&(l=c.s.dt.columns().data().toArray().length,o=h(s.node()).outerWidth(),l=h(c.s.dt.column(l-c.c.end).header()).offset(),h(s.node()).hasClass(c.classes.fixedRight)?r.scrollLeft(d.scrollWidth-d.clientWidth):n.left+o>l.left&&(i=r.scrollLeft(),r.scrollLeft(i-(l.left-(n.left+o)))))})},d.prototype._sum=function(t,e,s){return(t=(s=void 0===s?!1:s)?t.slice().reverse():t).slice(0,e).reduce(function(t,e){return t+e},0)},d.version="5.0.0",d.classes={bottomBlocker:"dtfc-bottom-blocker",fixedEnd:"dtfc-fixed-end",fixedLeft:"dtfc-fixed-left",fixedRight:"dtfc-fixed-right",fixedStart:"dtfc-fixed-start",tableFixedEnd:"dtfc-has-end",tableFixedLeft:"dtfc-has-left",tableFixedRight:"dtfc-has-right",tableFixedStart:"dtfc-has-start",tableScrollingEnd:"dtfc-scrolling-end",tableScrollingLeft:"dtfc-scrolling-left",tableScrollingRight:"dtfc-scrolling-right",tableScrollingStart:"dtfc-scrolling-start",topBlocker:"dtfc-top-blocker"},d.defaults={i18n:{button:"FixedColumns"},start:1,end:0},s=d,l=(h=o).fn.dataTable,o.fn.dataTable.FixedColumns=s,o.fn.DataTable.FixedColumns=s,(i=n.Api.register)("fixedColumns()",function(){return this}),i("fixedColumns().start()",function(t){var e=this.context[0];return void 0!==t?(e._fixedColumns.start(t),this):e._fixedColumns.start()}),i("fixedColumns().end()",function(t){var e=this.context[0];return void 0!==t?(e._fixedColumns.end(t),this):e._fixedColumns.end()}),i("fixedColumns().left()",function(t){var e=this.context[0];return void 0!==t?(e._fixedColumns.left(t),this):e._fixedColumns.left()}),i("fixedColumns().right()",function(t){var e=this.context[0];return void 0!==t?(e._fixedColumns.right(t),this):e._fixedColumns.right()}),n.ext.buttons.fixedColumns={action:function(t,e,s,i){o(s).attr("active")?(o(s).removeAttr("active").removeClass("active"),e.fixedColumns().start(0),e.fixedColumns().end(0)):(o(s).attr("active","true").addClass("active"),e.fixedColumns().start(i.config.start),e.fixedColumns().end(i.config.end))},config:{start:1,end:0},init:function(t,e,s){void 0===t.settings()[0]._fixedColumns&&r(t.settings(),s),o(e).attr("active","true").addClass("active"),t.button(e).text(s.text||t.i18n("buttons.fixedColumns",t.settings()[0]._fixedColumns.c.i18n.button))},text:null},o(e).on("plugin-init.dt",function(t,e){"dt"!==t.namespace||!e.oInit.fixedColumns&&!n.defaults.fixedColumns||e._fixedColumns||r(e,null)}),n});
/*! Bootstrap 5 integration for DataTables' FixedColumns
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-fixedcolumns'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.FixedColumns ) {
				require('datatables.net-fixedcolumns')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;




return DataTable;
}));

/*! FixedHeader 4.0.1
 * © SpryMedia Ltd - datatables.net/license
 */
!function(o){var i,s;"function"==typeof define&&define.amd?define(["jquery","datatables.net"],function(t){return o(t,window,document)}):"object"==typeof exports?(i=require("jquery"),s=function(t,e){e.fn.dataTable||require("datatables.net")(t,e)},"undefined"==typeof window?module.exports=function(t,e){return t=t||window,e=e||i(t),s(t,e),o(e,t,t.document)}:(s(window,i),module.exports=o(i,window,window.document))):o(jQuery,window,document)}(function(b,m,v){"use strict";function s(t,e){if(!d.versionCheck("2"))throw"Warning: FixedHeader requires DataTables 2 or newer";if(!(this instanceof s))throw"FixedHeader must be initialised with the 'new' keyword.";if(!0===e&&(e={}),t=new d.Api(t),this.c=b.extend(!0,{},s.defaults,e),this.s={dt:t,position:{theadTop:0,tbodyTop:0,tfootTop:0,tfootBottom:0,width:0,left:0,tfootHeight:0,theadHeight:0,windowHeight:b(m).height(),visible:!0},headerMode:null,footerMode:null,autoWidth:t.settings()[0].oFeatures.bAutoWidth,namespace:".dtfc"+o++,scrollLeft:{header:-1,footer:-1},enable:!0,autoDisable:!1},this.dom={floatingHeader:null,thead:b(t.table().header()),tbody:b(t.table().body()),tfoot:b(t.table().footer()),header:{host:null,floating:null,floatingParent:b('<div class="dtfh-floatingparent"><div></div></div>'),placeholder:null},footer:{host:null,floating:null,floatingParent:b('<div class="dtfh-floatingparent"><div></div></div>'),placeholder:null}},this.dom.header.host=this.dom.thead.parent(),this.dom.footer.host=this.dom.tfoot.parent(),(e=t.settings()[0])._fixedHeader)throw"FixedHeader already initialised on table "+e.nTable.id;(e._fixedHeader=this)._constructor()}var d=b.fn.dataTable,o=0;return b.extend(s.prototype,{destroy:function(){var t=this.dom;this.s.dt.off(".dtfc"),b(m).off(this.s.namespace),t.header.rightBlocker&&t.header.rightBlocker.remove(),t.header.leftBlocker&&t.header.leftBlocker.remove(),t.footer.rightBlocker&&t.footer.rightBlocker.remove(),t.footer.leftBlocker&&t.footer.leftBlocker.remove(),this.c.header&&this._modeChange("in-place","header",!0),this.c.footer&&t.tfoot.length&&this._modeChange("in-place","footer",!0)},enable:function(t,e,o){this.s.enable=t,this.s.enableType=o,!e&&void 0!==e||(this._positions(),this._scroll(!0))},enabled:function(){return this.s.enable},headerOffset:function(t){return void 0!==t&&(this.c.headerOffset=t,this.update()),this.c.headerOffset},footerOffset:function(t){return void 0!==t&&(this.c.footerOffset=t,this.update()),this.c.footerOffset},update:function(t){var e=this.s.dt.table().node();(this.s.enable||this.s.autoDisable)&&(b(e).is(":visible")?(this.s.autoDisable=!1,this.enable(!0,!1)):(this.s.autoDisable=!0,this.enable(!1,!1)),0!==b(e).children("thead").length)&&(this._positions(),this._scroll(void 0===t||t),this._widths(this.dom.header),this._widths(this.dom.footer))},_constructor:function(){var o=this,i=this.s.dt,t=(b(m).on("scroll"+this.s.namespace,function(){o._scroll()}).on("resize"+this.s.namespace,d.util.throttle(function(){o.s.position.windowHeight=b(m).height(),o.update()},50)),b(".fh-fixedHeader")),t=(!this.c.headerOffset&&t.length&&(this.c.headerOffset=t.outerHeight()),b(".fh-fixedFooter"));!this.c.footerOffset&&t.length&&(this.c.footerOffset=t.outerHeight()),i.on("column-reorder.dt.dtfc column-visibility.dt.dtfc column-sizing.dt.dtfc responsive-display.dt.dtfc",function(t,e){o.update()}).on("draw.dt.dtfc",function(t,e){o.update(e!==i.settings()[0])}),i.on("destroy.dtfc",function(){o.destroy()}),this._positions(),this._scroll()},_clone:function(t,e){var o,i,s=this,d=this.s.dt,n=this.dom[t],r="header"===t?this.dom.thead:this.dom.tfoot;"footer"===t&&this._scrollEnabled()||(!e&&n.floating?n.floating.removeClass("fixedHeader-floating fixedHeader-locked"):(n.floating&&(null!==n.placeholder&&n.placeholder.remove(),n.floating.children().detach(),n.floating.remove()),e=b(d.table().node()),o=b(e.parent()),i=this._scrollEnabled(),n.floating=b(d.table().node().cloneNode(!1)).attr("aria-hidden","true").css({top:0,left:0}).removeAttr("id"),n.floatingParent.css({width:o[0].offsetWidth,overflow:"hidden",height:"fit-content",position:"fixed",left:i?e.offset().left+o.scrollLeft():0}).css("header"===t?{top:this.c.headerOffset,bottom:""}:{top:"",bottom:this.c.footerOffset}).addClass("footer"===t?"dtfh-floatingparent-foot":"dtfh-floatingparent-head").appendTo("body").children().eq(0).append(n.floating),this._stickyPosition(n.floating,"-"),(i=function(){var t=o.scrollLeft();s.s.scrollLeft={footer:t,header:t},n.floatingParent.scrollLeft(s.s.scrollLeft.header)})(),o.off("scroll.dtfh").on("scroll.dtfh",i),n.floatingParent.children().css({width:"fit-content",paddingRight:s.s.dt.settings()[0].oBrowser.barWidth}),(e=b("footer"===t?"div.dtfc-bottom-blocker":"div.dtfc-top-blocker",d.table().container())).length&&e.clone().appendTo(n.floatingParent).css({position:"fixed",right:e.width()}),n.placeholder=r.clone(!1),n.placeholder.find("*[id]").removeAttr("id"),n.host.prepend(n.placeholder),n.floating.append(r),this._widths(n)))},_stickyPosition:function(t,e){var i;this._scrollEnabled()&&(i="rtl"===b(this.s.dt.table().node()).css("direction"),t.find("th").each(function(){var t,e,o;"sticky"===b(this).css("position")&&(t=b(this).css("right"),e=b(this).css("left"),"auto"===t||i?"auto"!==e&&i&&(o=+e.replace(/px/g,""),b(this).css("left",0<o?o:0)):(o=+t.replace(/px/g,""),b(this).css("right",0<o?o:0)))}))},_horizontal:function(t,e){var o,i=this.dom[t],s=this.s.scrollLeft;i.floating&&s[t]!==e&&(this._scrollEnabled()&&(o=b(b(this.s.dt.table().node()).parent()).scrollLeft(),i.floating.scrollLeft(o),i.floatingParent.scrollLeft(o)),s[t]=e)},_modeChange:function(t,e,o){var i,s,d,n,r,a,f,h=this.dom[e],l=this.s.position,c=this._scrollEnabled();"footer"===e&&c||(i=function(t){h.floating[0].style.setProperty("width",t+"px","important"),c||h.floatingParent[0].style.setProperty("width",t+"px","important")},n=this.dom["footer"===e?"tfoot":"thead"],s=b.contains(n[0],v.activeElement)?v.activeElement:null,r=b(b(this.s.dt.table().node()).parent()),"in-place"===t?(h.placeholder&&(h.placeholder.remove(),h.placeholder=null),"header"===e?h.host.prepend(n):h.host.append(n),h.floating&&(h.floating.remove(),h.floating=null,this._stickyPosition(h.host,"+")),h.floatingParent&&(h.floatingParent.find("div.dtfc-top-blocker").remove(),h.floatingParent.remove()),b(b(h.host.parent()).parent()).scrollLeft(r.scrollLeft())):"in"===t?(this._clone(e,o),n=r.offset(),f=(d=b(v).scrollTop())+b(m).height(),a=c?n.top:l.tbodyTop,n=c?n.top+r.outerHeight():l.tfootTop,r="footer"===e?f<a?l.tfootHeight:a+l.tfootHeight-f:d+this.c.headerOffset+l.theadHeight-n,a="header"===e?"top":"bottom",f=this.c[e+"Offset"]-(0<r?r:0),h.floating.addClass("fixedHeader-floating"),h.floatingParent.css(a,f).css({left:l.left,"z-index":3}),i(l.width),"footer"===e&&h.floating.css("top","")):"below"===t?(this._clone(e,o),h.floating.addClass("fixedHeader-locked"),h.floatingParent.css({position:"absolute",top:l.tfootTop-l.theadHeight,left:l.left+"px"}),i(l.width)):"above"===t&&(this._clone(e,o),h.floating.addClass("fixedHeader-locked"),h.floatingParent.css({position:"absolute",top:l.tbodyTop,left:l.left+"px"}),i(l.width)),s&&s!==v.activeElement&&setTimeout(function(){s.focus()},10),this.s.scrollLeft.header=-1,this.s.scrollLeft.footer=-1,this.s[e+"Mode"]=t)},_positions:function(){var t=this.s.dt,e=t.table(),o=this.s.position,i=this.dom,e=b(e.node()),s=this._scrollEnabled(),d=b(t.table().header()),t=b(t.table().footer()),i=i.tbody,n=e.parent();o.visible=e.is(":visible"),o.width=e.outerWidth(),o.left=e.offset().left,o.theadTop=d.offset().top,o.tbodyTop=(s?n:i).offset().top,o.tbodyHeight=(s?n:i).outerHeight(),o.theadHeight=d.outerHeight(),o.theadBottom=o.theadTop+o.theadHeight,o.tfootTop=o.tbodyTop+o.tbodyHeight,t.length?(o.tfootBottom=o.tfootTop+t.outerHeight(),o.tfootHeight=t.outerHeight()):(o.tfootBottom=o.tfootTop,o.tfootHeight=0)},_scroll:function(t){var e,o,i,s,d,n,r,a,f,h,l,c,p,g,u;this.s.dt.settings()[0].bDestroying||(e=this._scrollEnabled(),i=(o=b(this.s.dt.table().node()).parent()).offset(),h=o.outerHeight(),s=b(v).scrollLeft(),d=b(v).scrollTop(),n=b(m).height()+d,l=this.s.position,c=e?i.top:l.tbodyTop,a=(e?i:l).left,h=e?i.top+h:l.tfootTop,f=e?o.outerWidth():l.tbodyWidth,this.c.header&&(!this.s.enable||!l.visible||d+this.c.headerOffset+l.theadHeight<=c?r="in-place":d+this.c.headerOffset+l.theadHeight>c&&d+this.c.headerOffset+l.theadHeight<h?(r="in",d+this.c.headerOffset+l.theadHeight>h||void 0===this.dom.header.floatingParent?t=!0:this.dom.header.floatingParent.css({top:this.c.headerOffset,position:"fixed"}).children().eq(0).append(this.dom.header.floating)):r="below",!t&&r===this.s.headerMode||this._modeChange(r,"header",t),this._horizontal("header",s)),p={offset:{top:0,left:0},height:0},g={offset:{top:0,left:0},height:0},this.c.footer&&this.dom.tfoot.length&&this.dom.tfoot.find("th, td").length&&(!this.s.enable||!l.visible||l.tfootBottom+this.c.footerOffset<=n?u="in-place":h+l.tfootHeight+this.c.footerOffset>n&&c+this.c.footerOffset<n?(u="in",t=!0):u="above",!t&&u===this.s.footerMode||this._modeChange(u,"footer",t),this._horizontal("footer",s),h=function(t){return{offset:t.offset(),height:t.outerHeight()}},p=this.dom.header.floating?h(this.dom.header.floating):h(this.dom.thead),g=this.dom.footer.floating?h(this.dom.footer.floating):h(this.dom.tfoot),e)&&g.offset.top>d&&(c=n+((l=d-i.top)>-p.height?l:0)-(p.offset.top+(l<-p.height?p.height:0)+g.height),o.outerHeight(c=c<0?0:c),Math.round(o.outerHeight())>=Math.round(c)?b(this.dom.tfoot.parent()).addClass("fixedHeader-floating"):b(this.dom.tfoot.parent()).removeClass("fixedHeader-floating")),this.dom.header.floating&&this.dom.header.floatingParent.css("left",a-s),this.dom.footer.floating&&this.dom.footer.floatingParent.css("left",a-s),void 0!==this.s.dt.settings()[0]._fixedColumns&&(this.dom.header.rightBlocker=(u=function(t,e,o){var i;return null!==(o=void 0===o?0===(i=b("div.dtfc-"+t+"-"+e+"-blocker")).length?null:i.clone().css("z-index",1):o)&&("in"===r||"below"===r?o.appendTo("body").css({top:("top"===e?p:g).offset.top,left:"right"===t?a+f-o.width():a}):o.detach()),o})("right","top",this.dom.header.rightBlocker),this.dom.header.leftBlocker=u("left","top",this.dom.header.leftBlocker),this.dom.footer.rightBlocker=u("right","bottom",this.dom.footer.rightBlocker),this.dom.footer.leftBlocker=u("left","bottom",this.dom.footer.leftBlocker)))},_scrollEnabled:function(){var t=this.s.dt.settings()[0].oScroll;return""!==t.sY||""!==t.sX},_widths:function(t){if(t&&t.placeholder)for(var e=b(this.s.dt.table().node()),o=b(e.parent()),i=(t.floatingParent.css("width",o[0].offsetWidth),t.floating.css("width",e[0].offsetWidth),b("colgroup",t.floating).remove(),t.placeholder.parent().find("colgroup").clone().appendTo(t.floating).find("col")),s=this.s.dt.columns(":visible").widths(),d=0;d<s.length;d++)i.eq(d).css("width",s[d])}}),s.version="4.0.1",s.defaults={header:!0,footer:!1,headerOffset:0,footerOffset:0},b.fn.dataTable.FixedHeader=s,b.fn.DataTable.FixedHeader=s,b(v).on("init.dt.dtfh",function(t,e,o){var i;"dt"===t.namespace&&(t=e.oInit.fixedHeader,i=d.defaults.fixedHeader,t||i)&&!e._fixedHeader&&(i=b.extend({},i,t),!1!==t)&&new s(e,i)}),d.Api.register("fixedHeader()",function(){}),d.Api.register("fixedHeader.adjust()",function(){return this.iterator("table",function(t){t=t._fixedHeader;t&&t.update()})}),d.Api.register("fixedHeader.enable()",function(e){return this.iterator("table",function(t){t=t._fixedHeader;e=void 0===e||e,t&&e!==t.enabled()&&t.enable(e)})}),d.Api.register("fixedHeader.enabled()",function(){if(this.context.length){var t=this.context[0]._fixedHeader;if(t)return t.enabled()}return!1}),d.Api.register("fixedHeader.disable()",function(){return this.iterator("table",function(t){t=t._fixedHeader;t&&t.enabled()&&t.enable(!1)})}),b.each(["header","footer"],function(t,o){d.Api.register("fixedHeader."+o+"Offset()",function(e){var t=this.context;return void 0===e?t.length&&t[0]._fixedHeader?t[0]._fixedHeader[o+"Offset"]():void 0:this.iterator("table",function(t){t=t._fixedHeader;t&&t[o+"Offset"](e)})})}),d});
/*! Bootstrap 5 styling wrapper for FixedHeader
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-fixedheader'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.FixedHeader ) {
				require('datatables.net-fixedheader')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;




return DataTable;
}));

/*! Responsive 3.0.2
 * © SpryMedia Ltd - datatables.net/license
 */
!function(n){var i,r;"function"==typeof define&&define.amd?define(["jquery","datatables.net"],function(e){return n(e,window,document)}):"object"==typeof exports?(i=require("jquery"),r=function(e,t){t.fn.dataTable||require("datatables.net")(e,t)},"undefined"==typeof window?module.exports=function(e,t){return e=e||window,t=t||i(e),r(e,t),n(t,e,e.document)}:(r(window,i),module.exports=n(i,window,window.document))):n(jQuery,window,document)}(function(b,y,d){"use strict";function a(e,t){if(!i.versionCheck||!i.versionCheck("2"))throw"DataTables Responsive requires DataTables 2 or newer";this.s={childNodeStore:{},columns:[],current:[],dt:new i.Api(e)},this.s.dt.settings()[0].responsive||(t&&"string"==typeof t.details?t.details={type:t.details}:t&&!1===t.details?t.details={type:!1}:t&&!0===t.details&&(t.details={type:"inline"}),this.c=b.extend(!0,{},a.defaults,i.defaults.responsive,t),(e.responsive=this)._constructor())}var i=b.fn.dataTable,e=(b.extend(a.prototype,{_constructor:function(){var o=this,r=this.s.dt,t=b(y).innerWidth(),e=(r.settings()[0]._responsive=this,b(y).on("orientationchange.dtr",i.util.throttle(function(){var e=b(y).innerWidth();e!==t&&(o._resize(),t=e)})),r.on("row-created.dtr",function(e,t,n,i){-1!==b.inArray(!1,o.s.current)&&b(">td, >th",t).each(function(e){e=r.column.index("toData",e);!1===o.s.current[e]&&b(this).css("display","none").addClass("dtr-hidden")})}),r.on("destroy.dtr",function(){r.off(".dtr"),b(r.table().body()).off(".dtr"),b(y).off("resize.dtr orientationchange.dtr"),r.cells(".dtr-control").nodes().to$().removeClass("dtr-control"),b(r.table().node()).removeClass("dtr-inline collapsed"),b.each(o.s.current,function(e,t){!1===t&&o._setColumnVis(e,!0)})}),this.c.breakpoints.sort(function(e,t){return e.width<t.width?1:e.width>t.width?-1:0}),this._classLogic(),this._resizeAuto(),this.c.details);!1!==e.type&&(o._detailsInit(),r.on("column-visibility.dtr",function(){o._timer&&clearTimeout(o._timer),o._timer=setTimeout(function(){o._timer=null,o._classLogic(),o._resizeAuto(),o._resize(!0),o._redrawChildren()},100)}),r.on("draw.dtr",function(){o._redrawChildren()}),b(r.table().node()).addClass("dtr-"+e.type)),r.on("column-reorder.dtr",function(e,t,n){o._classLogic(),o._resizeAuto(),o._resize(!0)}),r.on("column-sizing.dtr",function(){o._resizeAuto(),o._resize()}),r.on("column-calc.dt",function(e,t){for(var n=o.s.current,i=0;i<n.length;i++){var r=t.visible.indexOf(i);!1===n[i]&&0<=r&&t.visible.splice(r,1)}}),r.on("preXhr.dtr",function(){var e=[];r.rows().every(function(){this.child.isShown()&&e.push(this.id(!0))}),r.one("draw.dtr",function(){o._resizeAuto(),o._resize(),r.rows(e).every(function(){o._detailsDisplay(this,!1)})})}),r.on("draw.dtr",function(){o._controlClass()}).on("init.dtr",function(e,t,n){"dt"===e.namespace&&(o._resizeAuto(),o._resize())}),this._resize()},_colGroupAttach:function(e,t,n){var i=null;if(t[n].get(0).parentNode!==e[0]){for(var r=n+1;r<t.length;r++)if(e[0]===t[r].get(0).parentNode){i=r;break}null!==i?t[n].insertBefore(t[i][0]):e.append(t[n])}},_childNodes:function(e,t,n){var i=t+"-"+n;if(this.s.childNodeStore[i])return this.s.childNodeStore[i];for(var r=[],o=e.cell(t,n).node().childNodes,s=0,d=o.length;s<d;s++)r.push(o[s]);return this.s.childNodeStore[i]=r},_childNodesRestore:function(e,t,n){var i=t+"-"+n;if(this.s.childNodeStore[i]){var r=e.cell(t,n).node(),e=this.s.childNodeStore[i];if(0<e.length){for(var o=e[0].parentNode.childNodes,s=[],d=0,a=o.length;d<a;d++)s.push(o[d]);for(var l=0,c=s.length;l<c;l++)r.appendChild(s[l])}this.s.childNodeStore[i]=void 0}},_columnsVisiblity:function(n){for(var i=this.s.dt,e=this.s.columns,t=e.map(function(e,t){return{columnIdx:t,priority:e.priority}}).sort(function(e,t){return e.priority!==t.priority?e.priority-t.priority:e.columnIdx-t.columnIdx}),r=b.map(e,function(e,t){return!1===i.column(t).visible()?"not-visible":(!e.auto||null!==e.minWidth)&&(!0===e.auto?"-":-1!==b.inArray(n,e.includeIn))}),o=0,s=0,d=r.length;s<d;s++)!0===r[s]&&(o+=e[s].minWidth);var a=i.settings()[0].oScroll,a=a.sY||a.sX?a.iBarWidth:0,l=i.table().container().offsetWidth-a-o;for(s=0,d=r.length;s<d;s++)e[s].control&&(l-=e[s].minWidth);var c=!1;for(s=0,d=t.length;s<d;s++){var u=t[s].columnIdx;"-"===r[u]&&!e[u].control&&e[u].minWidth&&(c||l-e[u].minWidth<0?r[u]=!(c=!0):r[u]=!0,l-=e[u].minWidth)}var h=!1;for(s=0,d=e.length;s<d;s++)if(!e[s].control&&!e[s].never&&!1===r[s]){h=!0;break}for(s=0,d=e.length;s<d;s++)e[s].control&&(r[s]=h),"not-visible"===r[s]&&(r[s]=!1);return-1===b.inArray(!0,r)&&(r[0]=!0),r},_classLogic:function(){function d(e,t,n,i){var r,o,s;if(n){if("max-"===n)for(r=a._find(t).width,o=0,s=l.length;o<s;o++)l[o].width<=r&&u(e,l[o].name);else if("min-"===n)for(r=a._find(t).width,o=0,s=l.length;o<s;o++)l[o].width>=r&&u(e,l[o].name);else if("not-"===n)for(o=0,s=l.length;o<s;o++)-1===l[o].name.indexOf(i)&&u(e,l[o].name)}else c[e].includeIn.push(t)}var a=this,l=this.c.breakpoints,c=this.s.dt.columns().eq(0).map(function(e){var e=this.column(e),t=e.header().className,n=e.init().responsivePriority,e=e.header().getAttribute("data-priority");return void 0===n&&(n=null==e?1e4:+e),{className:t,includeIn:[],auto:!1,control:!1,never:!!t.match(/\b(dtr\-)?never\b/),priority:n}}),u=function(e,t){e=c[e].includeIn;-1===b.inArray(t,e)&&e.push(t)};c.each(function(e,r){for(var t=e.className.split(" "),o=!1,n=0,i=t.length;n<i;n++){var s=t[n].trim();if("all"===s||"dtr-all"===s)return o=!0,void(e.includeIn=b.map(l,function(e){return e.name}));if("none"===s||"dtr-none"===s||e.never)return void(o=!0);if("control"===s||"dtr-control"===s)return o=!0,void(e.control=!0);b.each(l,function(e,t){var n=t.name.split("-"),i=new RegExp("(min\\-|max\\-|not\\-)?("+n[0]+")(\\-[_a-zA-Z0-9])?"),i=s.match(i);i&&(o=!0,i[2]===n[0]&&i[3]==="-"+n[1]?d(r,t.name,i[1],i[2]+i[3]):i[2]!==n[0]||i[3]||d(r,t.name,i[1],i[2]))})}o||(e.auto=!0)}),this.s.columns=c},_controlClass:function(){var e,t,n;"inline"===this.c.details.type&&(e=this.s.dt,t=this.s.current,n=b.inArray(!0,t),e.cells(null,function(e){return e!==n},{page:"current"}).nodes().to$().filter(".dtr-control").removeClass("dtr-control"),e.cells(null,n,{page:"current"}).nodes().to$().addClass("dtr-control"))},_detailsDisplay:function(t,n){function e(e){b(t.node()).toggleClass("dtr-expanded",!1!==e),b(o.table().node()).triggerHandler("responsive-display.dt",[o,t,e,n])}var i,r=this,o=this.s.dt,s=this.c.details;s&&!1!==s.type&&(i="string"==typeof s.renderer?a.renderer[s.renderer]():s.renderer,"boolean"==typeof(s=s.display(t,n,function(){return i.call(r,o,t[0][0],r._detailsObj(t[0]))},function(){e(!1)})))&&e(s)},_detailsInit:function(){var n=this,i=this.s.dt,e=this.c.details,r=("inline"===e.type&&(e.target="td.dtr-control, th.dtr-control"),i.on("draw.dtr",function(){n._tabIndexes()}),n._tabIndexes(),b(i.table().body()).on("keyup.dtr","td, th",function(e){13===e.keyCode&&b(this).data("dtr-keyboard")&&b(this).click()}),e.target),e="string"==typeof r?r:"td, th";void 0===r&&null===r||b(i.table().body()).on("click.dtr mousedown.dtr mouseup.dtr",e,function(e){if(b(i.table().node()).hasClass("collapsed")&&-1!==b.inArray(b(this).closest("tr").get(0),i.rows().nodes().toArray())){if("number"==typeof r){var t=r<0?i.columns().eq(0).length+r:r;if(i.cell(this).index().column!==t)return}t=i.row(b(this).closest("tr"));"click"===e.type?n._detailsDisplay(t,!1):"mousedown"===e.type?b(this).css("outline","none"):"mouseup"===e.type&&b(this).trigger("blur").css("outline","")}})},_detailsObj:function(n){var i=this,r=this.s.dt;return b.map(this.s.columns,function(e,t){if(!e.never&&!e.control)return{className:r.settings()[0].aoColumns[t].sClass,columnIndex:t,data:r.cell(n,t).render(i.c.orthogonal),hidden:r.column(t).visible()&&!i.s.current[t],rowIndex:n,title:r.column(t).title()}})},_find:function(e){for(var t=this.c.breakpoints,n=0,i=t.length;n<i;n++)if(t[n].name===e)return t[n]},_redrawChildren:function(){var n=this,i=this.s.dt;i.rows({page:"current"}).iterator("row",function(e,t){n._detailsDisplay(i.row(t),!0)})},_resize:function(n){for(var e,i=this,r=this.s.dt,t=b(y).innerWidth(),o=this.c.breakpoints,s=o[0].name,d=this.s.columns,a=this.s.current.slice(),l=o.length-1;0<=l;l--)if(t<=o[l].width){s=o[l].name;break}var c=this._columnsVisiblity(s),u=(this.s.current=c,!1);for(l=0,e=d.length;l<e;l++)if(!1===c[l]&&!d[l].never&&!d[l].control&&!1==!r.column(l).visible()){u=!0;break}b(r.table().node()).toggleClass("collapsed",u);var h=!1,p=0,f=r.settings()[0],m=b(r.table().node()).children("colgroup"),v=f.aoColumns.map(function(e){return e.colEl});r.columns().eq(0).each(function(e,t){r.column(e).visible()&&(!0===c[t]&&p++,!n&&c[t]===a[t]||(h=!0,i._setColumnVis(e,c[t])),c[t]?i._colGroupAttach(m,v,t):v[t].detach())}),h&&(r.columns.adjust(),this._redrawChildren(),b(r.table().node()).trigger("responsive-resize.dt",[r,this._responsiveOnlyHidden()]),0===r.page.info().recordsDisplay)&&b("td",r.table().body()).eq(0).attr("colspan",p),i._controlClass()},_resizeAuto:function(){var t=this.s.dt,n=this.s.columns,r=this,o=t.columns().indexes().filter(function(e){return t.column(e).visible()});if(this.c.auto&&-1!==b.inArray(!0,b.map(n,function(e){return e.auto}))){for(var e=t.table().node().cloneNode(!1),i=b(t.table().header().cloneNode(!1)).appendTo(e),s=b(t.table().footer().cloneNode(!1)).appendTo(e),d=b(t.table().body()).clone(!1,!1).empty().appendTo(e),a=(e.style.width="auto",t.table().header.structure(o).forEach(e=>{e=e.filter(function(e){return!!e}).map(function(e){return b(e.cell).clone(!1).css("display","table-cell").css("width","auto").css("min-width",0)});b("<tr/>").append(e).appendTo(i)}),b("<tr/>").appendTo(d)),l=0;l<o.count();l++)a.append("<td/>");t.rows({page:"current"}).every(function(n){var i,e=this.node();e&&(i=e.cloneNode(!1),t.cells(n,o).every(function(e,t){t=r.s.childNodeStore[n+"-"+t];(t?b(this.node().cloneNode(!1)).append(b(t).clone()):b(this.node()).clone(!1)).appendTo(i)}),d.append(i))}),d.find("th, td").css("display",""),t.table().footer.structure(o).forEach(e=>{e=e.filter(function(e){return!!e}).map(function(e){return b(e.cell).clone(!1).css("display","table-cell").css("width","auto").css("min-width",0)});b("<tr/>").append(e).appendTo(s)}),"inline"===this.c.details.type&&b(e).addClass("dtr-inline collapsed"),b(e).find("[name]").removeAttr("name"),b(e).css("position","relative");e=b("<div/>").css({width:1,height:1,overflow:"hidden",clear:"both"}).append(e);e.insertBefore(t.table().node()),a.children().each(function(e){e=t.column.index("fromVisible",e);n[e].minWidth=this.offsetWidth||0}),e.remove()}},_responsiveOnlyHidden:function(){var n=this.s.dt;return b.map(this.s.current,function(e,t){return!1===n.column(t).visible()||e})},_setColumnVis:function(e,t){var n=this,i=this.s.dt,r=t?"":"none";this._setHeaderVis(e,t,i.table().header.structure()),this._setHeaderVis(e,t,i.table().footer.structure()),i.column(e).nodes().to$().css("display",r).toggleClass("dtr-hidden",!t),b.isEmptyObject(this.s.childNodeStore)||i.cells(null,e).indexes().each(function(e){n._childNodesRestore(i,e.row,e.column)})},_setHeaderVis:function(n,i,e){var r=this,o=i?"":"none";e.forEach(function(e){if(e[n])b(e[n].cell).css("display",o).toggleClass("dtr-hidden",!i);else for(var t=n;0<=t;){if(e[t]){e[t].cell.colSpan=r._colspan(e,t);break}t--}})},_colspan:function(e,t){for(var n=1,i=t+1;i<e.length;i++)if(null===e[i]&&this.s.current[i])n++;else if(e[i])break;return n},_tabIndexes:function(){var e=this.s.dt,t=e.cells({page:"current"}).nodes().to$(),n=e.settings()[0],i=this.c.details.target;t.filter("[data-dtr-keyboard]").removeData("[data-dtr-keyboard]"),("number"==typeof i?e.cells(null,i,{page:"current"}).nodes().to$():b(i="td:first-child, th:first-child"===i?">td:first-child, >th:first-child":i,e.rows({page:"current"}).nodes())).attr("tabIndex",n.iTabIndex).data("dtr-keyboard",1)}}),a.defaults={breakpoints:a.breakpoints=[{name:"desktop",width:1/0},{name:"tablet-l",width:1024},{name:"tablet-p",width:768},{name:"mobile-l",width:480},{name:"mobile-p",width:320}],auto:!0,details:{display:(a.display={childRow:function(e,t,n){var i=b(e.node());return t?i.hasClass("dtr-expanded")?(e.child(n(),"child").show(),!0):void 0:i.hasClass("dtr-expanded")?(e.child(!1),!1):!1!==(t=n())&&(e.child(t,"child").show(),!0)},childRowImmediate:function(e,t,n){var i=b(e.node());return!t&&i.hasClass("dtr-expanded")||!e.responsive.hasHidden()?(e.child(!1),!1):!1!==(t=n())&&(e.child(t,"child").show(),!0)},modal:function(s){return function(e,t,n,i){n=n();if(!1===n)return!1;if(t){if(!(o=b("div.dtr-modal-content")).length||e.index()!==o.data("dtr-row-idx"))return null;o.empty().append(n)}else{var r=function(){o.remove(),b(d).off("keypress.dtr"),b(e.node()).removeClass("dtr-expanded"),i()},o=b('<div class="dtr-modal"/>').append(b('<div class="dtr-modal-display"/>').append(b('<div class="dtr-modal-content"/>').data("dtr-row-idx",e.index()).append(n)).append(b('<div class="dtr-modal-close">&times;</div>').click(function(){r()}))).append(b('<div class="dtr-modal-background"/>').click(function(){r()})).appendTo("body");b(e.node()).addClass("dtr-expanded"),b(d).on("keyup.dtr",function(e){27===e.keyCode&&(e.stopPropagation(),r())})}return s&&s.header&&b("div.dtr-modal-content").prepend("<h2>"+s.header(e)+"</h2>"),!0}}}).childRow,renderer:(a.renderer={listHiddenNodes:function(){return function(i,e,t){var r=this,o=b('<ul data-dtr-index="'+e+'" class="dtr-details"/>'),s=!1;return b.each(t,function(e,t){var n;t.hidden&&(n=t.className?'class="'+t.className+'"':"",b("<li "+n+' data-dtr-index="'+t.columnIndex+'" data-dt-row="'+t.rowIndex+'" data-dt-column="'+t.columnIndex+'"><span class="dtr-title">'+t.title+"</span> </li>").append(b('<span class="dtr-data"/>').append(r._childNodes(i,t.rowIndex,t.columnIndex))).appendTo(o),s=!0)}),!!s&&o}},listHidden:function(){return function(e,t,n){n=b.map(n,function(e){var t=e.className?'class="'+e.className+'"':"";return e.hidden?"<li "+t+' data-dtr-index="'+e.columnIndex+'" data-dt-row="'+e.rowIndex+'" data-dt-column="'+e.columnIndex+'"><span class="dtr-title">'+e.title+'</span> <span class="dtr-data">'+e.data+"</span></li>":""}).join("");return!!n&&b('<ul data-dtr-index="'+t+'" class="dtr-details"/>').append(n)}},tableAll:function(i){return i=b.extend({tableClass:""},i),function(e,t,n){n=b.map(n,function(e){return"<tr "+(e.className?'class="'+e.className+'"':"")+' data-dt-row="'+e.rowIndex+'" data-dt-column="'+e.columnIndex+'"><td>'+e.title+":</td> <td>"+e.data+"</td></tr>"}).join("");return b('<table class="'+i.tableClass+' dtr-details" width="100%"/>').append(n)}}}).listHidden(),target:0,type:"inline"},orthogonal:"display"},b.fn.dataTable.Api);return e.register("responsive()",function(){return this}),e.register("responsive.index()",function(e){return{column:(e=b(e)).data("dtr-index"),row:e.parent().data("dtr-index")}}),e.register("responsive.rebuild()",function(){return this.iterator("table",function(e){e._responsive&&e._responsive._classLogic()})}),e.register("responsive.recalc()",function(){return this.iterator("table",function(e){e._responsive&&(e._responsive._resizeAuto(),e._responsive._resize())})}),e.register("responsive.hasHidden()",function(){var e=this.context[0];return!!e._responsive&&-1!==b.inArray(!1,e._responsive._responsiveOnlyHidden())}),e.registerPlural("columns().responsiveHidden()","column().responsiveHidden()",function(){return this.iterator("column",function(e,t){return!!e._responsive&&e._responsive._responsiveOnlyHidden()[t]},1)}),a.version="3.0.2",b.fn.dataTable.Responsive=a,b.fn.DataTable.Responsive=a,b(d).on("preInit.dt.dtr",function(e,t,n){"dt"===e.namespace&&(b(t.nTable).hasClass("responsive")||b(t.nTable).hasClass("dt-responsive")||t.oInit.responsive||i.defaults.responsive)&&!1!==(e=t.oInit.responsive)&&new a(t,b.isPlainObject(e)?e:{})}),i});
/*! Bootstrap 5 integration for DataTables' Responsive
 * © SpryMedia Ltd - datatables.net/license
 */
!function(n){var o,t;"function"==typeof define&&define.amd?define(["jquery","datatables.net-bs5","datatables.net-responsive"],function(e){return n(e,window,document)}):"object"==typeof exports?(o=require("jquery"),t=function(e,d){d.fn.dataTable||require("datatables.net-bs5")(e,d),d.fn.dataTable.Responsive||require("datatables.net-responsive")(e,d)},"undefined"==typeof window?module.exports=function(e,d){return e=e||window,d=d||o(e),t(e,d),n(d,e,e.document)}:(t(window,o),module.exports=n(o,window,window.document))):n(jQuery,window,document)}(function(r,e,l){"use strict";var u,d=r.fn.dataTable,n=d.Responsive.display,f=n.modal,p=r('<div class="modal fade dtr-bs-modal" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"/></div></div></div>'),o=e.bootstrap;return d.Responsive.bootstrap=function(e){o=e},n.modal=function(s){return!u&&o.Modal&&(u=new o.Modal(p[0])),function(e,d,n,o){if(u){var t,a,i=n();if(!1===i)return!1;if(d){if(!r.contains(l,p[0])||e.index()!==p.data("dtr-row-idx"))return null;p.find("div.modal-body").empty().append(i)}else s&&s.header&&(a=(t=p.find("div.modal-header")).find("button").detach(),t.empty().append('<h4 class="modal-title">'+s.header(e)+"</h4>").append(a)),p.find("div.modal-body").empty().append(i),p.data("dtr-row-idx",e.index()).one("hidden.bs.modal",o).appendTo("body"),u.show();return!0}return f(e,d,n,o)}},d});
/*! RowGroup 1.5.0
 * © SpryMedia Ltd - datatables.net/license
 */
!function(e){var n,o;"function"==typeof define&&define.amd?define(["jquery","datatables.net"],function(t){return e(t,window,document)}):"object"==typeof exports?(n=require("jquery"),o=function(t,r){r.fn.dataTable||require("datatables.net")(t,r)},"undefined"==typeof window?module.exports=function(t,r){return t=t||window,r=r||n(t),o(t,r),e(r,0,t.document)}:(o(window,n),module.exports=e(n,window,window.document))):e(jQuery,window,document)}(function(i,t,r){"use strict";function a(t,r){if(!l.versionCheck||!l.versionCheck("1.11"))throw"RowGroup requires DataTables 1.11 or newer";if(this.c=i.extend(!0,{},l.defaults.rowGroup,a.defaults,r),this.s={dt:new l.Api(t)},this.dom={},r=this.s.dt.settings()[0],t=r.rowGroup)return t;(r.rowGroup=this)._constructor()}var l=i.fn.dataTable;return i.extend(a.prototype,{dataSrc:function(t){var r;return void 0===t?this.c.dataSrc:(r=this.s.dt,this.c.dataSrc=t,i(r.table().node()).triggerHandler("rowgroup-datasrc.dt",[r,t]),this)},disable:function(){return this.c.enable=!1,this},enable:function(t){return!1===t?this.disable():(this.c.enable=!0,this)},enabled:function(){return this.c.enable},_constructor:function(){var e=this,t=this.s.dt,n=t.settings()[0];t.on("draw.dtrg",function(t,r){e.c.enable&&n===r&&e._draw()}),t.on("column-visibility.dt.dtrg responsive-resize.dt.dtrg",function(){e._adjustColspan()}),t.on("destroy",function(){t.off(".dtrg")})},_adjustColspan:function(){i("tr."+this.c.className,this.s.dt.table().body()).find("th:visible, td:visible").attr("colspan",this._colspan())},_colspan:function(){return this.s.dt.columns().visible().reduce(function(t,r){return t+r},0)},_draw:function(){var t=this.s.dt,t=this._group(0,t.rows({page:"current"}).indexes());this._groupDisplay(0,t)},_group:function(t,r){for(var e,n=Array.isArray(this.c.dataSrc)?this.c.dataSrc:[this.c.dataSrc],o=l.util.get(n[t]),i=this.s.dt,a=[],s=0,d=r.length;s<d;s++){var u,c=r[s];null==(u=o(i.row(c).data(),t))&&(u=this.c.emptyDataGroup),void 0!==e&&u===e||(a.push({dataPoint:u,rows:[]}),e=u),a[a.length-1].rows.push(c)}if(void 0!==n[t+1])for(s=0,d=a.length;s<d;s++)a[s].children=this._group(t+1,a[s].rows);return a},_groupDisplay:function(t,r){for(var e,n=this.s.dt,o=0,i=r.length;o<i;o++){var a,s=r[o],d=s.dataPoint,u=s.rows;this.c.startRender&&(e=this.c.startRender.call(this,n.rows(u),d,t),a=this._rowWrap(e,this.c.startClassName,t))&&a.insertBefore(n.row(u[0]).node()),this.c.endRender&&(e=this.c.endRender.call(this,n.rows(u),d,t),a=this._rowWrap(e,this.c.endClassName,t))&&a.insertAfter(n.row(u[u.length-1]).node()),s.children&&this._groupDisplay(t+1,s.children)}},_rowWrap:function(t,r,e){return null==(t=null!==t&&""!==t?t:this.c.emptyDataGroup)?null:("object"==typeof t&&t.nodeName&&"tr"===t.nodeName.toLowerCase()?i(t):t instanceof i&&t.length&&"tr"===t[0].nodeName.toLowerCase()?t:i("<tr/>").append(i("<th/>").attr("colspan",this._colspan()).attr("scope","row").append(t))).addClass(this.c.className).addClass(r).addClass("dtrg-level-"+e)}}),a.defaults={className:"dtrg-group",dataSrc:0,emptyDataGroup:"No group",enable:!0,endClassName:"dtrg-end",endRender:null,startClassName:"dtrg-start",startRender:function(t,r){return r}},a.version="1.5.0",i.fn.dataTable.RowGroup=a,i.fn.DataTable.RowGroup=a,l.Api.register("rowGroup()",function(){return this}),l.Api.register("rowGroup().disable()",function(){return this.iterator("table",function(t){t.rowGroup&&t.rowGroup.enable(!1)})}),l.Api.register("rowGroup().enable()",function(r){return this.iterator("table",function(t){t.rowGroup&&t.rowGroup.enable(void 0===r||r)})}),l.Api.register("rowGroup().enabled()",function(){var t=this.context;return!(!t.length||!t[0].rowGroup)&&t[0].rowGroup.enabled()}),l.Api.register("rowGroup().dataSrc()",function(r){return void 0===r?this.context[0].rowGroup.dataSrc():this.iterator("table",function(t){t.rowGroup&&t.rowGroup.dataSrc(r)})}),i(r).on("preInit.dt.dtrg",function(t,r,e){var n,o;"dt"===t.namespace&&(t=r.oInit.rowGroup,n=l.defaults.rowGroup,t||n)&&(o=i.extend({},n,t),!1!==t)&&new a(r,o)}),l});
/*! Bootstrap 5 styling wrapper for RowGroup
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-rowgroup'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.RowGroup ) {
				require('datatables.net-rowgroup')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;




return DataTable;
}));

/*! RowReorder 1.5.0
 * © SpryMedia Ltd - datatables.net/license
 */
/*! Bootstrap 5 styling wrapper for RowReorder
 * © SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net-bs5', 'datatables.net-rowreorder'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net-bs5')(root, $);
			}

			if ( ! $.fn.dataTable.RowReorder ) {
				require('datatables.net-rowreorder')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;




return DataTable;
}));

/*! Scroller 2.4.3
 * © SpryMedia Ltd - datatables.net/license
 */
/*! Select for DataTables 2.0.3
 * © SpryMedia Ltd - datatables.net/license/mit
 */
/*! DateTime picker for DataTables.net v1.5.3
 *
 * © SpryMedia Ltd, all rights reserved.
 * License: MIT datatables.net/license/mit
 */
/*! © SpryMedia Ltd, Matthew Hasbach - datatables.net/license */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if ( ! $.fn.dataTable ) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if ( ! root ) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if ( ! $ ) {
					$ = jq( root );
				}

				cjsRequires( root, $ );
				return factory( $, root, root.document );
			};
		}
		else {
			cjsRequires( window, jq );
			module.exports = factory( jq, window, window.document );
		}
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document ) {
'use strict';
var DataTable = $.fn.dataTable;


/**
 * @summary     ConditionalPaging
 * @description Hide paging controls when the amount of pages is <= 1
 * @version     1.0.0
 * @author      Matthew Hasbach (https://github.com/mjhasbach)
 * @copyright   Copyright 2015 Matthew Hasbach
 *
 * License      MIT - http://datatables.net/license/mit
 *
 * This feature plugin for DataTables hides paging controls when the amount
 * of pages is <= 1. The controls can either appear / disappear or fade in / out
 *
 * @example
 *    $('#myTable').DataTable({
 *        conditionalPaging: true
 *    });
 *
 * @example
 *    $('#myTable').DataTable({
 *        conditionalPaging: {
 *            style: 'fade',
 *            speed: 500 // optional
 *        }
 *    });
 */
$(document).on('init.dt', function (e, dtSettings) {
    if (e.namespace !== 'dt') {
        return;
    }
    var options = dtSettings.oInit.conditionalPaging ||
        DataTable.defaults.conditionalPaging;
    if ($.isPlainObject(options) || options === true) {
        var config = $.isPlainObject(options) ? options : {}, api = new DataTable.Api(dtSettings), speed = 500, conditionalPaging = function (e) {
            var $paging = $(api.table().container()).find('div.dt-paging'), pages = api.page.info().pages;
            if (e instanceof $.Event) {
                if (pages <= 1) {
                    if (config.style === 'fade') {
                        $paging.stop().fadeTo(speed, 0);
                    }
                    else {
                        $paging.css('visibility', 'hidden');
    }