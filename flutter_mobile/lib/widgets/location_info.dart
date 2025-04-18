import 'package:flutter/material.dart';
import 'package:location/location.dart' as loc;

class LocationInfo extends StatelessWidget {
  final loc.LocationData location;

  const LocationInfo({super.key, required this.location});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: Colors.grey[200],
      child: Row(
        children: [
          const Icon(Icons.location_on, size: 18, color: Colors.grey),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Lat: ${location.latitude!.toStringAsFixed(6)}, '
              'Lng: ${location.longitude!.toStringAsFixed(6)}',
              style: TextStyle(color: Colors.grey[800], fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}
