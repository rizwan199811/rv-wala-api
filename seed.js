const fs = require('fs')
// const SeedModel = require('./models/seed')
const mongoose = require('mongoose');
const UserModel = require('./models/user');
const { passwordHash } = require('./utils');


require('dotenv').config()


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// let makeString = `<option value="Adirondack">Adirondack</option>
// <option value="Aerolite">Aerolite</option>
// <option value="Airstream">Airstream</option>
// <option value="Alfa">Alfa</option>
// <option value="Alfa Leisure">Alfa Leisure</option>
// <option value="Aljo">Aljo</option>
// <option value="Allegro">Allegro</option>
// <option value="Alpenlite">Alpenlite</option>
// <option value="Alpine">Alpine</option>
// <option value="Ameri-Camp">Ameri-Camp</option>
// <option value="Americamp">Americamp</option>
// <option value="American Coach">American Coach</option>
// <option value="American Cruiser">American Cruiser</option>
// <option value="American Freedom">American Freedom</option>
// <option value="American Hauler">American Hauler</option>
// <option value="Apex">Apex</option>
// <option value="AR-ONE">AR-ONE</option>
// <option value="Arctic Fox">Arctic Fox</option>
// <option value="Athens Park Homes">Athens Park Homes</option>
// <option value="Autumn Ridge">Autumn Ridge</option>
// <option value="Beaver">Beaver</option>
// <option value="Beaver Motor Coaches">Beaver Motor Coaches</option>
// <option value="Bigfoot">Bigfoot</option>
// <option value="Bison">Bison</option>
// <option value="Blue Bird">Blue Bird</option>
// <option value="Born Free">Born Free</option>
// <option value="Bounder">Bounder</option>
// <option value="Braxton Creek">Braxton Creek</option>
// <option value="Breckenridge">Breckenridge</option>
// <option value="Cabover Style">Cabover Style</option>
// <option value="Carriage">Carriage</option>
// <option value="Chalet Rv">Chalet Rv</option>
// <option value="Cherokee">Cherokee</option>
// <option value="Cherokee Trailer">Cherokee Trailer</option>
// <option value="Chevrolet">Chevrolet</option>
// <option value="Chinook">Chinook</option>
// <option value="Cikira">Cikira</option>
// <option value="Coach House">Coach House</option>
// <option value="Coachmen">Coachmen</option>
// <option value="Coachmen Spirit Of America">Coachmen Spirit Of America</option>
// <option value="Coachwork">Coachwork</option>
// <option value="Coleman">Coleman</option>
// <option value="Coleman Explorer">Coleman Explorer</option>
// <option value="COROSS ROADS">COROSS ROADS</option>
// <option value="Country Coach">Country Coach</option>
// <option value="CROSS ROADS">CROSS ROADS</option>
// <option value="Crossroads">Crossroads</option>
// <option value="Crossroads Rv">Crossroads Rv</option>
// <option value="Cruiser Rv">Cruiser Rv</option>
// <option value="Cruiser Rv Corp">Cruiser Rv Corp</option>
// <option value="Ct Coachworks">Ct Coachworks</option>
// <option value="Custom">Custom</option>
// <option value="Damon">Damon</option>
// <option value="Daybreak">Daybreak</option>
// <option value="Diplomat 40PDQ">Diplomat 40PDQ</option>
// <option value="Dodge">Dodge</option>
// <option value="DOUBLE TREE">DOUBLE TREE</option>
// <option value="DOUBLE TREE RV">DOUBLE TREE RV</option>
// <option value="DRV">DRV</option>
// <option value="DRV DOUBLETREE">DRV DOUBLETREE</option>
// <option value="DRV LUXURY SUITES">DRV LUXURY SUITES</option>
// <option value="Dune Sport">Dune Sport</option>
// <option value="DUTCH PARK">DUTCH PARK</option>
// <option value="Dutchman">Dutchman</option>
// <option value="Dutchmen">Dutchmen</option>
// <option value="Dynamax">Dynamax</option>
// <option value="Dynamax Corp">Dynamax Corp</option>
// <option value="Dynamite Manufacturing">Dynamite Manufacturing</option>
// <option value="Eagle">Eagle</option>
// <option value="East to West Inc">East to West Inc</option>
// <option value="Eclipse">Eclipse</option>
// <option value="Eclipse Recreational Vehicles">Eclipse Recreational Vehicles</option>
// <option value="Eclipse Rv">Eclipse Rv</option>
// <option value="Endura Max">Endura Max</option>
// <option value="Entegra Coach">Entegra Coach</option>
// <option value="Europa">Europa</option>
// <option value="Ever-lite">Ever-lite</option>
// <option value="Evergreen">Evergreen</option>
// <option value="Evergreen Rv">Evergreen Rv</option>
// <option value="Evo">Evo</option>
// <option value="Excel">Excel</option>
// <option value="Excel - Peterson">Excel - Peterson</option>
// <option value="Extreme Warrior">Extreme Warrior</option>
// <option value="Featherlite Coaches">Featherlite Coaches</option>
// <option value="Ferrari">Ferrari</option>
// <option value="Fiesta">Fiesta</option>
// <option value="Flagstaff">Flagstaff</option>
// <option value="Fleetwood">Fleetwood</option>
// <option value="Fleetwood Rv">Fleetwood Rv</option>
// <option value="Ford">Ford</option>
// <option value="Forest River">Forest River</option>
// <option value="Forester">Forester</option>
// <option value="Foretravel">Foretravel</option>
// <option value="Four Winds">Four Winds</option>
// <option value="Four Winds Infinity">Four Winds Infinity</option>
// <option value="Four Winds International">Four Winds International</option>
// <option value="Fourwinds">Fourwinds</option>
// <option value="Franklin">Franklin</option>
// <option value="Freelander">Freelander</option>
// <option value="Freightliner">Freightliner</option>
// <option value="Genesis Supreme">Genesis Supreme</option>
// <option value="Georgetown">Georgetown</option>
// <option value="Georgie Boy">Georgie Boy</option>
// <option value="Glendale">Glendale</option>
// <option value="Glendale Rv">Glendale Rv</option>
// <option value="GMC">GMC</option>
// <option value="Grand Design">Grand Design</option>
// <option value="Grand Junction">Grand Junction</option>
// <option value="Gulf Stream">Gulf Stream</option>
// <option value="Gulfstream">Gulfstream</option>
// <option value="Hallmark">Hallmark</option>
// <option value="Haulmark">Haulmark</option>
// <option value="HEART LAND">HEART LAND</option>
// <option value="Heartland">Heartland</option>
// <option value="Heartland Landmark">Heartland Landmark</option>
// <option value="Heartland North Trail">Heartland North Trail</option>
// <option value="Heartland Rv">Heartland Rv</option>
// <option value="Heartland Wilderness">Heartland Wilderness</option>
// <option value="Heartlander">Heartlander</option>
// <option value="Hi Lo">Hi Lo</option>
// <option value="Highland Ridge">Highland Ridge</option>
// <option value="Highland Rv">Highland Rv</option>
// <option value="Holiday  Rambler">Holiday Rambler</option>
// <option value="Holiday Rambler">Holiday Rambler</option>
// <option value="Horton">Horton</option>
// <option value="Host">Host</option>
// <option value="Hurricane">Hurricane</option>
// <option value="Hy-Line">Hy-Line</option>
// <option value="Hymer">Hymer</option>
// <option value="Ice Castle Fish Houses">Ice Castle Fish Houses</option>
// <option value="Itasca">Itasca</option>
// <option value="Jamboree">Jamboree</option>
// <option value="Jayco">Jayco</option>
// <option value="Jayco Eagle Super Lite">Jayco Eagle Super Lite</option>
// <option value="Jayco White Hawk">Jayco White Hawk</option>
// <option value="Journey">Journey</option>
// <option value="K-Z">K-Z</option>
// <option value="K-Z Manufacturing">K-Z Manufacturing</option>
// <option value="Keystone">Keystone</option>
// <option value="Keystone Rv">Keystone Rv</option>
// <option value="Komfort">Komfort</option>
// <option value="Kz">Kz</option>
// <option value="Kz Rv">Kz Rv</option>
// <option value="Lance">Lance</option>
// <option value="launch">launch</option>
// <option value="LAZY DAZE">LAZY DAZE</option>
// <option value="Leisure Trave">Leisure Trave</option>
// <option value="Leisure Travel">Leisure Travel</option>
// <option value="Leprechaun">Leprechaun</option>
// <option value="Lifestyle Luxury Rv">Lifestyle Luxury Rv</option>
// <option value="Little Guy">Little Guy</option>
// <option value="Livin">Livin</option>
// <option value="Livin Lite">Livin Lite</option>
// <option value="Livin' Lite">Livin' Lite</option>
// <option value="Majestic Leisure Craft">Majestic Leisure Craft</option>
// <option value="Mandalay Coach">Mandalay Coach</option>
// <option value="Marathon">Marathon</option>
// <option value="MCI">MCI</option>
// <option value="Mckenzie">Mckenzie</option>
// <option value="Mckenzie Towables">Mckenzie Towables</option>
// <option value="Mercedes-Benz">Mercedes-Benz</option>
// <option value="Meridian">Meridian</option>
// <option value="Milan">Milan</option>
// <option value="MONACAO">MONACAO</option>
// <option value="Monaco">Monaco</option>
// <option value="Montana">Montana</option>
// <option value="MONTANA 3665RE">MONTANA 3665RE</option>
// <option value="MVP">MVP</option>
// <option value="Nash">Nash</option>
// <option value="National">National</option>
// <option value="National Rv">National Rv</option>
// <option value="Navion (Itasca Winnebago)">Navion (Itasca Winnebago)</option>
// <option value="Newell">Newell</option>
// <option value="Newell Coach">Newell Coach</option>
// <option value="Newmar">Newmar</option>
// <option value="Nexus">Nexus</option>
// <option value="Non-Little Guy Tear Drop">Non-Little Guy Tear Drop</option>
// <option value="Northland">Northland</option>
// <option value="Northwood">Northwood</option>
// <option value="Northwood Mfg">Northwood Mfg</option>
// <option value="Northwoods">Northwoods</option>
// <option value="Nu Wa">Nu Wa</option>
// <option value="NuWa">NuWa</option>
// <option value="Nuwa Industries">Nuwa Industries</option>
// <option value="Odes">Odes</option>
// <option value="Odessa Industries">Odessa Industries</option>
// <option value="Open Range">Open Range</option>
// <option value="Optima">Optima</option>
// <option value="Other">Other</option>
// <option value="Other Make">Other Make</option>
// <option value="Outdoors Rv Manufacturing">Outdoors Rv Manufacturing</option>
// <option value="Pacific Coachworks">Pacific Coachworks</option>
// <option value="Palomino">Palomino</option>
// <option value="panther">panther</option>
// <option value="Passport Ultra Lite">Passport Ultra Lite</option>
// <option value="Pastime">Pastime</option>
// <option value="Peterson">Peterson</option>
// <option value="Phaeton">Phaeton</option>
// <option value="Phoenix">Phoenix</option>
// <option value="Phoenix Usa">Phoenix Usa</option>
// <option value="Pilgrim">Pilgrim</option>
// <option value="Pilgrim International">Pilgrim International</option>
// <option value="Pioneer">Pioneer</option>
// <option value="Pleasure Way">Pleasure Way</option>
// <option value="Pleasure-Way">Pleasure-Way</option>
// <option value="Porsche">Porsche</option>
// <option value="Potomac">Potomac</option>
// <option value="Power House Coach">Power House Coach</option>
// <option value="Prevost">Prevost</option>
// <option value="Prime Time">Prime Time</option>
// <option value="R-Vision">R-Vision</option>
// <option value="Rage'N">Rage'N</option>
// <option value="Ram">Ram</option>
// <option value="Rc Willett Company, Inc.">Rc Willett Company, Inc.</option>
// <option value="Recreation By Design">Recreation By Design</option>
// <option value="Redwood">Redwood</option>
// <option value="Redwood Rv">Redwood Rv</option>
// <option value="Reflection">Reflection</option>
// <option value="Renegade">Renegade</option>
// <option value="Rexhall">Rexhall</option>
// <option value="Riverside Rv">Riverside Rv</option>
// <option value="Roadmaster">Roadmaster</option>
// <option value="Roadtrek">Roadtrek</option>
// <option value="Rockwood">Rockwood</option>
// <option value="Royals Internat">Royals Internat</option>
// <option value="Runaway">Runaway</option>
// <option value="SAFARI">SAFARI</option>
// <option value="Salem">Salem</option>
// <option value="Seabreeze">Seabreeze</option>
// <option value="Serro Scotty">Serro Scotty</option>
// <option value="Shasta">Shasta</option>
// <option value="SHOW HAULER">SHOW HAULER</option>
// <option value="Showhauler">Showhauler</option>
// <option value="Siesta">Siesta</option>
// <option value="Silver Crown">Silver Crown</option>
// <option value="Silver Eagle">Silver Eagle</option>
// <option value="Skyline">Skyline</option>
// <option value="Skyline Corp">Skyline Corp</option>
// <option value="Skyline Skycat">Skyline Skycat</option>
// <option value="Solaire">Solaire</option>
// <option value="Solera">Solera</option>
// <option value="Solstice">Solstice</option>
// <option value="Somerset">Somerset</option>
// <option value="Sportsmen">Sportsmen</option>
// <option value="Starcraft">Starcraft</option>
// <option value="Starcraft Rvs">Starcraft Rvs</option>
// <option value="Stellar">Stellar</option>
// <option value="Sun Valley Inc">Sun Valley Inc</option>
// <option value="Sunnybrook">Sunnybrook</option>
// <option value="Sunova">Sunova</option>
// <option value="Sunset Creek">Sunset Creek</option>
// <option value="Sunset Park &amp; Rv Inc.">Sunset Park &amp; Rv Inc.</option>
// <option value="Sunset Park Rv">Sunset Park Rv</option>
// <option value="Surveyor">Surveyor</option>
// <option value="T@B">T@B</option>
// <option value="T@G">T@G</option>
// <option value="Taxa Outdoors">Taxa Outdoors</option>
// <option value="Terry">Terry</option>
// <option value="Teton">Teton</option>
// <option value="Teton Homes">Teton Homes</option>
// <option value="The RV Factory">The RV Factory</option>
// <option value="Thor">Thor</option>
// <option value="Thor California">Thor California</option>
// <option value="Thor Industries">Thor Industries</option>
// <option value="Thor Motor Coach">Thor Motor Coach</option>
// <option value="Tiffin">Tiffin</option>
// <option value="Tiffin Motorhomes">Tiffin Motorhomes</option>
// <option value="Travel Lite">Travel Lite</option>
// <option value="Travel Supreme">Travel Supreme</option>
// <option value="Travelcraft">Travelcraft</option>
// <option value="Trillium">Trillium</option>
// <option value="V-Cross Vibe">V-Cross Vibe</option>
// <option value="Venture Rv">Venture Rv</option>
// <option value="Viewfinder">Viewfinder</option>
// <option value="Viking">Viking</option>
// <option value="Volkswagen">Volkswagen</option>
// <option value="Vortex">Vortex</option>
// <option value="Weekend Warrior">Weekend Warrior</option>
// <option value="Western">Western</option>
// <option value="Western Rv">Western Rv</option>
// <option value="White Water">White Water</option>
// <option value="Winnebago">Winnebago</option>
// <option value="Winnebago Industries, Inc.">Winnebago Industries, Inc.</option>
// <option value="Winnebago Micro Minnie">Winnebago Micro Minnie</option>
// <option value="Yellowstone">Yellowstone</option>`
db.once('open', async function () {
  console.log('Database is connected!');



  // Insert All The Dropdowns With Basic Options
  // try {
  //   let types = [
  //     {
  //       label: "Class A",
  //       value: "Class A",
  //     },
  //     {
  //       label: "Class B",
  //       value: "Class B",
  //     },
  //     {
  //       label: "Class C",
  //       value: "Class C",
  //     },
  //     {
  //       label: "Fifth Wheel",
  //       value: "Fifth Wheel",
  //     },
  //     {
  //       label: "Toy Hauler",
  //       value: "Toy Hauler",
  //     },
  //     {
  //       label: "Travel Trailer",
  //       value: "Travel Trailer",
  //     },
  //     {
  //       label: "Pop up camper and other",
  //       value: "Pop up camper and other",
  //     },
  //     {
  //       label: "Campervan",
  //       value: "Campervan",
  //     },
  //   ];
  //   let startYear = 1969;
  //   let currentTime = new Date()
  //   let year = currentTime.getFullYear()
  //   let years = [], sleeps = [], slides = [], seatbelts = [], makes = [];
  //   for (let i = year; i >= startYear; i--) {
  //     years.push({ label: `${i}`, value: `${i}` })
  //   }
  //   for (let i = 1; i <= 15; i++) {
  //     sleeps.push({ label: `${i}`, value: `${i}` })
  //   }
  //   for (let i = 1; i <= 9; i++) {
  //     slides.push({ label: `${i}`, value: `${i}` });
  //     seatbelts.push({ label: `${i}`, value: `${i}` })
  //   }
  //   for (let i = 1; i <= makeString.split('"').length; i++) {
  //     if (i % 2 == 1) {
  //       makes.push({ label: makeString.split('"')[i], value: makeString.split('"')[i] })
  //     }
  //   }
  //   await SeedModel.insertMany([{
  //     name: 'Type',
  //     value: [...types]
  //   }, {
  //     name: 'Make',
  //     value: [...makes]
  //   },
  //   {
  //     name: 'Year',
  //     value: [...years]
  //   },
  //   {
  //     name: 'Slide',
  //     value: [...slides]
  //   },
  //   {
  //     name: 'Seatbelt',
  //     value: [...seatbelts]
  //   },
  //   {
  //     name: 'Sleep',
  //     value: [...sleeps]
  //   }
  //   ])

  // } catch (e) {
  //   console.log(e)
  // }


  const superAdminDocCount = await UserModel.find({ role: "super_admin" }).countDocuments();
  const permissions =[ 
  {
    title: "RV Request",
    href: "/rv-request",
    icon: "bi bi-truck-front-fill",
  },
  {
    title: "Blogs",
    href: "/blogs",
    icon: "bi bi-card-text",
  }
]
  console.log(superAdminDocCount)
  if (superAdminDocCount === 0) {
    try {
      const adminUser = {
        email: "adminuser@gmail.com",
        role: "super_admin",
        password: await passwordHash.hashPassword("pass123"),
        userName: "rizwan.ahmed",
        fullName: "Rizwan Ahmed Siddiqui",
        permissions
      }
   
      // Insert superAdmin User as seedData in DB
      console.log(adminUser)

      let superAdminUser = await UserModel.create(adminUser)
      console.log(superAdminUser)
    } catch (err) {
      console.log(err)
    }
  }


  mongoose.disconnect();
});
