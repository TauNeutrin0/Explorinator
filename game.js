/*eslint-disable no-param-reassign */
/*globals data_forestNames */
var mapSize = [360, 360];
var mapScale = 3; // scale of features will be 2^mapscale
var mapVariance = 0.4;

var maps;
var knownMaps;
var places = {};
var canvasScale = 6;
var plyPos;
var godMode = false;

function writeTxtSty(text, color, bold) {
  var e = document.createElement('span');
  e.innerHTML = text;
  if (color !== null) e.style.color = color;
  if (bold) { e.style["font-weight"] = "bold"; }
  document.body.lastElementChild.appendChild(e);
}

function writeTxt(text) {
  if (typeof text === "string") {
    document.body.lastElementChild.appendChild(document.createTextNode(text));
  } else {
    document.body.lastElementChild.appendChild(text);
  }
}

function writeTxtNL(text) {
  writeTxt(text);
  NL();
}

function NL() {
  var line = document.createElement('div');
  line.className = 'line';
  document.body.appendChild(line);
}

function walk(dy, dx, descr, dist) {
  if (!isNaN(Number(dist))) {
    dist = Math.abs(Math.round(dist));
    writeTxt("You walk " + descr + ", " + dist + "km");
  } else {
    dist = 1;
    writeTxt("You walk " + descr);
  }
  var ny = plyPos[0] + dy * dist, nx = plyPos[1] + dx * dist;
  if (nx < 0 || ny < 0
  || nx >= maps[0][0].length || ny >= maps[0].length) {
    writeTxtNL(", but you don't make it. There is some kind of barrier blocking your way.");
    NL();
    return;
  }
  plyPos[0] = ny;
  plyPos[1] = nx;
  NL();
  NL();
}

function submitText(text) {
  var input = document.getElementById("input");
  if (! text) return;
  writeTxtNL("> " + text);
  handleText(text);
  window.scrollTo(0,document.body.scrollHeight);
  input.value = "";
}

function handleText(text) {
  text = text.toLowerCase();
  var spltTxt = text.split(" ");
  if (spltTxt[0] === "code") {
    var e = document.createElement('a');
    e.innerHTML = "~ <em>Explorinator on GitHub</em> ~";
    e.target = "_blank";
    e.href = "https://github.com/TauNeutrin0/Explorinator/";
    writeTxtNL(e);
    NL();
  } else if (spltTxt[0] === "walk" || spltTxt[0] === "w") {
    switch (spltTxt[1]) {
      case "north": case "n":
        walk(-1, 0, "north", spltTxt[2]);
        break;
      case "south": case "s":
        walk(1, 0, "south", spltTxt[2]);
        break;
      case "east": case "e":
        walk(0, 1, "east", spltTxt[2]);
        break;
      case "west": case "w":
        walk(0, -1, "west", spltTxt[2]);
        break;
      default:
        writeTxtNL("You walk forwards and derpily trip over.");
        NL();
        break;
    }
  } else if (spltTxt[0] === "scout" || spltTxt[0] === "s") {
    writeTxtSty("You look around you, and you see:");
    var vismap = checkMapVisibility(plyPos, 15, maps[0], maps[2]);
    copyMaps(maps, knownMaps, vismap);
    writeVisMap(plyPos, 15, vismap, maps[0], maps[2], true);
    NL();
    NL();
  } else if (spltTxt[0] === "map" || spltTxt[0] === "m") {
    if (godMode) {
      writeTxtSty("You use the awesome power of the devs, and the entire world is revealed:");
      writeColorMap(generateColorMap(maps[2], maps[0]), plyPos);
    } else {
      writeTxtSty("You try to remember the maps you've already made...");
      writeColorMap(generateColorMap(knownMaps[2], knownMaps[0]), plyPos);
    }
    NL();
  } else if (spltTxt[0] === "help" || spltTxt[0] === "?") {
    writeTxtSty("Help", null, true);
    NL();
    writeTxtNL("help|?              -- This help");
    writeTxtNL("w[alk] <dir> [dist] -- Walk in dir, dist km if given");
    writeTxtNL(" -> dir: n[orth]|s[outh]|w[est]|e[ast]");
    writeTxtNL("s[cout]             -- Explore your surroundings");
    writeTxtNL("m[ap]               -- Draw a map of your achievements so far");
    writeTxtNL("code                -- Credits");
    NL();
  } else {
    writeTxtSty("You said: '" + text + "'!", "blue", true);
    NL();
    NL();
  }
}

function init() {
  NL();
  NL();
  writeTxtNL("You wake up lying on the ground. Where are you? I guess you'd better find out.");
  var mapHeight = initTerrainMap(mapSize, mapScale, mapVariance, true);
  var mapHumidity = initTerrainMap(mapSize, mapScale, mapVariance, false);
  var mapBiome = generateBiomeMap(mapHeight, mapHumidity);
  maps = new Array(3);
  maps[0] = mapHeight;
  maps[1] = mapHumidity;
  maps[2] = mapBiome;
  //writeColorMap(initPlaces(maps[2]));
  initPlaces(maps[2]);
  knownMaps = new Array(3);
  knownMaps[0] = initEmptyMap(mapSize, mapScale);
  knownMaps[1] = initEmptyMap(mapSize, mapScale);
  knownMaps[2] = initEmptyMap(mapSize, mapScale);
  NL();
  // writeMapBiome(mapBiome, mapHeight);
  plyPos = [Math.round(mapHeight.length / 2), Math.round(mapHeight[0].length / 2)];
  // plyPos = [50, 50];
  writeTxtNL("You look around...");
  // Take a break! http://xkcd.com/kite/kite_trick.jpg
  //printVisMap(plyPos, 15, checkVisibility(plyPos, 15, mapHeight, mapBiome), mapHeight, mapBiome, false);
  writeVisMap(plyPos, 15, checkMapVisibility(plyPos, 15, mapHeight, mapBiome), mapHeight, mapBiome, true);
  NL();
  NL();
  var input = document.getElementById("input");
  input.value = "";
  input.focus();
}

function initPlaces(bM) {
  var groupThreshold = 10;
  
  // Forest
  var colourMap = new Array(bM.length);
  var cellForestGroup = new Array(bM.length);
  var forestGroups = []; // [[x1,y1],[x2,y2]]
  // Determine if each cell has a high enough surround of forest to count as a place
  var i, j, k, l,m;
  for(i = 0; i < bM.length; i++) {
    cellForestGroup[i] = new Array(bM[i].length);
    colourMap[i] = new Array(bM[i].length);
    for(j = 0; j < bM[i].length; j++) {
      // Check surrounding 5*5 square for forest
      var numForest = 0;
      for(k = -2; k < 3; k++) for(l = -2; l < 3; l++) {
        var inBounds =  i + k > 0 && i + k < bM.length && j + l > 0 && j + l < bM[i].length;
        if(inBounds && bM[i+k][j+l] === 2) numForest++;
      }
      // If the number of surrounding forest cells is above threshold, add it to a group.
      if(numForest > groupThreshold){
        // Check if cell neighbours one numbered forest cell
          // Number it the same and add cell to group
        // If cell neighbours two differently numbered cells
          // Number it the same as group A and set all cells in group B to be in group A
        // If cell has no neighbouring forest, create new group
        var aboveGroup = i-1 >= 0 ? cellForestGroup[i-1][j] : -1;
        var leftGroup = j-1 >= 0 ? cellForestGroup[i][j-1] : -1;
        if(aboveGroup !== -1) {
          cellForestGroup[i][j] = aboveGroup;
          forestGroups[aboveGroup].push([i, j]);
          if(leftGroup !== -1 && leftGroup !== aboveGroup) {
            var group = forestGroups[leftGroup];
            for(m = 0; m < group.length; m++) {
              cellForestGroup[ group[m][0] ][ group[m][1] ] = aboveGroup;
              forestGroups[aboveGroup].push(group[m]);
              forestGroups[leftGroup] = [];
            }
          }
        } else if(leftGroup !== -1) {
          cellForestGroup[i][j] = leftGroup;
          forestGroups[leftGroup].push([i, j]);
        } else {
          cellForestGroup[i][j] = forestGroups.length;
          forestGroups.push([[i,j]]);
        }
      } else {
        cellForestGroup[i][j] = -1;
      }
      colourMap[i][j] = numForest > groupThreshold ? "black" : "white";
    }
  }
  forestGroups = forestGroups.filter(function(n){ return n.length !== 0; });
  console.log("Number of groups: " + forestGroups.length);
  forestSizes = data_biomeNames[0].sizes;
  for(i = 0; i < forestGroups.length; i++) {
    var foundSize = null;
    for(j = 0; j < forestSizes.length && foundSize === null; j++) {
      var minSize = forestSizes[j].size[0];
      var maxSize = forestSizes[j].size[1];
      if((minSize === null || forestGroups[i].length >= minSize) &&
         (maxSize === null || forestGroups[i].length <= maxSize)) {
          foundSize = j;
        }
    }
    if(foundSize === null) {
      // Could not find size for group, remove item and decrement counter.
      forestGroups.splice(i--, 1);
    } else {
      // Found correct size group, pick random nameset and generate name.
      var namesets = forestSizes[foundSize].namesets;
      var nameset = null;
      var rand = Math.random();
      for(j = 0; j < namesets.length && nameset === null; j++) {
        rand -= namesets[j].probability;
        if(rand < 0) nameset = namesets[j].nameset;
      }
      // Generate name
      var forestName = "";
      for(j = 0; j < nameset.length; j++) {
        forestName += nameset[j][Math.floor(Math.random() * nameset[j].length)];
      }
      console.log("Name " + (i+1) + ": " + forestName + ";");
    }
  }
  return colourMap;
}

function writeVisMap(pos, vis, vM, hM, bM, mask) {
  // Calculate offset on tiles and apply visibility mask and range of sight
  var visHMap = new Array(vis * 2 - 1);
  var visBMap = new Array(vis * 2 - 1);
  var i, j;
  for (i = 0; i < 2 * vis - 1; i++) {
    visHMap[i] = new Array(vis * 2 - 1);
    visBMap[i] = new Array(vis * 2 - 1);
    for (j = 0; j < 2 * vis - 1; j++) {
      var insideMap = i + pos[0] - vis + 1 >= 0 && j + pos[1] - vis + 1 >= 0 && i + pos[0] - vis + 1 < vM.length && j + pos[1] - vis + 1 < vM[0].length;
      var masked = insideMap && vM[i + pos[0] - vis + 1][j + pos[1] - vis + 1] !== 1 && mask;
        if (insideMap && !masked) {
          visHMap[i][j] = hM[i + pos[0] - vis + 1][j + pos[1] - vis + 1];
          visBMap[i][j] = bM[i + pos[0] - vis + 1][j + pos[1] - vis + 1];
        } else {
          visHMap[i][j] = -1;
          visBMap[i][j] = -1;
        }
    }
  }
  
  var visPos = [vis - 1, vis - 1];
  writeColorMap(generateColorMap(visBMap, visHMap), visPos);
}

function writeColorMap(map, pos) {
  NL();
  var e = document.createElement('canvas');
  e.width = canvasScale * map.length;
  e.height = canvasScale * map[0].length;
  var ctx = e.getContext("2d");
  var i, j;
  for (i = 0; i < map.length; i++) {
    for (j = 0; j < map[i].length; j++) {
      ctx.fillStyle = map[i][j];
      ctx.fillRect(j * canvasScale, i * canvasScale, canvasScale, canvasScale);
      if (pos != null && i === pos[0] && j === pos[1]) {
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

function getPoint(m, x, y) {
  while (x < 0) {
    x += m.length;
  }
  while (y < 0) {
    y += m[0].length;
  }
  return m[x % m.length][y % m[0].length];
}
