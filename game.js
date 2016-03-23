/* eslint -env browser */
var mapSize = [360, 360];
var mapScale = 3; // scale of features will be 2^mapscale
var mapVariance = 0.4;
// var mapBiome; // 0 - water 1 - grassland, 2 - forest, 3 - desert, 4 - rock, 5 - beach, 6 - marsh
var maps;
var knownMaps;
var canvasScale = 6;
var plyPos;
var godMode = false;

function writeTxtSty(text, color, bold) {
  var e = document.createElement('span');
  e.innerHTML = text;
  e.style.color = color;
  if (bold) { e.style["font-weight"] = "bold"; }
  document.body.lastElementChild.appendChild(e);
}

function writeTxt(text) {
  document.body.lastElementChild.appendChild(document.createTextNode(text));
}

function NL() {
  // document.body.appendChild(document.createElement('br'));
  var lastChild = document.body.lastElementChild;
  if (lastChild && lastChild.children.length === 0)
    lastChild.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('div'));
}

function walk(dy, dx, descr, dist) {
  if (!isNaN(+dist)) {
    dist = Math.abs(Math.round(dist));
    writeTxt("You walk " + descr + ", " + dist + "km");
  } else {
    dist = 1;
    writeTxt("You walk " + descr);
  }
  var ny = plyPos[0] + dy * dist, nx = plyPos[1] + dx * dist;
  if (nx < 0 || ny < 0 || nx >= maps[0][0].length || ny >= maps[0].length) {
    writeTxt(", but you don't make it. There is some kind of barrier blocking your way.");
    NL();
    return;
  }
  plyPos[0] = ny;
  plyPos[1] = nx;
  NL();
}

function submitText(text) {
  text = text.toLowerCase();
  var spltTxt = text.split(" ");
  if (spltTxt[0] === "code") {
    var e = document.createElement('a');
    e.innerHTML = "Explorinator on github";
    e.href = "https://github.com/TauNeutrin0/Explorinator/";
    document.body.appendChild(e);
    NL();
    NL();
  } else if (spltTxt[0] === "walk" || spltTxt[0] == "w") {
    switch (spltTxt[1]) {
      case "north": case "n":
        walk(-1, 0, "north", spltTxt[2]);
        break;
      case "south": case "s":
        walk(1, 0, "south", spltTxt[2]);
        break;
      case "east": case "e":
        walk(0, -1, "east", spltTxt[2]);
        break;
      case "west": case "w":
        walk(0, 1, "west", spltTxt[2]);
        break;
      default:
        writeTxt("You walk forwards and derpily trip over.");
        NL();
        break;
    }
  } else if (spltTxt[0] === "scout") {
    writeTxtSty("You look around you, and you see:");
    var vismap = checkVisibility(plyPos, 15, maps[0], maps[2]);
    copyMaps(maps, knownMaps, vismap);
    printVisMap(plyPos, 15, vismap, maps[0], maps[2], true);
    NL();
    NL();
  } else if (spltTxt[0] === "map") {
    if (godMode) {
      writeTxtSty("You use the awesome power of the devs, and the entire world is revealed:");
      writeMapBiome(maps[2], maps[0], plyPos);
    } else {
      writeTxtSty("You try to remember the maps you've already made...");
      writeMapBiome(knownMaps[2], knownMaps[0], plyPos);
    }
    NL();
    NL();
  } else {
    writeTxtSty("You said: '" + text + "'!", "blue", true);
    NL();
    NL();
  }
}

function init() {
  NL();
  writeTxt("You wake up lying on the floor. Where are you? I guess you'd better find out.");
  NL();
  var mapHeight = initMap(mapSize, mapScale, mapVariance, true);
  var mapHumidity = initMap(mapSize, mapScale, mapVariance, false);
  var mapBiome = genMapBiome(mapHeight, mapHumidity);
  maps = new Array(3);
  maps[0] = mapHeight;
  maps[1] = mapHumidity;
  maps[2] = mapBiome;
  knownMaps = new Array(3);
  knownMaps[0] = initEmptyMap(mapSize, mapScale);
  knownMaps[1] = initEmptyMap(mapSize, mapScale);
  knownMaps[2] = initEmptyMap(mapSize, mapScale);
  NL();
  // writeMapBiome(mapBiome, mapHeight);
  plyPos = [Math.round(mapHeight.length / 2), Math.round(mapHeight[0].length / 2)];
  // plyPos = [50, 50];
  // Take a break! http://xkcd.com/kite/kite_trick.jpg
  printVisMap(plyPos, 15, checkVisibility(plyPos, 15, mapHeight, mapBiome), mapHeight, mapBiome, false);
  printVisMap(plyPos, 15, checkVisibility(plyPos, 15, mapHeight, mapBiome), mapHeight, mapBiome, true);
  NL();
}

function printVisMap(pos, vis, vM, hM, bM, mask) {
  var pM = new Array(vis * 2 - 1);
  var i, j;
  for (i = 0; i < 2 * vis - 1; i++) {
    pM[i] = new Array(vis * 2 - 1);
    for (j = 0; j < 2 * vis - 1; j++) {
      if (i + pos[0] - vis + 1 >= 0 && j + pos[1] - vis + 1 >= 0 && i + pos[0] - vis + 1 < vM.length && j + pos[1] - vis + 1 < vM[0].length) {
        if (vM[i + pos[0] - vis + 1][j + pos[1] - vis + 1] === 1 || !mask) {
          pM[i][j] = [hM[i + pos[0] - vis + 1][j + pos[1] - vis + 1], bM[i + pos[0] - vis + 1][j + pos[1] - vis + 1]];
        } else {
          pM[i][j] = [-1, -1];
        }
      } else {
        pM[i][j] = [-1, -1];
      }
    }
  }

  NL();
  var e = document.createElement('canvas');
  e.width = canvasScale * pM.length;
  e.height = canvasScale * pM[0].length;
  var ctx = e.getContext("2d");
  for (i = 0; i < pM.length; i++) {
    for (j = 0; j < pM[i].length; j++) {
      if (pM[i][j][1] ===- 1) {
        ctx.fillStyle = "black";
      } else if (pM[i][j][1] === 0) {
        ctx.fillStyle = "blue";
      } else if (pM[i][j][1] === 1) {
        ctx.fillStyle = "hsl(100, 100%, " + (70 + pM[i][j][0] * 20) + "%)";
      } else if (pM[i][j][1] === 2) {
        ctx.fillStyle = "hsl(120, 100%, " + (20 + pM[i][j][0] * 10) + "%)";
      } else if (pM[i][j][1] === 3) {
        ctx.fillStyle = "hsl(60, 100%, " + (60 + pM[i][j][0] * 20) + "%)";
      } else if (pM[i][j][1] === 4) {
        ctx.fillStyle = "hsl(0, 0%, " + (50 - pM[i][j][0] * 20) + "%)";
      } else if (pM[i][j][1] === 5) {
        ctx.fillStyle = "hsl(40, 100%, " + (70 + pM[i][j][0] * 20) + "%)";
      } else if (pM[i][j][1] === 6) {
        ctx.fillStyle = "hsl(180, 60%, " + (50 + pM[i][j][0] * 20) + "%)";
      }
      ctx.fillRect(j * canvasScale, i * canvasScale, canvasScale, canvasScale);
      if (i === vis - 1 && j === vis - 1) {
        ctx.fillStyle = "#FF0000";
        ctx.moveTo(j * canvasScale, i * canvasScale);
        ctx.lineTo((j + 1) * canvasScale - 1, (i + 1) * canvasScale - 1);
        ctx.stroke();
        ctx.moveTo((j + 1) * canvasScale - 1, i * canvasScale);
        ctx.lineTo(j * canvasScale, (i + 1) * canvasScale - 1);
        ctx.stroke();
      }
    }
  }
  document.body.lastElementChild.appendChild(e);
}

function checkVisibility(pos, vis, hM, bM) {
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

function writeMapShaded(m) {
  NL();
  var i, j;
  for (i = 0; i < m.length; i++) {
    for (j = 0; j < m[0].length; j++) {
      writeTxtSty("\u2588\u2588", "#" + Math.round((m[i][j] + 1.2) * 255 / 2.4).toString(16) + Math.round((m[i][j] + 1.2) * 255 / 2.4).toString(16) + Math.round((m[i][j] + 1.2) * 255 / 2.4).toString(16), true);
    }
    NL();
  }
  NL();
}

function writeMapBiome(m, hM, pos) {
  var i, j;
  NL();
  var e = document.createElement('canvas');
  e.width = canvasScale * m.length;
  e.height = canvasScale * m[0].length;
  var ctx = e.getContext("2d");
  for (i = 0; i < m.length; i++) {
    for (j = 0; j < m[i].length; j++) {
      if (m[i][j] ===- 1) {
        ctx.fillStyle = "black";
      } else if (m[i][j] === 0) {
        ctx.fillStyle = "blue";
      } else if (m[i][j] === 1) {
        ctx.fillStyle = "hsl(100, 100%, " + (70 + hM[i][j] * 20) + "%)";
      } else if (m[i][j] === 2) {
        ctx.fillStyle = "hsl(120, 100%, " + (20 + hM[i][j] * 10) + "%)";
      } else if (m[i][j] === 3) {
        ctx.fillStyle = "hsl(60, 100%, " + (60 + hM[i][j] * 20) + "%)";
      } else if (m[i][j] === 4) {
        ctx.fillStyle = "hsl(0, 0%, " + (50 - hM[i][j] * 20) + "%)";
      } else if (m[i][j] === 5) {
        ctx.fillStyle = "hsl(40, 100%, " + (70 + hM[i][j] * 20) + "%)";
      } else if (m[i][j] === 6) {
        ctx.fillStyle = "hsl(180, 60%, " + (50 + hM[i][j] * 20) + "%)";
      }
      ctx.fillRect(j * canvasScale, i * canvasScale, canvasScale, canvasScale);
      if (i === pos[0] && j === pos[1]) {
        ctx.fillStyle = "#FF0000";
        ctx.moveTo(j * canvasScale, i * canvasScale);
        ctx.lineTo((j + 1) * canvasScale - 1, (i + 1) * canvasScale - 1);
        ctx.stroke();
        ctx.moveTo((j + 1) * canvasScale - 1, i * canvasScale);
        ctx.lineTo(j * canvasScale, (i + 1) * canvasScale - 1);
        ctx.stroke();
      }
    }
  }
  document.body.lastElementChild.appendChild(e);
  NL();
}

function initMap(mSize, mScale, mVariance, water) {
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
        rMap[(x%rMap.length)][(y%rMap[0].length)] = -1;
      } else {
        x = i;
        y = j;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = Math.random() * 2 - 1;
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
        rMap[(x%rMap.length)][(y%rMap[0].length)] = ((getPoint(rMap, i, j) + getPoint(rMap, i, j + scale) + getPoint(rMap, i + scale, j) + getPoint(rMap, i + scale, j + scale)) / 4.0) + (Math.random() * 2 - 1) * variance;
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
        rMap[(x%rMap.length)][(y%rMap[0].length)] = ((getPoint(rMap, i, j) + getPoint(rMap, i + scale, j) + getPoint(rMap, i + hS, j - hS) + getPoint(rMap, i + hS, j + hS)) / 4.0) + (Math.random() * 2 - 1) * variance;
        x = i;
        y = j + hS;
        while (x < 0) {
          x += rMap.length;
        }
        while (y < 0) {
          y += rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = ((getPoint(rMap, i, j) + getPoint(rMap, i, j + scale) + getPoint(rMap, i - hS, j + hS) + getPoint(rMap, i + hS, j + hS)) / 4.0) + (Math.random() * 2 - 1) * variance;
      }
    }
    variance /= 2;
    scale /= 2;
  }
  return rMap;

  // http://www.bluh.org/code-the-diamond-square-algorithm/
}

function initEmptyMap(mSize, mScale) {
  var size = [Math.ceil(mSize[0] / Math.pow(2, mScale)) * mScale + 1, Math.ceil(mSize[1] / Math.pow(2, mScale)) * mScale + 1];
  var map = new Array(size[0]);
  for (var i = 0; i < size[0]; i++) {
    map[i] = new Array(size[1]);
    for (var j = 0; j < size[1]; j++) map[i][j] = -1;
  }
  return map;
}

function genMapBiome(mapHeight, mapHumidity) {
  var mapBiome = JSON.parse(JSON.stringify(mapHeight));
  var i, j;
  for (i = 0; i < mapHeight.length; i++) {
    for (j = 0; j < mapHeight[i].length; j++) {
      if (mapHeight[i][j] <- 0.8) {
        mapBiome[i][j] = 0;
      } else if (mapHumidity[i][j] <- 0.8) {
        mapBiome[i][j] = 3;
      } else if (mapHeight[i][j] <- 0.75) {
        mapBiome[i][j] = 5;
      } else if (mapHeight[i][j] <- 0.5) {
        if (mapHumidity[i][j] > 1.5) {
          mapBiome[i][j] = 6;
        } else {
          mapBiome[i][j] = 1;
        }
      } else if (mapHeight[i][j] < 0.5) {
        if (mapHumidity[i][j] <- 0.75) {
          mapBiome[i][j] = 3;
        } else if (mapHumidity[i][j] > 0.5) {
          mapBiome[i][j] = 2;
        } else {
          mapBiome[i][j] = 1;
        }
      } else if (mapHeight[i][j] < 0.75) {
        if (mapHumidity[i][j] <- 0.85) {
          mapBiome[i][j] = 3;
        } else if (mapHumidity[i][j] > 0.3) {
          mapBiome[i][j] = 2;
        } else {
          mapBiome[i][j] = 1;
        }
      } else {
        mapBiome[i][j] = 4;
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

function getPoint(m, x, y) {
  while (x < 0) {
    x += m.length;
  }
  while (y < 0) {
    y += m[0].length;
  }
  return m[x%m.length][y%m[0].length];
}
