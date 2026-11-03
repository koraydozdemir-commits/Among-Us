/* Johnny Among Us — The Skeld map data.
   Canvas coordinates are currently mapped into the existing 1440×870 game world.
   Protocol coordinates and vent graph are retained alongside those anchors so the
   artwork/collision geometry can be calibrated without losing authoritative IDs. */
(function (global) {
  'use strict';

  const FLOORS = [
    {n:'Upper Engine',p:[[205,112],[376,112],[400,138],[400,270],[372,300],[205,300]],c:'#747c79',kind:'engine'},
    {n:'Reactor',p:[[62,270],[230,250],[260,278],[260,493],[220,530],[62,505]],c:'#716d68',kind:'reactor'},
    {n:'Security',p:[[350,292],[476,292],[495,320],[495,455],[468,482],[350,482]],c:'#657b79',kind:'security'},
    {n:'Lower Engine',p:[[205,520],[376,520],[400,548],[400,678],[372,705],[205,690]],c:'#747c79',kind:'engine'},
    {n:'MedBay',p:[[480,246],[640,246],[682,280],[682,405],[645,444],[500,430],[480,400]],c:'#9aa9a2',kind:'medbay'},
    {n:'Cafeteria',p:[[650,18],[946,18],[1010,82],[1010,298],[950,382],[700,382],[630,298],[630,88]],c:'#aaa996',kind:'cafeteria'},
    {n:'Weapons',p:[[1050,78],[1170,78],[1230,138],[1230,248],[1180,286],[1050,286]],c:'#8b9993',kind:'weapons'},
    {n:'O2',p:[[990,294],[1110,294],[1140,326],[1140,410],[1110,432],[990,432]],c:'#839995',kind:'o2'},
    {n:'Navigation',p:[[1280,300],[1390,300],[1440,350],[1440,450],[1390,492],[1280,492]],c:'#84999b',kind:'nav'},
    {n:'Admin',p:[[890,418],[1065,418],[1095,448],[1095,558],[1055,592],[890,592]],c:'#8c9b91',kind:'admin'},
    {n:'Electrical',p:[[480,462],[650,462],[682,492],[682,642],[650,680],[480,680]],c:'#667a70',kind:'electrical'},
    {n:'Storage',p:[[650,520],[900,520],[950,570],[950,760],[900,820],[690,820],[640,770],[640,575]],c:'#928e79',kind:'storage'},
    {n:'Communications',p:[[900,650],[1065,650],[1095,680],[1095,785],[1055,825],[925,825],[900,790]],c:'#708681',kind:'comms'},
    {n:'Shields',p:[[1090,558],[1225,558],[1260,595],[1260,705],[1220,750],[1090,750]],c:'#879a94',kind:'shields'}
  ];

  const HALLS = [
    [[365,160],[655,160],[655,245],[365,245]],
    [[240,350],[360,350],[360,425],[240,425]],
    [[245,475],[355,475],[355,555],[245,555]],
    [[450,365],[510,365],[510,425],[450,425]],
    [[600,345],[690,345],[690,430],[600,430]],
    [[975,165],[1070,165],[1070,245],[975,245]],
    [[1070,245],[1150,245],[1150,320],[1070,320]],
    [[1095,350],[1300,350],[1300,425],[1095,425]],
    [[1065,455],[1300,455],[1300,520],[1065,520]],
    [[815,365],[900,365],[900,455],[815,455]],
    [[645,625],[720,625],[720,700],[645,700]],
    [[895,755],[960,755],[960,825],[895,825]],
    [[1030,625],[1110,625],[1110,700],[1030,700]],
    [[900,555],[980,555],[980,635],[900,635]],
    [[465,425],[535,425],[535,510],[465,510]],
    [[370,600],[485,600],[485,670],[370,670]]
  ];

  const ST = [[150,395],[230,265],[580,410],[570,560],[990,510],[1170,650],[1140,185],[1345,400],[190,455],[575,500],[690,110],[1050,360],[800,730],[1370,445],[585,620],[570,510],[885,330],[610,415]];
  const POWER_TARGETS = [[1020,780],[1050,550],[1170,650],[1345,455],[295,265],[580,410],[1050,360]];
  const POWER_TARGET_NAMES = ['COMMUNICATIONS','ADMIN','SHIELDS','NAVIGATION','UPPER ENGINE','MEDBAY','O2'];
  const TBL = [820,205];
  const TASK_NAMES = ['START REACTOR','ALIGN ENGINE OUTPUT','SUBMIT SCAN','FIX WIRING','SWIPE CARD','PRIME SHIELDS','CLEAR ASTEROIDS','STABILIZE STEERING','UNLOCK MANIFOLDS','CALIBRATE DISTRIBUTOR','DOWNLOAD / UPLOAD DATA','CLEAN O2 FILTER','FUEL ENGINES','CHART COURSE','CLEAN VENT','DIVERT POWER','EMPTY GARBAGE','INSPECT SAMPLE'];

  // Protocol IDs and X/Y values are exact source data. Canvas points are the
  // current hand-mapped positions in this game's 1440×870 world and are flagged
  // for calibration against the full-resolution visual reference.
  const VENT_META = [
    {id:0,name:'Admin',protocol:[2.543373,-9.59182],canvas:[990,510],links:[1,2]},
    {id:1,name:'Right hallway',protocol:[9.38308,-6.0749207],canvas:[1170,490],links:[0,2]},
    {id:2,name:'Cafeteria',protocol:[4.2584915,0.08728027],canvas:[950,320],links:[0,1]},
    {id:3,name:'Electrical',protocol:[-9.777372,-7.6704063],canvas:[570,560],links:[5,6]},
    {id:4,name:'Upper Engine',protocol:[-15.288929,2.8827324],canvas:[350,205],links:[11]},
    {id:5,name:'Security',protocol:[-12.534981,-6.586403],canvas:[420,425],links:[3,6]},
    {id:6,name:'MedBay',protocol:[-10.608683,-3.8129234],canvas:[580,350],links:[3,5]},
    {id:7,name:'Weapons',protocol:[8.819103,3.687191],canvas:[1140,185],links:[12]},
    {id:8,name:'Lower Reactor',protocol:[-20.796825,-6.590065],canvas:[165,455],links:[9]},
    {id:9,name:'Lower Engine',protocol:[-15.251087,-13.293049],canvas:[350,615],links:[8]},
    {id:10,name:'Shields',protocol:[9.52224,-13.974211],canvas:[1170,660],links:[13]},
    {id:11,name:'Upper Reactor',protocol:[-21.877165,-2.6886406],canvas:[165,330],links:[4]},
    {id:12,name:'Upper Navigation',protocol:[16.007935,-2.8046074],canvas:[1370,360],links:[7]},
    {id:13,name:'Lower Navigation',protocol:[16.007935,-6.0212097],canvas:[1370,445],links:[10]}
  ];

  // The graph intentionally contains only genuine Skeld connections:
  // engines north/south, medical wing, central Cafeteria/Admin/Hallway,
  // east upper, and east lower.
  const VENT_GROUPS = [[4,11],[8,9],[3,5,6],[0,1,2],[7,12],[13,10]];
  const VENTS = VENT_META.map(v => v.canvas.slice());
  const VENT_LINKS = VENT_META.map(v => v.links.slice());

  const PANELS = [[535,545]];
  const BLOCKERS = [
    [700,100,82,55],[860,100,82,55],[775,185,82,55],[700,270,82,55],[860,270,82,55],
    [520,285,42,90],[610,285,42,90],[545,365,90,28],
    [950,465,85,64],[1080,145,120,80],[1320,340,75,70],[112,340,76,110],
    [500,490,44,40],[600,490,44,40],[500,595,44,40],[600,595,44,40],
    [720,600,62,58],[835,600,62,58],[720,710,62,58],[835,710,62,58],
    [930,680,65,40],[1015,690,65,40],[1125,585,60,42],[1190,650,42,52],
    [250,150,65,48],[300,555,65,48]
  ];
  const DOORWAYS = [[392,180,16,52,true],[252,365,16,50,true],[270,497,55,16,false],[392,610,16,48,true],[487,370,16,48,true],[674,355,16,50,true],[1002,180,16,50,true],[1090,278,54,16,false],[1132,360,16,48,true],[1272,360,16,48,true],[1272,465,16,48,true],[845,374,50,16,false],[860,410,50,16,false],[490,454,50,16,false],[635,640,16,48,true],[890,770,16,48,true],[1080,640,16,48,true],[930,560,16,48,true]];
  const REACTOR_PANELS = [[205,300],[205,475]];
  const O2_PANELS = [[1070,370],[1050,560]];
  const COMMS_PANEL = [1030,760];

  global.JohnnySkeldMapData = Object.freeze({
    version: 1, world: {width:1440,height:870},
    FLOORS, HALLS, ST, POWER_TARGETS, POWER_TARGET_NAMES, TBL, TASK_NAMES,
    VENT_META, VENT_GROUPS, VENTS, VENT_LINKS, PANELS, BLOCKERS, DOORWAYS,
    REACTOR_PANELS, O2_PANELS, COMMS_PANEL
  });
})(window);
