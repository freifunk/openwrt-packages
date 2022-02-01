var latfield = '';
var lonfield = '';
var latfield_id='';
var lonfield_id='';
var centerlon = 10;
var centerlat = 52;
var zoom = 6;

function init(){		
	var field = window.name.substring(0, window.name.lastIndexOf("."));
	if(parent.document.getElementById(field+".latfield")!=null){
		latfield_id = parent.document.getElementById(field+".latfield").value;	
		document.getElementById('osm').style.display="none";
	}
	if(parent.document.getElementById(field+".lonfield")!=null){
		lonfield_id = parent.document.getElementById(field+".lonfield").value;
	}
	if(parent.document.getElementById(field+".centerlat")!=null){
		centerlat =parseFloat(parent.document.getElementById(field+".centerlat").value);
	}
	if(parent.document.getElementById(field+".centerlon")!=null){
		centerlon = parseFloat(parent.document.getElementById(field+".centerlon").value);
	}
	if(parent.document.getElementById(field+".zoom")!=null){
		zoom = parseFloat(parent.document.getElementById(field+".zoom").value);
	}
	drawmap();
}

function drawmap() {
 	var map = L.map('ffmap').setView([centerlat, centerlon], zoom);

	var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
	map.addLayer(osm);
	var marker = L.marker([centerlat, centerlon], {'draggable': true}).addTo(map);
	marker.on('move', (event) => {
		if(parent.document.getElementById(latfield_id)==null){
			latfield=document.getElementById('osmlat');
		}else{
			latfield=parent.document.getElementById(latfield_id);
		}
		if(parent.document.getElementById(lonfield_id)==null){
			lonfield=document.getElementById('osmlon');
		}else{
			lonfield=parent.document.getElementById(lonfield_id);
		}
		latfield.value = event.target.getLatLng().lat;
		lonfield.value = event.target.getLatLng().lng;								

	});
	map.on('click', (event) => {
		marker.setLatLng(event.latlng);
	});
}
