import 'package:flutter/material.dart';
import 'package:geobound_web/screens/home_screen.dart';
import 'package:geobound_web/utils/colors.dart';
import 'package:geobound_web/widgets/button_widget.dart';
import 'package:geobound_web/widgets/text_widget.dart';
import 'package:geobound_web/widgets/textfield_widget.dart';
import 'package:geobound_web/widgets/toast_widget.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final username = TextEditingController();
  final password = TextEditingController();

  bool inLogin = true;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          color: primary,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/logo.png',
              height: 300,
            ),
            const SizedBox(
              height: 20,
            ),
            TextWidget(
              text: 'Admin Account',
              fontSize: 18,
              fontFamily: 'Bold',
            ),
            const SizedBox(
              height: 10,
            ),
            TextFieldWidget(
              height: 45,
              color: Colors.white,
              borderColor: Colors.white,
              label: 'Admin ID',
              controller: username,
            ),
            const SizedBox(
              height: 10,
            ),
            TextFieldWidget(
              height: 45,
              color: Colors.white,
              borderColor: Colors.white,
              label: 'Password',
              showEye: true,
              isObscure: true,
              controller: password,
            ),
            const SizedBox(
              height: 20,
            ),
            ButtonWidget(
              color: Colors.amber,
              width: 150,
              radius: 10,
              label: 'Login',
              onPressed: () {
                if (username.text == 'admin_username123' &&
                    password.text == 'admin_password123') {
                  Navigator.of(context).pushReplacement(MaterialPageRoute(
                      builder: (context) => const HomeScreen()));
                } else {
                  showToast('Invalid admin credentials');
                }
              },
            ),
            const SizedBox(
              height: 20,
            ),
            // TextButton(
            //   onPressed: () {
            //     showDialog(
            //       context: context,
            //       builder: (context) {
            //         return AlertDialog(
            //           title: const Text("Enter Personnel ID"),
            //           content: TextField(
            //             controller: _controller,
            //             decoration: const InputDecoration(
            //               hintText: "Personnel ID",
            //               border: OutlineInputBorder(),
            //             ),
            //             keyboardType: TextInputType.number,
            //           ),
            //           actions: [
            //             TextButton(
            //               onPressed: () {
            //                 Navigator.of(context).pop(); // Close the dialog
            //               },
            //               child: const Text("Cancel"),
            //             ),
            //             TextButton(
            //               onPressed: () async {
            //                 final personnelId = _controller.text.trim();
            //                 if (personnelId.isNotEmpty) {
            //                   // Do something with the personnel ID
            //                   print("Personnel ID entered: $personnelId");

            //                   await FirebaseFirestore.instance
            //                       .collection('Users')
            //                       .doc(personnelId)
            //                       .get()
            //                       .then((DocumentSnapshot documentSnapshot) {
            //                     if (documentSnapshot.exists) {
            //                       print('Document exists on the database');
            //                       Navigator.of(context)
            //                           .pushReplacement(MaterialPageRoute(
            //                               builder: (context) => PersonnelScreen(
            //                                     id: personnelId,
            //                                   )));
            //                     } else {
            //                       Navigator.pop(context);
            //                       ScaffoldMessenger.of(context).showSnackBar(
            //                         const SnackBar(
            //                           content: Text("Invalid ID!"),
            //                         ),
            //                       );
            //                     }
            //                   });
            //                 } else {
            //                   // Show an error or a message
            //                   ScaffoldMessenger.of(context).showSnackBar(
            //                     const SnackBar(
            //                       content:
            //                           Text("Please enter a valid Personnel ID"),
            //                     ),
            //                   );
            //                 }
            //               },
            //               child: const Text("Confirm"),
            //             ),
            //           ],
            //         );
            //       },
            //     );
            //   },
            //   child: TextWidget(
            //     text: 'Continue as Personnel',
            //     fontSize: 14,
            //     color: Colors.white,
            //     fontFamily: 'Bold',
            //   ),
            // ),
          ],
        ),
      ),
    );
  }

  final TextEditingController _controller = TextEditingController();
}
