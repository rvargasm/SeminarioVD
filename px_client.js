function convert_px_data ( dataset, handlers, callback ) {
  var dims = dataset.dimension;

  // id's and sizes are listed in reverse order
  // for some bizarre reason
  dims.size = dims.size.reverse();
  dims.id = dims.id.reverse();

  // allow quick index-to-dimension-value lookups
  dims.id.forEach( id => {
    var dim = dims[ id ]
      , cat = dim.category
      , handler = handlers[ id ]
      ;
    dim.lookup = {};
    for ( var key in cat.index ) {
      var index = cat.index[ key ]
        , label = cat.label[ key ]
                    .trim().replace( /\s+/, ' ' )
        ;
      if ( handler && handler.parser ) {
        label = handler.parser( label );
      }
      dim.lookup[ index ] = label;
    }
  });

  // convert data stream to 'fact' objects
  var data = dataset.value.map( (d, i) => {
    var fact = { 'value': d }
      , mul = 1
      ;
    dims.size.forEach( (size, dim_idx) => {
      var cat_idx = ~~( i / mul ) % size
        , dim = dims[ dims.id[ dim_idx ] ]
        , handler = handlers[ dims.id[ dim_idx ] ]
        , label = ( handler && handler.label ) || dim.label
        ;
      fact[ label ] = dim.lookup[ cat_idx ];
      mul = mul * size;
    });
    return fact;
  });
  callback( null, data );
}

function load_px_data ( data_url, handlers, callback ) {
  d3.json( data_url, dimspec => {
    var query = dimspec.variables.map(function ( dim ) {
      var handler = handlers[ dim.code ]
        , sel = [];
      dim.valueTexts.map(function ( val, idx ) {
        if ( !handler || !handler.select || handler.select( val ) ) {
          sel.push( dim.values[ idx ] )
        }
      });
      return { 'code': dim.code
              , 'selection': { 'filter': 'item'
                              , 'values': sel } };
    });
    var post_data = { 'query': query
                    , 'response': { 'format': 'json-stat' } };
    d3.xhr( data_url )
      .response(function ( req ) {
        return JSON.parse( req.responseText );
      })
      .post( JSON.stringify( post_data ), function ( e, d ) {
        convert_px_data( d.dataset, handlers, callback );
      });
  });
}