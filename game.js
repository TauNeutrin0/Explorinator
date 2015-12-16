/*eslint-env browser */
var mapSize = [360,360];
var mapScale = 3;//scale of features will be 2^mapscale
var mapVariance = 0.4;
//var mapBiome;// 0-water 1-grassland, 2-forest, 3-desert, 4-rock, 5-beach, 6-marsh
var plyPos;

function writeTxtSty(text,color,bold) {
  var e = document.createElement('span');
  e.innerHTML = text;
  e.style.color = color;
  if(bold){e.style["font-weight"] = "bold";}
  document.body.lastElementChild.appendChild(e);
}

function writeTxt(text) {
  document.body.lastElementChild.appendChild(document.createTextNode(text));
}

function NL() {
  //document.body.appendChild(document.createElement('br'));
  var lastChild = document.body.lastElementChild;
  if (lastChild && lastChild.children.length == 0)
    lastChild.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('div'));
}

function submitText(text) {
  text = text.toLowerCase();
  if(text === "code"){
    var e = document.createElement('a');
    e.innerHTML = "Explorinator on github";
    e.href = "https://github.com/TauNeutrin0/Explorinator/tree/gh-pages";
    document.body.appendChild(e);
    NL();
    NL();
  }else if(text.slice(0, 5) === "walk "){
    writeTxtSty("You walk forwards and derpily trip over.");
    NL();
    NL();
  }else if(text.slice(0, 6) === "scout "){
    writeTxtSty("You look around you, but unfortunately you don't know how to look properly as the code has not been written yet.");
    //printVisMap(plyPos,10,checkVisibility(plyPos,10,mapHeight),mapHeight,mapBiome);
    NL();
    NL();
  }else{
    writeTxtSty("You said: '"+text+"'!","blue",true);
    NL();
    NL();
    
  }
}

function init() {
  NL();
  writeTxt("You wake up lying on the floor. Where are you? I guess you'd better find out.");
  NL();
  var mapHeight = initMap(mapSize,mapScale,mapVariance,true);
  var mapHumidity = initMap(mapSize,mapScale,mapVariance,false);
  var mapBiome = genMapBiome(mapHeight,mapHumidity);
  NL();
  writeMapBiome(mapBiome,mapHeight);
  plyPos=[Math.round(mapHeight.length / 2),Math.round(mapHeight[0].length / 2)];
  //Take a break! http://xkcd.com/kite/kite_trick.jpg
  printVisMap(plyPos,10,checkVisibility(plyPos,10,mapHeight),mapHeight,mapBiome);
  NL();
}

function printVisMap(pos,vis,vM,hM,bM) {
	var pM = new Array(vis*2);
	var i,j;
	for(i=0;i<2*vis;i++){
		pM[i] = new Array(vis*2);
		for(j=0;j<2*vis;j++){
			if(vM[i][j]===1){
				pM[i][j] = [hM,bM];
			} else {
				pM[i][j] = [-1,-1];
			}
		}
	}
	
  NL();
  var i,j;
  for(i=0;i<pM.length;i++) {
    for(j=0;j<pM[i].length;j++) {
      if(pM[i][j][1]===-1){
        writeTxtSty("\u2588\u2588","Black",true);
      } else if(pM[i][j][1]===0){
        writeTxtSty("\u2588\u2588","Blue",true);
      } else if (pM[i][j][1]===1) {
        writeTxtSty("\u2588\u2588","hsl(100, 100%, "+(70+pM[i][j][0]*20)+"%)",true);
      } else if (pM[i][j][1]===2) {
        writeTxtSty("\u2588\u2588","hsl(120, 100%, "+(20+pM[i][j][0]*10)+"%)",true);
      } else if (pM[i][j][1]===3) {
        writeTxtSty("\u2588\u2588","hsl(60, 100%, "+(60+pM[i][j][0]*20)+"%)",true);
      } else if (pM[i][j][1]===4) {
        writeTxtSty("\u2588\u2588","hsl(0, 0%, "+(50-pM[i][j][0]*20)+"%)",true);
      } else if (pM[i][j][1]===5) {
        writeTxtSty("\u2588\u2588","hsl(40, 100%, "+(70+pM[i][j][0]*20)+"%)",true);
      } else if (pM[i][j][1]===6) {
        writeTxtSty("\u2588\u2588","hsl(180, 60%, "+(50+pM[i][j][0]*20)+"%)",true);
      }
    }
    NL();
  }
  NL();
}

function checkVisibility(pos,vis,hM) {
	var mapVis = JSON.parse(JSON.stringify(hM));
	var mapGrad = JSON.parse(JSON.stringify(hM));
	var posH = hM[pos[0],pos[1]];
	var i,j;
	for(i=0;i<mapVis.length;i++){
		for(j=0;j<mapVis[i].length;j++){
			if(pos[0]-vis<i&&pos[0]+vis>i&&pos[1]-vis<j&&pos[1]+vis>j){
				if(Math.pow(pos[0]-i,2)+Math.pow(pos[1]-j,2)<=Math.pow(vis,2)){
					mapVis[i][j] = 1;
				} else {
					mapVis[i][j] = 0;
				}
			} else {
				mapVis[i][j] = 0;
			}
		}
	}
	for(i=pos[0]-vis;i<=pos[0]+vis;i++){
	    for(j=pos[1]-vis;j<=pos[1]+vis;j++){
		    if(mapVis===1){
                mapGrad[i][j]=(hM[i][j]-posH)/Math.sqrt(Math.pow(i-pos[0])+Math.pow(j-pos[1]));
            }
        }
	}
	for(i=pos[0]-vis;i<=pos[0]+vis;i++){
	    for(j=pos[1]-vis;j<=pos[1]+vis;j++){
	    	if(mapVis===1){
	    		var graddx = (j-pos[1])/(i-pos[0]); //Essentially gradient from (i,j) to pos
	    		var graddy = (i-pos[0])/(j-pos[1]);
	    		var a,b;
	    		var visible = true;
	    		if(i<pos[0]){
		    		for(a=0;a<pos[0]-1-i;a++){
		    			var y = Math.floor((a+0.5)*graddx+j+0.5);
		    			if(hM[a+i][y]>hM[i][j]||hM[a+i+1][y]>hM[i][j]){
		    				visible=false;
		    			}
		    		}
	    		} else {
			    	for(a=0;a<i-1-pos[0];a++){
			    		var y = Math.floor((a+0.5)*graddx+pos[1]+0.5);
			    		if(hM[a+pos[0]][y]>hM[i][j]||hM[a+pos[0]+1][y]>hM[i][j]){
			    			visible=false;
			    		}
			    	}
	    		}
	    		if(j<pos[1]){
		    		for(a=0;a<pos[1]-1-j;a++){
		    			var x = Math.floor((a+0.5)*graddy+i+0.5);
		    			if(hM[x][a+j]>hM[i][j]||hM[x][a+j+1]>hM[i][j]){
		    				visible=false;
		    			}
		    		}
	    		} else {
			    	for(a=0;a<j-1-pos[1];a++){
			    		var x = Math.floor((a+0.5)*graddy+pos[0]+0.5);
			    		if(hM[x][a+pos[1]]>hM[i][j]||hM[x][a+pos[1]+1]>hM[i][j]){
			    			visible=false;
		    			}
			    	}
	    		}
	    		if(!visible){
	    			mapVis[i][j] = 0;
	    		}

	    	}
    	}
	}
	return mapVis;
}

function writeMapShaded(m) {
  NL();
  var i,j;
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
  var i,j;
  for(i=0;i<m.length;i++) {
    for(j=0;j<m[0].length;j++) {
      if(m[i][j]===0){
        writeTxtSty("\u2588\u2588","Blue",true);
      } else if (m[i][j]===1) {
        writeTxtSty("\u2588\u2588","hsl(100, 100%, "+(70+hM[i][j]*20)+"%)",true);
      } else if (m[i][j]===2) {
        writeTxtSty("\u2588\u2588","hsl(120, 100%, "+(20+hM[i][j]*10)+"%)",true);
      } else if (m[i][j]===3) {
        writeTxtSty("\u2588\u2588","hsl(60, 100%, "+(60+hM[i][j]*20)+"%)",true);
      } else if (m[i][j]===4) {
        writeTxtSty("\u2588\u2588","hsl(0, 0%, "+(50-hM[i][j]*20)+"%)",true);
      } else if (m[i][j]===5) {
        writeTxtSty("\u2588\u2588","hsl(40, 100%, "+(70+hM[i][j]*20)+"%)",true);
      } else if (m[i][j]===6) {
        writeTxtSty("\u2588\u2588","hsl(180, 60%, "+(50+hM[i][j]*20)+"%)",true);
      }
    }
    NL();
  }
  NL();
}

function initMap(mSize,mScale,mVariance,water) {
  var size = [Math.ceil(mSize[0]/Math.pow(2,mScale))*mScale+1,Math.ceil(mSize[1]/Math.pow(2,mScale))*mScale+1];
  var scale = Math.pow(2,mScale);
  var rMap=new Array(size[0]);
  var i,j,x,y;
  for(i=0;i<rMap.length;i++) {
    rMap[i]=new Array(size[1]);
  }
  var variance = mVariance;
  //Diamond square algorithm go!
  for(i=0;i<rMap.length;i+=scale) {
    for(j=0;j<rMap[i].length;j+=scale) {
      if((i<=scale||j<=scale||i>=rMap.length-scale||j>=rMap[i].length-scale)&&water){
        x=i;
        y=j;
        while(x<0){
          x+=rMap.length;
        }
        while(y<0){
          y+=rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = -1;
      } else {
        x=i;
        y=j;
        while(x<0){
          x+=rMap.length;
        }
        while(y<0){
          y+=rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = Math.random()*2-1;
      }
    }
  }
  while(scale>1){
    //Diamond
    var hS = scale/2;
    for(i=0;i<rMap.length;i+=scale){
      for(j=0;j<rMap[i].length;j+=scale) {
        x=i+hS;
        y=j+hS;
        while(x<0){
          x+=rMap.length;
        }
        while(y<0){
          y+=rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = ((getPoint(rMap,i,j)+getPoint(rMap,i,j+scale)+getPoint(rMap,i+scale,j)+getPoint(rMap,i+scale,j+scale))/4.0)+(Math.random()*2-1)*variance;
      }
    }
    //Square
    for(i=0;i<rMap.length;i+=scale){
      for(j=0;j<rMap[i].length;j+=scale) {
        x = i+hS;
        y = j;
        while(x<0){
          x+=rMap.length;
        }
        while(y<0){
          y+=rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = ((getPoint(rMap,i,j)+getPoint(rMap,i+scale,j)+getPoint(rMap,i+hS,j-hS)+getPoint(rMap,i+hS,j+hS))/4.0)+(Math.random()*2-1)*variance;
        x=i;
        y=j+hS;
        while(x<0){
          x+=rMap.length;
        }
        while(y<0){
          y+=rMap[0].length;
        }
        rMap[(x%rMap.length)][(y%rMap[0].length)] = ((getPoint(rMap,i,j)+getPoint(rMap,i,j+scale)+getPoint(rMap,i-hS,j+hS)+getPoint(rMap,i+hS,j+hS))/4.0)+(Math.random()*2-1)*variance;
      }
    }
    variance/=2;
    scale/=2;
  }
  return rMap;
  
  //http://www.bluh.org/code-the-diamond-square-algorithm/
}

function genMapBiome(mapHeight,mapHumidity) {
  var mapBiome = JSON.parse(JSON.stringify(mapHeight));
  var i,j;
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
  return mapBiome;
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