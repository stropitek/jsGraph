import * as util from '../graph.util'

var aggregatorWorker;
var queue = {};

let string = function() {

  onmessage = function( e ) {

    const data = e.data.data, // The initial data
      max = e.data.max, // Max X
      min = e.data.min; // Min Y

    let numPoints = e.data.numPoints; // Total number of points in the slot
    let l = data.length; // Number of data in the original buffer
    let i = 0;
    let k = -4;
    let slots = [];
    let dataAggregatedX = [];
    let dataAggregatedY = [];
    let aggregationSum = [];
    let getX;

    const dataPerSlot = numPoints / ( max - min ); // Computed number of aggregation per slot
    if ( e.data.xdata ) {

      getX = function getX( index ) {
        return e.data.xdata[  index ];
      }
    } else {
      getX = function getX( index ) {
        return index * e.data.xScale + e.data.xOffset;
      }

    }

    let aggregations = {};

    for ( ; i < l; i++ ) {

      // dataPerSlot: 1 / 1000 ( compression by 1'000 )
      //console.log( dataPerSlot, getX( i ) );
      slotNumber = Math.floor( ( getX( i ) - min ) * dataPerSlot );

      if ( slots[ k ] !== slotNumber ) {
        k += 4;
        slots[ k ] = slotNumber;

        let slotX = ( slotNumber + 0.5 ) / dataPerSlot;

        dataAggregatedX[ k ] = slotX;
        dataAggregatedX[ k + 1 ] = slotX;
        dataAggregatedX[ k + 2 ] = slotX;
        dataAggregatedX[ k + 3 ] = slotX;

        dataAggregatedY[ k ] = data[ i ];
        dataAggregatedY[ k + 1 ] = data[ i ];
        dataAggregatedY[ k + 2 ] = data[ i ];
        dataAggregatedY[ k + 3 ] = data[ i ];
        aggregationSum[ k ] = 0;

      }
      dataAggregatedY[ k + 1 ] = Math.min( data[ i ], dataAggregatedY[ k + 1 ] );
      dataAggregatedY[ k + 2 ] = Math.max( data[ i ], dataAggregatedY[ k + 2 ] );
      dataAggregatedY[ k + 3 ] = data[ i ];
      aggregationSum[ k ] += data[ i ];
    }

    aggregations[ numPoints ] = {
      x: dataAggregatedX,
      y: dataAggregatedY,
      sums: aggregationSum
    };

    lastAggregation = dataAggregatedY;
    lastAggregationX = dataAggregatedX;
    lastAggregationSum = aggregationSum;

    while ( numPoints > 256 ) {

      numPoints /= 2;

      newAggregation = [];
      newAggregationX = [];

      k = 0;
      for ( i = 0, l = lastAggregation.length; i < l; i += 8 ) {

        newAggregationX[ k ] = ( lastAggregationX[ i ] + lastAggregationX[ i + 4 ] ) / 2;
        newAggregationX[ k + 1 ] = newAggregationX[ k ];
        newAggregationX[ k + 2 ] = newAggregationX[ k ];
        newAggregationX[ k + 3 ] = newAggregationX[ k ];

        newAggregation[ k ] = lastAggregation[ i ]
        newAggregation[ k + 1 ] = Math.min( lastAggregation[ i + 1 ], lastAggregation[ i + 5 ] );
        newAggregation[ k + 2 ] = Math.max( lastAggregation[ i + 2 ], lastAggregation[ i + 6 ] );
        newAggregation[ k + 3 ] = lastAggregation[ i + 7 ];

        aggregationSum[ k ] = lastAggregationSum[ i ] + lastAggregationSum[ i + 4 ];

        k += 4;
      }

      aggregations[ numPoints ] = {
        x: newAggregationX,
        y: newAggregation,
        sums: aggregationSum
      };

      lastAggregation = newAggregation;
      lastAggregationX = newAggregationX;
      aggregationSum = [];
    }

    postMessage( {
      aggregates: aggregations,
      _queueId: e.data._queueId
    } );
  };

}.toString();

string = string.split( "\n" );
string.pop();
string.shift();

var workerUrl = URL.createObjectURL( new Blob(
  [ string.join( "\n" ) ], {
    type: 'application/javascript'
  } ) );

aggregatorWorker = new Worker( workerUrl );

aggregatorWorker.onmessage = function( e ) {
  var id = e.data._queueId;
  delete e.data._queueId;
  queue[ id ]( e.data );
  delete queue[ id ];
}

export default function( toOptimize ) {

  var requestId = util.guid();
  toOptimize._queueId = requestId;

  var prom = new Promise( ( resolver ) => {
    queue[ requestId ] = resolver;
  } );

  aggregatorWorker.postMessage( toOptimize );
  return prom;
}