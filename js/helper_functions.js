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


				   //Recursive function that returns true if the target_node can be found by following any paths starting @ start_node
				   function has_node(start_node, target_node) {

				       //Found node
				       if (start_node == target_node)
				           return true;

				       //Reached end of this branch
				       if (nodes[start_node].outgoing.length < 1)
				           return false

				       //Continue searching 
				       return (nodes[start_node].outgoing.reduce(function(prevValue, currNode, index, array) {
				           return prevValue | has_node(currNode.node, target_node);
				       }, false));

				   }



				   //Function to make current node active. Changes appearance of node and sets active_node variable
				   function toggle_active(selected_node, i) {

				       //Updating end_node

				       on_main_branch = false;

				       if (end_node > -1) {
				           on_main_branch = nodes[i].incoming.reduce(function(prevValue, currNode) {
				               return prevValue | currNode == end_node
				           }, false);
				       }

				       if (on_main_branch)
				           end_node = i;
				       else
				           end_node = 0;

				       //Make all nodes blue, make active node red	
				       node_handles[curr_path]
				           .classed({
				               'active_node': false
				           })

				       //Node is already active, toggle to off
				   /*
    if (active_node == i) {
				           active_node = -1;
				           return
				       }
*/
				       //Make node active
				       active_node = i;

				       selected_node.classed({
				           'active_node': true
				       })

				   }




				   /* Calculate along track distance of nodes  */
				   function update_dist(pathHandle) {

				           //Cycle through all distances and set to -1
				           nodes.map(function(n) {
				               n.dist = -1;
				           })


				           //For each branch, calculate node dist values 
				           for (var j = 0; j < pathHandle.length; j++) {

				               var segments = pathHandle[j].node().pathSegList;

				               branches[j].total_distance = pathHandle[j].node().getTotalLength();

				               for (i = 0; i < nodes.length; i++) {
				                   if (nodes[i].hasOwnProperty('x')) { //Node has not been deleted
				                       p = closestPoint(pathHandle[j].node(), [nodes[i].x, nodes[i].y]);
				                       if (p.distance < 1) { //node is on path
				                           if (nodes[i].dist < 0) { // node distance has not been computed yet 
				                               nodes[i].dist = p.scanLength; // + delta
				                           } //end if nodes[i].dist < 0

				                       } // end if p.distance < 1
				                   } //end if nodes[i].hasOwnProperty('x')
				               } // end for each nodes

				           } //end for each pathHandle



				           //Calculate Relative Distance

				           if (branches.length > 1)
				               calculate_relative_distances();

				           /*         console.log('updating title');     */
				           d3.selectAll("circle")
				               .select("title")
				               .text(function(d) {
				                   return d.dist;
				               });

				           //Update branch specific min/max distances	
				           branches.map(function(d, i) {


				               /*
	                               d.min_dist = Math.min.apply(Math, d.nodes.map(function(n) {
	                	                return nodes[n].dist
	                	            }));
	                	           d.max_dist = Math.max.apply(Math, d.nodes.map(function(n) {
	                	                return nodes[n].dist
	                	                 }));	
	                */

				               d.min_dist = nodes[d.nodes[0]].dist,
				                   d.max_dist = nodes[d.nodes[d.nodes.length - 1]].dist;
				           });

				           var min_dist = nodes.reduce(function(p, v) {
				               if (v.dist < p) return v.dist;
				               return p;
				           }, 0);

				           var max_dist = nodes.reduce(function(p, v) {
				               if (v.dist > p) return v.dist;
				               return p;
				           }, 0);

				           var min_level = branches.reduce(function(p, v) {
				               if (v.level < p) return v.level;
				               return p;
				           }, 0);

				           var max_level = branches.reduce(function(p, v) {
				               if (v.level > p) return v.level;
				               return p;
				           }, 0);


				           //Update Domains

				           x.domain([min_dist, max_dist]);
				           y.domain([min_level, max_level + 1]);


				       } //end function 



					   
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


				   var drag = d3.behavior.drag()
				       .on("drag", dragmove)
				       .on("dragstart", function() {
				           d3.event.sourceEvent.stopPropagation(); // silence other listeners
				       })
				       /* 	        .on("dragend", merge_nodes); */


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

				   /* Calculate node distances in relation to the main branch  */
				   function calculate_relative_distances() {

				           branches[0].visited = true;
				           to_update = [].concat(branches[0].nodes);

				           while (to_update.length > 0) {

				               //Find branches that start/end @ this node	
				               incoming_branches = branches.filter(function(b) {
				                   return !b.visited && b.nodes[b.nodes.length - 1] == to_update[0]
				               });
				               outgoing_branches = branches.filter(function(b) {
				                   return !b.visited && b.nodes[0] == to_update[0]
				               });

				               incoming_branches.map(function(b) {
				                   b.visited = true;
				                   //Add nodes from start to end -1 to to_update
				                   add_nodes = b.nodes.filter(function(n, i) {
				                       return (i < b.nodes.length)
				                   })

				                   to_update = to_update.concat(add_nodes);
				               })

				               outgoing_branches.map(function(b) {
				                   b.visited = true;
				                   //Add nodes from start + 1 to end
				                   add_nodes = b.nodes.filter(function(n, i) {
				                       return (i > 0)
				                   })

				                   to_update = to_update.concat(add_nodes);
				               })

				               update_node_distances(incoming_branches, outgoing_branches, to_update[0]);

				               to_update.shift();
				           }




				       } //end calculate_relative-distances


				   function linearRegression(y, x) {

				       var lr = {};
				       var n = y.length;
				       var sum_x = 0;
				       var sum_y = 0;
				       var sum_xy = 0;
				       var sum_xx = 0;
				       var sum_yy = 0;

				       for (var i = 0; i < y.length; i++) {

				           sum_x += x[i];
				           sum_y += y[i];
				           sum_xy += (x[i] * y[i]);
				           sum_xx += (x[i] * x[i]);
				           sum_yy += (y[i] * y[i]);
				       }

				       lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
				       lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
				       lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

				       return lr;

				   };



				   /*  Offsets node distances in incoming/outgoing branches */
				   function update_node_distances(incoming_branches, outgoing_branches, node_id) {


				       incoming_branches.map(function(b) {

				           offset = nodes[node_id].dist - b.total_distance;

				           b.nodes.map(function(n, i) {
				               //Start node
				               if (i == 0)
				                   nodes[n].dist = offset;
				               //All other nodes except the last (which already has a distance) 
				               else if (i < b.nodes.length - 1)
				                   nodes[n] = nodes[n].dist + offset
				           })
				       })


				       outgoing_branches.map(function(b) {
				           offset = nodes[node_id].dist
				           b.nodes.map(function(n, i) {
				               if (i > 0)
				                   nodes[n].dist = nodes[n].dist + offset
				           })
				       })



				   };



				   //Format LAT/LON info
				   function formatLocation(p, k) {
				       var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
				       return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " " + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
				   }

				   //Update LAT/LON info 
				   function mousemoved() {
				       info.text(formatLocation(projection.invert(d3.mouse(this)), zoom.scale()));
				   }

				   //Function to find closest point to a node, for use when regressing data points onto path
				   /* from http://bl.ocks.org/mbostock/8027637  */
				   function closestPoint(pathNode, point) {
				       var pathLength = pathNode.getTotalLength(),
				           precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
				           best,
				           bestLength,
				           bestDistance = Infinity;

				       // linear scan for coarse approximation
				       for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
				           /*     	console.log('loop ', scan);  */
				           if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
				               /*         	console.log ('scanDistance is ', scanDistance); */
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
				   
				   
				   
	/*
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

		                // 							branches[branches.length-1].level = branches[branches.length-1].order;	 
						if (lr_curr_branch.slope < lr_source_branch.slope)
							branches[branches.length-1].level = source_branch[0].level +1;
						else
							branches[branches.length-1].level = source_branch[0].level -1;




		                ss.branches.push(curr_branch.order)
		                ss.source_branch = source_branch[0].level;



		            }
*/
