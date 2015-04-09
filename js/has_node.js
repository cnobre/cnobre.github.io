function has_node(start_node,target_node){
	
	//Found node
	if start_node == target_node
		return true;
		
	//Reached end of this branch
	if start_node.outgoing.length<1
		return false;
	
	//Continue searching 
	return (nodes[start_node].outgoing.reduce(function(prevNode, currNode, index, array) {
		return prevNode & has_node(currNode);
		});)

	
}


{
            node: node_counter,
            visited: false //for branch buildling, keeps track if this path segment has been visited
        }