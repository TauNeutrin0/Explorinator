var map;
var mapSize = [360,360];
var mapScale = 3;//scale of features will be 2^mapscale
var mapVariance = 0.4;
var mapBiome;// 0-water 1-grassland, 2-forest, 3-desert, 4-rock, 5-beach, 6-marsh
var plyPos



function writeTxtSty(text,color,bold) {
  var e = document.createElement('span');
  e.innerHTML = text;
  e.style.color = color;
  if(bold){e.style["font-weight"] = "bold";}
  document.body.appendChild(e);
}

function writeTxt(text) {
  document.body.appendChild(document.createTextNode(text));
}

function NL() {
  document.body.appendChild(document.createElement('br'));
}

function submitText(text) {
  text = text.toLowerCase();
  if(text == "code"){
    var e = document.createElement('a');
    e.innerHTML = "Explorinator on github";
    e.href = "https://github.com/TauNeutrin0/Explorinator/tree/gh-pages";
    document.body.appendChild(e);
  }else if(text.slice(0, 4) == "walk"){
    writeTxtSty("You walk forwards and derpily trip over");
    NL();
    NL();
  }else{
    writeTxtSty("You said: '"+text+"'!","blue",true);
    NL();
    NL();
    
  }
}

function init() {
  writeTxt("You wake up lying on the floor. Where are you? I guess you'd better find out.");
  NL();
  var mapHeight = initMap(mapSize,mapScale,mapVariance,true);
  var mapHumidity = initMap(mapSize,mapScale,mapVariance,false);
  var mapBiome = JSON.parse(JSON.stringify(mapHeight));
  for(i=0;i<mapHeight.length;i++){
    for(j=0;j<mapHeight[i].length;j++){
      if(mapHeight[i][j]<-0.8) {
        mapBiome[i][j] = 0;
      } else if(mapHumidity[i][j]<-0.8) {
        mapBiome[i][j] = 3;
      } else if(mapHeight[i][j]<-0.75) {
        mapBiome[i][j] = 5;
      } else if(mapHeight[i][j]<-0.5) {
        if(mapHumidity[i][j]>1.5){
          mapBiome[i][j] = 6;
        } else {
          mapBiome[i][j] = 1;
        }
      } else if(mapHeight[i][j]<0.5) {
        if(mapHumidity[i][j]<-0.75){
          mapBiome[i][j] = 3;
        } else if(mapHumidity[i][j]>0.5){
          mapBiome[i][j] = 2;
        } else {
          mapBiome[i][j] = 1;
        }
      } else if(mapHeight[i][j]<0.75) {
        if(mapHumidity[i][j]<-0.85){
          mapBiome[i][j] = 3;
        } else if(mapHumidity[i][j]>0.3){
          mapBiome[i][j] = 2;
        } else {
          mapBiome[i][j] = 1;
        }
      } else {
        mapBiome[i][j] = 4;
      }
    }
  }
  NL();
  writeMapBiome(mapBiome,mapHeight);
  NL();
}

function writeMapShaded(m) {
  NL();
  for(i=0;i<m.length;i++) {
    for(j=0;j<m[0].length;j++) {
      writeTxtSty("\u2588\u2588","#"+Math.round((m[i][j]+1.2)*255/2.4).toString(16)+Math.round((m[i][j]+1.2)*255/2.4).toString(16)+Math.round((m[i][j]+1.2)*255/2.4).toString(16),true);
    }
    NL();
  }
  NL();
}

function writeMapBiome(m,hM) {
  NL();
  for(i=0;i<m.length;i++) {
    for(j=0;j<m[0].length;j++) {
      if(m[i][j]==0){
        writeTxtSty("\u2588\u2588","Blue",true);
      } else if (m[i][j]==1) {
        writeTxtSty("\u2588\u2588","hsl(100, 100%, "+(70+hM[i][j]*20)+"%)",true);
      } else if (m[i][j]==2) {
        writeTxtSty("\u2588\u2588","hsl(120, 100%, "+(20+hM[i][j]*10)+"%)",true);
      } else if (m[i][j]==3) {
        writeTxtSty("\u2588\u2588","hsl(60, 100%, "+(60+hM[i][j]*20)+"%)",true);
      } else if (m[i][j]==4) {
        writeTxtSty("\u2588\u2588","hsl(0, 0%, "+(50-hM[i][j]*20)+"%)",true);
      } else if (m[i][j]==5) {
        writeTxtSty("\u2588\u2588","hsl(40, 100%, "+(70+hM[i][j]*20)+"%)",true);
      } else if (m[i][j]==6) {
        writeTxtSty("\u2588\u2588","hsl(180, 60%, "+(50+hM[i][j]*20)+"%)",true);
        alert(6);
      } else {
        if(i==100){
          alert(i+" "+j+" "+m[i][j]);
        }
      }
    }
    NL();
  }
  NL();
}

function initMap(mSize,mScale,mVariance,water) {
  var size = [Math.ceil(mSize[0]/Math.pow(2,mScale))*mScale+1,Math.ceil(mSize[1]/Math.pow(2,mScale))*mScale+1];
  var scale = Math.pow(2,mScale);
  var map=new Array(size[0]);
  for(i=0;i<map.length;i++) {
    map[i]=new Array(size[1]);
  }
  var variance = mapVariance;
  //Diamond square algorithm go!
  for(i=0;i<map.length;i+=scale) {
    for(j=0;j<map[i].length;j+=scale) {
      if((i<=scale||j<=scale||i>=map.length-scale||j>=map[i].length-scale)&&water){
        x=i;
        y=j;
        while(x<0){
          x+=map.length;
        }
        while(y<0){
          y+=map[0].length;
        }
        map[(x%map.length)][(y%map[0].length)] = -1;
      } else {
        x=i;
        y=j;
        while(x<0){
          x+=map.length;
        }
        while(y<0){
          y+=map[0].length;
        }
        map[(x%map.length)][(y%map[0].length)] = Math.random()*2-1;
      }
    }
  }
  while(scale>1){
    //Diamond
    var hS = scale/2;
    for(i=0;i<map.length;i+=scale){
      for(j=0;j<map[i].length;j+=scale) {
        x=i+hS;
        y=j+hS;
        while(x<0){
          x+=map.length;
        }
        while(y<0){
          y+=map[0].length;
        }
        map[(x%map.length)][(y%map[0].length)] = ((getPoint(map,i,j)+getPoint(map,i,j+scale)+getPoint(map,i+scale,j)+getPoint(map,i+scale,j+scale))/4.0)+(Math.random()*2-1)*variance;
      }
    }
    //Square
    for(i=0;i<map.length;i+=scale){
      for(j=0;j<map[i].length;j+=scale) {
        var x = i+hS;
        var y = j;
        while(x<0){
          x+=map.length;
        }
        while(y<0){
          y+=map[0].length;
        }
        map[(x%map.length)][(y%map[0].length)] = ((getPoint(map,i,j)+getPoint(map,i+scale,j)+getPoint(map,i+hS,j-hS)+getPoint(map,i+hS,j+hS))/4.0)+(Math.random()*2-1)*variance;
        x=i;
        y=j+hS;
        while(x<0){
          x+=map.length;
        }
        while(y<0){
          y+=map[0].length;
        }
        map[(x%map.length)][(y%map[0].length)] = ((getPoint(map,i,j)+getPoint(map,i,j+scale)+getPoint(map,i-hS,j+hS)+getPoint(map,i+hS,j+hS))/4.0)+(Math.random()*2-1)*variance;
      }
    }
    console.log("Scale: "+scale);
    variance/=2;
    scale/=2;
  }
  return map;
  
  diamondSquare(Math.pow(2,mapScale),size);
  //http://www.bluh.org/code-the-diamond-square-algorithm/
}
function getPoint(m,x,y) {
  while(x<0){
    x+=m.length;
  }
  while(y<0){
    y+=m[0].length;
  }
  return m[x%m.length][y%m[0].length];
}