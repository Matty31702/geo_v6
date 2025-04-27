import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geobound/services/auth_service.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geobound/services/location_service.dart';
import 'package:geobound/models/geofence_model.dart';
import 'package:geobound/widgets/status_bar.dart';
import 'package:geobound/widgets/location_info.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
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

  // Add these new variables to track time spent in geofence
  DateTime? _geofenceEntryTime;
  double _totalHoursInToday = 0.0;
  Map<String, dynamic>? _currentRecord;
  String? _currentRecordId;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _initializeServices();
  }

  @override
  void dispose() {
    _hoursUpdateTimer?.cancel();
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
          _updateUserLoginStatus(true);

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
  // Update user location and any associated vehicle in Firestore
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
      // Update user location
      await _firestore.collection('Users').doc(userId).update({
        'lat': currentLocation.latitude,
        'lng': currentLocation.longitude,
        'last_location_update': DateTime.now().toIso8601String(),
      });

      // Check if user has an associated vehicle
      final vehiclesSnapshot =
          await _firestore
              .collection('Vehicles')
              .where('user_id', isEqualTo: userId)
              .get();

      // If vehicle exists, update its location
      if (vehiclesSnapshot.docs.isNotEmpty) {
        // Get the first vehicle associated with this user
        // (assuming each user has at most one vehicle)
        final vehicleDoc = vehiclesSnapshot.docs.first;

        // Update vehicle location
        await _firestore.collection('Vehicles').doc(vehicleDoc.id).update({
          'lat': currentLocation.latitude,
          'lng': currentLocation.longitude,
          'last_location_update': DateTime.now().toIso8601String(),
        });

        debugPrint("Updated vehicle location for user: $userId");
      }
    } catch (e) {
      debugPrint("Error updating location information: $e");
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

        // Store the current record and its ID for later updates
        _currentRecord = todayDocs.first.data();
        _currentRecordId = todayDocs.first.id;

        setState(() {
          _currentAttendanceStatus = todayDocs.first['status'];

          // Retrieve the existing hours_in value if it exists
          _totalHoursInToday = (todayDocs.first['hours_in'] ?? 0.0).toDouble();

          // If we're currently in the geofence and status is "IN", restore entry time
          if (_isInsideGeofence && todayDocs.first['status'] == "IN") {
            final lastEntryTimeStr = todayDocs.first['entry_time'];
            if (lastEntryTimeStr != null) {
              _geofenceEntryTime = DateTime.parse(lastEntryTimeStr);
            } else {
              // If entry_time is missing but status is IN, set it to now
              _geofenceEntryTime = DateTime.now();
            }
          }
        });
      } else {
        setState(() {
          _currentAttendanceStatus = "Not Recorded";
          _totalHoursInToday = 0.0;
          _currentRecord = null;
          _currentRecordId = null;
        });
      }
    } catch (e) {
      debugPrint("Error fetching attendance status: $e");
    }
  }

  // Modified to handle hours calculation
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

    // Calculate if geofence status changes
    final bool wasInsideGeofence = _isInsideGeofence;
    _checkIfInGeofence(); // Update _isInsideGeofence based on current location
    final newStatus = _isInsideGeofence ? "IN" : "OUT";

    final bool statusChanged = (newStatus != _currentAttendanceStatus);
    final bool geofenceTransition = (wasInsideGeofence != _isInsideGeofence);

    if (!statusChanged && !geofenceTransition) {
      // Neither the recorded status nor our physical position has changed
      return;
    }

    setState(() {
      _isRecordingAttendance = true;
    });

    try {
      // Get current date and time
      final now = DateTime.now();
      final today = now.toIso8601String().split('T')[0];

      // Calculate hours spent in geofence if we're leaving
      if (wasInsideGeofence &&
          !_isInsideGeofence &&
          _geofenceEntryTime != null) {
        // Exiting the geofence - calculate hours spent
        final exitTime = now;
        final duration = exitTime.difference(_geofenceEntryTime!);
        final hoursSpent = duration.inMinutes / 60.0;

        // Add to the total hours for today
        _totalHoursInToday += hoursSpent;

        // Reset entry time
        _geofenceEntryTime = null;

        debugPrint(
          "Exiting geofence. Hours spent: $hoursSpent. Total today: $_totalHoursInToday",
        );
      } else if (!wasInsideGeofence && _isInsideGeofence) {
        // Entering the geofence - record entry time
        _geofenceEntryTime = now;
        debugPrint("Entering geofence at: ${now.toIso8601String()}");
      }

      // Check if user has an associated vehicle
      String? vehicleId;
      final vehiclesSnapshot =
          await _firestore
              .collection('Vehicles')
              .where('user_id', isEqualTo: userId)
              .limit(1)
              .get();

      // If vehicle exists, get its ID
      if (vehiclesSnapshot.docs.isNotEmpty) {
        vehicleId = vehiclesSnapshot.docs.first.id;
      }

      // Format hours with 2 decimal places
      final formattedHours = _totalHoursInToday.toStringAsFixed(2);

      // Prepare location data
      final locationData = {
        'status': newStatus,
        'date_time': now.toIso8601String(),
        'lat': currentLocation.latitude,
        'lng': currentLocation.longitude,
        'isLoggedIn': true,
        'hours_in': _totalHoursInToday, // Add hours_in field
        // Store entry time if we're inside the geofence
        if (_isInsideGeofence && _geofenceEntryTime != null)
          'entry_time': _geofenceEntryTime!.toIso8601String(),
      };

      // Add vehicle_id to the record if it exists
      if (vehicleId != null) {
        locationData['vehicle_id'] = vehicleId;
      }

      // Update existing record or create a new one
      if (_currentRecordId != null) {
        // Update existing record
        await _firestore
            .collection('Records')
            .doc(_currentRecordId)
            .update(locationData);
      } else {
        // Create new record for today
        final docRef = await _firestore.collection('Records').add({
          'user_id': userId,
          ...locationData, // Spread the location data
        });

        // Save the record ID for future updates
        _currentRecordId = docRef.id;
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
              Text('Attendance updated: $newStatus (${formattedHours}h today)'),
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

  // Add a periodic timer to update hours when staying inside the geofence
  Timer? _hoursUpdateTimer;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // Start a timer to periodically update hours_in while inside the geofence
    _hoursUpdateTimer?.cancel();
    _hoursUpdateTimer = Timer.periodic(const Duration(minutes: 5), (timer) {
      if (_isInsideGeofence && _geofenceEntryTime != null) {
        _updateHoursInRecord();
      }
    });
  }

  // Method to update hours in Firestore without changing status
  Future<void> _updateHoursInRecord() async {
    if (!_isInsideGeofence ||
        _geofenceEntryTime == null ||
        _currentRecordId == null) {
      return;
    }

    try {
      final now = DateTime.now();
      final currentSessionHours =
          now.difference(_geofenceEntryTime!).inMinutes / 60.0;
      final temporaryTotalHours = _totalHoursInToday + currentSessionHours;

      // Update only the hours_in field
      await _firestore.collection('Records').doc(_currentRecordId).update({
        'hours_in': temporaryTotalHours,
        'last_updated': now.toIso8601String(),
      });

      debugPrint("Updated hours_in (periodic): $temporaryTotalHours hours");
    } catch (e) {
      debugPrint("Error updating hours_in: $e");
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
    // Format hours for display
    final formattedHours = _totalHoursInToday.toStringAsFixed(2);

    // Calculate ongoing session hours if currently inside
    String ongoingHours = "0.00";
    if (_isInsideGeofence && _geofenceEntryTime != null) {
      final currentDuration = DateTime.now().difference(_geofenceEntryTime!);
      final currentHours = currentDuration.inMinutes / 60.0;
      ongoingHours = currentHours.toStringAsFixed(2);
    }

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

                  // Attendance status indicator with hours
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
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
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Total Hours Today: $formattedHours h',
                          style: const TextStyle(fontSize: 12),
                        ),
                        if (_isInsideGeofence && _geofenceEntryTime != null)
                          Text(
                            'Current Session: $ongoingHours h (since ${DateFormat('HH:mm').format(_geofenceEntryTime!)})',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.green,
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Location details
                  if (_locationService.currentLocation != null)
                    LocationInfo(location: _locationService.currentLocation!),

                  // Map view (existing code...)
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
