/**
 * RapidDispatch Freight & Logistics - Initial Seed Data
 * Headquartered in Dallas, TX
 */

const initialTickets = [
  {
    id: 101,
    trackingNumber: "RD-TX-90214",
    truckNumber: "TRK-4402",
    driverName: "Caleb 'Mack' Vance",
    route: "Dallas, TX -> Memphis, TN",
    freightType: "Automotive Transmission Assemblies (High Priority)",
    issue: "Engine blown on I-30 Eastbound near Texarkana. Truck stranded on shoulder.",
    priority: "Critical",
    status: "Open",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    resolution: "",
    lastUpdatedBy: null,
    history: [
      { timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), text: "Ticket generated via Telematics breakdown alert." }
    ]
  },
  {
    id: 102,
    trackingNumber: "RD-TX-88310",
    truckNumber: "TRK-8921",
    driverName: "Sarah 'Red' Connor",
    route: "Fort Worth, TX -> Chicago, IL",
    freightType: "Refrigerated Organic Beef (Temp-Controlled 34°F)",
    issue: "Reefer cooling unit throwing Error Code E-44 (Compressor Trip). Cargo temp rising: currently 38°F.",
    priority: "Critical",
    status: "Open",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    resolution: "",
    lastUpdatedBy: null,
    history: [
      { timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(), text: "Automated Reefer telemetry alert: Temp breach detected." }
    ]
  },
  {
    id: 103,
    trackingNumber: "RD-TX-77491",
    truckNumber: "TRK-1105",
    driverName: "Hector Morales",
    route: "Dallas, TX -> Atlanta, GA",
    freightType: "Consumer Electronics (48 Pallets)",
    issue: "Blown steer tire on I-20 West of Shreveport. Mobile tire repair truck dispatched, ETA 25 mins.",
    priority: "High",
    status: "In Progress",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    resolution: "Roadside service unit #4 dispatched with 295/75R22.5 steer tire.",
    lastUpdatedBy: "Marcus Thorne",
    history: [
      { timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), text: "Driver called hotline directly." },
      { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), text: "Roadside dispatch confirmed with Love's Truck Care." }
    ]
  },
  {
    id: 104,
    trackingNumber: "RD-TX-66205",
    truckNumber: "TRK-6034",
    driverName: "Devon Brooks",
    route: "San Antonio, TX -> Dallas Hub",
    freightType: "Dry Van - Industrial Hardware",
    issue: "Receiving dock at Dallas South Hub reports gate lock malfunction; 6 trucks queued.",
    priority: "Medium",
    status: "Open",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    resolution: "",
    lastUpdatedBy: null,
    history: [
      { timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), text: "Facility manager reported queue buildup." }
    ]
  },
  {
    id: 105,
    trackingNumber: "RD-TX-55119",
    truckNumber: "TRK-2209",
    driverName: "Darren 'Slim' Miller",
    route: "Dallas, TX -> Houston Port Terminal",
    freightType: "Export Hazmat Cargo (UN 1993 Flammable Liquid)",
    issue: "Customer calling demanding delivery ETA update. Custom seal documentation mismatched at weigh station checkpoint.",
    priority: "Critical",
    status: "Open",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    resolution: "",
    lastUpdatedBy: null,
    history: [
      { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), text: "Customer service escalation received from Houston logistics coordinator." }
    ]
  },
  {
    id: 106,
    trackingNumber: "RD-TX-44012",
    truckNumber: "TRK-9002",
    driverName: "Amanda Hayes",
    route: "El Paso, TX -> Dallas, TX",
    freightType: "Pharmaceutical Supplies (Vaccine Cold Chain)",
    issue: "Driver approaching maximum Hours of Service (HOS) limit (45 minutes remaining) with 75 miles to go.",
    priority: "High",
    status: "Open",
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    resolution: "",
    lastUpdatedBy: null,
    history: [
      { timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(), text: "ELD automated warning trigger: 45 min drive time limit." }
    ]
  },
  {
    id: 107,
    trackingNumber: "RD-TX-33890",
    truckNumber: "TRK-3118",
    driverName: "Rayford Jenkins",
    route: "Dallas, TX -> Denver, CO",
    freightType: "Aerospace Machined Components",
    issue: "Severe blizzard warning across Raton Pass on I-25. Route diversion advisory needed.",
    priority: "Medium",
    status: "In Progress",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    resolution: "Alternative southern route via Amarillo & Lubbock plotted.",
    lastUpdatedBy: "Sarah Jenkins",
    history: [
      { timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), text: "NOAA weather alert correlated with active manifest." }
    ]
  }
];

module.exports = { initialTickets };
