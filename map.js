let map;
let locations = [];

//initialize map
function initMap() {
  map = L.map("map").setView([42.9545, -85.4924], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let controlKeyPressed = false;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
      controlKeyPressed = true;
      map.getContainer().style.cursor = "crosshair";
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
      controlKeyPressed = false;
      map.getContainer().style.cursor = "";
    }
  });

  map.on("click", (event) => {
    if (!controlKeyPressed) return;

    const name = window.prompt("Enter a name for this location:");
    if (name === null) return;

    placeMarker(event.latlng, name);
  });
}

function initMarker(marker, name, imageSrc, enabled, locationObj, circle) {
  locationObj.circle = circle;
  marker.on("click", () => {
    const editableTooltipContent = setTooltipContent(
      marker,
      locationObj.name,
      locationObj.imageSrc,
      enabled,
      locationObj,
      true
    );
    marker.unbindTooltip();
    marker
      .bindPopup(editableTooltipContent, { className: "custom-popup" })
      .openPopup();

    marker.once("popupclose", () => {
      marker.unbindPopup();
      const hoverTooltipContent = setTooltipContent(
        marker,
        locationObj.name,
        locationObj.imageSrc,
        enabled,
        locationObj,
        false
      );
      marker.bindTooltip(hoverTooltipContent, {
        className: "custom-tooltip",
        permanent: false,
      });
    });
  });

  const hoverTooltipContent = setTooltipContent(
    marker,
    name,
    locationObj.imageSrc,
    enabled,
    locationObj,
    false
  );
  marker.bindTooltip(hoverTooltipContent, {
    className: "custom-tooltip",
    permanent: false,
  });

  // Set the initial marker and circle colors
  const icon = marker.getElement();
  icon.style.filter = enabled ? "" : "grayscale(100%)";
}

//Function: marker
function placeMarker(location, name) {
  const marker = L.marker(location).addTo(map);

  const locationObj = {
    latitude: location.lat,
    longitude: location.lng,
    name: name,
    enabled: true,
    imageSrc: "",
    radius: 16.25, 
  };

  const circle = drawCircle(location, true, locationObj.radius);
  locationObj.circle = circle;
  locations.push(locationObj);
  initMarker(marker, name, "", true, locationObj, circle);
}

//Function: circle
function drawCircle(location, enabled, radius) {
  const circle = L.circle(location, {
    color: enabled ? "blue" : "gray",
    fillColor: enabled ? "#f03" : "#aaa",
    fillOpacity: 0.5,
    radius: radius,
  }).addTo(map);

  return circle;
}

function setTooltipContent(marker, name, imageSrc, enabled, locationObj, isEditable) {
  // Create the tooltip content
  const nameElement = document.createElement("div");
  nameElement.innerHTML = name;

  const imgElement = document.createElement("img");
  imgElement.src = imageSrc || "";
  imgElement.width = 50;
  imgElement.height = 50;
  imgElement.style.display = imageSrc ? "block" : "none";


  const tooltipContent = document.createElement("div");
  tooltipContent.setAttribute("id", "tooltipContent");

  tooltipContent.appendChild(nameElement);
  console.log(imgElement)
  tooltipContent.appendChild(imgElement);

  if (isEditable) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.classList.add("form-control-file", "mb-2");
    fileInput.addEventListener("input", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        imgElement.src = reader.result;
        locationObj.imageSrc = reader.result; //imageSrc set here
        marker.unbindTooltip();
        const hoverTooltipContent = setTooltipContent(
          marker,
          locationObj.name,
          locationObj.imageSrc,
          enabled,
          locationObj,
          false
        );
        marker.bindTooltip(hoverTooltipContent, {
          className: "custom-tooltip",
          permanent: false,
        });
        if (marker.isPopupOpen()) {
          const popupContent = setTooltipContent(
            marker,
            locationObj.name,
            locationObj.imageSrc,
            enabled,
            locationObj,
            true
          );
          marker.setPopupContent(popupContent);
        }
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    });
    tooltipContent.appendChild(fileInput);

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.classList.add("btn", "btn-danger", "mr-2");
    deleteButton.onclick = () => {
      const index = locations.findIndex((loc) => loc.name === name);
      locationObj.circle.remove();
      locations.splice(index, 1);
      marker.remove();
    };

    const enabledCheckbox = document.createElement("input");
    enabledCheckbox.type = "checkbox";
    enabledCheckbox.checked = enabled;
    enabledCheckbox.classList.add("form-check-input", "ml-2");
    enabledCheckbox.onclick = () => {
      locationObj.enabled = !locationObj.enabled;
      const icon = marker.getElement();
      icon.style.filter = locationObj.enabled ? "" : "grayscale(100%)";
      locationObj.circle.setStyle({
        color: locationObj.enabled ? "blue" : "gray",
        fillColor: locationObj.enabled ? "#f03" : "#aaa",
      });
    };

    const checkboxLabel = document.createElement("label");
    checkboxLabel.innerHTML = "Enabled";
    checkboxLabel.classList.add("form-check-label", "ml-2");
    checkboxLabel.appendChild(enabledCheckbox);

    const text = document.createElement("textarea");
    text.setAttribute("id", "long-text-input");
    text.setAttribute("class", "form-control");
    text.setAttribute("rows", "3");
    text.setAttribute("placeholder", "Description");
    text.addEventListener("input", (event) => {
      locationObj.text = event.target.value;
    });
    

    const radiusDiv = document.createElement("div");
    radiusDiv.classList.add("form-group");

    const radius = document.createElement("input");
    radius.type = "range";
    radius.id = "radius";
    radius.name = "radius";
    radius.min = "0";
    radius.max = "20";
    radius.classList.add("custom-range");

    const radiusLabel = document.createElement("label");
    radiusLabel.setAttribute("for", "radius");
    radiusLabel.innerHTML = "Radius: ";

    const radiusValue = document.createElement("div");
    radiusValue.id = "radiusValue";
    radiusValue.textContent = radius.value;
    radiusValue.classList.add("text-muted");

    radius.addEventListener("input", (event) => {
      const newRadius = parseFloat(event.target.value);
      radiusValue.textContent = newRadius;
      locationObj.radius = newRadius;
      locationObj.circle.setRadius(newRadius*100);
    });

    radiusLabel.appendChild(radiusValue);
    radiusDiv.appendChild(radiusLabel);
    radiusDiv.appendChild(radius);

    enabledCheckbox.checked = locationObj.enabled || enabled;
    text.value = locationObj.text || "";
    radius.value = locationObj.radius || 0;
   
    tooltipContent.appendChild(text);
    tooltipContent.appendChild(checkboxLabel);
    tooltipContent.appendChild(radiusDiv);
    tooltipContent.appendChild(deleteButton);
  }

  return tooltipContent;
}



//send to backend
function sendAllLocationsToBackend() {
  var locationsToSend = locations.map((location) => {
    const { circle, ...locationWithoutCircle } = location;
    return locationWithoutCircle;
  });
  locationsToSend = JSON.stringify(locationsToSend);
  console.log("Sending all locations to backend:", locationsToSend);
}

initMap();
