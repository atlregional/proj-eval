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
var rawRows;
// Provide your access token
	L.mapbox.accessToken = 'pk.eyJ1IjoiYXRscmVnaW9uYWwiLCJhIjoiQmZ6d2tyMCJ9.oENm3NSf--qHrimdm9Vvdw';
	// Create a map in the div #map
	map = L.mapbox.map('map', 'atlregional.tm2-basemap');

	map.on('click', function(e) {
		// console.log(e);
		// console.log($(e.originalEvent.target).attr('class'));
		if ($(e.originalEvent.target).attr('class') === 'leaflet-zoom-animated'){
			closeChart();
		}
	});
var legend = L.control({position: 'bottomright'});
var opacityLegend = L.control({position: 'bottomleft'});
var info = L.control();

colorbrewer.RdPu.mod7 = colorbrewer.RdPu[9];
colorbrewer.RdPu.mod7.splice(0,1);
colorbrewer.RdPu.mod7.splice(0,1);
var filterBool = false;
var projMap, projTypeMap;
var csvData = {};
var regionalData, countyData;
var colorScale;
var csvMap, countyMap;
var xVariable = $('#xVariable').val();
var yVariable = $('#yVariable').val();
var rVariable = $('#rVariable').val();
var colorVariable = $('#colorVariable').val();
var dataValues;
var newCsv, csv;
var csvRows;
var previousProps = null;
var scales = {};
var jenks = {};
var closeChartButton = ' <button onclick="closeChart()" class="btn btn-xs btn-default">&times;</button>';
var previousMouseId;
var formats = {};
var searchHighlightIds = [];

var xVariablePreset = 'current_score'
var yVariablePreset = 'future_score'
var rVariablePreset = 'bc_2040'
var colorVariablePreset = 'total_cost'

var variableMap = {
	"ID":{
		"name": "Project ID",
		"description": "",
		"column_chart": false,
		"format": "decimal"
	},
	"county":{
		"name": "County",
		"description": "",
		"column_chart": false,
		"format": "decimal"
	},
	"total_cost":{
		"name": "Cost in Millions",
		"description": "",
		"column_chart": false,
		"format": "dollar"
	},
	"benefit_2015":{
		"name": "2015 Benefit in Millions",
		"description": "Monetary benefit of the project in millions if it is built in 2015",
		"column_chart": false,
		"format": "dollar"
	},
	"benefit_2040":{
		"name": "2040 Benefit in Millions",
		"description": "Monetary benefit of the project in millions if it is built in 2040",
		"column_chart": false,
		"format": "dollar"
	},
	"bc_2015":{
		"name": "2015 Benefit/Cost",
		"description": "Benefit/Cost of project if it were built in 2015",
		"column_chart": false,
		"format": "decimal"
	},
	"bc_2040":{
		"name": "2040 Benefit/Cost",
		"description": "Benefit/Cost of project if it were built in 2040 ",
		"column_chart": false,
		"format": "decimal"
	},
	"current_congestion":{
		"name": "Current Congestion Index",
		"description": "Travel Time Index on project link",
		"column_chart": true,
		"format": "decimal"
	},
	"current_safety":{
		"name": "Current Safety Index",
		"description": "Ratio of crash rate/ average crash rate by facility type",
		"column_chart": true,
		"format": "decimal"
	},
	"current_freight":{
		"name": "Current Freight Index",
		"description": "Whether or not project lies within the ASTRO Network",
		"column_chart": true,
		"format": "decimal"
	},
	"current_reliability":{
		"name": "Current Reliability Index",
		"description": "Trip reliability on project link using Buffer Index",
		"column_chart": true,
		"format": "decimal"
	},
	"current_eta":{
		"name": "Current Equity Index",
		"description": "Whether or not project lies within an ETA",
		"column_chart": true,
		"format": "decimal"
	},
	"current_air":{
		"name": "Current Air Quality Index",
		"description": "Average concentration of particulate matter around project link ",
		"column_chart": true,
		"format": "decimal"
	},
	"current_access":{
		"name": "Current Accessibility Index",
		"description": "The percent of vehicles going to or coming from an activity center on the project link ",
		"column_chart": true,
		"format": "decimal"
	},
	"current_score":{
		"name": "Need Score",
		"description": "The sum of the weighted current data points indicating need",
		"column_chart": false,
		"format": "decimal"
	},
	"future_congestion":{
		"name": "Future Congestion Index",
		"description": "Difference in VHD on the project link build-no build",
		"column_chart": true,
		"format": "decimal"
	},
	"future_access":{
		"name": "Future Accessibility Index",
		"description": "Difference in percent of vehicles going to or coming from an activity center on the project link build-no build",
		"column_chart": true,
		"format": "decimal"
	},
	"future_freight":{
		"name": "Future Freight Index",
		"description": "Difference in truck VMT on link build-no build",
		"column_chart": true,
		"format": "decimal"
	},
	"future_deliverable":{
		"name": "Future Deliverability Index",
		"description": "Total environmental obstacles along project links inversed so high value= high deliverability",
		"column_chart": true,
		"format": "decimal"
	},
	"future_air":{
		"name": "Future Air Quality Index",
		"description": "Difference in level of particulates regionally build-no build",
		"column_chart": true,
		"format": "decimal"
	},
	"future_volume":{
		"name": "Future Volume Index",
		"description": "Volume/Mile categorized",
		"column_chart": true,
		"format": "decimal"
	},
	"future_score":{
		"name": "Performance Score",
		"description": "The sum of the weighted future data points indicating performance",
		"column_chart": false,
		"format": "decimal"
	},
};
formats.dollar = d3.format('$,.2s');
// formats['Current Score'] = d3.format('.2f');
// formats['Future Score'] = d3.format('.2f');
formats.decimal = d3.format('.2f');
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this._div.innerHTML = 'Click a project on the map or chart for more info.'
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	// previousLayer = null;

	if (typeof previousProps === 'undefined'){
		return;
	}
	// console.log(this);
	if (props){
		this._div.innerHTML = 'Currently viewing project ' + props.ID + closeChartButton;
		previousProps = props;
		$('#close-chart').show().removeClass('hidden');
		$('#chartPanel').append('<div id="data-summary"></div>');
	}
	else{
		// $('#chartPanel').html( 
		// // '<h4><strong>ARC Project Evaluation</strong></h4>' +
		// '');
		this._div.innerHTML = 'Click a project on the map or chart for more info.'
		$('#close-chart').hide();
		$('#data-summary').remove();
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
info.update();



// READY!
$(function() {
	$(window).hashchange(function(){
		getHash();
	});
	$('#myTabs a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	})
	// $("#mapTabLink").on('show.bs.tab', function() { 
	// 	map.invalidateSize(false);
	// 	// console.log('map tab');
	// });
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
	
    var tableHighlightId = null;
    // var table = $('#projectTable').DataTable();
    $('#projectTable').on('mouseover', 'tr', function(){
    	if (tableHighlightId !== null && !filterBool)
			removeHighlightChartPoint(tableHighlightId);
		
		table = $('#projectTable').DataTable();
		var row = table.row(this);
		var id = $(row.data()[1]).text();
		// console.log(id);
 		if (!filterBool){
 			highlightChartPoint(id);
			tableHighlightId = id;
		}
	})
	.on( 'mouseleave', function () {
		if (tableHighlightId !== null && !filterBool)
			removeHighlightChartPoint(tableHighlightId);
	});
	$('#clearFilter').click(function(){
		filterBool = false;
		$.each(searchHighlightIds, function(i, id){
			removeHighlightChartPoint(id);
		});
		var layers = counters.getLayers();
		$.each(layers, function(i, layer){
			layer.setStyle({
        		color: getColorScale(csvMap[layer.feature.properties.ID][0]),
        		opacity: 0.5,
        		fillOpacity: 0.5,
        		weight: 5
        	});
        });
    });
	$('#filterChart').click(function(){
		var searchTerm = $(".dataTables_filter input").val();
		if (searchTerm.length > 1){
			filterBool = true;
			removeHighlightIds();
			// console.log(searchTerm);
			table = $('#projectTable').DataTable();
			var rows = table.$('tr', {"filter":"applied"})
			// console.log(rows)
			$.each(rows, function(i, row){
				id = $($(row).children()[0]).text();
				// console.log(id);
				highlightChartPoint(id);
				searchHighlightIds.push(id);
				var layers = counters.getLayers();
				$.each(layers, function(i, layer){
					if (searchHighlightIds.indexOf(layer.feature.properties.ID) > -1){
						layer.setStyle({
		            		color: getColorScale(csvMap[layer.feature.properties.ID][0]),
		            		opacity: 0.5,
		            		weight: 5
		            	});
					}
					else{
						layer.setStyle({
		            		// color: getColorScale(csvMap[id][0]),
		            		opacity: 0.0,
		            		fillOpacity: 0.0,
		            		// weight: 5
		            	});
					}
				});
			});
		}
		else{
			$.each(searchHighlightIds, function(i, id){
				removeHighlightChartPoint(id);
				var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == id;})
				layer.setStyle({
            		color: getColorScale(csvMap[id][0]),
            		opacity: 0.5,
            		weight: 5
            	});
			});
		}
	})



    // Instantiate a slider
    var bootstrapEnv = findBootstrapEnvironment();
    initialScaleFactor = 5;
	if (bootstrapEnv === 'xs' || bootstrapEnv === 'sm'){
		initialScaleFactor = 10;
	}
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
	$('#countyFilter').val('');
	if (previousProps !== null){
		info.update();
		location.hash = '';
		resetPrevious();
		$('#chartControls').show();
		if ( $.fn.dataTable.isDataTable('#projectTable') ) {
			$('#projectTable').DataTable().search( '' ).draw();
		}
	}
}
function getHash(){
	var id = location.hash.slice(1);
	if (d3.keys(csvMap).indexOf(id) > -1 ){
		// console.log();
		var source = 'table';
		if ($("ul#myTabs li.active").attr('id') === 'mapTabLink')
			source = 'map';
		getStationData(getLayerById(id), source);
	}
	else if( id === ''){
		closeChart();
	}
}

function removeHighlightIds(){
	$.each(searchHighlightIds, function(i, id){
		removeHighlightChartPoint(id);
		if (i === searchHighlightIds.length - 1)
		searchHighlightIds = [];
	});
}
function filterData($this, filters, e){
	strokeBool = false;
	// console.log(e);
	// console.log($this.id)
	var filterClass;
	if ( $($this).hasClass('single') === true ){
		filterClass = 'single';
	}
	else{
		filterClass = 'special'
	}
	// console.log(filterClass);
	
	// console.log(filters);
	$('#clear-dates').removeAttr('disabled');
	// console.log(e.target.id);
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
    			// console.log(json);
    			// console.log(filters);
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
				// console.log(rollup);
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
        					// console.log(id + ' highligh');
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
		$('#'+previousLayer.feature.properties.ID.replace(/ /gi, "-")+'-row').closest('tr').removeClass('warning');
		var color = typeof scales[colorVariable](csvMap[previousLayer.feature.properties.ID][0][colorVariable]) !== 'undefined' ? scales[colorVariable](csvMap[previousLayer.feature.properties.ID][0][colorVariable]) : 'blue';
		previousLayer.setStyle({
			fillColor: color,
			color: color,
			stroke: true,
			opacity: 0.5,
			weight: 5
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
	// console.log(propertyValues);
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
function getLayerById(id){
	var layers = counters.getLayers();
	for (var j = layers.length - 1; j >= 0; j--) {
		if (layers[j].feature.properties.ID === id ){
			return layers[j];
		}
	}
}
function resetMarkers(){
	strokeBool = true;
	var layers = counters.getLayers();
	for (var j = layers.length - 1; j >= 0; j--) {
		resetMarker(layers[j]);
	}
}
function resetMarker(marker){
	// console.log(csvMap[marker.feature.properties.ID][0]);
	// console.log(getColorScale(csvMap[marker.feature.properties.ID][0]));
	marker.setStyle({
		// fill: true,
		stroke: true,
		// fillColor: getColorScale(csvMap[marker.feature.properties.ID]),
		color: getColorScale(csvMap[marker.feature.properties.ID][0]),
		// fillOpacity: 1.0,
		opacity: 0.5
	});
	// marker.setRadius(3);
	// marker._tooltip.setHtml(marker.feature.properties.id);
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
		// console.log(valueText);
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
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
      if (/LCI|CTP|TDM|CSX|^NW$|^NE$|^SE$|^SW$|MARTA|GWCC|CNN|^FY$|^ARC$|^SR$|^II$|^STP$|^III$|^US$|CMAQ/g.test(txt))
        return txt
      else if (/^IN$|^OF$|^AND$|^FOR$/g.test(txt)){
        return txt.toLowerCase()
      }
      else
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function getStationData(layer, source){
	resetPrevious();
	$('#chartControls').hide();
	var id = layer.feature.properties.ID;
	if ( source !== 'table' && $.fn.dataTable.isDataTable('#projectTable') ) {
		$('#projectTable').DataTable().search( id ).draw();
	}
	$('#'+id.replace(/ /gi, "-")+'-row').closest('tr').addClass('warning');
	var description = layer.feature.properties.PRJ_DESC !== null ? toTitleCase(layer.feature.properties.PRJ_DESC) : 'No description';
	description += closeChartButton;
	var county = csvMap[id][0].county;
	// console.log(county);
	layer.setStyle({
		fillColor: highlightStroke,
		color: highlightStroke,
		stroke: true,
		opacity: 0.5,
		weight: 10
	});
	info.update(layer.feature.properties);
	var categories = d3.keys(csvMap['AR-959'][0]);
	var index = categories.indexOf('county');
	categories.splice(index, 1);
	index = categories.indexOf('ID');
	categories.splice(index, 1);
	index = categories.indexOf('total_cost');
	categories.splice(index, 1);
	index = categories.indexOf('benefit_2015');
	categories.splice(index, 1);
	index = categories.indexOf('benefit_2040');
	categories.splice(index, 1);
	index = categories.indexOf('bc_2015');
	categories.splice(index, 1);
	index = categories.indexOf('bc_2040');
	categories.splice(index, 1);
	$.each(categories, function(i, varName){
		categories[i] = variableMap[varName].name;
	});
	// console.log(csvMap[id]);
	// console.log(id);
	var data;
	if (typeof csvData[id] !== 'undefined') {
		data = csvData[id].data;
		// console.log(data)
	}
	else{
		$('#chart').html('No data for project ID <b>' + id + '</b>.');
		return;
	}
	// console.log(data);
	
	var chartData = {
		description: id,
		categories: categories,
		data: data,
		county: countyData[county]
	};
	var variableList = ['current_score', 'future_score', 'total_cost', 'bc_2015', 'bc_2040'];
	drawChart(chartData, 'totals');
	var summaryString = getSummaryString(variableList, csvMap[id][0]);
	$('#data-summary')
		.html('')
		.append(description)
		.append(summaryString);
	// console.log(chartData);
	$('[data-toggle="popover"]').popover();
	$('[data-toggle="tooltip"]').tooltip();
	previousLayer = layer;
	// currentData = rollup;
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
function getSummaryString(variableList, row){
	var summaryTable = $('<table id="summary-table" class="table table-condensed" style="font-size:small; ">');
	summaryTable.append('<thead><tr><th>Category</th><th>'+row['ID']+'</th><th>Regional</th></tr></thead>')
	var tBody = $('<tbody>');
	$.each(variableMap, function(varName, data){
		if (!data.column_chart && varName !== 'ID' && varName !== 'county'){
			var projValue = row[varName];
			var regionalValue = regionalMap[varName]/csvRows.length;
			projValue = formats[variableMap[varName].format](projValue);
			regionalValue = formats[variableMap[varName].format](regionalValue);
			var description = '';
			if ( variableMap[varName].description !== ''){
				description = ' <span data-toggle="tooltip" data-placement="right" title="' + variableMap[varName].description + '" class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>';
			}
			tBody.append(
				'<tr><td>' +variableMap[varName].name
				+ description + '</td><td>' + projValue +  '</td>' + 
				'<td>' + regionalValue + '</td></tr>'
			);
		}
	});
	for (var i = 0; i < variableList.length; i++) {
		
	};
	summaryTable.append(tBody);
	return summaryTable;
}
function drawChart(data, type){
	// console.log(data.county);
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

        tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + formats.decimal(this.y);
            }
        },

        plotOptions: {
            // column: {
            //     stacking: 'normal'
            // }
        },

        series: [{
            name: data.description,
            data: data.data,
            stack: 'male'
        }, {
            name: 'Regional average',
            data: regionalData,
            stack: 'female'
        }, {
            name: 'County average',
            data: data.county,
            stack: 'female'
        },
        ]
    });
}
function highlightChartPoint(id){
	// Check if we're looking at scatterplot or specific project
	if (previousProps === null){
		var p =_.find($('#chart').highcharts().series[0].points, function(obj){return obj.name == id});
		// var p = $('#chart').highcharts().series[0].data[0];
		// console.log(id);
		var color = getColorScale(csvMap[id][0]);
		// console.log(p);
		p.update({
			marker: {
				fillColor: convertHex(color, 1.0),
				lineColor: '#000',
				lineWidth: 2,
				radius: getPointSize(csvMap[id][0]) + 1
			}
		});
		// console.log(p);
	}
}
// function highlightMoveChartPoint(id){
// 	var chart = $('#chart').highcharts()
// 	// Check if we're looking at scatterplot or specific project
// 	if (previousProps === null){
// 		var p =_.find(chart.series[0].points, function(obj){return obj.name == id});
// 		// var p = $('#chart').highcharts().series[0].data[0];
// 		//save the point state to a new point
// 		var color = getColorScale(csvMap[id][0]);
// 		var newPoint = {
// 			x: p.x,
// 			y: p.y,
// 			name: p.name,
// 			marker: {
// 				fillColor: convertHex(color, 1.0),
// 				lineColor: '#000',
// 				lineWidth: 2,
// 				radius: getPointSize(csvMap[id][0]) + 1
// 			}
// 		};
// 		//remove the point
// 		p.remove();
// 		//add the new point at end of series
// 		chart.series[0].addPoint(newPoint);
// 		//select the last point
// 		chart.series[0].points[chart.series[0].points.length - 1].select();
// 	}	
// }
function removeHighlightChartPoint(id){
	// Check if we're looking at scatterplot or specific project
	if (previousProps === null){
		var p =_.find($('#chart').highcharts().series[0].points, function(obj){return obj.name == id});
		// var p = $('#chart').highcharts().series[0].data[0];
		var color = getColorScale(csvMap[id][0]);
		p.update({
			marker: {
				// symbol: 'square',
				fillColor: convertHex(color, 0.5),
				// lineColor: '#000',
				// lineWidth: 2,
				// opacity: 0.5,
				// lineColor: rgba(0,0,0,0),
				radius: getPointSize(csvMap[id][0])
			}
		});
	}
}
function drawScatter(data){
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
        	// min: 0,
            title: {
                enabled: true,
                text: variableMap[data.xLabel].name
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            // type: 'category'
        },
        yAxis: {
        	// min: 0,
            title: {
                text: variableMap[data.yLabel].name
            }
        },
        tooltip: {
    		formatter: function(){
    			var tooltipFormats = {};
    			// console.log(formats[variableMap[xVariable].format])
    			tooltipFormats.x = formats[variableMap[xVariable].format];
    			tooltipFormats.y = formats[variableMap[yVariable].format];
    			tooltipFormats.r = formats[variableMap[rVariable].format];
    			tooltipFormats.color = formats[variableMap[colorVariable].format];
    			// console.log(tooltipFormats);
    			return '<b>' +this.point.name+'</b><br>' +
    					variableMap[data.xLabel].name + ': '+tooltipFormats.x(this.point.x)+'<br/>' +
    					variableMap[data.yLabel].name + ': '+tooltipFormats.y(this.point.y)+'<br/>' +
    					variableMap[rVariable].name + ': '+tooltipFormats.r(csvMap[this.point.name][0][rVariable])+'<br/>' +
    					variableMap[colorVariable].name + ': '+tooltipFormats.color(csvMap[this.point.name][0][colorVariable])+'<br/>';
    		}
		},
        plotOptions: {
            series: {
            	states: {
                    hover: {
                        halo: {
                            // size: this.size,
                            attributes: {
                                fill: this.color,
                                'stroke-width': 2,
                                stroke: '#333',
                                // radius: 40
                            }
                        }

                    }
                },
                point: {
                    events: {
                        mouseOver: function () {
                        	if (!filterBool){

                        		// reset previous highlighted project on the map
	                        	if (typeof previousMouseId !== 'undefined'){
	                        		var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == previousMouseId;})
		                        	layer.setStyle({
		                        		color: getColorScale(csvMap[layer.feature.properties.ID][0]),
		                        		opacity: 0.5,
		                        		weight: 5
		                        	});
	                        	}

	                        	// highlight this mouseovered project on the map
	                        	var id = this.name;
	                        	var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == id;})
	                        	layer.setStyle({
	                        		color: '#000',
	                        		opacity: 1,
	                        		weight: 10
	                        	});
	                        	previousMouseId = id;
	                        }
                        },
                        click: function () {
                        	var id = this.name;
                        	window.location.hash = id;
                        	var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == id;});
                        	getStationData(layer, 'chart');
                        }
                    }
                },
                events: {
                	mouseOut: function () {
                    	if (!filterBool){
	                    	var layer = _.find(counters.getLayers(), function(layer){return layer.feature.properties.ID == previousMouseId;})
	                    	layer.setStyle({
	                    		color: getColorScale(csvMap[layer.feature.properties.ID][0]),
	                    		opacity: 0.5,
	                    		weight: 5
	                    	});
	                    }
                    }
                }
            }
        },

        series: [{
			name: 'Project',
            data: data.data,
            // marker : {
            //         enabled : true,
            //         // radius : 2
            // },
            color: scales[colorVariable].range()
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
	// if(typeof hex === 'undefined')
	// 	console.log(hex);
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}
function getPointSize(row){
	var maxSize = _.max(csvRows,rVariable)[rVariable];
	return +row[rVariable] / maxSize * 20;
}
function getScatterData(csvRows, countyFilter){
	xVariable = $('#xVariable').val();
	yVariable = $('#yVariable').val();
	rVariable = $('#rVariable').val();
	colorVariable = $('#colorVariable').val();
	dataValues = [];
	var color = '#ff0000';
	// var colorDomain = [_.min(csvRows,colorVariable)[colorVariable],_.max(csvRows,colorVariable)[colorVariable]];
	// console.log(csvRows);
	csvRows.forEach(function(row){
		// if (countyFilter === '' || typeof countyFilter === 'undefined' || countyFilter === row.County){
			var pointSize = getPointSize(row);
			color = getColorScale(row);
			// if (typeof color === 'undefined'){
			// 	console.log(color);
			// 	console.log(row);

			// }
			var totalObject = {
				x: +row[xVariable],
				y: +row[yVariable],
				name: row['ID'],
				radius: pointSize,
				color: convertHex(color, 0.5),

			};
			dataValues.push(totalObject);
		// }
		
	});
	return {
		description: variableMap[xVariable].name + ' vs. ' + variableMap[yVariable].name,
		data: dataValues,
		xLabel: xVariable,
		yLabel: yVariable
	};
}
function getColorScale(row){
	// console.log(row);
	// console.log(colorVariable);
	if (typeof scales[colorVariable] === 'undefined'){
		// console.log(row[colorVariable]);
		var colorDomain = [+_.min(csvRows,colorVariable)[colorVariable],+_.max(csvRows,colorVariable)[colorVariable]];
		// console.log(colorDomain)
		scales[colorVariable] = d3.scale.quantize()
		    .domain(colorDomain)
		    .range(colorbrewer.RdPu.mod7);
		// breaks = ss.jenks(csvRows.map(function(d) { return +d[colorVariable]; }), 9);
		// jenks[colorVariable] = d3.scale.quantile()
		//     .domain(breaks)
		//     .range(colorbrewer.RdPu.mod7)
		return scales[colorVariable](+row[colorVariable]);
	}
	else{
		return scales[colorVariable](+row[colorVariable]);
	}	
}
// function filterCounties(county){
// 	// console.log(county);

// }
function initialize() {
	var variableString = $('<ul>');
	$.each(variableMap, function(variable, data){
		// if (variable !== 'ID' && variable !== 'county')
		var variableItem = $('<li><strong>' + data.name + '</strong> - ' + data.description + '</li>');
		variableString.append(variableItem);
	})
	$('#variable-list').html(variableString);

	$.each(variableMap, function(csvVar, data){
		// var selected = i === 1 ? '' : 'selected';
		selected = ''
		$('.scatterVariable').append('<option value=' + csvVar + ' ' + selected + '>' + data.name + '</option>');	
	});
	$('#xVariable').val(xVariablePreset);
	$('#yVariable').val(yVariablePreset);
	$('#rVariable').val(rVariablePreset);
	$('#colorVariable').val(colorVariablePreset);
	$('.scatterVariable').change(function(){
		var countyFilter = ''
		if (this.id === 'countyFilter'){
			// countyFilter = this.value;
			// draw map with filtered counties
		}
		var chartData = getScatterData(csvRows, countyFilter);
		drawScatter(chartData);
	});
	$('#colorVariable').change(function(){
		colorVariable = this.value;
		resetMarkers();
	});
	$('#countyFilter').change(function(){
		removeHighlightIds();
		if (this.value !== ''){
			var layers = countyMap[this.value];
			$.each(layers, function(i, layer){
				highlightChartPoint(layer.ID);
				searchHighlightIds.push(layer.ID);
			});
		}
	});
	var currentLayer;
	
	var csvUrl = 'Draft_Visualization_08262015.csv';
	// 'BC_Current_Future_0812.csv'
	d3.text(csvUrl, function(unparsedData){

		rawRows = d3.csv.parseRows(unparsedData);
		rawRows.splice(0,1);
		csv = d3.csv.parse(unparsedData);
		csvRows = csv;		
			// console.log(csv);
			regionalData = d3.nest()
				// .key(function(d) { return d.ID; })
				.rollup(function(d){
					var dataArray = [];
					$.each(variableMap, function(varName, data){
						if (data.column_chart){
							// console.log(varName);
							dataArray.push(
								d3.mean(d,function(g) {
									return g[varName];
								})
							);
						}
					});
					return dataArray;
				})
				.map(csv);
			countyData = d3.nest()
				.key(function(d) { return d.county; })
				.rollup(function(d){
					var dataArray = [];
					$.each(variableMap, function(varName, data){
						if (data.column_chart){
							// console.log(varName);
							dataArray.push(
								d3.mean(d,function(g) {
									return g[varName];
								})
							);
						}
					});
					return dataArray;
				})
				.map(csv);
			var totals = {};
			regionalMap = _.reduce(csv, function(memo, num) {
				_.each(num, function(val, key){
					if (typeof totals[key] === 'undefined'){
						totals[key] = +val;
					}
					else{
						totals[key] += +val;
					}
				});
				return totals;
			});
			csvMap = d3.nest()
				.key(function(d) { return d.ID; })
				.map(csv);

			countyMap = d3.nest()
				.key(function(d) { return d.county; })
				.map(csv);
			// console.log(csvMap);
			var chartData = getScatterData(csv);
			drawScatter(chartData);

			csv.forEach(function(row){
				var newRow  = _.clone(row);
				// console.log(newRow);
				$.each(variableMap, function(varName, data){
					if (!data.column_chart){
						// console.log(varName);
						delete newRow[varName];
					}
				});
				// console.log(newRow);
				var values = d3.values(newRow);
				values = _.map(values, function(num){ return +num; });
				
				// values.splice(0,1);
				// values.splice(0,1);
				// values.splice(values.length - 1,1);
				// values.splice(values.length - 1,1);
				// console.log(values);
				// console.log(row);
				csvData[row.ID] = {};
				csvData[row.ID].data = values;
			})
			

			// get line data

			var projUrl = 'proj_eval.geojson';
			d3.json(projUrl, function(error, json) {
				if (error) return console.warn(error);
				// console.log(json);
				json.features = _.reject(json.features, function(feature){
					// console.log(d3.keys(csvMap).indexOf(feature.properties.ID));
					return d3.keys(csvMap).indexOf(feature.properties.ID) === -1;
				});
				var geoJSON = json;
				data = json;
				// console.log(geoJSON);
				// console.log(data);
				projMap = d3.nest()
					.key(function(d) { return d.properties.ID; })
					.map(json.features);
				projTypeMap = d3.nest()
					.key(function(d) { return d.properties['PRJ_TYPE']; })
					.map(json.features);
				// Data table 
				var table = $('#projectTable');
				var thead = $('<thead>')
				var tr = $('<tr>')
				
				var categories = d3.keys(csvRows[0]);
				// console.log(categories);
				categories.splice(2, 0, 'Description');
				// categories.splice(0, 0, 'Map');
				for (var i = 0; i < categories.length; i++) {
					tr.append('<th>'+categories[i] + '</th>');
				};
				thead.append(tr);
				table.append(thead);
				$.each(rawRows, function(i, row){
					var description = 'No description';
					// console.log(projMap[row[1]][0]);
					if (typeof projMap[row[0]] !== 'undefined'){
						description = projMap[row[0]][0].properties.PRJ_DESC;
					}
					else{
						description = 'No description';
					}
					row.splice(2, 0, description);
					// row.splice(0, 0, '<a href="#' + row[0] + '">' + row[0] + '</a>')
					row[0] = '<a class="project-row" id="'+row[0].replace(/ /gi, "-")+'-row" href="#' + row[0] + '">' + row[0] + '</a>';
					for (var i = 0; i < row.length; i++) {
						if (i === row.length - 1){
							row[i] = formats.dollar(row[i]);
						}
						else if ( i > 2 && !isNaN(row[i])){
							row[i] = formats.decimal(row[i]);
						}
					};
				});
				arrivalsDatatable = table.DataTable( {
					"order": [[ 1, "asc" ]],
					// "columns": [
					// 	{"title": "ID"},
					// 	{"title": "County"},
					// 	{"title": "Direction"},
					// 	{"title": "diff"}
					// ],
					// "columnDefs": [
					// 	// "targets": [ 2 ],
					// 	// "visible": false
					// 	// { "type": "num", "targets": 0 }
					// 	{ "visible": false, "targets": 3 },
					// 	// { "orderData": 1,    "targets": 3 },
					// ],
					"data": rawRows,
					"paging": true,
					"scrollY": 400,
	        		"scrollX": true,
					// bScrollCollapse
					"pageLength": 50,
					// "ordering": false,
					"info": true,
					"bFilter": true
				});
				geomMap = d3.nest()
					.key(function(d) { return d.geometry.type; })
					.map(json.features);
				// console.log(geomMap);
				// console.log(projMap)
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
								// console.log(feature);
								window.location.hash = feature.properties.ID;
								getStationData(layer, 'map');
								// map.panTo(layer.getLatLng());
							},
							mouseover: function(e){
								if (!filterBool){
									highlightChartPoint(feature.properties.ID);
								}
							},
							mouseout: function(e){
								if (!filterBool){
									removeHighlightChartPoint(feature.properties.ID);
								}
							}
						});
						if (location.hash.slice(1) === feature.properties.ID){
							// console.log('hash!!')
							currentLayer = layer;
						}
					}
				}).addTo(map);
				
				// console.log(counters);
				map.fitBounds(counters.getBounds());
				if (typeof currentLayer !== 'undefined'){
					getStationData(currentLayer, 'onload');
				}
			});
	});
}

// Compute the matrices required for Jenks breaks. These matrices
    // can be used for any classing of data with `classes <= n_classes`
    ss.jenksMatrices = function(data, n_classes) {

        // in the original implementation, these matrices are referred to
        // as `LC` and `OP`
        //
        // * lower_class_limits (LC): optimal lower class limits
        // * variance_combinations (OP): optimal variance combinations for all classes
        var lower_class_limits = [],
            variance_combinations = [],
            // loop counters
            i, j,
            // the variance, as computed at each step in the calculation
            variance = 0;

        // Initialize and fill each matrix with zeroes
        for (i = 0; i < data.length + 1; i++) {
            var tmp1 = [], tmp2 = [];
            for (j = 0; j < n_classes + 1; j++) {
                tmp1.push(0);
                tmp2.push(0);
            }
            lower_class_limits.push(tmp1);
            variance_combinations.push(tmp2);
        }

        for (i = 1; i < n_classes + 1; i++) {
            lower_class_limits[1][i] = 1;
            variance_combinations[1][i] = 0;
            // in the original implementation, 9999999 is used but
            // since Javascript has `Infinity`, we use that.
            for (j = 2; j < data.length + 1; j++) {
                variance_combinations[j][i] = Infinity;
            }
        }

        for (var l = 2; l < data.length + 1; l++) {

            // `SZ` originally. this is the sum of the values seen thus
            // far when calculating variance.
            var sum = 0, 
                // `ZSQ` originally. the sum of squares of values seen
                // thus far
                sum_squares = 0,
                // `WT` originally. This is the number of 
                w = 0,
                // `IV` originally
                i4 = 0;

            // in several instances, you could say `Math.pow(x, 2)`
            // instead of `x * x`, but this is slower in some browsers
            // introduces an unnecessary concept.
            for (var m = 1; m < l + 1; m++) {

                // `III` originally
                var lower_class_limit = l - m + 1,
                    val = data[lower_class_limit - 1];

                // here we're estimating variance for each potential classing
                // of the data, for each potential number of classes. `w`
                // is the number of data points considered so far.
                w++;

                // increase the current sum and sum-of-squares
                sum += val;
                sum_squares += val * val;

                // the variance at this point in the sequence is the difference
                // between the sum of squares and the total x 2, over the number
                // of samples.
                variance = sum_squares - (sum * sum) / w;

                i4 = lower_class_limit - 1;

                if (i4 !== 0) {
                    for (j = 2; j < n_classes + 1; j++) {
                        if (variance_combinations[l][j] >=
                            (variance + variance_combinations[i4][j - 1])) {
                            lower_class_limits[l][j] = lower_class_limit;
                            variance_combinations[l][j] = variance +
                                variance_combinations[i4][j - 1];
                        }
                    }
                }
            }

            lower_class_limits[l][1] = 1;
            variance_combinations[l][1] = variance;
        }

        return {
            lower_class_limits: lower_class_limits,
            variance_combinations: variance_combinations
        };
    };

    // # [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
    //
    // Implementations: [1](http://danieljlewis.org/files/2010/06/Jenks.pdf) (python),
    // [2](https://github.com/vvoovv/djeo-jenks/blob/master/main.js) (buggy),
    // [3](https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407) (works)

    ss.jenks = function(data, n_classes) {

        // sort data in numerical order
        data = data.slice().sort(function (a, b) { return a - b; });

        // get our basic matrices
        var matrices = ss.jenksMatrices(data, n_classes),
            // we only need lower class limits here
            lower_class_limits = matrices.lower_class_limits,
            k = data.length - 1,
            kclass = [],
            countNum = n_classes;

        // the calculation of classes will never include the upper and
        // lower bounds, so we need to explicitly set them
        kclass[n_classes] = data[data.length - 1];
        kclass[0] = data[0];

        // the lower_class_limits matrix is used as indexes into itself
        // here: the `k` variable is reused in each iteration.
        while (countNum > 1) {
            kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
            k = lower_class_limits[k][countNum] - 1;
            countNum--;
        }

        return kclass;
    };
