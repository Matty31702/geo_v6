import 'package:flutter/material.dart';

class ActionButtons extends StatelessWidget {
  final bool isInsideGeofence;
  final VoidCallback onUpdateLocation;
  final VoidCallback onMarkAttendance;

  const ActionButtons({
    super.key,
    required this.isInsideGeofence,
    required this.onUpdateLocation,
    required this.onMarkAttendance,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            // ignore: deprecated_member_use
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          ElevatedButton.icon(
            onPressed: onUpdateLocation,
            icon: const Icon(Icons.my_location),
            label: const Text('Update Location'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D47A1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          ElevatedButton.icon(
            onPressed: onMarkAttendance,
            icon: const Icon(Icons.check),
            label: const Text('Mark Attendance'),
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  isInsideGeofence ? Colors.green[700] : Colors.orange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
