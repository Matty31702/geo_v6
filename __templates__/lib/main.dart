import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'screens/auth/login_screen.dart';

// void main() {
//   runApp(const MyApp());
// }

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
      options: const FirebaseOptions(
          apiKey: "AIzaSyAlT6C46rXK3Ogip4p7D8JjUZKngMbGRwk",
          authDomain: "attendance-checker-63276.firebaseapp.com",
          databaseURL:
              "https://attendance-checker-63276-default-rtdb.asia-southeast1.firebasedatabase.app",
          projectId: "attendance-checker-63276",
          storageBucket: "attendance-checker-63276.firebasestorage.app",
          messagingSenderId: "52667528148",
          appId: "1:52667528148:web:38adb152afccb71d539c41",
          measurementId: "G-5Q8MEEFXK9"));
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: LoginScreen(),
    );
  }
}
