Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
	return Math.min.apply(null, this);
};
var locations, counts, weather, technology, chart, currentData, chartData;
var weatherData = [];
var initialStroke = 'grey';
var highlightStroke = '#333';
var initialScaleFactor;
var previousLayer;
var filterMap = {
	temp: 'maxtempi',
	dow: 'dow',
	date: 'count_date',
	season: 'season',
	countType: 'count_type',
	station: 'station_id'
};
var technology = {
	'V': {
		color: '#1b9e77',
		label: 'Video'
	},
	'H': {
		color: '#d95f02',
		label: 'Manual'
	},
	'R': {
		color: '#7570b3',
		label: 'Pneumatic'
	},
	'I': {
		color: '#e7298a',
		label: 'Infrared'
	}
};
// var technology;
var opacities =  [
	{
		value:0.25,
		label:5,
		numCounts: []
	},
	{
		value:0.5,
		label:20,
		numCounts: []
	},
	{
		value:0.75,
		label:35,
		numCounts: []
	},
	{
		value:0.9,
		label:50,
		numCounts: []
	},
];
var filterPrev;
var prevError = false;
var counters;
var strokeBool = true;
var map;
// Provide your access token
	L.mapbox.accessToken = 'pk.eyJ1IjoiYXRscmVnaW9uYWwiLCJhIjoiQmZ6d2tyMCJ9.oENm3NSf--qHrimdm9Vvdw';
	// Create a map in the div #map
	map = L.mapbox.map('map', 'atlregional.tm2-basemap');

	map.on('click', function(e) {
		console.log(e);
		console.log($(e.originalEvent.target).attr('class'));
		if ($(e.originalEvent.target).attr('class') === 'leaflet-zoom-animated'){
			closeChart();
		}
	});
var legend = L.control({position: 'bottomright'});
var opacityLegend = L.control({position: 'bottomleft'});
var info = L.control();



var projMap;
var csvData = {};
var regionalData;
var colorScale;
var csvMap;
var xVariable = $('#xVariable').val();
var yVariable = $('#yVariable').val();
var rVariable = $('#rVariable').val();
var colorVariable = $('#colorVariable').val();
var dataValues;
var newCsv, csv;
var csvRows;
var previousProps = null;
var scales = {};
var previousMouseId;
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	// previousLayer = null;
	if (typeof previousProps === 'undefined'){
		return;
	}
	console.log(this);
	var bootstrapEnv = findBootstrapEnvironment();
	if (bootstrapEnv !== 'xs'){
		this._div.style.width = '500px';
		this._div.style.height = '500px';
	}
	else{
		this._div.style.width = '380px';
		this._div.style.height = '450px';
	}
	if (props){
		previousProps = props;
		this._div.innerHTML = 
		'<h4><strong>ARC Active Counts</strong><button id="close-chart" style="font-size:xx-large;" aria-label="Close Count Station Chart" class="close pull-right">&times;</button></h4>' +
		'<div id="chart"></div>';
	}
	else{
		this._div.innerHTML = 
		'<h4><strong>ARC Active Counts</strong><button id="close-chart" style="font-size:xx-large;" aria-label="Close Count Station Chart" class="close pull-right">&times;</button></h4>' +
		'Click a count location<br/><strong>OR</strong><br/>Set filter and click <em><strong>Go!</strong></em>' +
		'<div id="chart"></div>';
		if (typeof csvRows !== 'undefined'){
			var chartData = getScatterData(csvRows);
			drawScatter(chartData);
			previousProps = null;
		}
	}
	$('#close-chart').on('click', function(){
			closeChart();
	});
};
info.addTo(map);
$(function() {
    initialize();
	$('.modal').on('show.bs.modal', function() {
		var chart = $('#chart').highcharts();
	    $('#chart').css('visibility', 'hidden');
	});
	$('.modal').on('shown.bs.modal', function() {
		var chart = $('#chart').highcharts();
	    $('#chart').css('visibility', 'initial');
	    chart.reflow();
	});
	$('#drawChart').click(function(e){
		console.log('draw chart');
	});
    $("#temp-comparison").on('focus', function () {
        // Store the current value on focus and on change
        previous = this.value;
    }).change(function() {
        // Do something with the previous value after the change
        // alert(previous);
        $(previous).prop('checked', false);
        $(this.value).prop('checked', true);
        if (this.value === '#temp-min' || this.value === '#temp-max'){
        	$('#temp-field').show();
        }
        else{
        	$('#temp-field').hide();
        	$('#temp.single').val('');
        }
        // Make sure the previous value is updated
        // previous = this.value;
    });
    $('input[type=radio][name=tempRadios]').on('click', function() {
		if (this.id === 'temp-max') {
			console.log(this.id);
			// bind radio button value to temp-comparison checkbox
			$('#temp-comparison option[value="#temp-max"]').prop('selected', true);
		}
		else if (this.id === 'temp-min') {
			$('#temp-comparison option[value="#temp-min"]').prop('selected', true);
		}
	});
    $('.special').on('change keyup', function(e){
    	console.log('clearing single');
    	$('#temp.single').val('');
    	$(".single option:selected").removeAttr("selected");
    });
    $('.single').on('change keyup', function(e){
    	console.log('clearing special');
    	$('#temp.special').val('');
    	$(".special option:selected").removeAttr("selected");
    });
    // Instantiate a slider
    var bootstrapEnv = findBootstrapEnvironment();
    initialScaleFactor = 5;
	if (bootstrapEnv === 'xs' || bootstrapEnv === 'sm'){
		initialScaleFactor = 10;
	}
	$('#scale-factor').slider({
      	formatter: function(value) {
        	return 'Marker radius size: ' + value;
      	},
      	value: initialScaleFactor
    })
	.on('change', function(e){ 
		console.log(e.value.newValue);
		var layers = counters.getLayers();
		var oldValue = e.value.oldValue;
		var newValue = e.value.newValue;
		for (var i = layers.length - 1; i >= 0; i--) {
			var oldRadius = layers[i].getRadius();
			layers[i].setRadius(oldRadius / oldValue * newValue);
		};
			
			
		});
    $('.filter').on('keyup change', function(e){
    	$('#main-alert').css('visibility','hidden');
    	if (this.id === 'dow' || this.id === 'season'){
    		$("#date option:selected").removeAttr("selected");
    	}	
    	else if (this.id === 'date'){
    		$("#dow option:selected").removeAttr("selected");
    		$("#season.special option:selected").removeAttr("selected");
    	}
    	var filters = getFilters();
    	var filterVal = $(this).val();
    	console.log(filters)
    	console.log(filterPrev)
    	console.log(_.isEqual(filters, filterPrev));
    	if (e.type === 'keyup' ){
    		if (this.id !== 'temp'){
    			console.log('keyup = no change');
    			return;
    		}
    		console.log(filterVal);
    		if (this.id === 'temp' && filterVal.length < 2){
    			return;
    		}
    		else{

    		}
    		
    	}
    	else {
    		if (this.id === 'temp'){
    			console.log('temp not changed');
    			return;
    		}
    	}
    	if (typeof filterPrev === 'undefined' || !_.isEqual(filters, filterPrev)){
    		filterPrev = filters;
    		filterData(this, filters, e);
    	}
    	else{
    		console.log('filters have not changed');
    		filterPrev = filters;
    		if (prevError){
    			showFilterError(filters);
    			// clearFilter();
    		}
    	}
		
    }); // end .filter change
    $('#go-button').on('click', function(e){
    	var filters = getFilters();
    	console.log(filters);
    	console.log(filterPrev);
    	console.log(_.isEqual(filters, filterPrev));
    	// if (typeof filterPrev === 'undefined' || !_.isEqual(filters, filterPrev)){
    		filterPrev = filters;
    		filterData(this, filters, e);
    		
    	// }
    	// else{
    	// 	console.log('filters have not changed');
    	// 	filterPrev = filters;
    	// 	if (prevError){
    	// 		showFilterError(filters);
    	// 		// clearFilter();
    	// 	}
    	// }
		
    }); // end .go-button click
    $('#collapse-button').on('click', function(e){
    	var $this = $(this);
    	if ($this.html() === '+'){
    		$this.html('-');
    		$('#collapse-button').addClass('active');
    	}
    	else{
    		$this.html('+');
    		$('#collapse-button').removeClass('active');
    	}
		
    }); // end .go-button click
	$('#clear-dates').on('click', function(e){
		// clearFilter('dates');
		// clearFilter('dow');
		clearFilter();
	});
  }); // end DOMContentLoaded
function getFilters(){
	var filters;
	$('.filter').each(function(i, obj) {
		// console.log(obj.id)
		var value = $(obj).val();
		// $('#' + obj.id).val(value);
		if (obj.id === 'temp-comparison'){
			return true;
		}
		else if (obj.id === 'temp-min' || obj.id === 'temp-max'){
			if ($('#temp.single').val() !== '' || $('#temp.special').val() !== ''){
				if (typeof filters === 'undefined'){
    				filters = {};
    			}
		    	filters['temp-comp'] = $('input[name="tempRadios"]:checked').val();
    		}
    		else{
    			return true;
    		}
		}
		if (value !== null && value !== ""){
			if (typeof filters === 'undefined'){
				filters = {};
			}
	    	filters[obj.id] = value;
		}
	});
	// console.log(filters);
	if (typeof filters !== 'undefined' && typeof filters.season !== 'undefined' && typeof filters.season !== 'object'){
		filters.season = [filters.season];
	}
	return filters;
}
function closeChart(){
	if (previousProps !== null){
		info.update();
		resetPrevious();
	}
}
function filterData($this, filters, e){
	strokeBool = false;
	console.log(e);
	// console.log($this.id)
	var filterClass;
	if ( $($this).hasClass('single') === true ){
		filterClass = 'single';
	}
	else{
		filterClass = 'special'
	}
	console.log(filterClass);
	
	console.log(filters);
	$('#clear-dates').removeAttr('disabled');
	console.log(e.target.id);
	// var filterType = e.target.id;
	// var filterValues = $('#'+filterType).val();
	// console.log(filterValues);
	var layers = counters.getLayers();
	// var filterKey;
	var params;
	var paramsString = '';
	var seasonDates = [];
	var url = "http://localhost:3000/count_sum_weather?";
	// var visibleStations = [];
	// if (typeof filters !== 'undefined' || $this.id === 'go-button'){
		if (typeof filters !== 'undefined'){
    		params = getRequestParams(filters);
    		paramsString = serialize(params);
    	}
    	else{
    		filters = {};
    		filters.station = '';
    	}
		$.ajax({ 
			url: url + paramsString,
			beforeSend: function(){
				$('#loading').css({opacity: 1.0, visibility: "visible"});
				$('#go-button').button('loading');
				// $('#go-button').toggleClass('active');
			},
			complete: function(){
				$('#loading').fadeTo(200, 0);
				$('#go-button').button('reset');
				// $('#go-button').delay(1000).toggleClass('active');
			},
			success: function(json) {
    			console.log(json);
    			console.log(filters);
				var rollup = d3.nest()
					.key(function(d) { return d.station_id; })
					.rollup(function(d){
						return {
							sum_count: d3.sum(d,function(g) {
								return g.total_count;
							}),
							num_count: d.length,
							dates: _.uniq(_.pluck(d, 'count_date')),
							dirs: _.uniq(_.pluck(d, 'direction_of_travel'))
						};
					})
					.map(json);
				console.log(rollup);
				var maxNum = _.max(rollup, function(chr) {
							  return chr.num_count;
							});
				for (var j = layers.length - 1; j >= 0; j--) {
        			var tooltip = layers[j]._tooltip;
        			var id = layers[j].feature.properties.ID;
        			var opacityValue = 0.4; 

        			// If station does not have data for filter query, do not show it.
        			if (typeof rollup[id] === 'undefined'){
        				layers[j].setStyle({fill: false, stroke: false});
        			}
        			else{
        				opacityValue = getOpacity(rollup[id].dates.length);
        				var averageCount = (rollup[id].sum_count / rollup[id].dates.length / rollup[id].dirs.length).toFixed(2);
        				tooltip.setHtml(
        					'<p><strong>' + id + '</strong></p>' +
        					'<p>Average daily: ' + averageCount + '</p>' +
        					'<p>Days of counting: ' + rollup[id].dates.length + '</p>' +
        					'<p>Directions counted: ' + rollup[id].dirs.length + '</p>' 
        				);
        				var newCount = averageCount;
        				var currentOpacity = 0.0;

        				// If station is currently highlighted, keep it highlighted.
        				if (typeof previousLayer !== 'undefined' && previousLayer !== null && previousLayer.feature.properties.id == id){
        					currentOpacity = 1.0
        					console.log(id + ' highligh');
        				}
        				layers[j].setStyle({
        					fill: true, 
        					stroke: true,
        					fillOpacity: opacityValue,
        					// color: 'blue',
        					opacity: currentOpacity
        				});
        				var scaleFactor = $('#scale-factor').slider('getValue');
        				var radius = newCount * scaleFactor / 20;
        				layers[j].setRadius(radius);
        			}

        		} // end for layers iteration
			} // end success
		}); // end get JSON

	// If station was previously selected, get data for single station.
	if (previousLayer !== null){
		getStationData(previousLayer);
	}
}
function getOpacity(numCount){
	for (var i = 0; i < opacities.length; i++) {
		if (numCount < opacities[i].label){
			// console.log(opacities[i].label);
			// console.log(opacities[i].value);
			return opacities[i].value;
		}
	}
}
function resetPrevious(){
	if(typeof previousLayer !== 'undefined' && previousLayer !== null){
		var color = typeof scales[colorVariable](csvMap[previousLayer.feature.properties.ID][0][colorVariable]) !== 'undefined' ? scales[colorVariable](csvMap[previousLayer.feature.properties.ID][0][colorVariable]) : 'blue';
		previousLayer.setStyle({
			fillColor: color,
			color: color,
			stroke: strokeBool
		});
		previousLayer = null;
	}
}
function findBootstrapEnvironment() {
    var envs = ['xs', 'sm', 'md', 'lg'];

    $el = $('<div>');
    $el.appendTo($('body'));

    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];

        $el.addClass('hidden-'+env);
        if ($el.is(':hidden')) {
            $el.remove();
            return env;
        }
    }
}
function adjustFilters(filters){
	if (filterType === 'date'){
		currentValue = moment(+filterValues[i]).format('YYYY-MM-DD');
		// console.log(moment(+filterValues[i]).format('YYYY-MM-DD'));
	}
	else if (filterType === 'season' || filterType === 'temp' || filterType === 'dow'){
		currentValue = +filterValues[i];
	}
	else{
		currentValue = filterValues[i];
	}
	return filters;
}
function createNestingFunction(propertyName, propertyValues, propertyMap){
	console.log(propertyValues);
	// console.log()
	return function(d){ 
		
		// console.log(d[propertyMap[propertyName]]);
		// if ( propertyValues.indexOf(d[propertyMap[propertyName]]) > -1){
		// if (_.some(propertyValues, d[propertyMap[propertyName]])){
			// console.log(true);
			return d[propertyMap[propertyName]];
		// }
	};
}
function resetMarkers(){
	strokeBool = true;
	var layers = counters.getLayers();
	for (var j = layers.length - 1; j >= 0; j--) {
		resetMarker(layers[j]);

	}
}
function resetMarker(marker){
	marker.setStyle({
		fill: true,
		stroke: strokeBool,
		// fillOpacity: 1.0,
		// opacity: 1.0
	});
	marker.setRadius(3);
	marker._tooltip.setHtml(marker.feature.properties.id);
}
function clearFilter(filter){
	if (typeof filter === 'undefined'){
		$('#scale-factor').slider('setValue', 5, true, true);
		$('#clear-dates').attr('disabled', 'disabled');
		$(".filter option:selected").removeAttr("selected");
		$('#temp-min').attr('checked', true);
		$(".temp").val("");
		resetMarkers();
	}
	$("#" + filter + " option:selected").removeAttr("selected");
	filterPrev = undefined;
	resetPrevious();
	info.update();
}
function showFilterError(filters){
	var errorString = '<small><em>';
	var errorStringArray = [];
	$.each(filters, function(filterType, filterValues){
		var value;
		var valueText = '';
		if (filterType === 'countType' || filterType === 'season'){
			valueText = $("#" + filterType + ".single option[value='" + filterValues + "']").text();
		}
		else if (filterType === 'dow' || filterType === 'date'){
			valueText = $("#" + filterType + ".special option[value='" + filterValues + "']").text();
		}
		else if (filterType === 'temp'){
			valueText = $("#" + filterType + '.single').val();
		}
		console.log(valueText);
		errorStringArray.push(filterType + ': ' + valueText);
	});
	errorString += errorStringArray.join('; ') + '</em></small>';
	$('#main-alert').html('<strong>Sorry!</strong> No data found for filters: ' + errorString).css({opacity: 1.0, visibility: "visible"}).delay(1000).fadeTo(2000, 0);
	resetMarkers();
}
function formatDate(val){return moment(+val).format('YYYY-MM-DD');}
function getRequestParams(filters){
	var params = {};
	if(typeof filters === 'undefined'){
		return false;
	}
	else{
		if (typeof filters.date !== 'undefined'){
    		params.count_date = "in." + _.map(filters.date, formatDate);
		}
		if (typeof filters.dow !== 'undefined'){
			params.dow = "in." + filters.dow;
		}
		if (typeof filters.temp !== 'undefined'){
			params.maxtempi = $('input[name="tempRadios"]:checked').val() + filters.temp;
			// filterKey = 'maxtempi';
		}
		if (typeof filters.countType !== 'undefined'){
			params.count_type = 'eq.' + filters.countType;
			// filterKey = 'maxtempi';
		}
		if(typeof filters.season !== 'undefined'){
			params.season = "in." + filters.season;
		}
		if(typeof filters.weather !== 'undefined'){
			for (var i = filters.weather.length - 1; i >= 0; i--) {
				params[filters.weather[i]] = 'eq.' + '1';
			};
			// params.weather = "in." + filters.weather;
		}
		return params;
	}
}
function drawMarker(feature, value, factor){
	feature.setRadius(value, factor);
}
function getStationData(layer){
	resetPrevious();
	var count = layer.feature;
	var id = layer.feature.properties.ARCID;
	info.update(layer.feature.properties);
	layer.setStyle({color: highlightStroke, stroke: true});
	var categories = d3.keys(csvMap['AR-959'][0]);
	var index = categories.indexOf('County');
	categories.splice(index, 1);
	index = categories.indexOf('ID');
	categories.splice(index, 1);
	index = categories.indexOf('Cost');
	categories.splice(index, 1);
	console.log(csvMap[id]);
	console.log(id);
	var data = csvData[id].data;
	console.log(data);
	
	var chartData = {
		description: id,
		categories: categories,
		data: data,
		totals: {
			totals: [],
			means: []
		},
		weekends: [],
		weekdays: [],
		dates: [],
		rains: [],
		temps: []
	};
	drawChart(chartData, 'totals');
	console.log(chartData);

	previousLayer = layer;
	// currentData = rollup;
	$('.modal').modal();
}
serialize = function(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + obj[p]);
    }
  return str.join("&");
};
function checkFilter(count){
	var check = [true];
	if (typeof filterPrev !== 'undefined'){
		if (typeof filterPrev.temp !== 'undefined' ){
			if ( $('input[name="tempRadios"]:checked').val() === 'gte.'){
				if (count.values.temp >= filterPrev.temp){
					check.push(true);
				}
				else{
					check.push(false);
				}
			}
			else if ($('input[name="tempRadios"]:checked').val() === 'lte.'){
				if (count.values.temp < filterPrev.temp){
					check.push(true);
				}
				else{
					check.push(false);
				}
			}
		}
		if (typeof filterPrev.dow !== 'undefined' ){
			if ( _.indexOf(filterPrev.dow, count.values.dow.toString()) > -1 ){
				check.push(true);
			}
			else{
				check.push(false);
			}
		}
		// if (typeof filterPrev.countType !== 'undefined' ){
		// 	if ( _.indexOf(filterPrev.countType, count.values.countType.toString()) > -1 ){
		// 		check.push(true);
		// 	}
		// }
		if (typeof filterPrev.season !== 'undefined' ){
			if ( _.indexOf(filterPrev.season, count.values.season.toString()) > -1 ){
				check.push(true);
			}
			else{
				check.push(false);
			}
		}
		if (typeof filterPrev.date !== 'undefined' ){
			if ( _.indexOf(filterPrev.date, moment(count.key).valueOf().toString()) > -1 ){
				check.push(true);
			}
			else{
				check.push(false);
			}
		}
		if (typeof filterPrev.weather !== 'undefined' ){
			if ( count.values[filterPrev.weather[0]] ===  1){
				check.push(true);
			}
			else{
				check.push(false);
			}
		}
	}
	if (_.indexOf(check, false) > -1){
		return false;
	}
	else{
		return true;
	}
}
function drawChart(data, type){

	chart = $('#chart').highcharts({
		chart: {
	            zoomType: 'x',
	            backgroundColor: 'rgba(255, 255, 255, 0.0)',
	            type: 'column'
	        },
        title: {
            text: data.description
        },

        xAxis: {
            categories: data.categories
        },

        yAxis: {
            allowDecimals: true,
            min: 0,
            max: 1,
            title: {
                text: 'Score'
            }
        },

        // tooltip: {
        //     formatter: function () {
        //         return '<b>' + this.x + '</b><br/>' +
        //             this.series.name + ': ' + this.y + '<br/>' +
        //             'Total: ' + this.point.stackTotal;
        //     }
        // },

        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },

        series: [{
            name: data.description,
            data: data.data,
            stack: 'male'
        }, {
        //     name: 'Joe',
        //     data: [3, 4, 4, 2, 5, 3, 4, 4, 2, 5],
        //     stack: 'male'
        // }, {
        //     name: 'Jane',
        //     data: [2, 5, 6, 2, 1, 2, 5, 6, 2, 1],
        //     stack: 'female'
        // }, {
            name: 'Regional average',
            data: regionalData,
            stack: 'female'
        },
        ]
    });
}
function drawScatter(data){
	// console.log(type);
	// console.log(data.data);
	// console.log(data.rains);
	// console.log(data.temps);
	chart = $('#chart').highcharts({
		chart: {
	            zoomType: 'xy',
	            backgroundColor: 'rgba(255, 255, 255, 0.0)',
	            type: 'scatter'
	        },
        title: {
            text: data.description
        },

        xAxis: {
        	min: 0,
            title: {
                enabled: true,
                text: data.xLabel
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            // type: 'category'
        },
        yAxis: {
        	min: 0,
            title: {
                text: data.yLabel
            }
        },

        plotOptions: {
            series: {
                point: {
                    events: {
                        mouseOver: function () {
                        	// console.log(this.name);
                        	if (typeof previousMouseId !== 'undefined'){
                        		var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == previousMouseId;})
	                        	layer.setStyle({
	                        		color: getColorScale(csvMap[layer.feature.properties.ID][0]),
	                        		opacity: 0.5
	                        	});
                        	}
                        	var id = this.name;
                        	var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == id;})
                        	layer.setStyle({
                        		color: '#000',
                        		opacity: 1
                        	});
                        	previousMouseId = id;
                        }
                    }
                },
                events: {
                	mouseOut: function () {
                     //    console.log(this.name);
                    	// var id = this.name;
                    	var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == previousMouseId;})
                    	layer.setStyle({
                    		color: getColorScale(csvMap[layer.feature.properties.ID][0]),
                    		opacity: 0.5
                    	});
                    }
                }
            }
        },

        series: [{
        	tooltip: {
				headerFormat: '<b>{series.name}</b><br>',
				pointFormat: '{point.name}<br/>' + 
							  data.yLabel + ': {point.y}<br/>' +
							  data.xLabel + ': {point.x}<br/>'
			},
			name: 'Project',
            data: data.data

        }]
    });
}
jQuery.unparam = function (value) {
    if (value.length > 1 && value.charAt(0) == '#'){
        value = value.substring(1);
    }
    var
    // Object that holds names => values.
    params = {},
    // Get query string pieces (separated by &)
    pieces = value.split('&'),
    // Temporary variables used in loop.
    pair, i, l;

    // Loop through query string pieces and assign params.
    for (i = 0, l = pieces.length; i < l; i++) {
        pair = pieces[i].split('=', 2);
        // Repeated parameters with the same name are overwritten. Parameters
        // with no value get set to boolean true.
        params[decodeURIComponent(pair[0])] = (pair.length == 2 ?
            decodeURIComponent(pair[1].replace(/\+/g, ' ')) : true);
    }
    return params;
};
function matchKey(datapoint, key_variable){
	return(parseFloat(key_variable[0][datapoint]));
};
function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}
function getPointSize(row){
	var maxSize = _.max(csvRows,rVariable)[rVariable];
	return +row[rVariable] / maxSize * 10;
}
function getScatterData(csvRows){
	xVariable = $('#xVariable').val();
	yVariable = $('#yVariable').val();
	rVariable = $('#rVariable').val();
	colorVariable = $('#colorVariable').val();
	dataValues = [];
	var color = 'rgba(223, 83, 83, .5)';
	var colorDomain = [_.min(csvRows,colorVariable)[colorVariable],_.max(csvRows,colorVariable)[colorVariable]];
	console.log(csvRows);
	csvRows.forEach(function(row){
		var pointSize = getPointSize(row);
		color = getColorScale(row);
		var totalObject = {
			y: +row[xVariable],
			x: +row[yVariable],
			name: row['ID'],
			radius: pointSize,
			color: convertHex(color, 0.5),

		};
		dataValues.push(totalObject);
	});
	return {
		description: 'Scatter',
		data: dataValues,
		xLabel: xVariable,
		yLabel: yVariable
	};
}
function getColorScale(row){
	if (typeof scales[colorVariable] === 'undefined'){
		var colorDomain = [_.min(csvRows,colorVariable)[colorVariable],_.max(csvRows,colorVariable)[colorVariable]];
		scales[colorVariable] = d3.scale.quantize()
		    .domain(colorDomain)
		    .range(colorbrewer.RdPu[7]);
	}
	return scales[colorVariable](+row[colorVariable]);
}

function initialize() {
	
	$('.scatterVariable').change(function(){
		var chartData = getScatterData(csvRows);
		drawScatter(chartData);
	})
	var params = jQuery.unparam(window.location.hash);
	console.log(params);
	var currentLayer;
	var projUrl = 'proj_eval.geojson';
	dataValues = [];
	// var projUrl = 'Bundles_by_ARCID.geojson'
	d3.csv('Draft_Visualization_08072015.csv' , 
		function(error, csv){
			csvRows = csv;
			console.log(csv);
			regionalData = d3.nest()
				// .key(function(d) { return d.ID; })
				.rollup(function(d){
					return [
						d3.mean(d,function(g) {
							return g['Current Accessibility'];
						}),
						d3.mean(d,function(g) {
							return g['Current Air Quality'];
						}),
						d3.mean(d,function(g) {
							return g['Current Buffer Index'];
						}),
						d3.mean(d,function(g) {
							return g['Current Congestion'];
						}),
						d3.mean(d,function(g) {
							return g['Current Equitable Target Areas'];
						}),
						d3.mean(d,function(g) {
							return g['Current Freight'];
						}),
						d3.mean(d,function(g) {
							return g['Current Safety'];
						}),
						d3.mean(d,function(g) {
							return g['Future Accessibility'];
						}),
						d3.mean(d,function(g) {
							return g['Future Air Quality'];
						}),
						d3.mean(d,function(g) {
							return g['Future Congestion'];
						}),
						d3.mean(d,function(g) {
							return g['Future Deliverability'];
						}),
						d3.mean(d,function(g) {
							return g['Future Freight'];
						}),
						d3.mean(d,function(g) {
							return g['Future Volume'];
						}),
					];
				})
				.map(csv);
			
			csvMap = d3.nest()
				.key(function(d) { return d.ID; })
				.map(csv);
			console.log(csvMap);
			var chartData = getScatterData(csv);
			csv.forEach(function(row){
				var newRow  = _.clone(row);
				delete newRow['Current Score'];
				delete newRow['Future Score'];
				delete newRow['BC 2015'];
				delete newRow['BC 2040'];
				delete newRow['Annual Benefit 2040'];
				var values = d3.values(newRow);
				values = _.map(values, function(num){ return +num; });
				values.splice(0,1);
				values.splice(0,1);
				values.splice(values.length - 1,1);
				// console.log(row);
				csvData[row.ID] = {};
				csvData[row.ID].data = values;
			})
			drawScatter(chartData);

			// get line data
			d3.json(projUrl, function(error, json) {
				if (error) return console.warn(error);
				console.log(json);
				json.features = _.reject(json.features, function(feature){
					// console.log(d3.keys(csvMap).indexOf(feature.properties.ID));
					return d3.keys(csvMap).indexOf(feature.properties.ID) === -1;
				});
				var geoJSON = json;
				data = json;
				console.log(geoJSON);
				console.log(data);
				projMap = d3.nest()
					.key(function(d) { return d.properties.PRJ_TYPE; })
					.map(json.features);
				geomMap = d3.nest()
					.key(function(d) { return d.geometry.type; })
					.map(json.features);
				console.log(geomMap);
				var domain = Object.keys(projMap);
				domain.push(undefined);
				console.log(projMap)
				var stations = [];
				counters = L.geoJson(geoJSON, {
					style: function(feature){
						var color = getColorScale(csvMap[feature.properties.ID][0]);
						// console.log(csvMap[feature.properties.ID][0][colorVariable]);
						if (typeof color === 'undefined'){
							color = 'blue'
						}
						return {
							color: color,
							fillColor: color,
							stroke: true,
							weight: 5,
						};
					},
					onEachFeature: function(feature, layer){
						layer.bindLabel(feature.properties.ID, { direction: 'auto' });
						layer.on({
							click: function(e){
								console.log(feature);
								getStationData(layer);
								// map.panTo(layer.getLatLng());
							},
							mouseover: function(e){
								if (previousProps === null){
									console.log(feature);
									var p =_.find($('#chart').highcharts().series[0].data, function(obj){return obj.name == feature.properties.ID});
									var color = getColorScale(csvMap[feature.properties.ID][0]);
									p.update({
										marker: {
											// symbol: 'square',
											fillColor: convertHex(color, 1.0),
											// opacity: 1,
											lineColor: "#333",
											radius: getPointSize(csvMap[feature.properties.ID][0]) + 1
										}
									});
								}
								// getStationData(layer);
								// map.panTo(layer.getLatLng());
							},
							mouseout: function(e){
								if (previousProps === null){
									var p =_.find($('#chart').highcharts().series[0].data, function(obj){return obj.name == feature.properties.ID});
									var color = getColorScale(csvMap[feature.properties.ID][0]);
									p.update({
										marker: {
											// symbol: 'square',
											fillColor: convertHex(color, 0.5),
											// opacity: 0.5,
											// lineColor: rgba(0,0,0,0),
											radius: getPointSize(csvMap[feature.properties.ID][0])
										}
									});
								}
								// getStationData(layer);
								// map.panTo(layer.getLatLng());
							}
						});
						stations.push(feature.properties.id);
						if (typeof params.id !== 'undefined' && params.id === feature.properties.id){
							currentLayer = layer;
						}
					}
				}).addTo(map);
				console.log(counters);
				map.fitBounds(counters.getBounds());
				if (typeof currentLayer !== 'undefined'){
					getStationData(currentLayer);
				}
				legend.onAdd = function (map) {

					var div = L.DomUtil.create('div', 'info legend row');
					var innerDiv = $('')
					// div.style.width ='400px';
					// div.innerHTML += '<div style="width:200px;">';
					div.innerHTML += '<h4>Counter technology</h4>';

					var tech = Object.keys(technology);

				    for (var i = 0; i < tech.length; i++) {
				        div.innerHTML +=
				            '<i class="circle" style="background:' + technology[tech[i]].color + '"></i> ' +
				             (tech[i] ? technology[tech[i]].label + '<br>' : '+');
				    }
				    // div.innerHTML += 'some other content';
				    // div.innerHTML += '</div><div class=""pull-right style="width:200px;">'
				    // div.innerHTML += '<h4>Days of counting</h4>';

					// var tech = Object.keys(technology);
				    

				 //    for (var i = 0; i < opacities.length; i++) {
				 //        div.innerHTML +=
				 //            '<i class="circle" style="background: grey; opacity:'+opacities[i].value+'"></i> < ' +
				 //             (opacities[i].label ? opacities[i].label + '<br>' : '+');
				 //    }
				 //    div.innerHTML += '</div>';
				    return div;
				};
				legend.addTo(map);
				opacityLegend.onAdd = function (map) {

					var div = L.DomUtil.create('div', 'info legend');
					div.innerHTML += '<h4>Days of counting</h4>';

					var tech = Object.keys(technology);
				    

				    for (var i = 0; i < opacities.length; i++) {
				        div.innerHTML +=
				            '<i class="circle" style="background: grey; opacity:'+opacities[i].value+'"></i> < ' +
				             (opacities[i].label ? opacities[i].label + '<br>' : '+');
				    }

				    return div;
				};
				opacityLegend.addTo(map);
			});
		}
	);
}