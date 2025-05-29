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

  // Fixed variables to track time spent in geofence
  DateTime? _geofenceEntryTime;
  double _totalHoursInToday = 0.0;
  Map<String, dynamic>? _currentRecord;
  String? _currentRecordId;
  Timer? _hoursUpdateTimer;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _initializeServices();
    _startPeriodicUpdates();
  }

  @override
  void dispose() {
    _hoursUpdateTimer?.cancel();
    _locationService.dispose();
    super.dispose();
  }

  // Start periodic updates for hours calculation
  void _startPeriodicUpdates() {
    _hoursUpdateTimer?.cancel();
    _hoursUpdateTimer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (_isInsideGeofence && _geofenceEntryTime != null && mounted) {
        _updateHoursInRecord();
        // Update UI to show current session time
        setState(() {});
      }
    });
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

          if (_followUser &&
              locationData.latitude != null &&
              locationData.longitude != null) {
            try {
              if (_mapController.camera != null) {
                _mapController.move(
                  LatLng(locationData.latitude!, locationData.longitude!),
                  _mapController.zoom,
                );
              }
            } catch (e) {
              debugPrint("Map controller not ready: $e");
            }
          }
        }
      });

      await _getInitialLocation();
      _setupGeofence();
      await _fetchAttendanceStatus();
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
      await _updateUserLoginStatus(false);
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
      await _firestore.collection('Users').doc(userId).update({
        'lat': currentLocation.latitude,
        'lng': currentLocation.longitude,
        'last_location_update': DateTime.now().toIso8601String(),
      });

      final vehiclesSnapshot =
          await _firestore
              .collection('Vehicles')
              .where('user_id', isEqualTo: userId)
              .get();

      if (vehiclesSnapshot.docs.isNotEmpty) {
        final vehicleDoc = vehiclesSnapshot.docs.first;
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
    final currentLocation = _locationService.currentLocation;

    if (currentLocation == null ||
        currentLocation.latitude == null ||
        currentLocation.longitude == null) {
      debugPrint("Cannot check geofence: Location data is null");
      return;
    }

    final isInside = _geofence.isPointInGeofence(
      LatLng(currentLocation.latitude!, currentLocation.longitude!),
    );

    debugPrint(
      "Checking geofence: Lat: ${currentLocation.latitude}, Lng: ${currentLocation.longitude}, Inside: $isInside",
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

  // Fixed _fetchAttendanceStatus method with proper entry time handling
  Future<void> _fetchAttendanceStatus() async {
    try {
      final userId = _authService.currentUser?.uid;
      if (userId == null) return;

      final today = DateTime.now().toIso8601String().split('T')[0];
      final tomorrow =
          DateTime.now()
              .add(const Duration(days: 1))
              .toIso8601String()
              .split('T')[0];

      final snapshot =
          await _firestore
              .collection('Records')
              .where('user_id', isEqualTo: userId)
              .get();

      final todayDocs =
          snapshot.docs.where((doc) {
            final data = doc.data();
            final docDate = data['date_time'] as String?;
            return docDate != null &&
                docDate.compareTo(today) >= 0 &&
                docDate.compareTo(tomorrow) < 0;
          }).toList();

      if (todayDocs.isNotEmpty) {
        todayDocs.sort((a, b) {
          final aDate = a.data()['date_time'] as String? ?? '';
          final bDate = b.data()['date_time'] as String? ?? '';
          return bDate.compareTo(aDate);
        });

        final docData = todayDocs.first.data();
        _currentRecord = docData;
        _currentRecordId = todayDocs.first.id;

        if (mounted) {
          setState(() {
            _currentAttendanceStatus =
                docData['status'] as String? ?? "Unknown";

            final hoursIn = docData['hours_in'];
            _totalHoursInToday = (hoursIn is num) ? hoursIn.toDouble() : 0.0;

            // Fixed entry time handling
            if (_currentAttendanceStatus == "IN") {
              final entryTimeStr = docData['entry_time'] as String?;
              if (entryTimeStr != null && entryTimeStr.isNotEmpty) {
                try {
                  _geofenceEntryTime = DateTime.parse(entryTimeStr);
                  debugPrint("Restored entry time: $_geofenceEntryTime");
                } catch (e) {
                  debugPrint("Error parsing entry time: $e");
                  // If we're IN but can't parse entry time, set it to now
                  _geofenceEntryTime = DateTime.now();
                  _updateEntryTimeInFirestore();
                }
              } else if (_isInsideGeofence) {
                // If status is IN but no entry time, set it to now
                _geofenceEntryTime = DateTime.now();
                _updateEntryTimeInFirestore();
              }
            } else {
              _geofenceEntryTime = null;
            }
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _currentAttendanceStatus = "Not Recorded";
            _totalHoursInToday = 0.0;
            _currentRecord = null;
            _currentRecordId = null;
            _geofenceEntryTime = null;
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching attendance status: $e");
    }
  }

  // Helper method to update entry time in Firestore
  Future<void> _updateEntryTimeInFirestore() async {
    if (_currentRecordId != null && _geofenceEntryTime != null) {
      try {
        await _firestore.collection('Records').doc(_currentRecordId!).update({
          'entry_time': _geofenceEntryTime!.toIso8601String(),
        });
        debugPrint("Updated entry time in Firestore: $_geofenceEntryTime");
      } catch (e) {
        debugPrint("Error updating entry time: $e");
      }
    }
  }

  // Fixed _updateAttendanceStatus method
  Future<void> _updateAttendanceStatus() async {
    if (_isRecordingAttendance) return;

    final userId = _authService.currentUser?.uid;
    if (userId == null) return;

    final currentLocation = _locationService.currentLocation;
    if (currentLocation == null ||
        currentLocation.latitude == null ||
        currentLocation.longitude == null) {
      return;
    }

    final bool wasInsideGeofence = _isInsideGeofence;
    _checkIfInGeofence();
    final String newStatus = _isInsideGeofence ? "IN" : "OUT";

    bool shouldUpdate = false;
    String updateReason = "";

    if (_currentAttendanceStatus == "Not Recorded" ||
        _currentAttendanceStatus == "Unknown") {
      shouldUpdate = true;
      updateReason = "Initial status recording";
    } else if (wasInsideGeofence != _isInsideGeofence) {
      shouldUpdate = true;
      updateReason =
          _isInsideGeofence ? "Entering geofence" : "Leaving geofence";
    } else if (_currentAttendanceStatus != newStatus) {
      shouldUpdate = true;
      updateReason = "Status correction";
    }

    if (!shouldUpdate) {
      return;
    }

    debugPrint("Updating attendance: $updateReason. New status: $newStatus");

    setState(() {
      _isRecordingAttendance = true;
    });

    try {
      final now = DateTime.now();

      // Handle geofence exit - calculate and add hours
      if (wasInsideGeofence &&
          !_isInsideGeofence &&
          _geofenceEntryTime != null) {
        final duration = now.difference(_geofenceEntryTime!);
        final hoursSpent = duration.inMinutes / 60.0;
        _totalHoursInToday += hoursSpent;

        debugPrint(
          "Exiting geofence. Hours spent: ${_formatHoursAndMinutes(hoursSpent)}. Total today: ${_formatHoursAndMinutes(_totalHoursInToday)}",
        );
      }
      // Handle geofence entry - set entry time
      else if (!wasInsideGeofence && _isInsideGeofence) {
        _geofenceEntryTime = now;
        debugPrint("Entering geofence at: ${now.toIso8601String()}");
      }

      // Get vehicle ID if exists
      String? vehicleId;
      try {
        final vehiclesSnapshot =
            await _firestore
                .collection('Vehicles')
                .where('user_id', isEqualTo: userId)
                .limit(1)
                .get();

        if (vehiclesSnapshot.docs.isNotEmpty) {
          vehicleId = vehiclesSnapshot.docs.first.id;
        }
      } catch (e) {
        debugPrint("Error fetching vehicle data: $e");
      }

      final locationData = <String, dynamic>{
        'status': newStatus,
        'date_time': now.toIso8601String(),
        'lat': currentLocation.latitude,
        'lng': currentLocation.longitude,
        'isLoggedIn': true,
        'hours_in': _totalHoursInToday,
      };

      // Fixed entry_time and exit_time handling
      if (_isInsideGeofence) {
        // When entering or staying in geofence
        if (_geofenceEntryTime != null) {
          locationData['entry_time'] = _geofenceEntryTime!.toIso8601String();
        }
        locationData['exit_time'] = null; // Clear exit time
      } else {
        // When exiting geofence
        locationData['exit_time'] = now.toIso8601String();

        // Keep the previous entry_time for reference
        if (_geofenceEntryTime != null) {
          locationData['entry_time'] = _geofenceEntryTime!.toIso8601String();
        }

        // Clear entry time for next session
        _geofenceEntryTime = null;
      }

      if (vehicleId != null) {
        locationData['vehicle_id'] = vehicleId;
      }

      // Update or create record
      if (_currentRecordId != null && _currentRecordId!.isNotEmpty) {
        await _firestore
            .collection('Records')
            .doc(_currentRecordId!)
            .update(locationData);
      } else {
        final docRef = await _firestore.collection('Records').add({
          'user_id': userId,
          ...locationData,
        });
        _currentRecordId = docRef.id;
      }

      setState(() {
        _currentAttendanceStatus = newStatus;
      });

      if (mounted) {
        final formattedTime = _formatHoursAndMinutes(_totalHoursInToday);
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
                      ? 'Checked IN at ${_formatTime(now)} ($formattedTime today)'
                      : 'Checked OUT at ${_formatTime(now)} ($formattedTime today)',
                ),
              ],
            ),
            backgroundColor: _isInsideGeofence ? Colors.green : Colors.orange,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      debugPrint("Error updating attendance status: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update attendance: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isRecordingAttendance = false;
        });
      }
    }
  }

  // Helper method to format time for display
  String _formatTime(DateTime dateTime) {
    return DateFormat('HH:mm:ss').format(dateTime);
  }

  // Fixed helper method to format hours and minutes properly
  String _formatHoursAndMinutes(double totalHours) {
    if (totalHours <= 0) return '0m';

    final hours = totalHours.floor();
    final minutes = ((totalHours - hours) * 60).round();

    if (hours > 0 && minutes > 0) {
      return '${hours}h ${minutes}m';
    } else if (hours > 0) {
      return '${hours}h';
    } else if (minutes > 0) {
      return '${minutes}m';
    } else {
      return '0m';
    }
  }

  // Fixed method to update hours in Firestore without changing status
  Future<void> _updateHoursInRecord() async {
    if (!_isInsideGeofence ||
        _geofenceEntryTime == null ||
        _currentRecordId == null ||
        _currentRecordId!.isEmpty) {
      return;
    }

    try {
      final now = DateTime.now();
      final currentSessionMinutes =
          now.difference(_geofenceEntryTime!).inMinutes;
      final currentSessionHours = currentSessionMinutes / 60.0;
      final temporaryTotalHours = _totalHoursInToday + currentSessionHours;

      await _firestore.collection('Records').doc(_currentRecordId!).update({
        'hours_in': temporaryTotalHours,
        'last_updated': now.toIso8601String(),
        'current_session_minutes': currentSessionMinutes, // For debugging
      });

      debugPrint(
        "Updated hours_in (periodic): ${_formatHoursAndMinutes(temporaryTotalHours)}",
      );
    } catch (e) {
      debugPrint("Error updating hours_in: $e");
    }
  }

  void _toggleFollowUser() {
    setState(() {
      _followUser = !_followUser;

      if (_followUser &&
          _locationService.currentLocation != null &&
          _locationService.currentLocation!.latitude != null &&
          _locationService.currentLocation!.longitude != null) {
        try {
          _mapController.move(
            LatLng(
              _locationService.currentLocation!.latitude!,
              _locationService.currentLocation!.longitude!,
            ),
            _mapController.zoom,
          );
        } catch (e) {
          debugPrint("Error moving map: $e");
        }
      }
    });
  }

  Future<void> _showLogoutConfirmation() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
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

                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (BuildContext context) {
                    return const Center(child: CircularProgressIndicator());
                  },
                );

                await _logout();

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
    // Format hours and minutes for display
    final formattedTime = _formatHoursAndMinutes(_totalHoursInToday);

    // Calculate ongoing session time if currently inside
    String ongoingTime = "0m";
    if (_isInsideGeofence && _geofenceEntryTime != null) {
      final currentDuration = DateTime.now().difference(_geofenceEntryTime!);
      final currentHours = currentDuration.inMinutes / 60.0;
      ongoingTime = _formatHoursAndMinutes(currentHours);
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

                  // Attendance status indicator with formatted hours and minutes
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
                        /* Text(
                          'Total Time Today: $formattedTime',
                          style: const TextStyle(fontSize: 12),
                        ), */
                        if (_isInsideGeofence && _geofenceEntryTime != null)
                          Text(
                            'Current Session: $ongoingTime (since ${DateFormat('HH:mm').format(_geofenceEntryTime!)})',
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
