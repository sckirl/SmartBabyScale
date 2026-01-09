import { Phone, MapPin, Clock, AlertTriangle, Heart, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

export default function Emergency() {
  const emergencyContacts = [
    {
      name: "Dr. Sarah Johnson",
      role: "Pediatrician",
      phone: "(555) 123-4567",
      type: "primary"
    },
    {
      name: "Children's Hospital Emergency",
      role: "24/7 Emergency Care",
      phone: "(555) 999-0000",
      type: "emergency"
    },
    {
      name: "Poison Control Center",
      role: "24/7 Poison Help",
      phone: "1-800-222-1222",
      type: "poison"
    },
    {
      name: "After-hours Clinic",
      role: "Non-emergency Care",
      phone: "(555) 456-7890",
      type: "urgent"
    }
  ];

  const emergencySigns = [
    {
      category: "Breathing Problems",
      signs: [
        "Difficulty breathing or rapid breathing",
        "Blue lips or face",
        "Wheezing or grunting sounds",
        "Retractions (skin pulling in around ribs)"
      ],
      action: "Call 911 immediately",
      severity: "critical"
    },
    {
      category: "High Fever",
      signs: [
        "Fever over 100.4°F (38°C) in babies under 3 months",
        "Fever over 102°F (38.9°C) in babies 3-6 months",
        "Fever with lethargy or poor feeding",
        "Febrile seizures"
      ],
      action: "Contact pediatrician immediately",
      severity: "urgent"
    },
    {
      category: "Severe Illness",
      signs: [
        "Excessive crying that won't stop",
        "Extreme lethargy or difficulty waking",
        "Persistent vomiting",
        "Signs of dehydration"
      ],
      action: "Seek medical attention",
      severity: "urgent"
    },
    {
      category: "Injuries",
      signs: [
        "Head injury with loss of consciousness",
        "Suspected broken bones",
        "Cuts requiring stitches",
        "Burns larger than a quarter"
      ],
      action: "Go to emergency room",
      severity: "urgent"
    }
  ];

  const firstAidTips = [
    {
      title: "Choking (Under 1 year)",
      steps: [
        "Hold baby face down on your forearm",
        "Give 5 back blows between shoulder blades",
        "Turn baby over, give 5 chest thrusts",
        "Check mouth, remove visible objects",
        "Call 911 if object doesn't come out"
      ]
    },
    {
      title: "Fever Management",
      steps: [
        "Take accurate temperature",
        "Keep baby hydrated",
        "Dress in light clothing",
        "Give fever reducer if advised by doctor",
        "Monitor for other symptoms"
      ]
    },
    {
      title: "Minor Cuts",
      steps: [
        "Clean hands thoroughly",
        "Apply gentle pressure to stop bleeding",
        "Clean wound with water",
        "Apply bandage if needed",
        "Watch for signs of infection"
      ]
    }
  ];

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
      case 'poison': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'urgent': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'urgent': return 'border-orange-500 bg-orange-50';
      default: return 'border-yellow-500 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Emergency Information</h1>
        <p className="text-gray-600">Important contacts and guidelines for emergency situations</p>
      </div>

      {/* Emergency Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>In a life-threatening emergency, call 911 immediately.</strong> This information is for reference only and should not replace professional medical advice.
        </AlertDescription>
      </Alert>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getContactTypeColor(contact.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm opacity-80">{contact.role}</p>
                  </div>
                  <Badge variant="outline" className={contact.type === 'emergency' ? 'border-red-500 text-red-700' : ''}>
                    {contact.type}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => window.open(`tel:${contact.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {contact.phone}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* When to Seek Emergency Care */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            When to Seek Emergency Care
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {emergencySigns.map((category, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(category.severity)}`}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  {category.category === 'Breathing Problems' && <Heart className="h-4 w-4" />}
                  {category.category === 'High Fever' && <Thermometer className="h-4 w-4" />}
                  {category.category === 'Severe Illness' && <AlertTriangle className="h-4 w-4" />}
                  {category.category === 'Injuries' && <MapPin className="h-4 w-4" />}
                  {category.category}
                </h3>
                <ul className="space-y-1 text-sm mb-3">
                  {category.signs.map((sign, signIndex) => (
                    <li key={signIndex} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {sign}
                    </li>
                  ))}
                </ul>
                <div className={`text-sm font-medium p-2 rounded ${
                  category.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  Action: {category.action}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* First Aid Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Basic First Aid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {firstAidTips.map((tip, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">{tip.title}</h3>
                <ol className="space-y-2">
                  {tip.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm flex items-start gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hospital Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Children's Hospital</h4>
                <p className="text-sm text-gray-600">123 Medical Center Dr</p>
                <p className="text-sm text-gray-600">City, State 12345</p>
                <p className="text-sm text-gray-600">Distance: 15 minutes</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                <p>Always stay calm during emergencies - your baby can sense your stress</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-blue-500" />
                <p>Keep emergency numbers easily accessible on your phone</p>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 mt-0.5 text-blue-500" />
                <p>Consider taking an infant CPR and first aid class</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-500" />
                <p>Trust your instincts - you know your baby best</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baby Information Card */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Baby Information for Medical Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Baby's Name</label>
                <p>Emma Johnson</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p>June 15, 2024</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Age</label>
                <p>10 months</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Allergies</label>
                <p>None known</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medications</label>
                <p>None</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
                <p>None</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Keep this information updated and consider printing a copy for your diaper bag or car.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}