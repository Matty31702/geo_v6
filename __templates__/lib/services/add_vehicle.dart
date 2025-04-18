import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geobound_web/services/data.dart';

Future addVehicle(model, color, platenumber, userId) async {
  final docUser = FirebaseFirestore.instance.collection('Vehicles').doc();
  const double baseLat = 8.485383;
  const double baseLng = 124.655940;
  final Map<String, double> randomLatLng =
      generateRandomLatLng(baseLat, baseLng, 500);
  final json = {
    'lat': randomLatLng['latitude'],
    'long': randomLatLng['longitude'],
    'model': model,
    'color': color,
    'platenumber': platenumber,
    'userId': userId,
    'dateTime': DateTime.now(),
  };

  await docUser.set(json);
}
