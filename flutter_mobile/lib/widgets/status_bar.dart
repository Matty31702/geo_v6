import 'package:flutter/material.dart';

class StatusBar extends StatelessWidget {
  final bool isInsideGeofence;
  final String statusMessage;

  const StatusBar({
    super.key,
    required this.isInsideGeofence,
    required this.statusMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      color: isInsideGeofence ? Colors.green[700] : Colors.red[700],
      child: Row(
        children: [
          Icon(
            isInsideGeofence ? Icons.check_circle : Icons.warning,
            color: Colors.white,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              statusMessage,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              // ignore: deprecated_member_use
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              isInsideGeofence ? "IN" : "OUT",
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
