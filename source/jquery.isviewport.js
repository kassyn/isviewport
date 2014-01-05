/*!
 Name    : jQuery.isViewPort
 Version : 1.0
 License : MIT/GPL
 Site    : http://resuta.com.br/isviewport/
 Author  : Accácio Franklin @KassynFrank 
*/
;(function( $, window ){
	
	"use strict"	

	var Viewport = function( context ) {
		this.context = ( context || window );
	};

	Viewport.prototype.axisX = function() {
		return this.context.pageXOffset;
	};

	Viewport.prototype.axisY = function() {
		return this.context.pageYOffset;
	};

	Viewport.prototype.width = function() {
		return this.context.innerWidth;
	};

	Viewport.prototype.height = function() {
		return this.context.innerHeight;
	};

	Viewport.prototype.bottom = function() {
		return ( this.axisY() + this.height() );
	};

	Viewport.prototype.right = function() {
		return ( this.axisX() + this.width() );
	};

	var Rectangle = function( context ) {
		this.context = context;
		this.init();
		this.handleEvents();
	};

	Rectangle.prototype.init = function() {
		this.top    = this.context.offsetTop;
		this.left   = this.context.offsetLeft;
		this.width  = this.context.offsetWidth;
		this.height = this.context.offsetHeight;
		
		this.bottom = ( this.top + this.height );
		this.right  = ( this.left + this.width );
	};

	Rectangle.prototype.handleEvents = function() {
		$( window ).on( 'resize', $.proxy( this, 'resize' ) );
	};

	Rectangle.prototype.resize = function() {
		this.init();
	};

	var CollisionRect = function( view, callback ) {
		this.callback = callback;
		this.view = view;		
	};

	CollisionRect.prototype.verify = function( rectangles, callback ) {		
		( rectangles || [] ).forEach( $.proxy( this, 'collision' ) );		
	};

	CollisionRect.prototype.collision = function( rectangle, index ) {		
		if ( this.view.axisY() <= rectangle.top  && this.view.bottom() >= rectangle.bottom ) {
			( this.callback || $.noop ).call( null, rectangle, index );
		}
	};

	$.fn.isViewPort = function( options ) {
		
		options = $.extend({
			visible 				: $.noop,
			isRemoveVerifyAfterHit	: false
		}, options || {} );


		var rectangles = [];
		var mainView = new Viewport();		
		//callback control
		var callbackIsVisible = function(rect, index) {			
			//wrapper jquery callback element
			rect.context = $( rect.context );
			options.visible.call( null, rect, index );

			if ( options.isRemoveVerifyAfterHit ) {
				rectangles.splice( index, 1 );
			}
		};

		var affections = new CollisionRect( mainView, callbackIsVisible );

		this.each(function(){
			rectangles.push( new Rectangle( this ) );
		});

		$( window ).on( 'load scroll', function(){
			if ( !rectangles || !rectangles.length ) {				
				return;
			}

			affections.verify( rectangles );
		});

		return this;
	}

})( jQuery, window );