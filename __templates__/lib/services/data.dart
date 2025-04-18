import 'dart:math';

Map<String, double> generateRandomLatLng(
    double baseLat, double baseLng, double radiusInMeters) {
  final Random random = Random();

  // Convert radius from meters to degrees
  final double radiusInDegrees = radiusInMeters / 111000;

  // Generate random offsets
  final double randomLatOffset =
      (random.nextDouble() * 2 - 1) * radiusInDegrees;
  final double randomLngOffset =
      (random.nextDouble() * 2 - 1) * radiusInDegrees;

  // Calculate new latitude and longitude
  final double newLat = baseLat + randomLatOffset;
  final double newLng = baseLng + randomLngOffset;

  return {'latitude': newLat, 'longitude': newLng};
}
