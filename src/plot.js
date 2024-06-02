// plot points and shortest path here based on 

//                      21n - 1 character where n are # of points
//                      imid is an int representation of an image's id
//                      &shortestpath = 13
//                      &startatfirst = 13
//                      Can easily handle 300+ points assuming 7500 max chars
// http://localhost:xxxx?points=[[xxxx.x,yyyy.y,imid],[xxxx.x,yyyy.y,imid]],...&shortestpath=1&startatfirst=1&zoom=1
// presence of shortestpath creates a looping trace using convex hull
// presence of startatfirst will start a trace at the first point supplied to the last (no loop) [not implemented]
// presence of zoom will fit viewport to the bounds of the points
// presence of distance will display the route distance
// [imid is unimplemented but intended to select icons for each point]

import * as L from "leaflet";
import { getIcon, getRandomColor } from "./utils";

export default function plot() {
  const map = window.map;
  const zoom = getQueryVariable("zoom") == "1";
  const showcost = getQueryVariable("distance") == "1";
  const pointStr = getQueryVariable("points");
  if (!pointStr || pointStr.length <= 0) return;

  // [[xxxx.x,yyyy.y,imid], ...]
  const points = JSON.parse(getQueryVariable("points"));
  let cost = "Lol idk.";

  if (getQueryVariable("shortestpath") == "1") {
    if (getQueryVariable("startatfirst") == "1") {
      // start at first point
      // unimplemented
    }

    const path = convexHull(Array.from(points));
    cost = pathCost(path).toFixed(2);

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      L.polyline([[current[0], current[1]], [next[0], next[1]]], { color: "purple", weight: 4 }).addTo(window.map);
    }
  }

  if (showcost) {
    const costele = document.createElement("h3");
    document.body.appendChild(costele);
    costele.innerText = `Route is ${cost}m`;
    costele.className = "cost";
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


function convexHull (points) {
  const firstPoints = points[0]; 
  const sp = points[0];

  // Find the "left most point"
  let leftmost = points[0];
  for (const p of points) {
    if (p[1] < leftmost[1]) {
      leftmost = p;
    }
  }

  const path = [leftmost];

  while (true) {
    const curPoint = path[path.length - 1];
    let [selectedIdx, selectedPoint] = [0, null];

    // find the "most counterclockwise" point
    for (let [idx, p] of points.entries()) {
      if (!selectedPoint || counterClockWise(curPoint, p, selectedPoint) === 2) {
        // this point is counterclockwise with respect to the current hull
        // and selected point (e.g. more counterclockwise)
        [selectedIdx, selectedPoint] = [idx, p];
      }
    }

    // adding this to the hull so it's no longer available
    points.splice(selectedIdx, 1);

    // back to the furthest left point, formed a cycle, break
    if (selectedPoint === leftmost) {
      break;
    }

    // add to hull
    path.push(selectedPoint);
  }

  while (points.length > 0) {
    let [bestRatio, bestPointIdx, insertIdx] = [Infinity, null, 0];

    for (let [freeIdx, freePoint] of points.entries()) {
      // for every free point, find the point in the current path
      // that minimizes the cost of adding the point minus the cost of
      // the original segment
      let [bestCost, bestIdx] = [Infinity, 0];
      for (let [pathIdx, pathPoint] of path.entries()) {
        const nextPathPoint = path[(pathIdx + 1) % path.length];

        // the new cost minus the old cost
        const evalCost =
          pathCost([pathPoint, freePoint, nextPathPoint], firstPoints) -
          pathCost([pathPoint, nextPathPoint], firstPoints);

        if (evalCost < bestCost) {
          [bestCost, bestIdx] = [evalCost, pathIdx];
        }
      }

      // figure out how "much" more expensive this is with respect to the
      // overall length of the segment
      const nextPoint = path[(bestIdx + 1) % path.length];
      const prevCost = pathCost([path[bestIdx], nextPoint], firstPoints);
      const newCost = pathCost([path[bestIdx], freePoint, nextPoint], firstPoints);
      const ratio = newCost / prevCost;

      if (ratio < bestRatio) {
        [bestRatio, bestPointIdx, insertIdx] = [ratio, freeIdx, bestIdx + 1];
      }
    }

    const [nextPoint] = points.splice(bestPointIdx, 1);
    path.splice(insertIdx, 0, nextPoint);
  }

  // rotate the array so that starting point is back first
  const startIdx = path.findIndex(p => p === sp);
  path.unshift(...path.splice(startIdx, path.length));

  // go back home
  path.push(sp);

  return path;
};

function distance(a,b) {
  const val = Math.sqrt(((b[0] - a[0])^2) + ((b[1] - a[1])^2));

  return isNaN(val)? 0: val;
}

function pathCost (path, firstP) {
  return path
    .slice(0, -1)
    .map((point, idx) => {
      if (point == firstP) return 0;
      return distance(point, path[idx + 1]);
    })
    .reduce((a, b) => a + b, 0);
};

function counterClockWise (p, q, r) {
  return (q[0] - p[0]) * (r[1] - q[1]) < (q[1] - p[1]) * (r[0] - q[0]);
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