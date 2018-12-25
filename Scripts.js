/*jshint esversion: 6 */
d3.select('h1').style('color', 'white');
d3.select('h1').style('font-size', '24px');

var num = 100; //number of dots that we will have
var width = 1000; //width of screen
var height = 1000; //height of screen
var speedLim = 10; //speed limitation
var vision = 9; //how far each unit can see

//our 100 boids #Fixthis? use a matrix with linked list to speed up calculation.
var data = d3.range(num).map(() => {
  return {
    cx: Math.floor(Math.random() * width),
    cy: Math.floor(Math.random() * height),
    r: 0.5,
    fill: "white",
    Xvec: (Math.random()*6)-3, //speed goes from -3 to 3.
    Yvec: (Math.random()*6)-3
  };
});
//appending svg
d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
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
    if (d.cx > width) {
      d.cx -= width;
    } else if(d.cx < 0) {
      d.cx += width;
    }
    if (d.cy > height) {
      d.cy -= height;
    } else if(d.cy < 0) {
      d.cy += height;
    }
  })

  data.forEach(d => { //updating values.
    xval = [];
    yval = [];
    //current method of vision #fixthis using matrix / other thing to make faster.
    //This basically goes through everything which is slow as you can see. 
    for (var i = 0; i<num; i++) {
      var distY = d.cy - data[i].cy;
      var distX = d.cx - data[i].cx;
      if (((distY^2)+(distX^2)) < vision) {
        yval.push(distY);
        xval.push(distX);
      }
    }

    var vec1 = cohesion(xval, yval);

    d.Xvec -= vec1[0];
    d.Yvec -= vec1[1];
    var magSq = ((d.Xvec^2) + (d.Yvec^2))^(1/2);

    //normalize
    if (magSq >speedLim) {
      d.Xvec = (d.Xvec / magSq) * speedLim;
      d.Yvec = (d.Yvec / magSq) * speedLim;
    }
    //movement based on vectors

    d.cx += d.Xvec;
    d.cy += d.Yvec;
    if (d.cx > width) {
      d.cx -= width;
    } else if(d.cx < 0) {
      d.cx += width;
    }
    if (d.cy > height) {
      d.cy -= height;
    } else if(d.cy < 0) {
      d.cy += height;
    }
  });

  // Update the circles' positions according to the data.
  circles.attr("cx", function(d) {return d.cx;})
          .attr("cy", function(d) {return d.cy;})
          .attr("r", function(d) {return d.r;})
          .attr("fill", function(d) {return d.fill;});
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
