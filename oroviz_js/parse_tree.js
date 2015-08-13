

function build_tree(main_branch){

    left_branches =[];
    right_branches=[];
	
/* 	console.log ( 'current branch is source to ' , main_branch.source) */
	main_branch.source.map(function(branch_id){
		
		branch = source_pathway.getFeatureById(branch_id);
		
		angles = get_angles(main_branch,branch)
		main_angle = angles[0];
		branch_angle = angles[1];

		branch.angle = branch_angle;
		
		console.log ('main and branch angles are: ' , angles)
		//console.log(branch.angle)
		
		if (branch_angle< main_angle)
			  left_branches.push(branch.getId()) //left = relative position on the scatter plot
	    else
	    	  right_branches.push(branch.getId()) // right =  relative position on the scatter plot
		
	})		
	    	  
	    //Sort left and right branches by descending angles (larger angles first, smaller angles last (retrieved first with array.pop())
	    	  
	   left_branches.sort(function(a,b){
		   return (source_pathway.getFeatureById(a).angle- source_pathway.getFeatureById(b).angle )
	   })
	   
	   right_branches.sort(function(a,b){
		   return (source_pathway.getFeatureById(a).angle- source_pathway.getFeatureById(b).angle )
	   
	   })
		
	main_branch.left = left_branches;
	main_branch.right = right_branches;
	
	  //console.log ('Branch ',main_branch.getId() , ' left: ' , main_branch.left)
	  //console.log ('Branch ',main_branch.getId() , ' right: ' , main_branch.right)
	
}


function get_angles(main_branch,branch){
	
	vertex = branch.getGeometry().getFirstCoordinate();
	
	var x1,y1,x2,y2; //default values for vec 1 is the x axis 

	//Iterate through main branch segments to find the ones surrounding this vertex
	 main_branch.getGeometry().forEachSegment(function(start, end) {
	 	//found segment leading up to vertex
	 	if (end[0] == vertex[0] &&  end[1] == vertex[1]){
	 		x1 = start[0]-end[0];
	 		y1 = start[1]-end[1];
	 	}	
	 	//found segment after vertex
	 	if (start[0] == vertex[0] &&  start[1] == vertex[1]){
	 		x2 = end[0]-start[0];
	 		y2 = end[1]-start[1];
	 	}
	 		
	 })
	 
	 if (!x1){ //start of branch
	 	x1 = -x2;
	 	y1 = -y2;
	 	}
	 	
	 
	 	//Iterate through segments to find the first segment in this branch
	 branch.getGeometry().forEachSegment(function(start, end) {	
	 	//found first segment
	 	if (start[0] == vertex[0] &&  start[1] == vertex[1]){
	 		x3 = end[0]-start[0];
	 		y3 = end[1]-start[1];
	 	}
	 		
	 })

	 console.log(x1,y1,x2,y2,x3,3);
      angle1 = Math.atan2(y2, x2) - Math.atan2(y1, x1)
	  if (angle1 < 0) 
	  	angle1 += 2 * Math.PI; 
	  	
	 main_angle = angle1;
	 
	 angle2 = Math.atan2(y2, x2) - Math.atan2(y3, x3)
	  if (angle2 < 0) 
	  	angle2 += 2 * Math.PI; 
	  	
	  branch_angle = angle2;
	 
	  	
	  //console.log(angle) 
	  
	  return [main_angle,branch_angle]  
}

function getrightNode(node_id) {

	var branch = source_pathway.getFeatureById(node_id) ; 
	return branch.right.pop();	
	
}

function getleftNode(node_id) {

	var branch = source_pathway.getFeatureById(node_id) ; 
	return branch.left.pop();	
}



//Recursive function for an in order traversal of branches 
function inOrder (node_id) {
  console.log( ' inOrder running for branch', node_id);
  
  var branch = source_pathway.getFeatureById(node_id);
  
  next_node = getleftNode(node_id) ;
  
  //As long as there are still left nodes to be visited
  while (next_node){
  	inOrder(next_node)
  	next_node = getleftNode(node_id) ;
  }
  	
  
  //increment branch counter and assign level to node
  branch.set('order',++branch_level);
  console.log('set' , branch.getId(), ' level to ',  branch_level);
  
  next_node = getrightNode(node_id) ;
    //As long as there are still right nodes to be visited
   while (next_node){
  	inOrder(next_node)
  	next_node = getrightNode(node_id) ;
  }
  
  
}


function order_branches(){
	//Build tree and traverse to determine order of branches
	source_pathway.getFeatures().map(function(branch){
		 build_tree(branch)
	})
	
	branch_level = -1;
	inOrder(0)
	
}