var map;
var mapSize = [100,100];
var mapScale = 3;//scale of features will be 2^mapscale

function writeTxt(text) {
  document.body.appendChild(document.createTextNode(text));
}
function NL() {
  document.body.appendChild(document.createElement('br'));
}
function submitText(text) {
  writeTxt("You said: '"+text+"'!");
  NL();
  NL();
}

function init() {
  writeTxt("Start");
  NL();
  NL();
  initMap();
}

function initMap() {
  var size = [Math.ceil(mapSize[0]/Math.pow(2,mapScale))*mapScale,Math.ceil(mapSize[1]/Math.pow(2,mapScale))*mapScale];
  map=new Array(size[0]);
  console.log("Init map: "+map.length+";  size[0]: "+size[0]+".");
  for(i=0;i<map.length;i++) {
    if(i==0) {
      console.log("0 row init");
    }
    map[i]=new Array(size[1]);
  }
  //Diamond square algorithm go!
  
  alg(Math.pow(2,mapScale),size);
  //http://www.bluh.org/code-the-diamond-square-algorithm/
}

function alg(scale,size){
  var variance = 1.0;
  
  for(i=0;i<map.length;i+=scale) {
    for(j=0;j<map[0].length;j+=scale) {
      setPoint(i,j,Math.random()*2-1);
    }
  }
  /*while(scale>1){
    //Diamond
    var hS = scale/2;
    for(i=0;i<map.length;i+=scale){
      for(j=0;j<map[i].length;j+=scale) {
        setPoint(i+hS,j+hS,((getPoint(i,j)+getPoint(i,j+scale)+getPoint(i+scale,j)+getPoint(i+scale,j+scale))/4.0)+(Math.random()*2-1)*variance);
        //console.log("Diamond step: "+i+" "+j+"  hs:"+hS+".");
      }
    }
    //Square
    for(i=0;i<map.length;i+=scale){
      for(j=0;j<map[i].length;j+=scale) {
        setPoint(i+hS,j,((getPoint(i,j)+getPoint(i+scale,j)+getPoint(i+hS,j-hS)+getPoint(i+hS,j+hS))/4.0)+(Math.random()*2-1)*variance);
        setPoint(i,j+hS,((getPoint(i,j)+getPoint(i,j+scale)+getPoint(i-hS,j+hS)+getPoint(i+hS,j+hS))/4.0)+(Math.random()*2-1)*variance);
        //console.log("Square step: "+i+" "+j+"  hs:"+hS+".");
      }
    }
    console.log("Scale: "+scale);
    variance/=2;
    scale/=2;
  }*/
  for(i=0;i<map.length;i++){
    for(j=0;j<map[i].length;j++) {
      writeTxt(map[i][j]+" ");
    }
    NL();
  }
  console.log("0,0: "+map[0][0]);
}
function getPoint(x,y) {
  while(x<0){
    x+=map.length;
  }
  while(y<0){
    y+=map[0].length;
  }
  //console.log("x: "+x+"; x%:"+(x%map.length)+";  y: "+y+";  y%:"+(y%map.length)+".");
  return map[x%map.length][y%map[0].length];
}
function setPoint(x,y,val) {
  while(x<0){
    x+=map.length;
  }
  while(y<0){
    y+=map[0].length;
  }
  //console.log("x: "+x+"; x%:"+(x%map.length)+";  y: "+y+";  y%:"+(y%map.length)+";  val: "+val+".");
  if(x==0&&y==0) {
    console.log("0,0 set: "+val);
    console.log((typeof (x%map.length))+" "+(typeof (y%map[0].length))+" "+(typeof (val)));
  }
  map[(x%map.length)][(y%map[0].length)] = val;
  if(x==0&&y==0) {
    console.log("0,0 set to "+map[0][0]+"!");
  }
}
