import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:geobound_web/utils/colors.dart';
import 'package:geobound_web/widgets/text_widget.dart';

class ReportTab extends StatefulWidget {
  const ReportTab({super.key});

  @override
  State<ReportTab> createState() => _ReportTabState();
}

class _ReportTabState extends State<ReportTab> {
  bool hasLoaded = false;

  List users = [];

  @override
  void initState() {
    super.initState();
    getAllUsers();
  }

  getAllUsers() async {
    await FirebaseFirestore.instance
        .collection('Users')
        .get()
        .then((QuerySnapshot querySnapshot) {
      for (var doc in querySnapshot.docs) {
        setState(() {
          users.add(doc.data());
        });
      }
    }).whenComplete(
      () {
        setState(() {
          hasLoaded = true;
        });
      },
    );
  }

  List reports = [];

  @override
  Widget build(BuildContext context) {
    return hasLoaded
        ? Scaffold(
            body: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const SizedBox(
                    height: 20,
                  ),
                  StreamBuilder<DatabaseEvent>(
                      stream:
                          FirebaseDatabase.instance.ref("rfid_data").onValue,
                      builder: (context, snapshot) {
                        if (snapshot.hasError) {
                          print(snapshot.error);
                          return const Center(child: Text('Error'));
                        }

                        if (snapshot.hasData) {
                          final data = snapshot.data!.snapshot.value;

                          if (data != {}) {
                            final Map<dynamic, dynamic> dataMap =
                                data as Map<dynamic, dynamic>;
                            final List<Map<String, dynamic>> itemList =
                                dataMap.values.map((innerValue) {
                              return {
                                "Date": innerValue["Date"],
                                "ID": innerValue["ID"],
                                "Timestamp": innerValue["Timestamp"],
                              };
                            }).toList();

                            for (int i = 0; i < data.length; i++) {
                              reports.add({
                                'timein': itemList[i]['Timestamp'],
                                'name': users.where(
                                  (element) {
                                    return element['id'] ==
                                        itemList[i]['ID'].toString();
                                  },
                                ).isEmpty
                                    ? ''
                                    : users.where(
                                        (element) {
                                          return element['id'] ==
                                              itemList[i]['ID'].toString();
                                        },
                                      ).first['name'],
                                'number': users.where(
                                  (element) {
                                    return element['id'] ==
                                        itemList[i]['ID'].toString();
                                  },
                                ).isEmpty
                                    ? ''
                                    : users.where(
                                        (element) {
                                          return element['id'] ==
                                              itemList[i]['ID'].toString();
                                        },
                                      ).first['number'],
                                'id': itemList[i]['ID'].toString(),
                                'type': users.where(
                                  (element) {
                                    return element['id'] ==
                                        itemList[i]['ID'].toString();
                                  },
                                ).isEmpty
                                    ? ''
                                    : users.where(
                                        (element) {
                                          return element['id'] ==
                                              itemList[i]['ID'].toString();
                                        },
                                      ).first['type'],
                              });
                            }

                            return Container(
                              child: DataTable(
                                columns: [
                                  DataColumn(
                                    label: TextWidget(
                                      text: 'RFID ID Number',
                                      fontSize: 18,
                                      fontFamily: 'Bold',
                                      color: primary,
                                    ),
                                  ),
                                  DataColumn(
                                    label: TextWidget(
                                      text: 'Full Name',
                                      fontSize: 18,
                                      fontFamily: 'Bold',
                                      color: primary,
                                    ),
                                  ),
                                  DataColumn(
                                    label: TextWidget(
                                      text: 'Time in',
                                      fontSize: 18,
                                      fontFamily: 'Bold',
                                      color: primary,
                                    ),
                                  ),
                                  DataColumn(
                                    label: TextWidget(
                                      text: 'Time out',
                                      fontSize: 18,
                                      fontFamily: 'Bold',
                                      color: primary,
                                    ),
                                  ),
                                  DataColumn(
                                    label: TextWidget(
                                      text: 'Visitors/Personnel',
                                      fontSize: 18,
                                      fontFamily: 'Bold',
                                      color: primary,
                                    ),
                                  ),
                                ],
                                rows: [
                                  for (int i = 0; i < data.length; i++)
                                    DataRow(cells: [
                                      DataCell(
                                        TextWidget(
                                          text: itemList[i]['ID'].toString(),
                                          fontSize: 14,
                                          fontFamily: 'Medium',
                                          color: Colors.grey,
                                        ),
                                      ),
                                      DataCell(
                                        TextWidget(
                                          text: users.where(
                                            (element) {
                                              return element['id'] ==
                                                  itemList[i]['ID'].toString();
                                            },
                                          ).isEmpty
                                              ? ''
                                              : users.where(
                                                  (element) {
                                                    return element['id'] ==
                                                        itemList[i]['ID']
                                                            .toString();
                                                  },
                                                ).first['name'],
                                          fontSize: 14,
                                          fontFamily: 'Medium',
                                          color: Colors.grey,
                                        ),
                                      ),
                                      DataCell(
                                        TextWidget(
                                          text: itemList[i]['Timestamp']
                                                      .toString()
                                                      .split(' ')[1] ==
                                                  'PM'
                                              ? ''
                                              : itemList[i]['Timestamp'],
                                          fontSize: 14,
                                          fontFamily: 'Medium',
                                          color: Colors.grey,
                                        ),
                                      ),
                                      DataCell(
                                        TextWidget(
                                          text: itemList[i]['Timestamp']
                                                      .toString()
                                                      .split(' ')[1] !=
                                                  'PM'
                                              ? ''
                                              : itemList[i]['Timestamp'],
                                          fontSize: 14,
                                          fontFamily: 'Medium',
                                          color: Colors.grey,
                                        ),
                                      ),
                                      DataCell(
                                        TextWidget(
                                          text: 'Personnel',
                                          fontSize: 14,
                                          fontFamily: 'Medium',
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ])
                                ],
                                // DataTable's properties to add inner horizontal and vertical dividers
                                dividerThickness:
                                    1, // Horizontal dividers between rows
                                border: const TableBorder(
                                  horizontalInside: BorderSide(
                                      color: Colors.grey,
                                      width: 1), // Horizontal dividers
                                  verticalInside: BorderSide(
                                      color: Colors.grey,
                                      width: 1), // Vertical dividers
                                ),
                              ),
                            );
                          }

                          // Convert dynamic data to a list of maps
                        }
                        return const Center(child: Text('No data found'));
                      })
                ],
              ),
            ),
          )
        : const Center(
            child: CircularProgressIndicator(),
          );
  }
}
