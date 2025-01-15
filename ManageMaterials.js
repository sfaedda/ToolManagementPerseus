import React, { useState, useEffect } from 'react';

type Material = {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
};

type Loan = {
  id: string;
  materialId: string;
  borrowerName: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
};

const App: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [newMaterialName, setNewMaterialName] = useState('');
    const [newMaterialQuantity, setNewMaterialQuantity] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterialForLoan, setSelectedMaterialForLoan] = useState<Material | null>(null);
    const [loanQuantity, setLoanQuantity] = useState(1);
    const [loanStartDate, setLoanStartDate] = useState<Date | null>(null);
    const [loanEndDate, setLoanEndDate] = useState<Date | null>(null);
    const [loanBorrowerName, setLoanBorrowerName] = useState('');
    const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
    const [editMaterialName, setEditMaterialName] = useState('');
    const [editMaterialQuantity, setEditMaterialQuantity] = useState(1);
    
    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const storedMaterials = localStorage.getItem('materials');
        if (storedMaterials) {
          setMaterials(JSON.parse(storedMaterials));
        }
        const storedLoans = localStorage.getItem('loans');
        if (storedLoans) {
          setLoans(JSON.parse(storedLoans));
        }
    }, []);

    useEffect(() => {
      localStorage.setItem('materials', JSON.stringify(materials));
      localStorage.setItem('loans', JSON.stringify(loans));
    }, [materials, loans]);

    const handleAddMaterial = () => {
        if (newMaterialName.trim() === '') return;
        const newMaterial: Material = {
            id: Math.random().toString(36).substring(2, 15),
            name: newMaterialName,
            totalQuantity: newMaterialQuantity,
            availableQuantity: newMaterialQuantity,
        };
        setMaterials([...materials, newMaterial]);
        setNewMaterialName('');
        setNewMaterialQuantity(1);
    };

    const handleEditMaterial = (material: Material) => {
      setEditMaterialId(material.id);
      setEditMaterialName(material.name);
      setEditMaterialQuantity(material.totalQuantity);
    }

    const handleSaveMaterialEdit = () => {
      if (!editMaterialId) return;
      const updatedMaterials = materials.map(material =>
        material.id === editMaterialId ? { ...material, name: editMaterialName, totalQuantity: editMaterialQuantity, availableQuantity: material.availableQuantity + (editMaterialQuantity - material.totalQuantity)} : material
      );
      setMaterials(updatedMaterials);
      setEditMaterialId(null);
      setEditMaterialName('');
      setEditMaterialQuantity(1);
    }

    const handleCancelMaterialEdit = () => {
      setEditMaterialId(null);
      setEditMaterialName('');
      setEditMaterialQuantity(1);
    }
    const handleLoanMaterialSelection = (material: Material) => {
        setSelectedMaterialForLoan(material);
    };


    const handleLoanSubmit = () => {
      if (!selectedMaterialForLoan || !loanStartDate || !loanEndDate || loanBorrowerName.trim() === '') return;
      if (loanQuantity <= 0 || loanQuantity > selectedMaterialForLoan.availableQuantity) {
          alert("Invalid loan quantity");
          return;
      }

        const newLoan: Loan = {
          id: Math.random().toString(36).substring(2, 15),
          materialId: selectedMaterialForLoan.id,
          borrowerName: loanBorrowerName,
          quantity: loanQuantity,
          startDate: loanStartDate,
          endDate: loanEndDate,
        };
        setLoans([...loans, newLoan]);
        const updatedMaterials = materials.map((material) =>
            material.id === selectedMaterialForLoan.id
              ? { ...material, availableQuantity: material.availableQuantity - loanQuantity }
              : material
          );
        setMaterials(updatedMaterials)
        setSelectedMaterialForLoan(null);
        setLoanQuantity(1);
        setLoanStartDate(null);
        setLoanEndDate(null);
        setLoanBorrowerName('');
    };

    const handleReturnMaterial = (loan: Loan) => {
      const updatedLoans = loans.filter((l) => l.id !== loan.id);
      setLoans(updatedLoans);

       const updatedMaterials = materials.map((material) =>
            material.id === loan.materialId
              ? { ...material, availableQuantity: material.availableQuantity + loan.quantity }
              : material
          );
      setMaterials(updatedMaterials);
    }
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (date: Date) => void ) => {
        const date = new Date(e.target.value);
        setter(date);
    }
    const isMaterialCompletelyBorrowed = (material: Material) => {
      return material.availableQuantity === 0;
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen flex justify-center">
            <div className="max-w-4xl w-full space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">Laboratory Material Management</h1>
                {/* Add Material Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Material</h2>
                    <div className="flex space-x-4 mb-4">
                        <input
                            type="text"
                            placeholder="Material Name"
                            className="border p-2 rounded-md w-full"
                            value={newMaterialName}
                            onChange={(e) => setNewMaterialName(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            className="border p-2 rounded-md w-24"
                            value={newMaterialQuantity}
                            min="1"
                            onChange={(e) => setNewMaterialQuantity(parseInt(e.target.value, 10))}
                        />
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAddMaterial}>
                        Add Material
                    </button>
                </div>
                {/* Material List Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Material List</h2>
                    <input
                        type="text"
                        placeholder="Search Material"
                        className="border p-2 rounded-md w-full mb-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ul className="divide-y divide-gray-200">
                        {filteredMaterials.map((material) => (
                            <li key={material.id} className="py-3 flex justify-between items-center">
                                <div>
                                  {editMaterialId === material.id ? 
                                  <>
                                    <input
                                      type="text"
                                      className="border p-1 rounded-md mr-2"
                                      value={editMaterialName}
                                      onChange={(e) => setEditMaterialName(e.target.value)}
                                    />
                                    <input
                                      type="number"
                                      className="border p-1 rounded-md w-16"
                                      value={editMaterialQuantity}
                                      onChange={(e) => setEditMaterialQuantity(parseInt(e.target.value, 10))}
                                    />
                                  </>
                                  : <span className="font-medium text-gray-800">{material.name}</span> }
                                    
                                </div>
                                <div className="flex space-x-4 items-center">
                                    <span>
                                        Available: {material.availableQuantity} / {material.totalQuantity}
                                    </span>
                                    {editMaterialId === material.id ? (
                                      <>
                                         <button className="text-green-500 hover:text-green-700" onClick={handleSaveMaterialEdit}>Save</button>
                                        <button className="text-gray-500 hover:text-gray-700" onClick={handleCancelMaterialEdit}>Cancel</button>
                                      </>
                                      ) : (
                                          <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEditMaterial(material)}>Edit</button>
                                    )}
                                    
                                    
                                    <button
                                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ${isMaterialCompletelyBorrowed(material) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isMaterialCompletelyBorrowed(material)}
                                        onClick={() => handleLoanMaterialSelection(material)}
                                    >
                                        Borrow
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                  {/* Loan Material Section */}
                {selectedMaterialForLoan && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">Borrow {selectedMaterialForLoan.name}</h2>
                         <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Quantity to Borrow:
                            </label>
                            <input
                              type="number"
                              className="border p-2 rounded-md w-full"
                              value={loanQuantity}
                              min="1"
                              max={selectedMaterialForLoan.availableQuantity}
                              onChange={(e) => setLoanQuantity(parseInt(e.target.value, 10))}
                              />
                         </div>
                         <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Borrower Name:
                            </label>
                            <input
                                type="text"
                                className="border p-2 rounded-md w-full"
                                value={loanBorrowerName}
                                onChange={(e) => setLoanBorrowerName(e.target.value)}
                            />
                         </div>
                        
                        <div className="mb-4 flex space-x-4">
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                  Start Date:
                              </label>
                               <input type="date" className="border p-2 rounded-md w-full" onChange={(e) => handleDateChange(e, setLoanStartDate)} />
                            </div>
                           <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                  End Date:
                                </label>
                                <input type="date" className="border p-2 rounded-md w-full" onChange={(e) => handleDateChange(e, setLoanEndDate)} />
                           </div>
                        </div>
                      
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleLoanSubmit}>
                           Confirm Loan
                        </button>
                      </div>
                )}
                {/* Current Loans */}
                 <div className="bg-white p-6 rounded-xl shadow-md">
                   <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Loans</h2>
                   <ul className="divide-y divide-gray-200">
                       {loans.map((loan) => {
                         const material = materials.find((m) => m.id === loan.materialId);
                         return material ? (
                            <li key={loan.id} className="py-3 flex justify-between items-center">
                              <div>
                                  <span className="font-medium text-gray-800">{material.name}</span>
                                  <span className="text-gray-500 ml-2">
                                       -  {loan.quantity} borrowed by {loan.borrowerName}
                                  </span>
                                    <p className="text-sm text-gray-600">
                                        {loan.startDate.toLocaleDateString()} - {loan.endDate.toLocaleDateString()}
                                    </p>
                              </div>
                                <button className="text-red-500 hover:text-red-700" onClick={() => handleReturnMaterial(loan)}>Return</button>
                          </li>
                         ) : null;
                       })}
                   </ul>
                </div>
            </div>
        </div>
    );
};

export default App;