/*jshint esversion: 6 */
d3.select('h1').style('color', 'white');
d3.select('h1').style('font-size', '24px');

var NUM = 1000; //NUMber of dots that we will have
var WIDTH = 1000; //WIDTH of screen
var HEIGHT = 1000; //HEIGHT of screen
var SPEEDLIM = 4; //speed limitation #fixthis implement a speed minimum
var VISION = 900; //how far each unit can see (square rooted)
var INTROVERT = 25; //how introverted the boids are
var STEERINGFACTOR = 1; //how well does the boid take it's own current value.
//REMINDER THAT STEERING IS THE DIFFERENCE IN VECTORS *FIX
var STEERLIM = 1; //steering max turnage instead of steeringFactor
var COHESION = 1;
var ALIGNMENT = 1;
var SEPSTRENGTH = 1;  //value of seperation is only high when the boids are close
//currently, the new vectors are 0.4 of currnet, 0.3 of cohesion and 0.3 of allignment

//our 100 boids #Fixthis? use a matrix with linked list to speed up calculation.
var data = d3.range(NUM).map(() => {
  return {
    cx: Math.floor(Math.random() * WIDTH),
    cy: Math.floor(Math.random() * HEIGHT),
    r: 0.5,
    fill: "white",
    Xvec: (Math.random()*2*SPEEDLIM)-SPEEDLIM, //speed goes from -STEERLIM to STEERLIM
    Yvec: (Math.random()*2*SPEEDLIM)-SPEEDLIM
  };
});
//appending svg
var svg = d3.select("body")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

//creation of the boids, in our case they are circles. could change to triangles
circles = svg.selectAll("circle")
   .data(data)
   .enter().append("circle")
    .attr("cx", function(d) {return d.cx;})
    .attr("cy", function(d) {return d.cy;})
    .attr("r", function(d) {return d.r;})
    .attr("fill", function(d) {return d.fill;});

// Set the ticking interval.
setInterval(() => {
  // Update the data bound to the circles.
  data.forEach(d => { //take in d (as in data) and do something with it
    //updating the data *don't worry about transitions. Circles are data bound.
    d.cx += d.Xvec;
    d.cy += d.Yvec;
    //these are edge cases
    //note a mod b = ((a % b) + b) % b
    d.cx = ((d.cx % WIDTH) + WIDTH) % WIDTH;
    d.cy = ((d.cy % HEIGHT) + HEIGHT) % HEIGHT;
  })
  // Update the circles' positions according to the data.

  circles.attr("cx", function(d) {return d.cx;})
          .attr("cy", function(d) {return d.cy;})
          .attr("r", function(d) {return d.r;})
          .attr("fill", function(d) {return d.fill;});

  var modified = []; //stores the changed data. Don't want to have redundencies


  data.forEach(d => { //using vision to calulate steering
    xval = [];
    yval = [];
    var separation = {Xvec: 0, Yvec: 0}; //used for calculating separatoin
    var Closest = HEIGHT;
    //current method of VISION #fixthis using matrix / other thing to make faster.
    //This basically goes through everything which is slow as you can see.
    for (var i = 0; i<NUM; i++) {
      var distY = data[i].cy - d.cy;
      var distX = data[i].cx - d.cx;
      var distance = ((distY**2)+(distX**2));
      if (distance < VISION && distance != 0) { //distance != 0
        yval.push({distY: distY, Yvec: data[i].Yvec, cy: d.cy});
        xval.push({distX: distX, Xvec: data[i].Xvec, cx: d.cx});
        //#fixthis A way to push things to close together this uses the closest boid
        if (distance < INTROVERT && distance < Closest) {
          Closest = distance;

          separation.Xvec = INTROVERT/distX/10;
          separation.Yvec = INTROVERT/distY/10;
        }
      }
    }

    var vec1 = cohesion(xval, yval, d);
    var vec2 = alignment(xval, yval, d);
    //vec 3
    var summedX = vec1[0]*COHESION + vec2[0]*ALIGNMENT;
    var summedY = vec1[1]*COHESION + vec2[1]*ALIGNMENT;

    summedX -= (separation.Xvec - d.Xvec)*SEPSTRENGTH;
    summedY -= (separation.Yvec - d.Yvec)*SEPSTRENGTH;

    modified.push({Xvec: summedX, Yvec: summedY});
  });
  for (var i = 0; i < NUM; i++) {
    data[i].Xvec += modified[i].Xvec*STEERINGFACTOR;
    data[i].Yvec += modified[i].Yvec*STEERINGFACTOR;
    var magSq = ((data[i].Xvec**2) + (data[i].Yvec**2))**(1/2);
    if (magSq > SPEEDLIM) {
      data[i].Xvec = (data[i].Xvec / magSq) * SPEEDLIM;
      data[i].Yvec = (data[i].Yvec / magSq) * SPEEDLIM;
    }
  }
}, 5);


function cohesion(p1, p2, d) {
    var vec = [0,0]; //0 is x, 1 is y
    var length = p1.length;
    //if no close by points, return original vectors
    if (length == 0) {
      return vec;
    }
    for (var i = 0; i < length; i++) {
      vec[0] += p1[i].distX;
      vec[1] += p2[i].distY;
    }
    vec[0] = vec[0]/length;
    vec[1] = vec[1]/length;
    //steering
    vec[0] = vec[0] - d.Xvec;
    vec[1] = vec[1] - d.Yvec;
    //normalize
    var magSq = ((vec[0]**2) + (vec[1]**2))**(1/2);
    if (magSq > STEERLIM) {
      vec[0] = (vec[0] / magSq) * STEERLIM;
      vec[1] = (vec[1] / magSq) * STEERLIM;
    }
    return vec;
}
function alignment(p1, p2, d){
  var vec = [0,0]; //0 is x, 1 is y
  var length = p1.length;
  //if no close by points, return original vectors

  if (length == 0) {
    return vec;
  }

  for (var i = 0; i < length; i++) {
    vec[0] += p1[i].Xvec;
    vec[1] += p2[i].Yvec;
  }
  vec[0] = vec[0]/length;
  vec[1] = vec[1]/length;
  //steering
  vec[0] = vec[0] - d.Xvec;
  vec[1] = vec[1] - d.Yvec;
  //normalize
  var magSq = ((vec[0]**2) + (vec[1]**2))**(1/2);
  if (magSq > STEERLIM) {
    vec[0] = (vec[0] / magSq) * STEERLIM;
    vec[1] = (vec[1] / magSq) * STEERLIM;
  }
  return vec;

}
