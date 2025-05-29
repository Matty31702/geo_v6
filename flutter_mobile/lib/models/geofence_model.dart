import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class GeofenceModel {
  // Police HQ location
  static const LatLng policeHQ = LatLng(8.48104, 124.66092);

  // Geofence polygon points
  final List<LatLng> _geofencePoints = const [
    LatLng(8.480073626313512, 124.6592024185556),
    LatLng(8.480771448610795, 124.659781966325),
    LatLng(8.481003199181472, 124.65989139888063),
    LatLng(8.481336693599516, 124.6597687873508),
    LatLng(8.481749013571928, 124.6601243607887),
    LatLng(8.481810618726058, 124.66008558272824),
    LatLng(8.481958083098945, 124.66018000961981),
    LatLng(8.481997406921607, 124.66033904438592),
    LatLng(8.482213687877376, 124.6604831696423),
    LatLng(8.482375898513538, 124.6604781998065),
    LatLng(8.482508616256084, 124.66082111851995),
    LatLng(8.481975510968397, 124.66114277826864),
    LatLng(8.481782415418323, 124.66200779579509),
    LatLng(8.481531681331873, 124.66223523744821),
    LatLng(8.480877816406121, 124.66193511834342),
    LatLng(8.480499538569816, 124.66190869724471),
    LatLng(8.480697035643217, 124.66061779102608),
    LatLng(8.480093422147974, 124.6604375566402),
    LatLng(8.479679624772032, 124.660560881599),
    LatLng(8.479371902416062, 124.6594855946534),
    LatLng(8.479867192145548, 124.65904421835654),
    LatLng(8.480077545798508, 124.65920321515875),
  ];

  // Geofence polygon points
  /* final List<LatLng> _geofencePoints = const [
    LatLng(8.448564596768122, 124.6135788799146),
    LatLng(8.447903721063412, 124.61231543740246),
    LatLng(8.446738713059787, 124.61313774574927),
    LatLng(8.447285208161134, 124.61506503093773),
    LatLng(8.448579823678969, 124.61358518084529),
  ]; */

  Polygon getGeofencePolygon() {
    return Polygon(
      points: _geofencePoints,
      // ignore: deprecated_member_use
      color: Colors.blue.withOpacity(0.2),
      borderColor: Colors.blue,
      borderStrokeWidth: 2,
      isFilled: true,
    );
  }

  bool isPointInGeofence(LatLng point) {
    return _isPointInPolygon(point, _geofencePoints);
  }

  bool _isPointInPolygon(LatLng point, List<LatLng> polygon) {
    // Ray casting algorithm to determine if point is in polygon
    bool isInside = false;
    int i = 0, j = polygon.length - 1;

    for (i = 0; i < polygon.length; i++) {
      if ((polygon[i].longitude > point.longitude) !=
              (polygon[j].longitude > point.longitude) &&
          (point.latitude <
              (polygon[j].latitude - polygon[i].latitude) *
                      (point.longitude - polygon[i].longitude) /
                      (polygon[j].longitude - polygon[i].longitude) +
                  polygon[i].latitude)) {
        isInside = !isInside;
      }
      j = i;
    }

    return isInside;
  }
}
