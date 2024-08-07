let map;
let markers = [];
let currentMarker = null;
const pinColors = {
    "Not Home": "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    "Not Interested": "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    "Sold": "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    "Hot Lead": "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    "Revisit": "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    "Already Customer": "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    "Not Qualified": "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.0902, lng: -95.7129 }, // Centered in the US
        zoom: 4
    });

    map.addListener('click', function(event) {
        placeMarker(event.latLng);
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            let pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
        });
    }
}

function placeMarker(location) {
    if (currentMarker) {
        currentMarker.setMap(null);
    }

    currentMarker = new google.maps.Marker({
        position: location,
        map: map
    });

    document.getElementById('status').value = '';
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('notes').value = '';
}

function savePin() {
    if (!currentMarker) return;

    let status = document.getElementById('status').value;
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let email = document.getElementById('email').value;
    let notes = document.getElementById('notes').value;

    let marker = new google.maps.Marker({
        position: currentMarker.getPosition(),
        map: map,
        icon: pinColors[status]
    });

    markers.push({
        position: marker.getPosition().toString(),
        status: status,
        name: name,
        phone: phone,
        email: email,
        notes: notes
    });

    currentMarker.setMap(null);
    currentMarker = null;

    updateGoogleSheet(markers);
}

function updateGoogleSheet(markers) {
    gapi.load('client:auth2', function() {
        gapi.auth2.init({ client_id: '23723857066-56tgb7kvm94ge5nmeogbdt014l1952ov.apps.googleusercontent.co' });
        gapi.client.load('sheets', 'v4', function() {
            let params = {
                spreadsheetId: '1cjdhoYfinT7FNw2jIqiGRxsdfr8Ztf3vbuHCm8stE_Q',
                range: 'Sheet1!A1',
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS'
            };

            let valueRangeBody = {
                majorDimension: 'ROWS',
                values: markers.map(marker => [
                    marker.position,
                    marker.status,
                    marker.name,
                    marker.phone,
                    marker.email,
                    marker.notes
                ])
            };

            gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody).then(function(response) {
                console.log('Data saved to Google Sheets.');
            });
        });
    });
}
