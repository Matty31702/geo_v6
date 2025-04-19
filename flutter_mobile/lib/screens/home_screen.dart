import 'package:flutter/material.dart';
import 'package:flutter_mobile/services/auth_service.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_mobile/services/location_service.dart';
import 'package:flutter_mobile/models/geofence_model.dart';
import 'package:flutter_mobile/widgets/status_bar.dart';
import 'package:flutter_mobile/widgets/location_info.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
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
  late final MapController _mapController;
  final GeofenceModel _geofence = GeofenceModel();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  bool _isLoading = true;
  List<Marker> _markers = [];
  List<Polygon> _polygons = [];
  bool _isInsideGeofence = false;
  String _statusMessage = "Checking location...";
  bool _followUser = true;
  String _currentAttendanceStatus = "Unknown";
  bool _isRecordingAttendance = false;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
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
          _updateAttendanceStatus();
          _updateUserLocation();

          // Only use the map controller if follow is enabled AND we're sure the map is initialized
          if (_followUser &&
              locationData.latitude != null &&
              locationData.longitude != null) {
            try {
              // Check if map controller is properly initialized
              if (_mapController.camera != null) {
                _mapController.move(
                  LatLng(locationData.latitude!, locationData.longitude!),
                  // ignore: deprecated_member_use
                  _mapController.zoom,
                );
              }
            } catch (e) {
              // Silently handle map controller error
              debugPrint("Map controller not ready: $e");
            }
          }
        }
      });

      await _getInitialLocation();
      _setupGeofence();
      _fetchAttendanceStatus();
    } catch (e) {
      setState(() {
        _isLoading = false;
        _statusMessage = "Service initialization failed: $e";
      });
    }
  }

  // Update user login status in Firestore
  Future<void> _updateUserLoginStatus(bool isLoggedIn) async {
    try {
      final userId = _authService.currentUser?.uid;
      if (userId == null) return;

      await _firestore.collection('Users').doc(userId).update({
        'isLoggedIn': isLoggedIn,
        'last_status_update': DateTime.now().toIso8601String(),
      });

      debugPrint("Updated user login status to: $isLoggedIn");
    } catch (e) {
      debugPrint("Error updating user login status: $e");
    }
  }

  // Logout and update status in Firestore
  Future<void> _logout() async {
    try {
      // First update the login status to false
      await _updateUserLoginStatus(false);

      // Then sign out from authentication
      await _authService.signOut();
    } catch (e) {
      debugPrint("Error during logout: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logout error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Update user location in Firestore
  Future<void> _updateUserLocation() async {
    final userId = _authService.currentUser?.uid;
    if (userId == null) return;

    final currentLocation = _locationService.currentLocation;
    if (currentLocation == null ||
        currentLocation.latitude == null ||
        currentLocation.longitude == null) {
      return;
    }

    try {
      await _firestore.collection('Users').doc(userId).update({
        'lat': currentLocation.latitude,
        'lng': currentLocation.longitude,
        'last_location_update': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint("Error updating user location: $e");
    }
  }

  Future<void> _getInitialLocation() async {
    try {
      await _locationService.getCurrentLocation();
      setState(() {
        _isLoading = false;
      });

      _updateMarkers();
      _checkIfInGeofence();

      // Move map to current location with safety check
      if (_locationService.currentLocation != null) {
        try {
          _mapController.move(
            LatLng(
              _locationService.currentLocation!.latitude!,
              _locationService.currentLocation!.longitude!,
            ),
            16,
          );
        } catch (e) {
          debugPrint("Map controller not ready during initialization: $e");
        }
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

  Future<void> _fetchAttendanceStatus() async {
    try {
      final userId = _authService.currentUser?.uid;
      if (userId == null) return;

      // Get current date as string (YYYY-MM-DD)
      final today = DateTime.now().toIso8601String().split('T')[0];
      final tomorrow =
          DateTime.now()
              .add(const Duration(days: 1))
              .toIso8601String()
              .split('T')[0];

      // Simpler query that doesn't require composite index
      final snapshot =
          await _firestore
              .collection('Records')
              .where('user_id', isEqualTo: userId)
              .get();

      // Filter client-side for today's records
      final todayDocs =
          snapshot.docs.where((doc) {
            final docDate = doc['date_time'] as String;
            return docDate.compareTo(today) >= 0 &&
                docDate.compareTo(tomorrow) < 0;
          }).toList();

      if (todayDocs.isNotEmpty) {
        // Sort by date_time to get the latest
        todayDocs.sort(
          (a, b) =>
              (b['date_time'] as String).compareTo(a['date_time'] as String),
        );
        setState(() {
          _currentAttendanceStatus = todayDocs.first['status'];
        });
      } else {
        setState(() {
          _currentAttendanceStatus = "Not Recorded";
        });
      }
    } catch (e) {
      debugPrint("Error fetching attendance status: $e");
    }
  }

  Future<void> _updateAttendanceStatus() async {
    // Don't update if already recording to prevent duplicate records
    if (_isRecordingAttendance) return;

    final userId = _authService.currentUser?.uid;
    if (userId == null) return;

    // Get current location
    final currentLocation = _locationService.currentLocation;
    if (currentLocation == null ||
        currentLocation.latitude == null ||
        currentLocation.longitude == null) {
      return; // Can't update without location data
    }

    // Only update if geofence status changes
    final newStatus = _isInsideGeofence ? "IN" : "OUT";
    if (newStatus == _currentAttendanceStatus) return;

    setState(() {
      _isRecordingAttendance = true;
    });

    try {
      // Get current date
      final now = DateTime.now();
      final today = now.toIso8601String().split('T')[0];

      // Prepare location data
      final locationData = {
        'status': newStatus,
        'date_time': now.toIso8601String(),
        'lat': currentLocation.latitude, // Add latitude
        'lng': currentLocation.longitude, // Add longitude
        'isLoggedIn': true,
      };

      // Check if record for today exists
      final snapshot =
          await _firestore
              .collection('Records')
              .where('user_id', isEqualTo: userId)
              .where('date_time', isGreaterThanOrEqualTo: today)
              .where('date_time', isLessThan: '${today}T23:59:59')
              .limit(1)
              .get();

      if (snapshot.docs.isNotEmpty) {
        // Update existing record
        await _firestore
            .collection('Records')
            .doc(snapshot.docs.first.id)
            .update(locationData);
      } else {
        // Create new record for today
        await _firestore.collection('Records').add({
          'user_id': userId,
          ...locationData, // Spread the location data
        });
      }

      setState(() {
        _currentAttendanceStatus = newStatus;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                _isInsideGeofence ? Icons.check_circle : Icons.info_outline,
                color: Colors.white,
              ),
              const SizedBox(width: 8),
              Text('Attendance status updated: $newStatus'),
            ],
          ),
          backgroundColor: _isInsideGeofence ? Colors.green : Colors.orange,
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      debugPrint("Error updating attendance status: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update attendance: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isRecordingAttendance = false;
      });
    }
  }

  void _toggleFollowUser() {
    setState(() {
      _followUser = !_followUser;

      // If turning follow on, immediately center on user
      if (_followUser && _locationService.currentLocation != null) {
        _mapController.move(
          LatLng(
            _locationService.currentLocation!.latitude!,
            _locationService.currentLocation!.longitude!,
          ),
          _mapController.zoom,
        );
      }
    });
  }

  // Show logout confirmation dialog
  Future<void> _showLogoutConfirmation() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false, // User must tap a button to close the dialog
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Logout'),
          content: const SingleChildScrollView(
            child: ListBody(
              children: <Widget>[Text('Are you sure you want to log out?')],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Logout'),
              onPressed: () async {
                Navigator.of(context).pop();

                // Show loading indicator
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (BuildContext context) {
                    return const Center(child: CircularProgressIndicator());
                  },
                );

                // Call the logout function
                await _logout();

                // Close loading indicator (may not be necessary as auth state change
                // will probably navigate away from this screen)
                if (mounted) {
                  Navigator.of(context).pop();
                }
              },
            ),
          ],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        );
      },
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
            onPressed: _showLogoutConfirmation,
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

                  // Attendance status indicator
                  Container(
                    padding: const EdgeInsets.symmetric(
                      vertical: 8,
                      horizontal: 16,
                    ),
                    color:
                        _currentAttendanceStatus == "IN"
                            ? Colors.green.withOpacity(0.2)
                            : _currentAttendanceStatus == "OUT"
                            ? Colors.orange.withOpacity(0.2)
                            : Colors.grey.withOpacity(0.2),
                    child: Row(
                      children: [
                        Icon(
                          _currentAttendanceStatus == "IN"
                              ? Icons.check_circle
                              : _currentAttendanceStatus == "OUT"
                              ? Icons.info_outline
                              : Icons.help_outline,
                          color:
                              _currentAttendanceStatus == "IN"
                                  ? Colors.green
                                  : _currentAttendanceStatus == "OUT"
                                  ? Colors.orange
                                  : Colors.grey,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Current Status: $_currentAttendanceStatus',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),

                  // Location details
                  if (_locationService.currentLocation != null)
                    LocationInfo(location: _locationService.currentLocation!),

                  // Map view
                  Expanded(
                    child: Stack(
                      children: [
                        FlutterMap(
                          mapController: _mapController,
                          options: MapOptions(
                            initialCenter: GeofenceModel.policeHQ,
                            initialZoom: 16,
                            interactionOptions: const InteractionOptions(
                              enableScrollWheel: true,
                              enableMultiFingerGestureRace: true,
                              flags: InteractiveFlag.all,
                            ),
                            onPositionChanged: (position, hasGesture) {
                              // Disable follow mode if user manually moves the map
                              if (hasGesture && _followUser) {
                                setState(() {
                                  _followUser = false;
                                });
                              }
                            },
                          ),
                          children: [
                            TileLayer(
                              urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                              userAgentPackageName: 'com.police.attendance',
                              tileProvider:
                                  fmctp.CancellableNetworkTileProvider(),
                            ),
                            PolygonLayer(polygons: _polygons),
                            MarkerLayer(markers: _markers),
                          ],
                        ),

                        // Follow user toggle button
                        Positioned(
                          right: 16,
                          bottom: 16,
                          child: FloatingActionButton(
                            mini: true,
                            backgroundColor:
                                _followUser
                                    ? const Color(0xFF0D47A1)
                                    : Colors.grey,
                            onPressed: _toggleFollowUser,
                            child: Icon(
                              _followUser
                                  ? Icons.gps_fixed
                                  : Icons.gps_not_fixed,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
    );
  }
}
