define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, {


				plugins: {
			 'zoom': { zoomMode: 'xy', transition: false },
			 'drag': {
		          persistanceX: true,
		          dragY: false
		        },

		},

		mouseActions: [
			{ plugin: 'zoom', shift: false, ctrl: false },
			{ plugin: 'zoom', shift: false, type: 'dblclick', options: { mode: 'total' } }
		]

		} );

 		var series = [ [], [], [] ];

 		for( var i = 0; i < Math.PI * 2 ; i += 0.1 ) {

 			series[ 0 ].push( i );
 			series[ 1 ].push( i );
 			series[ 2 ].push( i );

 			series[ 0 ].push( Math.sin( i ) );
 			series[ 1 ].push( Math.cos( i ) );
 			series[ 2 ].push( Math.sin( i ) * Math.cos( i ) );
 		}

		var axisProperties = { primaryGrid: false, secondaryGrid: false },

			xAxis = graphinstance.getXAxis( 0, axisProperties ),
			leftAxis = graphinstance.getLeftAxis( 0, axisProperties ),
			rightAxis = graphinstance.getRightAxis( 0, axisProperties );


		var legend = graphinstance.makeLegend( {

			backgroundColor: 'rgba( 255, 255, 255, 0.8 )',
			frame: true,
			frameWidth: '1',
			frameColor: 'rgba( 100, 100, 100, 0.5 )',

			movable: false,
			isSerieHideable: true

		}).autoPosition('bottom');



		graphinstance.newSerie( "sin" )
			.setLabel( "f(x) = sin(x)" )
			.autoAxis()
			.setData( series[ 0 ] )	
			.setLineColor( '#bd1a1a' )
			.setMarkers()
		

		graphinstance.draw();

/*
		graphinstance.newSerie( "cos" )
			.setLabel( "f(x) = sin(x)" )
			.autoAxis()
			.setData( series[ 1 ] )
			.setLineColor('#1abd91', false, true );


		graphinstance.newSerie( "cossin" )
			.setLabel( "f(x) = sin(x) * cos(x)" )
			.autoAxis()
			.setData( series[ 2 ] )
			.setLineColor('#891abd');

		graphinstance.draw();

		*/

/*		graphinstance.getXAxis().setLabel( 'x' );
			graphinstance.getYAxis().setLabel( 'y' );
			*/
		//graphinstance.getYAxis().setLineAt0( true );

		//graphinstance.redraw( );
		
		/*
		legend.setPosition(

			{ dx: "-10px", dy: "10px", x: "max", y: "max" }, 
			"right", // Reference point
			"top" // Reference point

		);
*/
/*		var state = graphinstance.getAxisState();
		state.left[ 0 ] = [ 10, 20 ];
		state.bottom[ 0 ] = [ 10, 20 ];
		graphinstance.setAxisState( state );
*/
		//legend.update();




	}, "Legend", [ 

	"Use <code>graph.makeLegend( options )</code> to create a legend from the series !",
	"The styling options are <code>backgroundColor</code> to change the background color, <code>frame</code> to display a frame outside the legend, <code>frameWidth</code> and <code>frameColor</code>",
	"Use the options <code>movable: true</code> to make the legend draggable",
	"To set the default position of the legend, call <code>legend.setPosition( position [, referenceX, referenceY ] )</code>. The references define the corner of the legend that should be used for the positioning. (top, left, right or bottom)"

	] ];

});