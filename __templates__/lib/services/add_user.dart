import 'package:cloud_firestore/cloud_firestore.dart';

Future addUser(name, number, rfid, address, sector, email, type) async {
  final docUser = FirebaseFirestore.instance.collection('Users').doc(rfid);

  final json = {
    'name': name,
    'number': number,
    'address': address,
    'sector': sector,
    'id': docUser.id,
    'isVerified': false,
    'profile': '',
    'email': email,
    'dateTime': DateTime.now(),
    'type': type,
    'lat': 0,
    'lng': 0,
  };

  await docUser.set(json);
}
