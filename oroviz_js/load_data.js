//Load in data

d3.csv('data/all_cruise_data.csv', function(error, DATA) {

    var temp;

    DATA.map(function(d, i) {

        //Process date+time into single field				
        var date = new Date(d.day + ' ' + d.time);
        //d.date = date.valueOf();
        d.date = date;

        //Keep depth column as a string to preserve "surf" and "bottom_water" values

        //Make numbers out of lat/lon/temp/sal/pres and all Cs fields

        if (d.prs)
            d.prs = Number(d.prs);
        else
            d.prs = Number(d.depth);

        if (d.lat)
            d.lat = Number(d.lat);
        else
            d.lat = NaN

        if (d.lon)
            d.lon = Number(d.lon);
        else
            d.lon = NaN

        if (d.temp.trim())
            d.temp = Number(d.temp);
        /* 					console.log(d.temp); */
        else
            d.temp = NaN;

        if (d.sal.trim())
            d.sal = Number(d.sal);
        else
            d.sal = NaN;

        if (d.cs137_f.search('bd') > 0)
            d.cs137 = 0;

        else //Bd values become 0
            d.cs137 = Number(d.cs137_f);


        if (d.cs137_s.search('bd') > 0)
            d.cs137_s = 0;

        else //Bd values become 0
            d.cs137_s = Number(d.cs137_s);


        if (d.cs134_s.search('bd') > 0)
            d.cs134_s = 0;

        else //Bd values become 0
            d.cs134_s = Number(d.cs134_s);




        if (d.cs134_f.search('bd') > 0)
            d.cs134 = 0;
        else {

            if (d.cs134_f)
                d.cs134 = Number(d.cs134_f);


        }


		d.along_track_distance = 0;
        //Remove spurious fields
        delete d['day'];
        delete d['time'];


    }); //end data.map

    //Attempting to Remove entries with no cs137 value

    data = DATA.filter(function(d) {
        return !isNaN(d.cs137)
    });
    data = DATA; //currently obliterates the line above




    d3.json('data/OroSamples.json', function(error, DATA) {


        DATA.map(function(d, i) {
            d.lat = +d.latitude;
            d.lon = +d.longitude;
            d.id = d.name;

            /* 				     console.log(d.cs137) */
            if (!d.cs137)
                d.cs137 = NaN;

            else {
                if (d.cs137.search('below detection') > 0)
                    d.cs137 = 0;
                else
                    d.cs137 = +d.cs137;
            }
            /* 					 	console.log(d.cs137) */

            if (!d.cs134)
                d.cs134 = NaN;
            else {
                if (d.cs134.search('below detection') > 0)
                    d.cs134 = 0;
                else
                    d.cs134 = +d.cs134;
            }

            d.prs = +d.depth;
            d.sal = +d.salinityData;
            if (!d.sal)
                d.sal = NaN;

            d.temp = +d.tidBitTemperature;
            if (!d.temp)
                d.temp = NaN;
                
           d.along_track_distance = 0;


            d.cruise = 'N/A';
            date = new Date(d.collectionDate);

            d.date = date;
            d.source = 'Our Radioactive Ocean (ORO)';
            if (d.collectionDate) {
                data.push(d);
            }




        });


        //Cycle through all lons to make them negative. 
        data.map(function(d) {
            if (d.lon > 0) d.lon = d.lon - 360
        });

        all_data = data;
        map_data = data;

		create_map();
		create_scatter();

    });


});