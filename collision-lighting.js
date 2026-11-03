(function(){
'use strict';
function pointInPoly(x,y,poly){
 var inside=false;
 for(var i=0,j=poly.length-1;i<poly.length;j=i++){
  var xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
  if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi+0.000001)+xi))inside=!inside;
 }
 return inside;
}
function cross(ax,ay,bx,by){return ax*by-ay*bx}
function createMapPhysics(cfg){
 var floors=cfg.floors,halls=cfg.halls,blockers=cfg.blockers,doors=cfg.doors;
 var width=cfg.width,height=cfg.height,radius=cfg.radius,segments=[],corners=[],cornerKeys={};
 function addSegment(x1,y1,x2,y2){if(Math.hypot(x2-x1,y2-y1)>.5)segments.push([x1,y1,x2,y2])}
 floors.forEach(function(room){
  var poly=room.p;
  for(var i=0;i<poly.length;i++){
   var a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
   if(!length)continue;
   var gaps=[];
   doors.forEach(function(d){
    var px=d[0]+d[2]/2,py=d[1]+d[3]/2;
    var t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(length*length)));
    var ex=a[0]+dx*t,ey=a[1]+dy*t;
    if(Math.hypot(px-ex,py-ey)<34){
     var half=(Math.max(d[2],d[3])/2+13)/length;
     gaps.push([Math.max(0,t-half),Math.min(1,t+half)]);
    }
   });
   gaps.sort(function(x,y){return x[0]-y[0]});
   var cursor=0,parts=[];
   gaps.forEach(function(g){if(g[0]>cursor)parts.push([cursor,g[0]]);cursor=Math.max(cursor,g[1])});
   if(cursor<1)parts.push([cursor,1]);
   parts.forEach(function(part){addSegment(a[0]+dx*part[0],a[1]+dy*part[0],a[0]+dx*part[1],a[1]+dy*part[1])});
  }
 });
 blockers.forEach(function(b){
  addSegment(b[0],b[1],b[0]+b[2],b[1]);
  addSegment(b[0]+b[2],b[1],b[0]+b[2],b[1]+b[3]);
  addSegment(b[0]+b[2],b[1]+b[3],b[0],b[1]+b[3]);
  addSegment(b[0],b[1]+b[3],b[0],b[1]);
 });
 segments.forEach(function(s){
  for(var j=0;j<4;j++){
   var px=j===0||j===3?s[0]:s[2],py=j<2?s[1]:s[3],key=px.toFixed(2)+','+py.toFixed(2);
   if(!cornerKeys[key]){cornerKeys[key]=1;corners.push([px,py])}
  }
 });
 function onFloor(x,y){return floors.some(function(r){return pointInPoly(x,y,r.p)})||halls.some(function(poly){return pointInPoly(x,y,poly)})}
 function isWalkable(x,y){
  var clearance=radius*.94;
  if(x<clearance||y<clearance||x>width-clearance||y>height-clearance)return false;
  if(!onFloor(x,y))return false;
  for(var i=0;i<16;i++){
   var a=i*Math.PI/8;
   if(!onFloor(x+Math.cos(a)*clearance,y+Math.sin(a)*clearance))return false;
  }
  var padded=radius+3;
  return !blockers.some(function(b){
   var cx=Math.max(b[0],Math.min(x,b[0]+b[2])),cy=Math.max(b[1],Math.min(y,b[1]+b[3]));
   return (x-cx)*(x-cx)+(y-cy)*(y-cy)<padded*padded;
  });
 }
 function move(p,dx,dy){
  var steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/2));
  var sx=dx/steps,sy=dy/steps;
  for(var i=0;i<steps;i++){
   if(isWalkable(p.x+sx,p.y))p.x+=sx;
   if(isWalkable(p.x,p.y+sy))p.y+=sy;
  }
 }
 function rayDistance(x,y,angle,maxDistance){
  var rx=Math.cos(angle),ry=Math.sin(angle),nearest=maxDistance;
  segments.forEach(function(s){
   var sx=s[2]-s[0],sy=s[3]-s[1],qx=s[0]-x,qy=s[1]-y,den=cross(rx,ry,sx,sy);
   if(Math.abs(den)<.000001)return;
   var t=cross(qx,qy,sx,sy)/den,u=cross(qx,qy,rx,ry)/den;
   if(t>=0&&u>=0&&u<=1&&t<nearest)nearest=t;
  });
  return nearest;
 }
 function visiblePolygon(x,y,maxDistance){
  var angles=[];
  for(var i=0;i<64;i++)angles.push(i*Math.PI*2/64);
  corners.forEach(function(q){
   var a=Math.atan2(q[1]-y,q[0]-x);
   angles.push(a-.00008,a,a+.00008);
  });
  angles.sort(function(a,b){return a-b});
  var points=[];
  angles.forEach(function(a){
   if(points.length&&Math.abs(a-points[points.length-1].a)<.000001)return;
   points.push({a:a,d:rayDistance(x,y,a,maxDistance)});
  });
  return points.map(function(p){return[x+Math.cos(p.a)*p.d,y+Math.sin(p.a)*p.d]});
 }
 function canSee(a,b,maxDistance){
  var dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d>maxDistance)return false;
  return rayDistance(a.x,a.y,Math.atan2(dy,dx),d)>=d-.5;
 }
 function drawVision(ctx,canvas,p,scale,maxDistance){
  var poly=visiblePolygon(p.x,p.y,maxDistance),cx=canvas.width/2,cy=canvas.height/2,r=maxDistance*scale;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(2,7,13,.94)';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  poly.forEach(function(q,i){var x=cx+(q[0]-p.x)*scale,y=cy+(q[1]-p.y)*scale;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});
  ctx.closePath();ctx.clip();
  var g=ctx.createRadialGradient(cx,cy,r*.16,cx,cy,r);
  g.addColorStop(0,'rgba(2,7,13,0)');g.addColorStop(.7,'rgba(2,7,13,.10)');g.addColorStop(1,'rgba(2,7,13,.84)');
  ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();
 }
 return{isWalkable:isWalkable,move:move,canSee:canSee,drawVision:drawVision};
}
window.CrewMapPhysics={create:createMapPhysics};
})();