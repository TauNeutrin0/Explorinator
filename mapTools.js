/*
 * 
 * Terrain Map: Stores numerical values both positive and negative
 * Biome Map: Stores integer biome ids (-1 for blank)
 * Color Map: Stores color values in 'hsl(0, 0%, 0%)' form
 * 
 */

var biomes = [
    {"id":0, "name":"water",     "hue":"240", "height":[null, -0.8],  "humidity":[null, null],  },
    {"id":5, "name":"beach",     "hue":"40",  "height":[null, -0.75], "humidity":[null, null],  },
    {"id":4, "name":"rock",      "hue":"270", "height":[0.75, null],  "humidity":[null, null],  },
    {"id":3, "name":"desert",    "hue":"60",  "height":[null, null],  "humidity":[null, -0.75], },
//    {"id":6, "name":"marsh",     "hue":"180", "height":[null, null],  "humidity":[0.85, null],  },
    {"id":2, "name":"forest",    "hue":"120", "height":[null, null],  "humidity":[0.3, null],    },
    {"id":1, "name":"grassland", "hue":"100", "height":[null, null],  "humidity":[null, null],  }
];


function initEmptyMap(mSize, mScale) {
  var size = [Math.ceil(mSize[0] / Math.pow(2, mScale)) * mScale + 1, Math.ceil(mSize[1] / Math.pow(2, mScale)) * mScale + 1];
  var map = new Array(size[0]);
  for (var i = 0; i < size[0]; i++) {
    map[i] = new Array(size[1]);
    for (var j = 0; j < size[1]; j++) map[i][j] = -1;
  }
  return map;
}

function generateColorMap(biomeMap, heightMap) {
  var colorMap = new Array(biomeMap.length);
  var i, j, k;
  for (i = 0; i < biomeMap.length; i++) {
    colorMap[i] = new Array(biomeMap[i].length);
    for (j = 0; j < biomeMap[i].length; j++) {
      var biome = biomeMap[i][j];
      if (biome === -1) {
        colorMap[i][j] = "black";
      } else if (biome === 0) {
        colorMap[i][j] = "blue";
      } else {
        for(k = 0; k < biomes.length; k++) {
          if(biome === biomes[k].id) colorMap[i][j] = "hsl(" + biomes[k].hue + ", 100%, " + (70 + heightMap[i][j] * 20) + "%)";
        }
      }
    }
  }
  return colorMap;
}

function generateGradientMap(map) {
  var colorMap = new Array(map.length);
  var i, j;
  for (i = 0; i < map.length; i++) {
    colorMap[i] = new Array(map[i].length);
    for (j = 0; j < map[i].length; j++) {
      colorMap[i][j] = "hsl(0, 0%, " + (70 + map[i][j] * 20) + "%)";
    }
  }
  return colorMap;
}

function checkMapVisibility(pos, vis, hM, bM) {
  var mapVis = JSON.parse(JSON.stringify(hM));
  var mapGrad = JSON.parse(JSON.stringify(hM));
  var posH;
  if (bM[pos[0]][pos[1]] === 0) {
    posH = -0.85;
  } else {
    posH = hM[pos[0]][pos[1]] + 0.15;
  }
  var i, j;
  for (i = 0; i < mapVis.length; i++) {
    for (j = 0; j < mapVis[i].length; j++) {
      if (pos[0] - vis < i && pos[0] + vis > i && pos[1] - vis < j && pos[1] + vis > j) {
        if (Math.pow(pos[0] - i, 2) + Math.pow(pos[1] - j, 2) <= Math.pow(vis, 2)) {
          mapVis[i][j] = 1;
        } else {
          mapVis[i][j] = 0;
        }
      } else {
        mapVis[i][j] = 0;
      }
    }
  }
  for (i = pos[0] - vis; i <= pos[0] + vis; i++) {
    for (j = pos[1] - vis; j <= pos[1] + vis; j++) {
      if (i >= 0 && j >= 0 && i < mapVis.length && j < mapVis[0].length) {
        if (mapVis[i][j] === 1) {
          if (bM[i][j] === 0) {
            mapGrad[i][j] = (-1 - posH) / Math.sqrt(Math.pow(i - pos[0], 2) + Math.pow(j - pos[1], 2));
          } else {
            mapGrad[i][j] = (hM[i][j] - posH) / Math.sqrt(Math.pow(i - pos[0], 2) + Math.pow(j - pos[1], 2));
          }
        }
      }
    }
  }
  for (i = pos[0] - vis; i <= pos[0] + vis; i++) {
    for (j = pos[1] - vis; j <= pos[1] + vis; j++) {
      if (i >= 0 && j >= 0 && i < mapVis.length && j < mapVis[0].length) {
        if (mapVis[i][j] === 1) {
          var graddx = (j - pos[1]) / (i - pos[0]); // Essentially gradient from (i, j) to pos
          var graddy = (i - pos[0]) / (j - pos[1]);
          var a, b;
          var visible = true;
          if (i < pos[0]) {
            for (a = 0; a < pos[0] - 1 - i; a++) {
              var y = Math.floor((a + 0.5) * graddx + j + 0.5);
              if (mapGrad[a + i][y] > mapGrad[i][j] || mapGrad[a + i + 1][y] > mapGrad[i][j]) {
                visible = false;
              }
              /* if (i + 8 === pos[0] && j - 10 === pos[1]) {
               *   console.log("i:" + i + "; j:" + j + "; graddx:" + graddx + "; graddy:" + graddy + "; posHeight:" + posH + "; posgradient:" + mapGrad[i][j] + "; x:" + (a + i) + "; y:" + y + "; height:" + hM[a + i][y] + "; gradient:" + mapGrad[a + i][y] + "; visible:" + visible);
               *   console.log("i:" + i + "; j:" + j + "; graddx:" + graddx + "; graddy:" + graddy + "; posHeight:" + posH + "; posgradient:" + mapGrad[i][j] + "; x:" + (a + i + 1) + "; y:" + y + "; height:" + hM[a + i + 1][y] + "; gradient:" + mapGrad[a + i + 1][y] + "; visible:" + visible);
               * } */
            }
          } else {
            for (a = 0; a < i - 1 - pos[0]; a++) {
              var y = Math.floor((a + 0.5) * graddx + pos[1] + 0.5);
              if (mapGrad[a + pos[0]][y] > mapGrad[i][j] || mapGrad[a + pos[0] + 1][y] > mapGrad[i][j]) {
                visible = false;
              }
            }
          }
          if (j < pos[1]) {
            for (a = 0; a < pos[1] - 1 - j; a++) {
              var x = Math.floor((a + 0.5) * graddy + i + 0.5);
              if (mapGrad[x][a + j] > mapGrad[i][j] || mapGrad[x][a + j + 1] > mapGrad[i][j]) {
                visible = false;
              }
            }
          } else {
            for (a = 0; a < j - 1 - pos[1]; a++) {
              var x = Math.floor((a + 0.5) * graddy + pos[0] + 0.5);
              if (mapGrad[x][a + pos[1]] > mapGrad[i][j] || mapGrad[x][a + pos[1] + 1] > mapGrad[i][j]) {
                visible = false;
              }
            }
          }
          if (!visible) {
            mapVis[i][j] = 0;
          } else {
            mapVis[i][j] = 1;
          }
        }
      }
    }
  }
  return mapVis;
}


function initTerrainMap(mSize, mScale, mVariance, water) {
  var size = [Math.ceil(mSize[0] / Math.pow(2, mScale)) * mScale + 1, Math.ceil(mSize[1] / Math.pow(2, mScale)) * mScale + 1];
  var scale = Math.pow(2, mScale);
  var rMap = new Array(size[0]);
  var i, j, x, y;
  for (i = 0; i < rMap.length; i++) {
    rMap[i] = new Array(size[1]);
  }
  var variance = mVariance;
  // Diamond square algorithm go!
  for (i = 0; i < rMap.length; i += scale) {
    for (j = 0; j < rMap[i].length; j += scale) {
      if ((i <= scale || j <= scale || i >= rMap.length - scale || j >= rMap[i].length - scale) && water) {
        x = i;
        y = j;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[x % rMap.length][y % rMap[0].length] = -1;
      } else {
        x = i;
        y = j;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[x % rMap.length][y % rMap[0].length] = Math.random() * 2 - 1;
      }
    }
  }
  while (scale > 1) {
    // Diamond
    var hS = scale / 2;
    for (i = 0; i < rMap.length; i += scale) {
      for (j = 0; j < rMap[i].length; j += scale) {
        x = i + hS;
        y = j + hS;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[x % rMap.length][y % rMap[0].length] = ((getPoint(rMap, i, j) + getPoint(rMap, i, j + scale) + getPoint(rMap, i + scale, j) + getPoint(rMap, i + scale, j + scale)) / 4.0) + (Math.random() * 2 - 1) * variance;
      }
    }
    // Square
    for (i = 0; i < rMap.length; i += scale) {
      for (j = 0; j < rMap[i].length; j += scale) {
        x = i + hS;
        y = j;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[x % rMap.length][y % rMap[0].length] = ((getPoint(rMap, i, j) + getPoint(rMap, i + scale, j) + getPoint(rMap, i + hS, j - hS) + getPoint(rMap, i + hS, j + hS)) / 4.0) + (Math.random() * 2 - 1) * variance;
        x = i;
        y = j + hS;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[x % rMap.length][y % rMap[0].length] = ((getPoint(rMap, i, j) + getPoint(rMap, i, j + scale) + getPoint(rMap, i - hS, j + hS) + getPoint(rMap, i + hS, j + hS)) / 4.0) + (Math.random() * 2 - 1) * variance;
      }
    }
    variance /= 2;
    scale /= 2;
  }
  return rMap;

  // http://www.bluh.org/code-the-diamond-square-algorithm/
}

function generateBiomeMap(heightMap, humidityMap) {
  var mapBiome = new Array(heightMap.length);
  var i, j, k;
  for (i = 0; i < heightMap.length; i++) {
    mapBiome[i] = new Array(heightMap[i].length);
    
    for (j = 0; j < heightMap[i].length; j++) {
      var he = heightMap[i][j];
      var hu = humidityMap[i][j];
      
      for(k = 0; k < biomes.length; k++) {
        var heB = biomes[k].height;   // Height bounds
        var huB = biomes[k].humidity; // Humidity bounds
        // Check bounds
        if( (heB[0] === null || heB[0] < he) && (heB[1] === null || heB[1] > he) &&
            (huB[0] === null || huB[0] < hu) && (huB[1] === null || huB[1] > hu)) {
              mapBiome[i][j] = biomes[k].id;
              k = biomes.length;
        }
      }
    }
  }
  return mapBiome;
}

function copyMaps(src, dest, vis) {
  for (var i = 0; i < vis.length; i++) {
    for (var j = 0; j < vis[i].length; j++) {
      if (vis[i][j] === 1) {
        dest[0][i][j] = src[0][i][j];
        dest[1][i][j] = src[1][i][j];
        dest[2][i][j] = src[2][i][j];
      }
    }
  }
}