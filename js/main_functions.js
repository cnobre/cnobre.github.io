		// Add node to end of branch/pathway
		function add_node(d, i) {

		    if (d3.event.defaultPrevented) return; // click suppressed

		    //Grab mouse position  
		    d = d3.mouse(this);

		    //Increment node_counter
		    ++node_counter;

		    //Create new node object
		    var new_node = {
		        x: d[0],
		        y: d[1],
		        dist: -1,
		        source: false, //var to flag source nodes (nodes that start pathways)
		        ind: nodes.length, //stores index within nodes vector
		        incoming: [], //no need to store flag for visited since we only build branches forward, not backward
		        outgoing: []
		    }


		    //If pathway has at least two nodes, update incoming, outgoing	
		    if (active_node > -1) {
		        /* 	        	console.log('active node is ', active_node, nodes, nodes[active_node]); */

		        //Add the new node to the list of outgoing for the previous node. 
		        nodes[active_node].outgoing.push({
		            node: node_counter,
		            visited: false //for branch buildling, keeps track if this path segment has been visited
		        });

		        new_node.incoming = [active_node];

		    }


		    nodes.push(new_node);

		    //end_node = node_counter;

		    draw_nodes();

		}


		function draw_nodes(d, i) {


		    cname = ["circle" + String(curr_path)];

/* 		    console.log(curr_path) */
		    if (node_handles.length > curr_path)
		        node_handles[curr_path].remove();


		    //add in current set of nodes to map
		    node_handles[curr_path] = pathgroup.selectAll(cname)
		        .data(nodes)
		        .enter().append("circle")


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
		        .attr("class", "path_node")
		        //unique id for each node
		        .attr("id", function(d, i) {
		            return ('c_' + i)
		        })
		        .call(drag)
		        .on("click", function(d, i) {
		            if (d3.event.defaultPrevented) return;
		            toggle_active(d3.select(this), i);
		            draw_path();


		            d3.event.stopPropagation();
		        })
		        .on("dblclick", function(d, i) {
		            end_node = i;
		            draw_path();
		            apply_pathway();
		        })


		    //Create tooltip for debugging node distances
		    d3.selectAll(".path_node")
		        .append("svg:title");


		    activate_last_node();

		    draw_path()
		}


		//Function to draw paths between nodes  	
		function draw_path() {


		    //Create branch objects
		    sources = parse_branches();

		    //clear global variable path_handles
		    path_handles = [];

		    //delete existing pathway
		    d3.selectAll(".pathline").remove();
		    d3.selectAll(".mainpath").remove();
		    d3.selectAll(".track").remove();
		    d3.selectAll(".connector").remove();

		    //Iterate through branches and draw svg path objects						
		    branches.map(function(branch) {

		        // build the arrow.
		        svg.append("svg:defs").selectAll("marker")
		            .data(["end"]) // Different link/path types can be defined here
		            .enter().append("svg:marker") // This section adds in the arrows
		            .attr("id", String)
		            .attr("viewBox", "0 -5 10 10")
		            .attr("refX", 15)
		            .attr("refY", 0)
		            .attr("markerWidth", 3)
		            .attr("markerHeight", 3)
		            .attr("orient", "auto")
		            /* 	                .style("stroke", branch.color) */
		            .append("svg:path")
		            .attr("d", "M0,-5L10,0L0,5");

		        //Create path for each branch
		        path_handle = pathgroup
		            .append("path")
		            .attr("marker-end", "url(#end)")
		            .attr("d", newlineFunction(branch.nodes))
		            .attr("id", function() {
		                return ('b_' + branch.order)
		            })
		            .attr("class", function(d) {
		                if (branch.main) {
		                    return "mainpath"
		                }
		                return "pathline";
		            })
                    .style('stroke', branch.color)
		            /*                 .style('stroke', "#616161") */


		        path_handle
		            .on("mousedown", function() {
		                d3.event.stopPropagation();
		            })
		            //.on("click", test_callback ());

		        path_handles.push(path_handle);

		    });



		    //Update along path distance for all nodes
		    if (nodes.length > 1) {

		        update_dist(path_handles);

		        update_scatter_plot();

		        //Move circles to front
		        var sel = d3.selectAll(".path_node")
		        sel.moveToFront();


		    };



		}




		function apply_pathway() {


		    if (nodes.length < 2) return;
		    //Calculate distance from each data node to closest branch
		    user_data.map(function(d, i) {

		        d.dist2path = 10000;

		        path_handles.map(function(path_handle, i) {
		            p = closestPoint(path_handle.node(), [projection([d.lon, d.lat])[0],
		                projection([d.lon, d.lat])[1]
		            ]);

		            if (p.distance < d.dist2path) {
		                d.dist2path = p.distance;
		                d.distalongpath = p.scanLength + branches[i].min_dist;;
		                d.branch = i;
		            }

		        });


		        if (d.dist2path < path_tolerance) {

		            /*   	            	console.log('selected node', i ,' with dist2path of ', d.dist2path); */
		            d.selected = true;
		        }

		    })

		    //Assign selected or unselected node classes according to calculated dist2path
		    d3.selectAll(".data_node")
		        .data(slice_user_data)
		        .classed("selected_node", function(d) {
		            if (d.dist2path < path_tolerance) return true;
		            return false;
		        })
		        .classed("unselected_node", function(d) {
		            if (d.dist2path > path_tolerance) return true;
		            return false;
		        })
		        .attr("r", function(d) {
		            if (d.dist2path < path_tolerance) return 6;
		            return 4
		        })

		    update_scatter_plot();  

		}



		function update_scatter_plot() {

		    //Update x_axis
		    d3.select(".axis.axis--x")
		        .transition().duration(1500).ease("sin-in-out")
		        .call(xAxis);



		    //Iterate through branches and draw svg path lines						
		    branches.map(function(branch, i) {
		        var branch_line = [{
		            'x': branch.min_dist,
		            'y': branch.level
		        }, {
		            'x': branch.max_dist,
		            'y': branch.level
		        }];


		        axes.append("path")
		            .datum(branch_line)

		        .attr("class", "track")
		            .attr("id", function() {
		                return ('t_' + branch.order)
		            })
		            .attr("d", line_function)
		            .style('stroke', branch.color)

		    });

		    //Compress all branch nodes into a single vector	          
		    all_nodes = [];

		    branches.map(function(b) {
		        b.nodes.map(function(n) {
		            all_nodes.push({
		                ind: nodes[n].index,
		                dist: nodes[n].dist,
		                order: b.order,
		                level: b.level
		            })


		        })

		    })


		    //create subaxis for each branch
		    y_scales = [];
		    var y_axis = [];

		    branches.map(function(branch, i) {

		        ys = d3.scale.linear()
		            .range([y(branch.level + 0.1), y(branch.level + 0.8)])
		            .domain([data_max, data_min])
		            /* 					.domain([-1.6,-1.8 ]) */
		            .clamp(true);

		        y_scales.push(ys);

		        yax = d3.svg.axis()
		            .scale(ys)
		            .orient("left")
		            .ticks(4)
		            .tickSize(-x(branch.max_dist - branch.min_dist), 0, 0)

		        y_axis.push({
		            "axis": yax,
		            "branch": branch
		        })

		    });


		    //Update position of all yaxis.    
		    yaxes = axes.selectAll(".branch_y").data(y_axis);

		    yaxes
		        .enter()
		        .append("g")
		        .attr("class", "axis axis--y branch_y grid")
		        .attr("transform", function(d) {
		            return "translate(" + x(d.branch.min_dist) + ",0)"
		        })
		        .each(function(d) {
		            d3.select(this).call(d.axis)
		        });


		    axes_rect = axes.selectAll(".axes_background").data(y_axis);

		    axes_rect.exit().remove()

		    axes_rect
		        .enter()
		        .append("rect")
		        .attr("class", "axes_background")
		        .attr("x", function(d) {
		            return x(d.branch.min_dist)
		        })
		        .attr("y", function(d) {
		            return d.axis.scale().range()[1]
		        })
		        .attr("width", function(d) {
		            return x(d.branch.max_dist) - x(d.branch.min_dist)
		        })
		        .attr("height", function(d) {
		            return (d.axis.scale().range()[0] - d.axis.scale().range()[1])
		        })
		        .on("mousemove", function(d, i) {
		            xx = x.invert(d3.mouse(this)[0]);
		            yy = Math.round(d.axis.scale().invert(d3.mouse(this)[1]));

		            point = path_handles[i].node().getPointAtLength(xx - d.branch.min_dist); //getPointAtLength
		            marker_x = point.x;
		            marker_y = point.y;

		            //Update marker position
		            marker
		                .attr('cx', marker_x)
		                .attr('cy', marker_y);

		        })
		        .on("mouseout", function() {
		            marker.attr('cx', -30)
		                .attr('cy', -30);
		        });




		    axes_rect
		        .transition()
		        .duration(500).ease("sin-in-out")
		        .attr("x", function(d) {
		            return x(d.branch.min_dist)
		        })
		        .attr("y", function(d) {
		            return d.axis.scale().range()[1]
		        })
		        .attr("width", function(d) {
		            return x(d.branch.max_dist) - x(d.branch.min_dist)
		        })
		        .attr("height", function(d) {
		            return (d.axis.scale().range()[0] - d.axis.scale().range()[1])
		        })

		    yaxes
		        .transition()
		        .duration(500).ease("sin-in-out")
		        .attr("transform", function(d) {
		            return "translate(" + x(d.branch.min_dist) + ",0)"
		        })
		        .each(function(d) {
		            d3.select(this).call(d.axis)
		        });



		     //Update path nodes on  bottom plot 

		    path_nodes = axes.selectAll(".path_node")
		        .data(all_nodes);

		    path_nodes
		        .enter()
		        .append("circle")

				.attr("cx", function(d) {
		            return x(width)
		        })
		        .attr("cy", function(d) {
		            return y(d.level)
		        })
		        .attr("r", 5)
		        .attr("class", "circle")
		        .attr("class", "path_node")




		    path_nodes.transition()
		        .duration(500).ease("sin-in-out")
		        .attr("cx", function(d) {
		            return x(d.dist)
		        })
		        .attr("cy", function(d) {
		            return y(d.level)
		        })

			
			//Append "connectors" between connected branches
		    clines = [];

		    connectors = sources.filter(function(s) {
		        return nodes[s.node].incoming.length > 0
		    })

		    connectors.map(function(c) {
		        c.branches.map(function(cc, i) {
		            clines.push([{
		                'x': nodes[c.node].dist,
		                'y': c.source_branch
		            }, {
		                'x': nodes[c.node].dist,
		                'y': branches[cc].level
		            }])


		        })

		    })


			
		    clines.map(function(cl) {
		        axes.append("path")
		            .datum(cl)
		            .attr("class", "connector")
		            .attr("d", line_function)

		    })

/* 			return;  */

		    //Update data nodes on bottom plot

		    // add points circles to bottom plot
		    data_nodes = axes.selectAll(".data_node")
		        .data(user_data.filter(function(d) {
		            return d.selected
		        }));

		    if (data_nodes.length < 1)
		        return;
		    data_nodes
		        .enter()
		        .append("circle")
		        .attr("class", 'data_node')
		        .attr("cx", function(d) {
		            return width;
		        })
		        .attr("cy", function(d) {
		            /* 	            	console.log('d.branch for selected d is ', d.branch, d.depth); */
		            if (selected_var == 0)
		                return y_scales[d.branch](d.depth);
		            return y_scales[d.branch](d.value) //y_scales[d.branch](d.value);
		        })
		        .attr("r", "4px")
		        .attr("fill", function(d) {
		            return color(d.value) //heatmap(c(d.value));
		        })


		    data_nodes.transition()
		        .duration(500).ease("sin-in-out")
		        .attr("cx", function(d) {
		            return x(d.distalongpath);
		        })
		        .attr("cy", function(d) {
		            if (selected_var == 0)
		                return y_scales[d.branch](d.depth);

		            return y_scales[d.branch](d.value) //y_scales[d.branch](d.value);
		        })



		}



		//Function to generate branch objects for a given path
		function parse_branches() {

		    /* Check if currently active node is reachable from start_node 	 */
		    valid_end_node = nodes[start_node].outgoing.filter(function(n) {
		        return has_node(n.node, end_node);
		    });

		    //If not set end node to last node in the main branch)
		    if (valid_end_node.length < 1 & branches.length > 0)
		        end_node = branches[0].nodes[branches[0].nodes.length - 1];

		    branches = []; // empty branch vector, which will later be added to path object; 

		    // Set all path segments to unvisited and all sources to false; 
		    nodes.map(function(n) {
		        //For non empty nodes
		        if (n.hasOwnProperty('outgoing')) {
		            n.outgoing.map(function(k) {
		                k.visited = false;
		            })
		            n.source = false;
		        }
		    });

		    //Start by building main branch 
		    curr_branch = {
		        'main': true,
		        'order': 0, 
		        'level': 0, // will later be modified/sorted according to relative positions in space 
		        'nodes': [start_node],
		        'color': "#0883b0", //Color for main branch is always black
		        'visited': false //used when updating branch distances
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

		            next_node = nodes[curr_node].outgoing.filter(function(n) {
		                return has_node(n.node, end_node);
		            })[0].node;

		            next_node_index = nodes[curr_node].outgoing.map(function(e) {
		                return e.node;
		            }).indexOf(next_node);

		            nodes[curr_node].outgoing[next_node_index].visited = true; //flag this segment as visited
		        }

		        curr_node = next_node;

		        //Add node to list of nodes in branch
		        curr_branch.nodes.push(next_node);


		    }

		    branches.push(curr_branch);
		    
		    //Finished building main branch

		    /*     Build secondary branches */

		    //Set Sources
		    nodes.map(function(n) {
		        //For non empty nodes
		        if (n.hasOwnProperty('outgoing')) {
		            if (n.outgoing.length > 1) // nodes with more than one outgoing node
		                n.source = true;
		            if (n.ind == end_node && n.outgoing.length > 0) //end_node has outgoing nodes
		                n.source = true;
		            if (n.incoming.length < 1) // no incoming nodes
		                n.source = true;
		        }
		    });


		    //Filter source nodes
		    var source_nodes = nodes.filter(function(n) {
		        return n.source;
		    });


		    //Index of source nodes
		    sources = source_nodes.map(function(n) {
		        return n.ind
		    });


		    //Filter out lone nodes (no associated path)
		    sources = sources.filter(function(b) {
		        return nodes[b].outgoing.length > 0
		    });

		    sources = sources.map(function(ss) {
		        return {
		            "node": ss,
		            "source_branch": -1,
		            "branches": []
		        }
		    });


		    var all_levels = [0];
		    //For each source, build branch
		    sources.map(function(ss) {

		        s = ss.node;


		        //While this source has unvisited outgoing nodes
		        while (nodes[s].outgoing.filter(function(n) {
		                return !n.visited
		            }).length > 0) {


		            curr_branch = {
		                'main': false,
		                'order': branches.length,
		                'nodes': [s],
		                /* 	                    'color': colors[branches.length] */
		            };

		            var curr_node = s;
		            var next_node;



		            //While we don't reach end of branch or start of new branch
		            while (nodes[curr_node].outgoing.length > 0 && (curr_branch.nodes.length < 2 || !nodes[curr_node].source)) {

		                visited = nodes[curr_node].outgoing.filter(function(n) {
		                    return n.visited
		                });

		                if (visited.length == nodes[curr_node].outgoing.length) break; //No more nodes to visit


		                unvisited = nodes[curr_node].outgoing.filter(function(n) {
		                    return !n.visited
		                });

		                next_node_index = nodes[curr_node].outgoing.map(function(e) {
		                    return e.node;
		                }).indexOf(unvisited[0].node);

		                nodes[curr_node].outgoing[next_node_index].visited = true; //flag this segment as visited

		                //Select next node
		                next_node = nodes[curr_node].outgoing[next_node_index].node;

		                curr_node = next_node;

		                //Add node to list of nodes in branch
		                curr_branch.nodes.push(next_node);


		            }

		            //At least two nodes required for a branch
		            if (curr_branch.nodes.length > 1) {
		                branches.push(curr_branch);

		                //find out which branch this node is a part of
		                source_branch = branches.filter(function(branch) {
		                    return (branch.nodes.filter(function(n) {
		                        return n == s
		                    }).length > 0);
		                });

		                target_node = source_branch[0].nodes.reduce(function(p, v, ind) {
		                    if (v == s)
		                        return ind
		                    return p
		                }, -1);


		                if (target_node == source_branch[0].nodes.length - 1)
		                    target_node = target_node - 1;


		                //Fit a line between branching node and next (or previous) node in source branch
		                lr_source_branch = linearRegression(
		                    [nodes[source_branch[0].nodes[target_node]].y, nodes[source_branch[0].nodes[target_node + 1]].y], [nodes[source_branch[0].nodes[target_node]].x, nodes[source_branch[0].nodes[target_node + 1]].x]);

		                lr_curr_branch = linearRegression(
		                    [nodes[curr_branch.nodes[0]].y, nodes[curr_branch.nodes[1]].y], [nodes[curr_branch.nodes[0]].x, nodes[curr_branch.nodes[1]].x]);



		                new_y = lr_source_branch.slope * nodes[curr_branch.nodes[1]].x + lr_source_branch.intercept;

		                if (new_y < nodes[curr_branch.nodes[1]].y) {
		                    branches[branches.length - 1].level = source_branch[0].level - 1;
		                    branches[branches.length - 1].delta = -1;
		                } else {
		                    branches[branches.length - 1].level = source_branch[0].level + 1;
		                    branches[branches.length - 1].delta = +1;
		                }

		                branches[branches.length - 1].source_order = source_branch[0].order;

		                /* 							branches[branches.length-1].level = branches[branches.length-1].order;	 */
		                if (lr_curr_branch.slope < lr_source_branch.slope)
			            		branches[branches.length-1].level = source_branch[0].level +1;
			            	else
			            		branches[branches.length-1].level = source_branch[0].level -1;



		                if (branches.length == 6) {

		                    branches[0].level = 0;
		                    branches[1].level = 2;
		                    branches[2].level = 1;
		                    branches[3].level = 3;
		                    branches[4].level = 2;
		                    branches[5].level = 0;

		                }


		                ss.branches.push(curr_branch.order)
		                ss.source_branch = source_branch[0].level;



		            }




		        }



		    }); // end sources.map 


		    return sources;
		};