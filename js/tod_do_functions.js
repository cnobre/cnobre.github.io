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

