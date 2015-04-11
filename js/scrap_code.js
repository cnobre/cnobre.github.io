		    //For depth range implementation
		    
		    d3.select("#depth_range").on("input", function() {
		        selected_depth = +this.value;
		    });
		    
		    
		    	    function mousemoved() {
		        if (branches.length > 0 && paths[curr_path].length > 1) {
		            var m = d3.mouse(this),
		                p = closestPoint(path_handles[curr_path].node(), m);
		            /*             console.log(p); */
		        }
		    }



		    
		    
		//Function to merge nodes, not currently being used! (Apr9 2015)
		 function merge_nodes(d, i) {

		        /* Find closest Node*/

		        var diff_x;
		        var diff_y;

		        closest_node = nodes.filter(function(n) {

		            diff_x = Math.abs(n.x - nodes[i].x);
		            diff_y = Math.abs(n.y - nodes[i].y)

		            return (diff_x + diff_y > 0 && diff_x + diff_y < 10)

		        });


		        if (closest_node.length < 1) {
		            return;
		        }

		        /* console.log ('@ start of merge, nodes are', nodes[4]); */
		        //Merge nodes

		        var source_node = [i, closest_node[0].ind].reduce(function(p, v) {
		            if (v < p) return v;
		            return p;
		        }, i);
		        var target_node = [i, closest_node[0].ind].reduce(function(p, v) {
		            if (v > p) return v;
		            return p;
		        }, i);

		        //Update incoming and outgoing of nodeB
		        nodes[target_node].incoming = nodes[target_node].incoming.concat(nodes[source_node].incoming);
		        nodes[target_node].outgoing = nodes[target_node].outgoing.concat(nodes[source_node].outgoing);

		        //Update outgoing list of source_nodes' incoming nodes
		        nodes[source_node].incoming.map(function(n) {
		            nodes[n].outgoing.map(function(nn, ind) {
		                if (nn.node == source_node) //replace source_node with target_node
		                    nodes[n].outgoing.splice(ind, 1, {
		                    node: target_node,
		                    visited: false
		                })
		            });

		        });

		        /* 			console.log ('@ line 312, nodes is', nodes) */
		        //Update incoming list of source_nodes' outgoing nodes
		        nodes[source_node].outgoing.map(function(n) {
		            nodes[n.node].incoming.map(function(nn, ind) {
		                if (nn == source_node) //replace source_node with target_node
		                    nodes[n.node].incoming.splice(ind, 1, target_node)
		            });

		        });


		        //Remove source_node
		        /* 	        console.log('removing source node', source_node);  */

		        nodes[source_node] = -1;


		        /* 	        console.log ('@ line 328, nodes is', nodes) */

		        //Update active node - doesn't work here
		        /* 	toggle_active(d3.select('#c_' + target_node), target_node) */


		        draw_nodes()
		            /* 	        console.log('active node is ', active_node);  */


		        /* 	console.log ('after merging, nodes is', nodes) */
		    }
		    
		    
		    
		    /*
		//Apply Pathway Button
	    d3.select("#apply_path").on("click", function() {
	        if (branches.length < 1)
	            return
	        apply_pathway();
	    });
*/


