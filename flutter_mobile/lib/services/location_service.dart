import 'package:flutter/material.dart';
import 'package:location/location.dart' as loc;
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:async';
import 'package:geobound/models/geofence_model.dart';

typedef LocationChangedCallback =
    void Function(loc.LocationData? locationData, String? error);

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  final loc.Location _location = loc.Location();
  loc.LocationData? currentLocation;
  StreamSubscription<loc.LocationData>? _locationSubscription;
  final List<LocationChangedCallback> _listeners = [];

  Future<void> initializeLocationService() async {
    // Check if location service is enabled
    bool serviceEnabled = await _location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await _location.requestService();
      if (!serviceEnabled) {
        throw Exception("Location services are disabled");
      }
    }

    // Check location permission
    loc.PermissionStatus permissionStatus = await _location.hasPermission();
    if (permissionStatus == loc.PermissionStatus.denied) {
      permissionStatus = await _location.requestPermission();
      if (permissionStatus != loc.PermissionStatus.granted) {
        throw Exception("Location permission denied");
      }
    }

    // Configure location settings
    await _location.changeSettings(
      accuracy: loc.LocationAccuracy.high,
      interval: 5000, // Update every 5 seconds
      distanceFilter: 5, // Update if moved by 5 meters
    );

    _startLocationTracking();
  }

  Future<void> getCurrentLocation() async {
    currentLocation = await _location.getLocation();
    _notifyListeners();
    return;
  }

  void _startLocationTracking() {
    _locationSubscription?.cancel();
    _locationSubscription = _location.onLocationChanged.listen(
      (loc.LocationData newLocation) {
        currentLocation = newLocation;
        _notifyListeners();
      },
      onError: (e) {
        for (final listener in _listeners) {
          listener(null, e.toString());
        }
      },
    );
  }

  void addLocationChangedListener(LocationChangedCallback callback) {
    _listeners.add(callback);
  }

  void removeLocationChangedListener(LocationChangedCallback callback) {
    _listeners.remove(callback);
  }

  void _notifyListeners() {
    for (final listener in _listeners) {
      listener(currentLocation, null);
    }
  }

  List<Marker> getLocationMarkers(BuildContext context) {
    if (currentLocation == null) return [];

    final List<Marker> markers = [];

    // Add current location marker
    markers.add(
      Marker(
        point: LatLng(currentLocation!.latitude!, currentLocation!.longitude!),
        width: 40,
        height: 40,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.blue.withOpacity(0.7),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: const Icon(Icons.my_location, color: Colors.white, size: 20),
        ),
      ),
    );

    // Add police HQ marker
    markers.add(
      Marker(
        point: GeofenceModel.policeHQ,
        width: 40,
        height: 40,
        child: GestureDetector(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Police Regional Office 10\nCamp 1Lt Vicente G. Alagar, Claro M. Recto Ave, Cagayan de Oro',
                ),
                duration: Duration(seconds: 3),
              ),
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.7),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: const Icon(Icons.location_on, color: Colors.white, size: 20),
          ),
        ),
      ),
    );

    return markers;
  }

  void dispose() {
    _locationSubscription?.cancel();
    _listeners.clear();
  }
}
