let map;
let locations = [];

//initialize map
function initMap() {
  map = L.map('map').setView([42.9545, -85.4924], 13);

  //add titles+copyrights
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


  map.on('dblclick', (event) => {
    const name = window.prompt('Enter a name for this location:');
    if (name === null) return; // If the user pressed "Cancel" in the prompt, don't place the marker or circle.

    placeMarker(event.latlng, name);
  });
}

function initMarker(marker, name, imageSrc, enabled, locationObj, circle) {
  locationObj.circle = circle;
  marker.on('click', () => {
    const editableTooltipContent = setTooltipContent(marker, locationObj.name, locationObj.imageSrc, enabled, locationObj, true);
    marker.unbindTooltip();
    marker.bindPopup(editableTooltipContent, { className: 'custom-popup' }).openPopup();

    marker.once('popupclose', () => {
      marker.unbindPopup();
      const hoverTooltipContent = setTooltipContent(marker, locationObj.name, locationObj.imageSrc, enabled, locationObj, false);
      marker.bindTooltip(hoverTooltipContent, { className: 'custom-tooltip', permanent: false });
    });
  });

  const hoverTooltipContent = setTooltipContent(marker, name, locationObj.imageSrc, enabled, locationObj, false);
  marker.bindTooltip(hoverTooltipContent, { className: 'custom-tooltip', permanent: false });

  // Set the initial marker and circle colors
  const icon = marker.getElement();
  icon.style.filter = enabled ? '' : 'grayscale(100%)';
}

//Function: marker
function placeMarker(location, name) {
  const marker = L.marker(location).addTo(map);
  const circle = drawCircle(location, true); // Create the circle
  
  const locationObj = { latitude: location.lat, longitude: location.lng, name: name, enabled: true};

  locations.push(locationObj);
  initMarker(marker, name, '', true, locationObj, circle); // Pass the circle to initMarker
}



//Function: circle
function drawCircle(location, enabled) {
  const circle = L.circle(location, {
    color: enabled ? 'blue' : 'gray',
    fillColor: enabled ? '#f03' : '#aaa',
    fillOpacity: 0.5,
    radius: 16.25
  }).addTo(map);

  return circle;
}


function setTooltipContent(marker, name, imageSrc, enabled, locationObj, isEditable) {
   // Create the tooltip content
   const nameElement = document.createElement('div');
   nameElement.innerHTML = name;
 
   const imgElement = document.createElement('img');
   imgElement.src = imageSrc || '';
   imgElement.width = 50;
   imgElement.height = 50;
   imgElement.style.display = imageSrc ? 'block' : 'none';
 
   const tooltipContent = document.createElement('div');
   tooltipContent.appendChild(nameElement);
   tooltipContent.appendChild(imgElement);
 
   if (isEditable) {
     const fileInput = document.createElement('input');
     fileInput.type = 'file';
     fileInput.accept = 'image/*';
     fileInput.addEventListener('input', (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        imgElement.src = reader.result;
        locationObj.imageSrc = reader.result;
        marker.unbindTooltip();
        const hoverTooltipContent = setTooltipContent(marker, locationObj.name, locationObj.imageSrc, enabled, locationObj, false);
        marker.bindTooltip(hoverTooltipContent, { className: 'custom-tooltip', permanent: false });
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    });
 
     tooltipContent.appendChild(fileInput); // Add the file input to the tooltip content
 

     const deleteButton = document.createElement('button');
     deleteButton.innerHTML = 'Delete';
     deleteButton.onclick = () => {
      const index = locations.findIndex(loc => loc.name === name);
      locationObj.circle.remove();
       locations.splice(index, 1);
       marker.remove();
    
     };
     
    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = enabled;
    enabledCheckbox.onclick = () => {
      locationObj.enabled = !locationObj.enabled;
      const icon = marker.getElement();
      icon.style.filter = locationObj.enabled ? '' : 'grayscale(100%)';
      locationObj.circle.setStyle({
        color: locationObj.enabled ? 'blue' : 'gray',
        fillColor: locationObj.enabled ? '#f03' : '#aaa'
      });
    };

    const checkboxLabel = document.createElement('label');
    checkboxLabel.innerHTML = 'Enabled';
    checkboxLabel.style.marginLeft = '5px';
    checkboxLabel.appendChild(enabledCheckbox);

    tooltipContent.appendChild(deleteButton);
    tooltipContent.appendChild(checkboxLabel);
  }

  return tooltipContent;
}


//send to backend
function sendAllLocationsToBackend() {
  var locationsToSend = locations.map(location => {
    const { circle, ...locationWithoutCircle } = location;
    return locationWithoutCircle;
  });
  locationsToSend = JSON.stringify(locationsToSend);
  console.log('Sending all locations to backend:', locationsToSend);


}

initMap();
