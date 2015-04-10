		 /* 		For Demo Purposes, pre load two datasets into the browser */
		
		//Variables to store the two datasets
		var cruise_data =[];
		var gridded_data = [];
		
		//Variable for dataset being currently used
		var user_data =[];
		
		//Load in gridded data set		
		d3.json("gridded_data.json", function(error, data) {
		    gridded_data = data;
		});
		
		
		//Load in cruise data set
		d3.json("cruise_data.json", function(error, data) {
			
			data.lat.map(function(d, i) {

		        cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]),
		            "sal": Number(data.sal[i]*0.9),
		            "depth": 0,
		            "level": 0, //for depth dependent data, this would be another col of data. 
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.),
		            "sal": Number(data.sal[i]*0.95),
		            "depth": 10,
		            "level": 0, //for depth dependent data, this would be another col of data. 
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.5),
		            "sal": Number(data.sal[i]*0.92),
		            "depth": 15,
		            "level": 0, //for depth dependent data, this would be another col of data. 
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.4),
		            "sal": Number(data.sal[i]*0.95),
		            "depth": 20,
		            "level": 0, //for depth dependent data, this would be another col of data. 
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.3),
		            "sal": Number(data.sal[i]),
		            "depth": 25,
		            "level": 0, //for depth dependent data, this would be another col of data. 
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.2),
		            "sal": Number(data.sal[i]*0.9),
		            "depth": 30,
		            "level": 0, //for depth dependent data, this would be another col of data. 
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })



		    })
					
			//Default to cruise dataset
			user_data = cruise_data;
			
  			//Once data is loaded, render page
			render_page();
		});
		
		
			
				
