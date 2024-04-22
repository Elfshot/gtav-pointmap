// plot points and shortest path here based on 

//                      21n - 1 character where n are # of points
//                      imid is an int representation of an image's id
//                      &shortestpath = 13
//                      &startatfirst = 13
//                      Can easily handle 300+ points assuming 7500 max chars
// http://localhost:xxxx?points=[[xxxx.x,yyyy.y,imid],[xxxx.x,yyyy.y,imid]],...&shortestpath=1&startatfirst=1&zoom=1
// presence of shortestpath creates a trace using nearest neighbour ?or convex hull? (nearest neighbour is faster at great distances)
// presence of startatfirst will start the tracing at the first point supplied, otherwise any point
// presence of zoom will fit to bounds

import * as L from 'leaflet';
import { getIcon, getRandomColor } from './utils';

export default function plot() {
  const map = window.map;
  const zoom = getQueryVariable("zoom") == "1";

  const pointStr = getQueryVariable("points");
  if (!pointStr || pointStr.length <= 0) return;

  // [[xxxx.x,yyyy.y,imid], ...]
  const points = JSON.parse(getQueryVariable("points"));

  if (getQueryVariable("shortestpath") == "1") {
    if (getQueryVariable("startatfirst") == "1") {
      // start at first point
      // unimplemented
    }
    let path = nearestNeighbor(Array.from(points));

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      L.polyline([[current[0], current[1]], [next[0], next[1]]], { color: 'purple', weight: 4 }).addTo(window.map);
    }
  }

  // add points to map
  let mostright = points[0][0];
  let mostleft = points[0][0];
  let mostup = points[0][1];
  let mostdown = points[0][1];

  for (const point of points) {
    if (point[0] < mostright) mostright = point[0];
    if (point[0] > mostleft) mostleft = point[0];
    if (point[1] < mostdown) mostdown = point[1];
    if (point[1] > mostup) mostup = point[1];
  }

  if (zoom) {
    for (const point of points) {
      L.marker([point[0]+4,point[1]+4], {
        icon: getIcon(getRandomColor(), [25, 25])
      }).addTo(window.map);
    }
    map.fitBounds([[mostright, mostup], [mostleft, mostdown]]);
  } else {
    for (const point of points) {
      L.marker([point[0]+50,point[1]+10], {
        icon: getIcon(getRandomColor(), [15, 15])
      }).addTo(window.map);
    }
    map.flyTo([(mostright + mostleft)/2, (mostup + mostdown)/2], 5.3, {
      animate: false
    });
    map.panInside([mostright, mostup], {
      animate: false
    });
    map.panInside([mostleft, mostdown], {
      animate: false
    });
  }
}

// https://tspvis.com/
function nearestNeighbor(points) {
  const path = [points.shift()];

  while (points.length > 0) {
    // sort remaining points in place by their
    // distance from the last point in the current path
    points.sort(
      (a, b) =>
        distance(path[path.length - 1], b) - distance(path[path.length - 1], a)
    );

    // go to the closest remaining point
    path.push(points.pop());
  }

  // return to start after visiting all other points
  path.push(path[0]);
  // const cost = pathCost(path);

  return path;
};

function distance(a,b) {
  return Math.sqrt(((b[0] - a[0])^2) + ((b[1] - a[1])^2));
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
  return null;
}