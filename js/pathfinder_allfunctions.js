var margin = {
    top: 40.5,
    right: 40.5,
    bottom: 50.5,
    left: 60.5
};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var axis_height = 150;

var sc = Math.min(width, height) * 1

var projection = d3.geo.equirectangular()
    .scale(sc)
    .translate([width / 2, height / 2])
    .rotate([-80, 0])
    .precision(100);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 15])
    .on("zoom", move);

var path = d3.geo.path()
    .projection(projection);

var path_width = 6;

var graticule = d3.geo.graticule();

//Variable to store index of path currently being edited
var curr_path = 0;

//Variable to store branch info (no/distance)
var branches = [];

//Vector to store index of nodes that are sources of pathways - removed jan 13 2015
//var sources=[];

//New Approach!!
/* replaced with linked list inside node objects
   //Used to reconstruct pathway
        var incoming = [];

        //Used to reconstruct pathway
        var outgoing = [];
*/

//Assign unique node_no for each new node;
var node_counter = -1;

//index of which is the active node, set to -1 for no active node (i.e new path)
var active_node = -1;

//index of starting node of main branch, defaults to first node created
// (can be modified by user)
var start_node = 0;

//index of last node of main_branch, defaults to last one of first branch created 
// (can be modified by user). 
var end_node = -1;

//Vector node info 
var nodes = [];

//Vars to store node and path handles (svg components)  for the individual paths
var node_handles = [];
var path_handles = [];

var colors = ['#000000'];

//Axis Variables 
var x = d3.scale.linear()
    .domain([0, 100]) //determined by draw_path as min and max distances
    .range([0, width]);

var y = d3.scale.linear()
    //.base(Math.E)
    .domain([0, 1]) //determined by draw_path as [0, num_branches];
    .range([axis_height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(1)
    //.tickFormat(function(d) { return "e" + formatPower(Math.round(Math.log(d))); });


/*
var colors = d3.scale.quantize()
			.range(colorbrewer.Greens[7]);
		 
*/

//Random Color Generator
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var svg = d3.select("#js-map-nz-center").append("svg")
    //var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", add_node)
    /* 	    .on("dbclick",function(){console.log ('double clicked');}) */
    /* 	    .call(zoom); */

var g = svg.append("g")
    .on("mousemove", mousemoved);


g.append("path")
    .datum(graticule.outline)
    .attr("class", "background")
    .attr("d", path);

g.append("g")
    .attr("class", "graticule")
    .selectAll("path")
    .data(graticule.lines)
    .enter().append("path")
    .attr("d", path);

g.insert("path", ".graticule")
    .datum(topojson.mesh(worldtopo, worldtopo.objects.countries, function(a, b) {
        return a.id !== b.id;
    }))
    .attr("class", "boundary")
    .attr("d", path);

g.insert("path", ".graticule")
    .datum(topojson.object(worldtopo, worldtopo.objects.land))
    .attr("class", "land")
    .attr("d", path);

pathgroup = g.append("g")


axes = d3.select(".container").append("svg")
    .attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .attr("height", axis_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

axes.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(-15,0)")
    .call(yAxis);

axes.append("text") //text label for the y axis
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (axis_height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Branch Number");

axes.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (axis_height + 10) + ")")
    .call(xAxis);

axes.append("text") // text label for the x axis
    .attr("transform", "translate(" + (width / 2) + " ," + (axis_height + margin.bottom / 1.2) + ")")
    .style("text-anchor", "middle")
    .text("Along Track Distance");


var drag = d3.behavior.drag()
    .on("drag", dragmove);

var newlineFunction = d3.svg.line()
    .x(function(d) {
        return nodes[d].x;
    })
    .y(function(d) {
        return nodes[d].y;
    })
    .interpolate("cardinal");



// Add node to end of branch/pathway
function add_node(d, i) {

    //Grab mouse position  
    d = d3.mouse(this);

    //Increment node_counter
    ++node_counter;

    //Create new node object
    var new_node = {
        x: d[0],
        y: d[1],
        dist: -1,
        source: true, //var to flag source nodes (nodes that start pathways)
        ind: nodes.length, //stores index within nodes vector
        incoming: [active_node], //no need to store visited since we only build branches forward, not backward
        outgoing: []
    }

    //If pathway has at least two nodes, update incoming, outgoing	
    if (active_node > -1) {

        //Add the new node to the list of outgoing for the previous node. 
        nodes[active_node].outgoing.push({
            node: node_counter,
            visited: false //for branch buildling, keeps track if this path segment has been visited
        });

        new_node.source = false;

    }

    nodes.push(new_node);

    end_node = node_counter;

    draw_nodes();

}

//Function to expand spine into pathway
function expand_path() {
    //TO DO 	
}

//Function to update along track distance of nodes in a given path
function update_dist(pathHandle) {

        //Cycle through all distances and set to -1
        nodes.map(function(n) {
            n.dist = -1;
        })


        //For each branch, calculate node dist values (start on main branch by default (if main branch is the first one drawn!)
        //CAVEAT: MAIN BRANCH IS NOT NECESSARILY THE FIRST ONE DRAWN. THINK OF BETTER WAY OF DOING THIS
        for (var j = 0; j < pathHandle.length; j++) {
            /* console.log('*** branch ', j , '****'); */
            //var dist;

            //Value to add to start of branches off main pathway - this value will be updated in a separate function. 
            //var delta = 0;

            var segments = pathHandle[j].node().pathSegList;

            console.log('total path seg is ', pathHandle[j].node().getTotalLength());
            for (jj = 0; jj < segments.length; jj++) {
                console.log('segment ', jj, ' is ', segments.getItem(jj).x, segments.getItem(jj).y);
            }



            for (i = 0; i < nodes.length; i++) {
                if (nodes[i].hasOwnProperty('x')) { //Node has not been deleted
                    p = closestPoint(pathHandle[j].node(), [nodes[i].x, nodes[i].y]);
                    if (p.distance < 1) { //node is on path

                        console.log('node ', i, ' pos is ', nodes[i], x, nodes[i].y);
                        //console.log('pathhandle is ', pathHandle[j].node());


                        if (nodes[i].dist < 0) { // node distance has not been computed yet 
                            //delta = nodes[i].dist;

                            nodes[i].dist = p.scanLength; // + delta
                        } //end if

                    } // end if 

                } //end if
            } // end for each nodes


        } //end for each pathHandle
        if (branches.length > 1)
            calculate_relative_distances();


        var min_dist = 0;
        var max_dist = 0;

        //Update min/max length of branches
        branches.map(function(d, i) {
            d.min_dist = nodes[d.nodes[0]].dist,
                d.max_dist = nodes[d.nodes[d.nodes.length - 1]].dist;

            //Update min_dist and max_dist for plot axis
            min_dist = Math.min(min_dist, d.min_dist);
            max_dist = Math.max(max_dist, d.max_dist);

        })

        //Update X Domain
        x.domain([min_dist, max_dist]);
        y.domain([0, branches.length]);


    } //end function 




//function that calculates node distances in relation to the main branch, not necessarily to the start of their own branch.  
function calculate_relative_distances() {

        /*
//Find main branch
				var main_branch= branches.filter(function(n) {
				  return n.main;
				});
				
*/

        //Store distance at @ branching node (for both outgoing and incoming branch distance calcuations)
        var curr_dist;

        //Filter out nodes that have outgoing branches.
        var nodes_outgoing = nodes.filter(function(d, i) {
            return d.outgoing.length > 1
        });


        //cycle through nodes with outgoing branches
        nodes_outgoing.map(function(curr_node) {

                //console.log('Currently at node ' , curr_node.ind);
                curr_dist = curr_node.dist;
                //console.log('starting distance is ', curr_dist);	

                //Select branches stemming from this node that are not the main branch
                update_branches = branches.filter(function(n) {
                    return n.nodes[0] == curr_node.ind & !n.main
                });

                //console.log('This node has ', update_branches.length , 'stemming branches');

                //cycle through each stemming branch
                update_branches.map(function(branch, i) {

                        //Cycle through each node in the branch, update distance
                        branch.nodes.map(function(n, i) {
                                if (i > 0) {
                                    nodes[n].dist = nodes[n].dist + curr_dist;
                                } //end if
                            }) //end branch.nodes.map


                    }) //end update_branches.map			 	 	


            }) // end nodes_outgoing.map


        //Filter out nodes that have incoming branches.
        var nodes_incoming = nodes.filter(function(d, i) {
            return nodes[i].incoming.length > 1
        });


        //cycle through nodes with outgoing branches
        nodes_incoming.map(function(curr_node) {

                //console.log('Currently at node ' , curr_node.ind);
                curr_dist = curr_node.dist;
                //console.log('starting distance is ', curr_dist);	

                //Select branches stemming from this node that are not the main branch
                update_branches = branches.filter(function(n) {
                    return n.nodes[n.nodes.length] == curr_node.ind & !n.main
                });

                //console.log('This node has ', update_branches.length , 'stemming branches');

                //cycle through each stemming branch
                update_branches.map(function(branch, i) {

                        //Cycle through each node in the branch, update distance
                        branch.nodes.map(function(n, i) {
                                if (i > 0) {
                                    nodes[n].dist = nodes[n].dist + curr_dist;
                                } //end if
                            }) //end branch.nodes.map


                    }) //end update_branches.map			 	 	


            }) // end nodes_outgoing.map



    } //end calculate_relative-distances



function test_callback() {

        //console.log(d3.select(this));
    }
    // Add node along pathway
function add_extra_node(path_handle) {

    draw_nodes();
}

function draw_nodes(d, i) {

    cname = ["circle" + String(curr_path)];

    if (node_handles.length > curr_path)
        node_handles[curr_path].remove();


    //add in current set of nodes to map
    node_handles[curr_path] = pathgroup.selectAll(cname)
        .data(nodes)
        .enter().append("circle");

    node_handles[curr_path]
        .attr("cx", function(d) {
            return d.x
        })
        .attr("cy", function(d) {
            return d.y
        })
        .attr("r", 5)
        .attr("class", "circle")
        .attr("class", cname)
        //unique id for each node
        .attr("id", function(d, i) {
            return ('c_' + i)
        })
        .on("mousedown", function(d, i) {
            toggle_active(d3.select(this), i);
            d3.event.stopPropagation();
        })
        .on("dblclick", delete_node)
        .call(drag)

    activate_last_node();

    draw_path()
}

//Function to make last added node active
function activate_last_node() {

    //Make last added non-empty node active
    for (var s = nodes.length - 1; s >= 0; s--) {
        if (nodes[s].hasOwnProperty('x')) {
            toggle_active(d3.select('#c_' + s), s)
            break
        }
    }

}

//Function to make current node active. Changes appearance of node and sets active_node variable
function toggle_active(selected_node, i) {


        //Make all nodes blue, make active node red	
        node_handles[curr_path]
            .classed({
                'active_node': false
            })


        //Node is already active, toggle to off
        if (active_node == i) {
            active_node = -1;
            return
        }
        //Make node active
        active_node = i;

        selected_node.classed({
            'active_node': true
        })


    }
    //Function to delete node
function delete_node(d, i) {
    d3.event.stopPropagation();

    //Consider the following node sequence: A-> B -> C
    //											|__> D ->E

    //Set node values to empty
    nodes[i] = {};

    //If we remove B (or node other than the first in the path - A) 
    if (nodes[i].incoming[0] >= 0) {

        //	****** Revise for multiple incoming to one node! *******
        //Remove B from outgoing list of A
        var index = outgoing[incoming[i]].indexOf(i);
        outgoing[incoming[i]].splice(index, 1);

        //Add C and D to outoing list for A 
        outgoing[incoming[i]] = outgoing[incoming[i]].concat(outgoing[i]);


        //Change C and D's incoming node to A
        for (var s = 0; s < outgoing[i].length; s++) {
            incoming[outgoing[i][s]] = incoming[i];
        }
    } else { // Say we remove the starting node (A)
        //Change B's (and any other nodes stemming from A) incoming node to -1 (indicative of node @ start of path) and set 				them to sources
        for (var s = 0; s < outgoing[i].length; s++) {
            incoming[outgoing[i][s]] = -1;
            nodes[outgoing[i][s]].source = true;
        }

    }

    //Clear outgoing and incoming for B  	
    outgoing[i] = [];
    incoming[i] = [];

    draw_nodes()

    //Update distances along track for all nodes
    //update_dist(path_handles);

}


//Function to generate branch objects
function parse_branches() {


    branches = []; //clear global variable branches

    /*
	//Not enough nodes to have a branch
			if (nodes.length <2)
				return 
				
*/

    /*
    	        //Var to hold nodes in a given branch
    	        var branch_nodes; 
    */

    //Start by building main branch 

    curr_branch = {
        'main': true,
        'order': branches.length,
        'nodes': [start_node],
        'color': colors[0], //Color for main branch is always black
        'source': start_node
    };


    var curr_node = start_node;
    var next_node;


    //keep building branch as long as you don't encounter end_node or end of branch
    while (curr_node != end_node && nodes[curr_node].outgoing.length > 0) {


        if (end_node < 0) { // user has not defined end point, select first node in outgoing list

            nodes[curr_node].outgoing[0].visited = true; //flag this segment as visited

            //Select next node
            next_node = nodes[curr_node].outgoing[0].node;
        } else {

            // TO DO
            curr_node = nodes[curr_node].outgoing.filter(function(n) {
                return has_node(n, end_node);
            });
        }

        //If current node has more than 1 outgoing node, set it as a source.
        if (nodes[curr_node].outgoing.length > 1)
            nodes[curr_node].source = true;



        curr_node = next_node;

        //Add node to list of nodes in branch
        curr_branch.nodes.push(next_node);


    }

    branches.push(curr_branch);

    return


    //Build auxiliary branches

    //Find sources nodes
    var sources = nodes.filter(function(n) {
        return n.source;
    });


    //vector of indexes of starting point
    to_build = sources.map(function(n) {
        return n.ind
    });

    //Filter out lone nodes (no path)
    to_build = to_build.filter(function(b) {
        return outgoing[b].length > 0
    });

    var num_sources = to_build.length;

    //Keep track of source node for current branch
    var current_source;

    //While there are still branches to be built
    while (to_build.length > 0) {


        //index of next node to be drawn in branch
        var next_node = [to_build[0]];


        //check if node is source, update current_source
        if (nodes[next_node[0]].source)
            current_source = next_node[0];


        branch_nodes = [];

        //Add  "branching" node to the current pathway
        if (incoming[next_node[0]] > -1) {
            branch_nodes.push(incoming[next_node[0]]);
        }

        //While there are still nodes to be added to the current branch
        while (next_node.length > 0) {
            branch_nodes.push(next_node[0])


            //New Branch
            if (next_node.length > 1) {
                insert_ind = to_build.length - num_sources + 1;
                a2 = next_node.slice(1, next_node.length);
                to_build.splice.apply(to_build, [insert_ind, 0].concat(a2));

            }


            next_node = outgoing[next_node[0]];
            //console.log ('next_node is', next_node);   
        }


        //Remove current path from to_build
        to_build.shift();

        //console.log ('to_build is', to_build);

        if ((colors.length) <= branches.length)
            colors.push(getRandomColor());

        color = colors[branches.length];

        curr_branch = {
            'main': (current_source == 0 && branches.length == 0),
            'order': branches.length,
            'nodes': branch_nodes,
            'color': color,
            'source': current_source
        };


        //add branch object to branches vector
        branches.push(curr_branch)


    } // while to_build.length>0



};


//Function to draw paths between nodes  	
function draw_path() {

    //Create branch objects
    parse_branches();

    //clear global variable path_handles
    path_handles = [];

    //delete existing pathway
    d3.selectAll(".pathline").remove();

    //Iterate through branches and draw svg path objects						
    branches.map(function(branch) {

        //Create path for each branch
        path_handle = pathgroup
            .append("path")
            .attr("d", newlineFunction(branch.nodes))
            .attr("class", "pathline")
            .style('stroke', branch.color);

        path_handle
            .on("mousedown", function() {
                d3.event.stopPropagation();
            })
            //.on("click", test_callback ());

        path_handles.push(path_handle);

    });

    //Update along path distance for all nodes
    //update_dist(path_handles);

    //Move circles to front
    var sel = d3.selectAll("circle")
    sel.moveToFront();

    yAxis.ticks(branches.length); //One tick per branch


    d3.select(".axis.axis--y")
        .transition().duration(1500).ease("sin-in-out")
        .call(yAxis);

    d3.select(".axis.axis--x")
        .transition().duration(1500).ease("sin-in-out")
        .call(xAxis);



    var bline = d3.svg.line()
        .x(function(d) {
            return x(d.x);
        })
        .y(function(d) {
            return y(d.y);
        })


    return
    //Iterate through branches and draw svg path objects in plot below						
    branches.map(function(branch) {
        var branch_line = [{
            'x': branch.min_dist,
            'y': branch.order
        }, {
            'x': branch.max_dist,
            'y': branch.order
        }];

        axes.append("path")
            .datum(branch_line)
            .attr("class", "pathline")
            .attr("d", bline)
            .style('stroke', branch.color);

    });

}

//Function that assigns new positions to nodes once they are dragged
function dragmove(d, i) {

    nodes[i].x = d3.mouse(this)[0];
    nodes[i].y = d3.mouse(this)[1];

    d3.select(this)
        .attr("cx", function(d) {
            return d.x
        })
        .attr("cy", function(d) {
            return d.y
        })


    draw_path()

}

function move() {
    var t = d3.event.translate,
        s = d3.event.scale;
    t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
    t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
    zoom.translate(t);
    g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}

// Used to ensure nodes are in front of path line at all times. 
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};


function mousemoved() {
	console.log('in mousemoved');
    if (paths.length > 0 && paths[curr_path].length > 1) {
        var m = d3.mouse(this),
            p = closestPoint(path_handles[curr_path].node(), m);
            console.log(p);
    }
}



//Will use when regressing data points onto path
/* from http://bl.ocks.org/mbostock/8027637  */
function closestPoint(pathNode, point) {
    var pathLength = pathNode.getTotalLength(),
        precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
        best,
        bestLength,
        bestDistance = Infinity;

    // linear scan for coarse approximation
    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
            best = scan, bestLength = scanLength, bestDistance = scanDistance;
        }
    }

    // binary search for precise estimate
    precision *= .5;
    while (precision > .5) {
        var before,
            after,
            beforeLength,
            afterLength,
            beforeDistance,
            afterDistance;
        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
            best = before, bestLength = beforeLength, bestDistance = beforeDistance;
        } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
            best = after, bestLength = afterLength, bestDistance = afterDistance;
        } else {
            precision *= .5;
        }
    }

    best = [best.x, best.y];
    //Distance to path
    best.distance = Math.sqrt(bestDistance);
    //Along track distance
    best.scanLength = bestLength;
    //console.log(best);
    return best;

    function distance2(p) {
        var dx = p.x - point[0],
            dy = p.y - point[1];
        return dx * dx + dy * dy;
    }
}