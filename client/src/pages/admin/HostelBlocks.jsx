import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Eye, Edit2, Trash2, User, Building, 
  Bot, X, Check, AlertTriangle, RefreshCw, DoorOpen, 
  ArrowRight, Shield, Layers, Users, Sparkles 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Initial 5 Sample Hostel Blocks as specified
const INITIAL_HOSTEL_BLOCKS = [
  {
    id: 'block-1',
    name: 'Kaveri Boys Hostel',
    type: 'Boys',
    established: 2005,
    warden: 'Dr. R. Sharma',
    totalRooms: 120,
    occupied: 98,
    vacant: 22,
    floors: [
      { name: 'Ground Floor', rooms: 30, occupied: 25, vacant: 5 },
      { name: 'Floor 1', rooms: 30, occupied: 25, vacant: 5 },
      { name: 'Floor 2', rooms: 30, occupied: 24, vacant: 6 },
      { name: 'Floor 3', rooms: 30, occupied: 24, vacant: 6 }
    ]
  },
  {
    id: 'block-2',
    name: 'Ganga Girls Hostel',
    type: 'Girls',
    established: 2007,
    warden: 'Mrs. S. Nair',
    totalRooms: 100,
    occupied: 67,
    vacant: 33,
    floors: [
      { name: 'Ground Floor', rooms: 25, occupied: 18, vacant: 7 },
      { name: 'Floor 1', rooms: 25, occupied: 17, vacant: 8 },
      { name: 'Floor 2', rooms: 25, occupied: 16, vacant: 9 },
      { name: 'Floor 3', rooms: 25, occupied: 16, vacant: 9 }
    ]
  },
  {
    id: 'block-3',
    name: 'Cauvery Boys Hostel',
    type: 'Boys',
    established: 2010,
    warden: 'Mr. K. Patel',
    totalRooms: 80,
    occupied: 78,
    vacant: 2,
    floors: [
      { name: 'Ground Floor', rooms: 20, occupied: 20, vacant: 0 },
      { name: 'Floor 1', rooms: 20, occupied: 20, vacant: 0 },
      { name: 'Floor 2', rooms: 20, occupied: 19, vacant: 1 },
      { name: 'Floor 3', rooms: 20, occupied: 19, vacant: 1 }
    ]
  },
  {
    id: 'block-4',
    name: 'Saraswati Girls Hostel',
    type: 'Girls',
    established: 2012,
    warden: 'Dr. P. Mehta',
    totalRooms: 90,
    occupied: 45,
    vacant: 45,
    floors: [
      { name: 'Ground Floor', rooms: 22, occupied: 12, vacant: 10 },
      { name: 'Floor 1', rooms: 23, occupied: 11, vacant: 12 },
      { name: 'Floor 2', rooms: 22, occupied: 11, vacant: 11 },
      { name: 'Floor 3', rooms: 23, occupied: 11, vacant: 12 }
    ]
  },
  {
    id: 'block-5',
    name: 'Krishna Boys Hostel',
    type: 'Boys',
    established: 2015,
    warden: 'Mr. V. Reddy',
    totalRooms: 60,
    occupied: 58,
    vacant: 2,
    floors: [
      { name: 'Ground Floor', rooms: 15, occupied: 15, vacant: 0 },
      { name: 'Floor 1', rooms: 15, occupied: 15, vacant: 0 },
      { name: 'Floor 2', rooms: 15, occupied: 14, vacant: 1 },
      { name: 'Floor 3', rooms: 15, occupied: 14, vacant: 1 }
    ]
  }
];

const HostelBlocks = () => {
  const [blocks, setBlocks] = useState(INITIAL_HOSTEL_BLOCKS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedBlock, setSelectedBlock] = useState(null); // For Details Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null); // null = Add, obj = Edit
  const [viewRoomsBlock, setViewRoomsBlock] = useState(null); // For View Rooms Modal

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Boys',
    established: new Date().getFullYear(),
    warden: '',
    floorsCount: 4,
    roomsPerFloor: 25
  });
  const [formErrors, setFormErrors] = useState({});

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Summary Metrics Calculation
  const summaryMetrics = useMemo(() => {
    const totalBlocks = blocks.length;
    const totalRooms = blocks.reduce((acc, b) => acc + (Number(b.totalRooms) || 0), 0);
    const occupiedRooms = blocks.reduce((acc, b) => acc + (Number(b.occupied) || 0), 0);
    const vacantRooms = blocks.reduce((acc, b) => acc + (Number(b.vacant) || 0), 0);
    return { totalBlocks, totalRooms, occupiedRooms, vacantRooms };
  }, [blocks]);

  // Color helper based on percentage
  const getOccupancyColorStyles = (percent) => {
    if (percent <= 50) {
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-600',
        bg: 'bg-emerald-50'
      };
    } else if (percent <= 80) {
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-600',
        bg: 'bg-amber-50'
      };
    } else {
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-600',
        bg: 'bg-rose-50'
      };
    }
  };

  // Generate AI Analysis based on current blocks data
  const generateAiAnalysis = () => {
    setAiLoading(true);
    setTimeout(() => {
      if (blocks.length === 0) {
        setAiAnalysis('No hostel blocks are currently registered in the system. Add blocks to enable automated occupancy distribution analysis.');
        setAiLoading(false);
        return;
      }

      const totalRooms = summaryMetrics.totalRooms;
      const occupiedRooms = summaryMetrics.occupiedRooms;
      const overallOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      const criticalBlocks = blocks.filter(b => (b.occupied / b.totalRooms) >= 0.8).map(b => b.name);
      const highVacancyBlocks = blocks.filter(b => (b.occupied / b.totalRooms) <= 0.6).map(b => b.name);

      const boysRooms = blocks.filter(b => b.type === 'Boys').reduce((a, b) => a + b.totalRooms, 0);
      const boysOccupied = blocks.filter(b => b.type === 'Boys').reduce((a, b) => a + b.occupied, 0);
      const boysRate = boysRooms > 0 ? Math.round((boysOccupied / boysRooms) * 100) : 0;

      const girlsRooms = blocks.filter(b => b.type === 'Girls').reduce((a, b) => a + b.totalRooms, 0);
      const girlsOccupied = blocks.filter(b => b.type === 'Girls').reduce((a, b) => a + b.occupied, 0);
      const girlsRate = girlsRooms > 0 ? Math.round((girlsOccupied / girlsRooms) * 100) : 0;

      const criticalText = criticalBlocks.length > 0
        ? `Hostel blocks near critical capacity include ${criticalBlocks.join(', ')}, requiring strict room allocation controls.`
        : 'All hostel blocks are currently operating well within manageable capacity thresholds.';

      const vacancyText = highVacancyBlocks.length > 0
        ? `Conversely, ${highVacancyBlocks.join(', ')} maintain high vacancy margins (${100 - (blocks.find(b => b.name === highVacancyBlocks[0])?.occupied || 0)}% available), presenting ideal capacity for incoming students or wing renovations.`
        : 'Available room reserves are evenly balanced across wings.';

      const balanceText = `Current gender occupancy stands at ${boysRate}% for Boys hostels (${boysOccupied}/${boysRooms}) versus ${girlsRate}% for Girls hostels (${girlsOccupied}/${girlsRooms}), reflecting a notable ${Math.abs(boysRate - girlsRate)}% allocation difference.`;

      const recommendation = boysRate > 85
        ? 'Recommendation: Prioritize opening overflow wings in Saraswati Girls Hostel or plan modular capacity expansions for Boys blocks ahead of next semester.'
        : 'Recommendation: Maintain current room reserve buffer of 10% on ground floor wings for medical accessibility cases.';

      setAiAnalysis(`${criticalText} ${vacancyText} ${balanceText} ${recommendation}`);
      setAiLoading(false);
    }, 600);
  };

  useEffect(() => {
    generateAiAnalysis();
  }, [blocks]);

  // Filter blocks by search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return blocks;
    const q = searchQuery.toLowerCase();
    return blocks.filter(b => 
      b.name.toLowerCase().includes(q) || 
      b.type.toLowerCase().includes(q) ||
      b.warden.toLowerCase().includes(q)
    );
  }, [blocks, searchQuery]);

  // Handlers for Add/Edit
  const handleOpenAddModal = () => {
    setEditingBlock(null);
    setFormData({
      name: '',
      type: 'Boys',
      established: new Date().getFullYear(),
      warden: '',
      floorsCount: 4,
      roomsPerFloor: 25
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (block) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      type: block.type,
      established: block.established,
      warden: block.warden,
      floorsCount: block.floors.length || 4,
      roomsPerFloor: Math.round(block.totalRooms / (block.floors.length || 4)) || 25
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveBlock = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'This field is required';
    if (!formData.warden.trim()) errors.warden = 'This field is required';
    if (!formData.established) errors.established = 'This field is required';
    if (!formData.floorsCount || formData.floorsCount < 1) errors.floorsCount = 'This field is required';
    if (!formData.roomsPerFloor || formData.roomsPerFloor < 1) errors.roomsPerFloor = 'This field is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const totalRooms = Number(formData.floorsCount) * Number(formData.roomsPerFloor);
    const floors = [];
    for (let i = 0; i < formData.floorsCount; i++) {
      const floorName = i === 0 ? 'Ground Floor' : `Floor ${i}`;
      const floorRooms = Number(formData.roomsPerFloor);
      const floorOccupied = Math.round(floorRooms * 0.7); // default 70% occupancy
      floors.push({
        name: floorName,
        rooms: floorRooms,
        occupied: floorOccupied,
        vacant: floorRooms - floorOccupied
      });
    }

    const totalOccupied = floors.reduce((acc, f) => acc + f.occupied, 0);
    const totalVacant = totalRooms - totalOccupied;

    if (editingBlock) {
      // Update existing block
      const updated = blocks.map(b => {
        if (b.id === editingBlock.id) {
          return {
            ...b,
            name: formData.name.trim(),
            type: formData.type,
            established: Number(formData.established),
            warden: formData.warden.trim(),
            totalRooms,
            occupied: totalOccupied,
            vacant: totalVacant,
            floors
          };
        }
        return b;
      });
      setBlocks(updated);
      toast.success(`${formData.name} updated successfully!`);
    } else {
      // Add new block
      const newBlock = {
        id: `block-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type,
        established: Number(formData.established),
        warden: formData.warden.trim(),
        totalRooms,
        occupied: totalOccupied,
        vacant: totalVacant,
        floors
      };
      setBlocks([...blocks, newBlock]);
      toast.success(`${formData.name} added successfully!`);
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteBlock = (blockId, blockName) => {
    if (window.confirm(`Are you sure you want to delete ${blockName}? This will remove all associated floor and occupancy records.`)) {
      setBlocks(blocks.filter(b => b.id !== blockId));
      if (selectedBlock?.id === blockId) setSelectedBlock(null);
      toast.success(`${blockName} deleted.`);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Page Heading & Subtitle */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-[20px] font-medium text-slate-800 tracking-tight">Hostel blocks</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage hostel buildings, floors, rooms and student occupancy</p>
      </div>

      {/* Summary Metric Cards Row (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Blocks */}
        <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Blocks</span>
          <div className="mt-2">
            <span className="text-[24px] font-medium text-slate-800 leading-none">{summaryMetrics.totalBlocks}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Registered buildings</span>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Rooms</span>
          <div className="mt-2">
            <span className="text-[24px] font-medium text-slate-800 leading-none">{summaryMetrics.totalRooms}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Across all blocks</span>
          </div>
        </div>

        {/* Occupied Rooms */}
        <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Occupied Rooms</span>
          <div className="mt-2">
            <span className="text-[24px] font-medium text-blue-600 leading-none">{summaryMetrics.occupiedRooms}</span>
            <span className="text-[11px] text-blue-500/80 block mt-1">
              {summaryMetrics.totalRooms > 0 ? Math.round((summaryMetrics.occupiedRooms / summaryMetrics.totalRooms) * 100) : 0}% Occupancy
            </span>
          </div>
        </div>

        {/* Vacant Rooms */}
        <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Vacant Rooms</span>
          <div className="mt-2">
            <span className="text-[24px] font-medium text-emerald-600 leading-none">{summaryMetrics.vacantRooms}</span>
            <span className="text-[11px] text-emerald-600/80 block mt-1">Available for allocation</span>
          </div>
        </div>
      </div>

      {/* Toolbar Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input left */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hostel blocks…"
            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
          />
        </div>

        {/* Add hostel block button right */}
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add hostel block
        </button>
      </div>

      {/* Hostel Block Cards Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBlocks.length === 0 ? (
          <div className="lg:col-span-2 py-16 text-center bg-white border border-slate-200 rounded-xl">
            <Building className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-[14px] font-medium text-slate-600">No hostel blocks found</p>
            <p className="text-[12px] text-slate-400 mt-1">Try adjusting your search criteria or add a new block.</p>
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const occupancyPercent = block.totalRooms > 0 ? Math.round((block.occupied / block.totalRooms) * 100) : 0;
            const colorStyles = getOccupancyColorStyles(occupancyPercent);

            return (
              <div 
                key={block.id}
                className="bg-white border border-slate-200 rounded-xl p-5 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Card Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[16px] font-medium text-slate-900 leading-tight">{block.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                          block.type === 'Boys'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                          {block.type}
                        </span>
                        <span className="text-[12px] text-slate-400">Est. {block.established}</span>
                      </div>
                    </div>

                    {/* Action Icon Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedBlock(block)}
                        title="View details"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(block)}
                        title="Edit block"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id, block.name)}
                        title="Delete block"
                        className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-[12px] text-slate-500 mb-1.5">
                      <span>Occupancy</span>
                      <span className="font-mono">{block.occupied} / {block.totalRooms} rooms</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorStyles.bar} rounded-full transition-all duration-300`} 
                        style={{ width: `${occupancyPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                      <span className={`text-[11px] font-medium ${colorStyles.text}`}>
                        {occupancyPercent}% Occupied
                      </span>
                    </div>
                  </div>

                  {/* Stats Row (3 Columns) */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Total Rooms</span>
                      <span className="text-[14px] font-medium text-slate-800 mt-0.5 block">{block.totalRooms}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Occupied</span>
                      <span className="text-[14px] font-medium text-blue-600 mt-0.5 block">{block.occupied}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Vacant</span>
                      <span className="text-[14px] font-medium text-emerald-600 mt-0.5 block">{block.vacant}</span>
                    </div>
                  </div>

                  {/* Floors Section */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="text-[12px] font-medium uppercase tracking-wider text-slate-400 block mb-2">
                      Floors & rooms
                    </span>
                    <div className="space-y-2.5">
                      {block.floors?.map((floor, idx) => {
                        const floorPercent = floor.rooms > 0 ? Math.round((floor.occupied / floor.rooms) * 100) : 0;
                        const floorColor = getOccupancyColorStyles(floorPercent);

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[12px]">
                              <span className="text-slate-700 font-medium">{floor.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {floor.rooms} rooms · {floor.occupied} occupied
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${floorColor.bar} rounded-full`}
                                style={{ width: `${floorPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer Row */}
                <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Warden: <strong className="font-medium text-slate-800">{block.warden}</strong></span>
                  </div>

                  <button
                    onClick={() => setViewRoomsBlock(block)}
                    className="text-[12px] font-medium text-blue-600 hover:text-blue-700 bg-transparent border-none p-0 cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    View rooms →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Occupancy Analysis Panel */}
      <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-blue-50/80 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 text-[13px] font-medium">
            <Bot className="h-4 w-4 text-blue-600" />
            <span>AI occupancy analysis</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateAiAnalysis}
              disabled={aiLoading}
              className="text-[12px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none"
            >
              <RefreshCw className={`h-3 w-3 ${aiLoading ? 'animate-spin' : ''}`} /> Refresh analysis ↗
            </button>
          </div>
        </div>

        <div className="p-4 text-[13px] text-slate-700 leading-relaxed">
          {aiLoading ? (
            <p className="italic text-slate-400">Analyzing occupancy data…</p>
          ) : (
            <p>{aiAnalysis}</p>
          )}
        </div>
      </div>

      {/* Detail Modal (Eye Click) */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[16px] font-medium text-slate-900">{selectedBlock.name} — details</h3>
                <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full mt-1 ${
                  selectedBlock.type === 'Boys'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}>
                  {selectedBlock.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details Rows */}
            <div className="divide-y divide-slate-100 text-[13px] mt-4">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Block Name</span>
                <span className="font-medium text-slate-800">{selectedBlock.name}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-800">{selectedBlock.type} Hostel</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Established</span>
                <span className="font-medium text-slate-800">{selectedBlock.established}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Warden</span>
                <span className="font-medium text-slate-800">{selectedBlock.warden}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Total Rooms</span>
                <span className="font-medium text-slate-800">{selectedBlock.totalRooms}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Occupied</span>
                <span className="font-medium text-blue-600">{selectedBlock.occupied}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Vacant</span>
                <span className="font-medium text-emerald-600">{selectedBlock.vacant}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Occupancy %</span>
                <span className="font-medium text-slate-800">
                  {selectedBlock.totalRooms > 0 ? Math.round((selectedBlock.occupied / selectedBlock.totalRooms) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Floor Breakdown Table */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <h4 className="text-[12px] font-medium uppercase tracking-wider text-slate-500 mb-2">Floor breakdown</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-medium text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2">Floor</th>
                      <th className="p-2">Rooms</th>
                      <th className="p-2">Occ.</th>
                      <th className="p-2">Vac.</th>
                      <th className="p-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedBlock.floors?.map((f, i) => {
                      const pct = f.rooms > 0 ? Math.round((f.occupied / f.rooms) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-2 font-medium text-slate-800">{f.name}</td>
                          <td className="p-2 font-mono">{f.rooms}</td>
                          <td className="p-2 font-mono text-blue-600">{f.occupied}</td>
                          <td className="p-2 font-mono text-emerald-600">{f.vacant}</td>
                          <td className="p-2 text-right font-mono font-medium">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const toEdit = selectedBlock;
                  setSelectedBlock(null);
                  handleOpenEditModal(toEdit);
                }}
                className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
              >
                Edit block
              </button>
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Block Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-[440px] max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-[16px] font-medium text-slate-900">
                {editingBlock ? 'Edit hostel block' : 'Add hostel block'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-3.5 mt-4 text-[13px]">
              {/* Block Name */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Block name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kaveri Boys Hostel"
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                {formErrors.name && <span className="text-[12px] text-rose-500 mt-1 block">{formErrors.name}</span>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>

              {/* Established Year */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Established year</label>
                <input
                  type="number"
                  min="1950"
                  max="2030"
                  value={formData.established}
                  onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                {formErrors.established && <span className="text-[12px] text-rose-500 mt-1 block">{formErrors.established}</span>}
              </div>

              {/* Warden Name */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Warden name</label>
                <input
                  type="text"
                  value={formData.warden}
                  onChange={(e) => setFormData({ ...formData, warden: e.target.value })}
                  placeholder="e.g. Dr. R. Sharma"
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                {formErrors.warden && <span className="text-[12px] text-rose-500 mt-1 block">{formErrors.warden}</span>}
              </div>

              {/* Number of Floors & Rooms Per Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Number of floors</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.floorsCount}
                    onChange={(e) => setFormData({ ...formData, floorsCount: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.floorsCount && <span className="text-[12px] text-rose-500 mt-1 block">{formErrors.floorsCount}</span>}
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Rooms per floor</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.roomsPerFloor}
                    onChange={(e) => setFormData({ ...formData, roomsPerFloor: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.roomsPerFloor && <span className="text-[12px] text-rose-500 mt-1 block">{formErrors.roomsPerFloor}</span>}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Rooms Interactive Modal */}
      {viewRoomsBlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-xl text-left">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-[16px] font-medium text-slate-900">{viewRoomsBlock.name} — Room Layout</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Warden: {viewRoomsBlock.warden} · {viewRoomsBlock.occupied} occupied of {viewRoomsBlock.totalRooms} rooms
                </p>
              </div>
              <button
                onClick={() => setViewRoomsBlock(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {viewRoomsBlock.floors?.map((floor, fIdx) => (
                <div key={fIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[13px] font-medium text-slate-800">{floor.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {floor.occupied} occupied / {floor.vacant} vacant
                    </span>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                    {Array.from({ length: floor.rooms }).map((_, rIdx) => {
                      const roomNum = (fIdx * 100) + rIdx + 1;
                      const isOccupied = rIdx < floor.occupied;

                      return (
                        <div
                          key={rIdx}
                          title={`Room ${roomNum}: ${isOccupied ? 'Occupied' : 'Vacant'}`}
                          className={`p-1.5 rounded-lg text-center text-[10px] font-mono border transition-all cursor-default ${
                            isOccupied
                              ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                          }`}
                        >
                          <DoorOpen className="h-3 w-3 mx-auto mb-0.5 opacity-70" />
                          <span>{roomNum}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-blue-500"></span> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> Vacant
                </span>
              </div>
              <button
                onClick={() => setViewRoomsBlock(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelBlocks;
