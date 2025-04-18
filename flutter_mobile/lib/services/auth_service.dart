import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Sign in with personnel ID and password
  Future<UserCredential> signInWithPersonnelID(
    String personnelID,
    String password,
  ) async {
    try {
      // First, query Firestore to find the user document with this personnel ID
      final querySnapshot =
          await _firestore
              .collection('Users')
              .where('username', isEqualTo: personnelID)
              .limit(1)
              .get();

      if (querySnapshot.docs.isEmpty) {
        throw FirebaseAuthException(
          code: 'user-not-found',
          message: 'No personnel found with this ID',
        );
      }

      // Get the email associated with this personnel ID
      final userDoc = querySnapshot.docs.first;
      final String email = userDoc['email'];

      // Sign in with email and password using Firebase Auth
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      if (e is FirebaseAuthException) {
        // Forward Firebase auth exceptions
        rethrow;
      }
      // Handle Firestore or other errors
      throw FirebaseAuthException(
        code: 'operation-failed',
        message: 'Authentication failed. Please try again.',
      );
    }
  }

  // Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // Get current user
  User? get currentUser => _auth.currentUser;

  // Get user stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();
}
