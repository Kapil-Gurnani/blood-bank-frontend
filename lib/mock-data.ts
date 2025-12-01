export interface BloodComponent {
  bloodType: string
  quantity: number
}

export interface BloodBank {
  id: string
  name: string
  location: string
  city: string
  state: string
  phone: string
  hours: string
  latitude: number
  longitude: number
  components: BloodComponent[]
}

export const mockBloodUnits: BloodBank[] = [
  {
    id: "1",
    name: "Red Cross Blood Bank",
    location: "Central Hospital, Main Street",
    city: "Delhi",
    state: "Delhi",
    phone: "+91-11-2345-6789",
    hours: "24/7",
    latitude: 28.6139,
    longitude: 77.209,
    components: [
      { bloodType: "O+", quantity: 45 },
      { bloodType: "O-", quantity: 12 },
      { bloodType: "A+", quantity: 28 },
    ],
  },
  {
    id: "2",
    name: "Apollo Blood Center",
    location: "Apollo Hospital, Sector 5",
    city: "Delhi",
    state: "Delhi",
    phone: "+91-11-4567-8901",
    hours: "8 AM - 8 PM",
    latitude: 28.5355,
    longitude: 77.391,
    components: [
      { bloodType: "A+", quantity: 32 },
      { bloodType: "B+", quantity: 18 },
      { bloodType: "AB+", quantity: 8 },
      { bloodType: "AB-", quantity: 5 },
    ],
  },
  {
    id: "3",
    name: "Fortis Blood Bank",
    location: "Fortis Hospital, Vasant Kunj",
    city: "Delhi",
    state: "Delhi",
    phone: "+91-11-6789-0123",
    hours: "24/7",
    latitude: 28.5244,
    longitude: 77.1855,
    components: [
      { bloodType: "B+", quantity: 28 },
      { bloodType: "B-", quantity: 15 },
      { bloodType: "O+", quantity: 35 },
    ],
  },
  {
    id: "4",
    name: "Max Blood Center",
    location: "Max Hospital, Saket",
    city: "Delhi",
    state: "Delhi",
    phone: "+91-11-2345-6789",
    hours: "9 AM - 6 PM",
    latitude: 28.5244,
    longitude: 77.1855,
    components: [
      { bloodType: "AB+", quantity: 15 },
      { bloodType: "A-", quantity: 10 },
    ],
  },
  {
    id: "5",
    name: "Lilavati Blood Bank",
    location: "Lilavati Hospital, Bandra",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91-22-6789-0123",
    hours: "24/7",
    latitude: 19.0596,
    longitude: 72.8295,
    components: [
      { bloodType: "O-", quantity: 22 },
      { bloodType: "O+", quantity: 30 },
      { bloodType: "A-", quantity: 16 },
      { bloodType: "B+", quantity: 20 },
    ],
  },
  {
    id: "6",
    name: "Breach Candy Blood Center",
    location: "Breach Candy Hospital, Kala Ghoda",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91-22-2345-6789",
    hours: "8 AM - 10 PM",
    latitude: 18.9676,
    longitude: 72.8194,
    components: [
      { bloodType: "A-", quantity: 18 },
      { bloodType: "B-", quantity: 12 },
    ],
  },
  {
    id: "7",
    name: "Manipal Blood Bank",
    location: "Manipal Hospital, Whitefield",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91-80-1234-5678",
    hours: "24/7",
    latitude: 13.0827,
    longitude: 77.6412,
    components: [
      { bloodType: "B-", quantity: 25 },
      { bloodType: "AB-", quantity: 14 },
      { bloodType: "O+", quantity: 40 },
      { bloodType: "A+", quantity: 22 },
    ],
  },
  {
    id: "8",
    name: "St Johns Blood Center",
    location: "St Johns Hospital, Koramangala",
    city: "Bangalore",
    state: "Karnataka",
    phone: "+91-80-5678-9012",
    hours: "9 AM - 7 PM",
    latitude: 12.9352,
    longitude: 77.6245,
    components: [
      { bloodType: "AB-", quantity: 12 },
      { bloodType: "B+", quantity: 19 },
    ],
  },
  {
    id: "9",
    name: "CMC Blood Bank",
    location: "CMC Hospital, Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    phone: "+91-416-2284-2100",
    hours: "24/7",
    latitude: 12.9716,
    longitude: 79.1409,
    components: [
      { bloodType: "O+", quantity: 38 },
      { bloodType: "A+", quantity: 26 },
      { bloodType: "B+", quantity: 21 },
    ],
  },
  {
    id: "10",
    name: "Saveetha Blood Center",
    location: "Saveetha Hospital, Thandalam",
    city: "Chennai",
    state: "Tamil Nadu",
    phone: "+91-44-6789-0123",
    hours: "8 AM - 9 PM",
    latitude: 13.1939,
    longitude: 80.0855,
    components: [
      { bloodType: "A+", quantity: 29 },
      { bloodType: "O-", quantity: 17 },
      { bloodType: "B-", quantity: 13 },
      { bloodType: "AB+", quantity: 9 },
    ],
  },
]
