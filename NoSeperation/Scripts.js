/*jshint esversion: 6 */
d3.select('h1').style('color', 'white');
d3.select('h1').style('font-size', '24px');

var NUM = 1000; //NUMber of dots that we will have
var WIDTH = 200; //WIDTH of screen
var HEIGHT = 200; //HEIGHT of screen
var SPEEDLIM = 9; //speed limitation
var VISION = 400; //how far each unit can see
var INTROVERT = 1; //how introverted the boids are
var STEERINGFACTOR = 0.8; //how well does the boid take it's own current value.
var COHESION = 0.1;
var ALIGNMENT = 0.1;
var seperation = 0;  //value of seperation is only high when the boids are close
//currently, the new vectors are 0.4 of currnet, 0.3 of cohesion and 0.3 of allignment

//our 100 boids #Fixthis? use a matrix with linked list to speed up calculation.
var data = d3.range(NUM).map(() => {
  return {
    cx: Math.floor(Math.random() * WIDTH),
    cy: Math.floor(Math.random() * HEIGHT),
    r: 0.5,
    fill: "white",
    Xvec: (Math.random()*6)-3, //speed goes from -3 to 3 initially
    Yvec: (Math.random()*6)-3
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
  data.forEach(d => { //updating values.
    xval = [];
    yval = [];
    //current method of VISION #fixthis using matrix / other thing to make faster.
    //This basically goes through everything which is slow as you can see.
    for (var i = 0; i<NUM; i++) {
      var distY = d.cy - data[i].cy;
      var distX = d.cx - data[i].cx;
      var distance = (distY**2)+(distX**2);
      if (distance < VISION) {
        yval.push({distY: distY, Yvec: d.Yvec, cy: d.cy});
        xval.push({distX: distX, Xvec: d.Xvec, cx: d.cx});
        /* //A way to push things to close together away.
        if (distance < INTROVERT) {

        }
        */
      }
    }

    var vec1 = cohesion(xval, yval, d);
    var vec2 = alignment(xval, yval, d);
    var summedX = vec1[0]*COHESION + vec2[0]*ALIGNMENT + d.Xvec*STEERINGFACTOR;
    var summedY = vec1[1]*COHESION + vec2[1]*ALIGNMENT + d.Xvec*STEERINGFACTOR;

    var magSq = ((summedX**2) + (summedY**2));
    //normalize -> is there better math?
    if (magSq > SPEEDLIM) {
      summedX = (summedX / magSq) * SPEEDLIM;
      summedY = (summedY / magSq) * SPEEDLIM;
    }
    modified.push({Xvec: summedX, Yvec: summedY});
  });
  for (var i = 0; i < NUM; i++) {
    data[i].Xvec = modified[i].Xvec;
    data[i].Yvec = modified[i].Yvec;
  }
}, 50);


function cohesion(p1, p2, d) {
    var vec = [0,0]; //0 is x, 1 is y
    var length = p1.length;
    //if no close by points, return original vectors
    if (length == 0) {
      vec = [d.Xvec, d.Yvec];
      return vec;
    }
    for (var i = 0; i < length; i++) {
      vec[0] += p1[i].distX;
      vec[1] += p2[i].distY;
    }
    vec[0] = vec[0]/length;
    vec[1] = vec[1]/length;
    return vec;
}
function alignment(p1, p2, d){
  var vec = [0,0]; //0 is x, 1 is y
  var length = p1.length;
  //if no close by points, return original vectors
  if (length == 0) {
    vec = [d.Xvec, d.Yvec];
    return vec;
  }
  for (var i = 0; i < length; i++) {
    vec[0] += p1[i].Xvec;
    vec[1] += p2[i].Yvec;
  }
  vec[0] = vec[0]/length;
  vec[1] = vec[1]/length;
  return vec;
}
