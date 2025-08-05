export default function handler(req, res) {
  const balingasagBarangays = [
    "1 Poblacion",
    "2 Poblacion",
    "3 Poblacion",
    "4 Poblacion",
    "5 Poblacion",
    "6 Poblacion",
    "Balagnan",
    "Balingoan",
    "Barangay",
    "Blanco",
    "Calawag",
    "Camuayan",
    "Cogon",
    "Dansuli",
    "Dumarait",
    "Hermano",
    "Kibanban",
    "Linggangao",
    "Mambayaan",
    "Mandangoa",
    "Napaliran",
    "Natubo",
    "Quezon",
    "San Alonzo",
    "San Isidro",
    "San Juan",
    "San Miguel",
    "San Victor",
    "Talusan",
    "Waterfall"
  ];

  res.status(200).json(balingasagBarangays);
}