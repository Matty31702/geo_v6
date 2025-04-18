import 'package:flutter/material.dart';
import 'package:flutter_mobile/services/auth_service.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_mobile/services/location_service.dart';
import 'package:flutter_mobile/models/geofence_model.dart';
import 'package:flutter_mobile/widgets/status_bar.dart';
import 'package:flutter_mobile/widgets/location_info.dart';
import 'package:flutter_mobile/widgets/action_buttons.dart';
import 'package:flutter_map_cancellable_tile_provider/flutter_map_cancellable_tile_provider.dart'
    as fmctp;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AuthService _authService = AuthService();
  final LocationService _locationService = LocationService();
  final MapController _mapController = MapController();
  final GeofenceModel _geofence = GeofenceModel();

  bool _isLoading = true;
  List<Marker> _markers = [];
  List<Polygon> _polygons = [];
  bool _isInsideGeofence = false;
  String _statusMessage = "Checking location...";

  @override
  void initState() {
    super.initState();
    _initializeServices();
  }

  @override
  void dispose() {
    _locationService.dispose();
    super.dispose();
  }

  Future<void> _initializeServices() async {
    try {
      await _locationService.initializeLocationService();

      _locationService.addLocationChangedListener((locationData, error) {
        if (error != null) {
          setState(() {
            _statusMessage = "Location tracking error: $error";
          });
          return;
        }

        if (mounted && locationData != null) {
          setState(() {
            _isLoading = false;
          });
          _updateMarkers();
          _checkIfInGeofence();
        }
      });

      await _getCurrentLocation();
      _setupGeofence();
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = "Service initialization failed: $e";
      });
    }
  }

  Future<void> _getCurrentLocation() async {
    try {
      await _locationService.getCurrentLocation();
      setState(() {
        _isLoading = false;
      });

      _updateMarkers();
      _checkIfInGeofence();

      // Move map to current location
      if (_locationService.currentLocation != null) {
        _mapController.move(
          LatLng(
            _locationService.currentLocation!.latitude!,
            _locationService.currentLocation!.longitude!,
          ),
          16,
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = "Failed to get location: $e";
      });
    }
  }

  void _updateMarkers() {
    if (_locationService.currentLocation != null) {
      setState(() {
        _markers = _locationService.getLocationMarkers(context);
      });
    }
  }

  void _setupGeofence() {
    try {
      setState(() {
        _polygons = [_geofence.getGeofencePolygon()];
      });
    } catch (e) {
      debugPrint("Error setting up geofence: $e");
    }
  }

  void _checkIfInGeofence() {
    if (_locationService.currentLocation == null) return;

    final isInside = _geofence.isPointInGeofence(
      LatLng(
        _locationService.currentLocation!.latitude!,
        _locationService.currentLocation!.longitude!,
      ),
    );

    if (mounted) {
      setState(() {
        _isInsideGeofence = isInside;
        _statusMessage =
            isInside
                ? "You are inside the designated area"
                : "You are outside the designated area";
      });
    }
  }

  void _markAttendance() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              _isInsideGeofence ? Icons.check_circle : Icons.info_outline,
              color: Colors.white,
            ),
            const SizedBox(width: 8),
            Text(
              _isInsideGeofence
                  ? 'Attendance marked successfully'
                  : 'Attendance marked (outside area)',
            ),
          ],
        ),
        backgroundColor: _isInsideGeofence ? Colors.green : Colors.orange,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Police Regional Office 10'),
        backgroundColor: const Color(0xFF0D47A1),
        centerTitle: true,
        elevation: 4,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await _authService.signOut();
            },
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Initializing location services...'),
                  ],
                ),
              )
              : Column(
                children: [
                  // Status bar
                  StatusBar(
                    isInsideGeofence: _isInsideGeofence,
                    statusMessage: _statusMessage,
                  ),

                  // Location details
                  if (_locationService.currentLocation != null)
                    LocationInfo(location: _locationService.currentLocation!),

                  // Map view
                  Expanded(
                    child: FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: GeofenceModel.policeHQ,
                        initialZoom: 16,
                        interactionOptions: const InteractionOptions(
                          enableScrollWheel: true,
                          enableMultiFingerGestureRace: true,
                          flags: InteractiveFlag.all,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate:
                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.police.attendance',
                          tileProvider: fmctp.CancellableNetworkTileProvider(),
                        ),
                        PolygonLayer(polygons: _polygons),
                        MarkerLayer(markers: _markers),
                      ],
                    ),
                  ),

                  // Action buttons
                  ActionButtons(
                    isInsideGeofence: _isInsideGeofence,
                    onUpdateLocation: _getCurrentLocation,
                    onMarkAttendance: _markAttendance,
                  ),
                ],
              ),
    );
  }
}
