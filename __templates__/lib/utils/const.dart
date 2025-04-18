// import 'package:firebase_auth/firebase_auth.dart';

// String userId = FirebaseAuth.instance.currentUser!.uid;
import 'package:latlong2/latlong.dart';

String logo = 'assets/images/logo.png';
String label = 'assets/images/label.png';
String avatar = 'assets/images/avatar.png';
String icon = 'assets/images/icon.png';

List socials = [
  'assets/images/phone.png',
  'assets/images/apple.png',
  'assets/images/google.png',
  'assets/images/facebook.png'
];

List foodCategories = [
  'assets/images/fastfood.png',
  'assets/images/coffee.png',
  'assets/images/donut.png',
  'assets/images/bbq.png',
  'assets/images/pizza.png'
];
List foodCategoriesName = [
  'Fastfood',
  'Drinks',
  'Donut',
  'BBQ',
  'Pizza',
];

List shopCategories = [
  'Combo',
  'Meals',
  'Snacks',
  'Drinks',
  'Add-ons',
];

String home = 'assets/images/home.png';
String office = 'assets/images/office.png';
String groups = 'assets/images/groups.png';
String gcash = 'assets/images/image 5.png';
String paymaya = 'assets/images/image 6.png';
String bpi = 'assets/images/clarity_bank-solid.png';
bool isPointInPolygon(LatLng point, List<LatLng> polygon) {
  int i;
  int j = polygon.length - 1; // Initialize `j` with the last index
  bool isInside = false;

  for (i = 0; i < polygon.length; j = i++) {
    if (((polygon[i].latitude > point.latitude) !=
            (polygon[j].latitude > point.latitude)) &&
        (point.longitude <
            (polygon[j].longitude - polygon[i].longitude) *
                    (point.latitude - polygon[i].latitude) /
                    (polygon[j].latitude - polygon[i].latitude) +
                polygon[i].longitude)) {
      isInside = !isInside; // Toggle the boolean flag
    }
  }

  return isInside;
}

final List<LatLng> polygon = [
  const LatLng(8.482386, 124.660703),
  const LatLng(8.482260, 124.660365),
  const LatLng(8.481648, 124.660055),
  const LatLng(8.481202, 124.659958),
  const LatLng(8.480607, 124.659869),
  const LatLng(8.480215, 124.659576),
  const LatLng(8.479867, 124.659387),
  const LatLng(8.479635, 124.659260),
  const LatLng(8.479411, 124.659815),
  const LatLng(8.480161, 124.660293),
  const LatLng(8.480991, 124.660573),
  const LatLng(8.480714, 124.661805),
  const LatLng(8.480902, 124.661981),
  const LatLng(8.481415, 124.662026),
  const LatLng(8.481700, 124.661579),
  const LatLng(8.481852, 124.661223),
  const LatLng(8.482227, 124.660812),
  const LatLng(8.482386, 124.660703),
];
