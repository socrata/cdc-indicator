// http://jquerygeo.com/
// Copied from https://github.com/jQueryGeo/geo/blob/master/js/jquery.geo.core.js
// Calculates a centroid of a GeoJSON feature

/* eslint-disable */

export default function getCentroid(geom) {
  let c; //< temp storage for any coordinate during centroid op

  const pos_oo = Number.POSITIVE_INFINITY;
  const neg_oo = Number.NEGATIVE_INFINITY;

  switch (geom.type) {
    // case "Point":
    //   // return $.extend({}, geom);
    //   return Object.assign({}, geom);

    // case "LineString":
    case "Polygon":
      let a = 0;
      let coords = [].concat((geom.type === "Polygon") ? geom.coordinates[0] : geom.coordinates);
      let i;
      let j;
      let n;
      let bbox = [pos_oo, pos_oo, neg_oo, neg_oo];

      c = [0, 0];

      let wasGeodetic = false;
      // if ( !_ignoreGeo && $.geo.proj && this._isGeodetic( coords ) ) {
      //   wasGeodetic = true;
      //   coords = $.geo.proj.fromGeodetic(coords);
      // }

      //if (coords[0][0] != coords[coords.length - 1][0] || coords[0][1] != coords[coords.length - 1][1]) {
      //  coords.push(coords[0]);
      //}

      for (i = 1; i <= coords.length; i++) {
        j = i % coords.length;

        bbox[0] = Math.min(coords[j][0], bbox[0]);
        bbox[1] = Math.min(coords[j][1], bbox[1]);
        bbox[2] = Math.max(coords[j][0], bbox[2]);
        bbox[3] = Math.max(coords[j][1], bbox[3]);

        n = (coords[i - 1][0] * coords[j][1]) - (coords[j][0] * coords[i - 1][1]);
        a += n;
        c[0] += (coords[i - 1][0] + coords[j][0]) * n;
        c[1] += (coords[i - 1][1] + coords[j][1]) * n;
      }

      if (a === 0) {
        if (coords.length > 0) {
          c[0] = Math.min(Math.max(coords[0][0], bbox[0]), bbox[2]);
          c[1] = Math.min(Math.max(coords[0][1], bbox[1]), bbox[3]);
          // return { type: "Point", coordinates: wasGeodetic ? $.geo.proj.toGeodetic(c) : c };
          return {
            type: "Point",
            coordinates: c
          };
        } else {
          return undefined;
        }
      }

      a *= 3;
      //c[0] /= a;
      //c[1] /= a;

      c[0] = Math.min(Math.max(c[0] / a, bbox[0]), bbox[2]);
      c[1] = Math.min(Math.max(c[1] / a, bbox[1]), bbox[3]);

      // return { type: "Point", coordinates: wasGeodetic ? $.geo.proj.toGeodetic(c) : c };
      return {
        type: "Point",
        coordinates: c
      };

    // case "MultiPoint":
    //   // should return center of mass for point cluster but just return first point for now
    //   if ( geom.coordinates.length > 0 ) {
    //     c = geom.coordinates[ 0 ];
    //     return {
    //       type: "Point",
    //       coordinates: [ c[ 0 ], c[ 1 ] ]
    //     };
    //   }
    //   break;

    // case "MultiLineString":
    case "MultiPolygon":
      if (geom.coordinates.length > 0) {
        return getCentroid({
          type: geom.type.substr(5),
          coordinates: geom.coordinates[0]
        });
      }
      break;
  }

  return undefined;
}
