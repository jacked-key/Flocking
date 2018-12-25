/*jshint esversion: 6 */
d3.select('h1').style('color', 'white');
d3.select('h1').style('font-size', '24px');

var NUM = 100; //NUMber of dots that we will have
var WIDTH = 1000; //WIDTH of screen
var HEIGHT = 1000; //HEIGHT of screen
var SPEEDLIM = 10; //speed limitation
var VISION = 9; //how far each unit can see
var INTROVERT = 1; //how introverted the boids are
var STEERINGFACTOR = 0.4; //how well does the boid take it's own current value.
var COHESION = 0.3;
var ALIGNMENT = 0.3;
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
d3.select("body")
    .append("svg")
    .attr("WIDTH", WIDTH)
    .attr("HEIGHT", HEIGHT);
//Select SVG element
var svg = d3.select("svg");

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
    //updating the data don't worry about transitions. Circles are data bound.
    d.cx += d.Xvec;
    d.cy += d.Yvec;
    //these are edge cases, replace with modular arithmetic later to make faster
    if (d.cx > WIDTH) {
      d.cx -= WIDTH;
    } else if(d.cx < 0) {
      d.cx += WIDTH;
    }
    if (d.cy > HEIGHT) {
      d.cy -= HEIGHT;
    } else if(d.cy < 0) {
      d.cy += HEIGHT;
    }
  })
  // Update the circles' positions according to the data.
  circles.attr("cx", function(d) {return d.cx;})
          .attr("cy", function(d) {return d.cy;})
          .attr("r", function(d) {return d.r;})
          .attr("fill", function(d) {return d.fill;});

  var modified = []; //stores the changed data. Don't want to modify the data using modified data
  data.forEach(d => { //updating values.
    xval = [];
    yval = [];
    //current method of VISION #fixthis using matrix / other thing to make faster.
    //This basically goes through everything which is slow as you can see.
    for (var i = 0; i<NUM; i++) {
      var distY = d.cy - data[i].cy;
      var distX = d.cx - data[i].cx;
      var distance = (distY^2)+(distX^2);
      if (distance < VISION) {
        yval.push(Ydistance: distY, d.Yvec);
        xval.push(Xdistance: distX, d.Xvec);
        if (distance < INTROVERT) {

        }
      }
    }

    var vec1 = cohesion(xval, yval);

    d.Xvec -= vec1[0];
    d.Yvec -= vec1[1];
    var magSq = ((d.Xvec^2) + (d.Yvec^2))^(1/2);

    //normalize is there better math? #fixthis ?
    if (magSq >SPEEDLIM) {
      d.Xvec = (d.Xvec / magSq) * SPEEDLIM;
      d.Yvec = (d.Yvec / magSq) * SPEEDLIM;
    }
    //movement based on vectors

    d.cx += d.Xvec;
    d.cy += d.Yvec;
    if (d.cx > WIDTH) {
      d.cx -= WIDTH;
    } else if(d.cx < 0) {
      d.cx += WIDTH;
    }
    if (d.cy > HEIGHT) {
      d.cy -= HEIGHT;
    } else if(d.cy < 0) {
      d.cy += HEIGHT;
    }
  });


}, 50);


function cohesion(p1,p2) {
    var vec = [0,0]; //0 is x, 1 is y
    var length = p1.length;
    if (length == 0) {
      return vec;
    }
    for (var i = 0; i < length; i++) {
      vec[0] += p1[i];
      vec[1] += p2[i];
    }
    vec[0] = vec[0]/length;
    vec[1] = vec[1]/length;
    return vec;
}
function alightment(p1, p2){

}
function seperation(p1, p2){

}
