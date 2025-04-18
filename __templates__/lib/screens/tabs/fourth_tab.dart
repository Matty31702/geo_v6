import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geobound_web/utils/const.dart';
import 'package:geobound_web/widgets/text_widget.dart';
import 'package:latlong2/latlong.dart';

class FourthTab extends StatelessWidget {
  const FourthTab({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('Users').snapshots(),
        builder: (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
          if (snapshot.hasError) {
            print(snapshot.error);
            return const Center(child: Text('Error'));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Padding(
              padding: EdgeInsets.only(top: 50),
              child: Center(
                  child: CircularProgressIndicator(
                color: Colors.black,
              )),
            );
          }

          final data = snapshot.requireData;
          return StreamBuilder<QuerySnapshot>(
              stream:
                  FirebaseFirestore.instance.collection('Vehicles').snapshots(),
              builder: (BuildContext context,
                  AsyncSnapshot<QuerySnapshot> snapshot) {
                if (snapshot.hasError) {
                  print(snapshot.error);
                  return const Center(child: Text('Error'));
                }
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.only(top: 50),
                    child: Center(
                        child: CircularProgressIndicator(
                      color: Colors.black,
                    )),
                  );
                }

                final vehicleData = snapshot.requireData;
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 750,
                        height: 450,
                        child: Stack(
                          children: [
                            FlutterMap(
                              options: const MapOptions(
                                initialCenter: LatLng(8.480675,
                                    124.660238), // Center the map over London
                                initialZoom: 18,
                              ),
                              children: [
                                TileLayer(
                                  // Display map tiles from any source
                                  urlTemplate:
                                      'https://tile.openstreetmap.org/{z}/{x}/{y}.png', // OSMF's Tile Server
                                  userAgentPackageName: 'com.example.app',
                                  // And many more recommended properties!
                                ),
                                MarkerLayer(markers: [
                                  for (int i = 0; i < data.docs.length; i++)
                                    Marker(
                                      point: LatLng(data.docs[i]['lat'],
                                          data.docs[i]['lng']),
                                      child: Container(
                                        width: 25,
                                        height: 25,
                                        decoration: const BoxDecoration(
                                          color: Colors.red,
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: TextWidget(
                                            text:
                                                '${data.docs[i]['name'][0]}${data.docs[i]['name'][1]}${data.docs[i]['name'][2]}',
                                            fontSize: 12,
                                            color: Colors.white,
                                            fontFamily: 'Bold',
                                          ),
                                        ),
                                      ),
                                    ),
                                  for (int i = 0;
                                      i < vehicleData.docs.length;
                                      i++)
                                    Marker(
                                      width: 50,
                                      point: LatLng(vehicleData.docs[i]['lat'],
                                          vehicleData.docs[i]['long']),
                                      child: Container(
                                        decoration: const BoxDecoration(
                                          color: Colors.blue,
                                          shape: BoxShape.rectangle,
                                        ),
                                        child: Center(
                                          child: TextWidget(
                                            text:
                                                '${vehicleData.docs[i]['platenumber']}',
                                            fontSize: 12,
                                            color: Colors.white,
                                            fontFamily: 'Bold',
                                          ),
                                        ),
                                      ),
                                    ),
                                ]),
                                PolygonLayer(
                                  polygons: [
                                    Polygon(
                                        points: [
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
                                        ],
                                        color: Colors.red.withOpacity(0.2),
                                        borderColor: Colors.black,
                                        borderStrokeWidth: 2,
                                        isFilled: true),
                                  ],
                                ),
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.all(15.0),
                              child: Align(
                                alignment: Alignment.bottomRight,
                                child: Container(
                                  width: 180,
                                  height: 135,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.9),
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(10.0),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      children: [
                                        TextWidget(
                                          text: 'Map Legend',
                                          fontSize: 18,
                                          color: Colors.black,
                                          fontFamily: 'Bold',
                                        ),
                                        const SizedBox(
                                          height: 10,
                                        ),
                                        Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            Container(
                                              width: 15,
                                              height: 15,
                                              decoration: const BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: Colors.red,
                                              ),
                                            ),
                                            const SizedBox(
                                              width: 5,
                                            ),
                                            TextWidget(
                                              text: 'Personnel',
                                              fontSize: 14,
                                              color: Colors.black,
                                              fontFamily: 'Medium',
                                            ),
                                          ],
                                        ),
                                        const SizedBox(
                                          height: 5,
                                        ),
                                        Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            Container(
                                              width: 15,
                                              height: 15,
                                              decoration: const BoxDecoration(
                                                shape: BoxShape.rectangle,
                                                color: Colors.blue,
                                              ),
                                            ),
                                            const SizedBox(
                                              width: 5,
                                            ),
                                            TextWidget(
                                              text: 'Vehicles',
                                              fontSize: 14,
                                              color: Colors.black,
                                              fontFamily: 'Medium',
                                            ),
                                          ],
                                        ),
                                        const SizedBox(
                                          height: 5,
                                        ),
                                        Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            Container(
                                              width: 15,
                                              height: 15,
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                    color: Colors.black,
                                                    width: 1),
                                                shape: BoxShape.rectangle,
                                                color:
                                                    Colors.red.withOpacity(0.2),
                                              ),
                                            ),
                                            const SizedBox(
                                              width: 5,
                                            ),
                                            TextWidget(
                                              text: 'Geofencing Area',
                                              fontSize: 14,
                                              color: Colors.black,
                                              fontFamily: 'Medium',
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Card(
                            color: Colors.amber,
                            child: SizedBox(
                              width: 200,
                              child: ListTile(
                                onTap: () {
                                  showDetailDialog(context);
                                },
                                title: TextWidget(
                                  text: 'Personnel',
                                  fontSize: 18,
                                  fontFamily: 'Bold',
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          Card(
                            color: Colors.amber,
                            child: SizedBox(
                              width: 200,
                              child: ListTile(
                                onTap: () {
                                  showDetailDialog1(context);
                                },
                                title: TextWidget(
                                  text: 'Vehicles',
                                  fontSize: 18,
                                  fontFamily: 'Bold',
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              });
        });
  }

  void showDetailDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: StreamBuilder<QuerySnapshot>(
            stream: FirebaseFirestore.instance.collection('Users').snapshots(),
            builder:
                (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
              if (snapshot.hasError) {
                print(snapshot.error);
                return const Center(child: Text('Error loading data'));
              }
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Padding(
                  padding: EdgeInsets.only(top: 50),
                  child: Center(
                    child: CircularProgressIndicator(
                      color: Colors.blue,
                    ),
                  ),
                );
              }

              final data = snapshot.requireData;
              return SizedBox(
                height: 600,
                width: 800,
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Monitor Realtime Status',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.grey),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Centered Data Table
                      Expanded(
                        child: Center(
                          child: Container(
                            width: 700,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.2),
                                  spreadRadius: 2,
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: SingleChildScrollView(
                              scrollDirection: Axis.vertical,
                              child: DataTable(
                                columnSpacing: 40,
                                headingRowColor: WidgetStateColor.resolveWith(
                                  (states) => Colors.blue,
                                ),
                                border: const TableBorder.symmetric(
                                  inside: BorderSide(
                                      color: Colors.grey, width: 0.5),
                                ),
                                columns: const [
                                  DataColumn(
                                    label: Expanded(
                                      child: Text(
                                        'ID Number',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  ),
                                  DataColumn(
                                    label: Expanded(
                                      child: Text(
                                        'Name',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  ),
                                  DataColumn(
                                    label: Expanded(
                                      child: Text(
                                        'Current Status',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  ),
                                ],
                                rows: data.docs.map((doc) {
                                  LatLng pointToCheck =
                                      LatLng(doc['lat'], doc['lng']);
                                  final bool isInside =
                                      isPointInPolygon(pointToCheck, polygon);

                                  return DataRow(
                                    cells: [
                                      DataCell(
                                        Center(
                                          child: Text(
                                            doc['id'],
                                            style:
                                                const TextStyle(fontSize: 14),
                                          ),
                                        ),
                                      ),
                                      DataCell(
                                        Center(
                                          child: Text(
                                            doc['name'],
                                            style:
                                                const TextStyle(fontSize: 14),
                                          ),
                                        ),
                                      ),
                                      DataCell(
                                        Center(
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: isInside
                                                  ? Colors.green[100]
                                                  : Colors.red[100],
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              isInside
                                                  ? 'Present'
                                                  : 'Not Present',
                                              style: TextStyle(
                                                color: isInside
                                                    ? Colors.green[800]
                                                    : Colors.red[800],
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                }).toList(),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Action Button
                      Align(
                        alignment: Alignment.bottomRight,
                        child: ElevatedButton.icon(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.done),
                          label: const Text('Close'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  void showDetailDialog1(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: StreamBuilder<QuerySnapshot>(
            stream:
                FirebaseFirestore.instance.collection('Vehicles').snapshots(),
            builder:
                (BuildContext context, AsyncSnapshot<QuerySnapshot> snapshot) {
              if (snapshot.hasError) {
                print(snapshot.error);
                return const Center(child: Text('Error loading data'));
              }
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Padding(
                  padding: EdgeInsets.only(top: 50),
                  child: Center(
                    child: CircularProgressIndicator(color: Colors.blue),
                  ),
                );
              }

              final data = snapshot.requireData;

              return SizedBox(
                height: 600,
                width: 800,
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Monitor Realtime Status',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.grey),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Centered Data Table
                      Expanded(
                        child: Container(
                          width: 700,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.2),
                                spreadRadius: 2,
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: SingleChildScrollView(
                            child: Center(
                              child: DataTable(
                                columnSpacing: 80,
                                headingRowColor: WidgetStateColor.resolveWith(
                                  (states) => Colors.blue,
                                ),
                                border: const TableBorder.symmetric(
                                  inside: BorderSide(
                                      color: Colors.grey, width: 0.5),
                                ),
                                columns: const [
                                  DataColumn(
                                    label: Center(
                                      child: Text(
                                        'Personnel ID',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                  DataColumn(
                                    label: Center(
                                      child: Text(
                                        'Model',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                  DataColumn(
                                    label: Center(
                                      child: Text(
                                        'Plate Number',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                  DataColumn(
                                    label: Center(
                                      child: Text(
                                        'Current Status',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                                rows: data.docs.map((doc) {
                                  return DataRow(cells: [
                                    DataCell(Center(
                                      child: Text(
                                        doc['userId'],
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                    )),
                                    DataCell(Center(
                                      child: Text(
                                        doc['model'],
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                    )),
                                    DataCell(Center(
                                      child: Text(
                                        doc['platenumber'],
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                    )),
                                    DataCell(Center(
                                      child: StreamBuilder<QuerySnapshot>(
                                        stream: FirebaseFirestore.instance
                                            .collection('Users')
                                            .where('id',
                                                isEqualTo: doc['userId'])
                                            .snapshots(),
                                        builder: (BuildContext context,
                                            AsyncSnapshot<QuerySnapshot>
                                                snapshot) {
                                          if (snapshot.hasError) {
                                            print(snapshot.error);
                                            return const Text('Error');
                                          }
                                          if (snapshot.connectionState ==
                                              ConnectionState.waiting) {
                                            return const CircularProgressIndicator(
                                                color: Colors.black);
                                          }

                                          final recordData =
                                              snapshot.requireData;
                                          if (recordData.docs.isEmpty) {
                                            return const Text('No Data');
                                          }

                                          LatLng pointToCheck = LatLng(
                                            recordData.docs.first['lat'],
                                            recordData.docs.first['lng'],
                                          );
                                          final bool isInside =
                                              isPointInPolygon(
                                                  pointToCheck, polygon);

                                          return Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: isInside
                                                  ? Colors.green[100]
                                                  : Colors.red[100],
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              isInside
                                                  ? 'Present'
                                                  : 'Not Present',
                                              style: TextStyle(
                                                color: isInside
                                                    ? Colors.green[800]
                                                    : Colors.red[800],
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          );
                                        },
                                      ),
                                    )),
                                  ]);
                                }).toList(),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Action Button
                      Align(
                        alignment: Alignment.bottomRight,
                        child: ElevatedButton.icon(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.done),
                          label: const Text('Close'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
