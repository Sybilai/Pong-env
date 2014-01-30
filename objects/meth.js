Meth = {
  edge_length: 0,
  radius: 0,
  distance_from_center_to_edge: 0,
  interior_angle: 0,
  angle_center: 0,
  epsilon: 0.00001,

  initialize: function( no_edges ) {
    Meth.radius = Meth.edge_length / (2 * Math.sin( Math.PI / no_edges ) );
    Meth.distance_from_center_to_edge = Math.sqrt( Meth.radius*Meth.radius - (Meth.edge_length/2)*(Meth.edge_length/2) );
    Meth.interior_angle = (no_edges - 2) * Math.PI / no_edges;
    Meth.exterior_angle = Math.PI - Meth.interior_angle;
    Meth.angle_center = 2 * Math.PI / no_edges;
  },

  rotatePoint: function( point, angle, origin ) {
    if (origin == undefined) origin = {x: 0, y: 0};

    var sin_angle = Math.sin( angle.toFixed(5) ),
        cos_angle = Math.cos( angle.toFixed(5) );

    return {
      x: origin.x + (point.x - origin.x) * cos_angle - (point.y - origin.y) * sin_angle,
      y: origin.y + (point.x - origin.x) * sin_angle + (point.y - origin.y) * cos_angle
    };
  },

  // STIIND CA A - B - C COLINIARE
  // STIIND A SI C, SI DIST(A, B) SI DIST(A, C)
  // RETURNEAZA COORDONATELE PCT B
  getThirdPoint: function( A, C, AB ) {
    var k = AB / Meth.edge_length;

    return {
      x: A.x + k * (C.x - A.x),
      y: A.y + k * (C.y - A.y)
    }
  }
}

module.exports = Meth;
