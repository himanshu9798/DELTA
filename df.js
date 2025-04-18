import DataTable from "react-data-table-component";
import React, { Fragment, useState, useEffect } from "react";
import "./DFAllocation.css";
import { FaCheck, FaTimes, FaEye, FaFilter, FaEdit } from "react-icons/fa";
import $ from "jquery"
import { Config } from "./Masters/Util";
import dayjs from 'dayjs';


function DFAllocation() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [allocationType, setAllocationType] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedSerial, setSelectedSerial] = useState("");
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [currentStockData, setCurrentStockData] = useState(null);
  const [showStockDetailDialog, setShowStockDetailDialog] = useState(false);
  const [stockDetailType, setStockDetailType] = useState("");
  const [stockDetailData, setStockDetailData] = useState([]);
  const [poNumbers, setPoNumbers] = useState([
    { value: "PO000001", label: "PO000001", state: "Gujarat" },
    { value: "PO000002", label: "PO000002", state: "Maharashtra" },
    { value: "PO000003", label: "PO000003", state: "Bihar" },
  ]);
  const [selectedPoNumber, setSelectedPoNumber] = useState("PO000001");
  // const [dfSerialNumbers, setDfSerialNumbers] = useState([
  //   { value: "SN-001", label: "SN-001" },
  //   { value: "SN-002", label: "SN-002" },
  //   { value: "SN-003", label: "SN-003" },
  // ]);
  const [selectedDfSerialNumber, setSelectedDfSerialNumber] =
    useState("SN-001");
  const [selectedState, setSelectedState] = useState("");
  const stateOptions = [
    { value: "", label: "All States" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Bihar", label: "Bihar" },
  ];

  const [showChangeModelDialog, setShowChangeModelDialog] = useState(false);
  const [vendors, setVendors] = useState([
    { id: 1, name: "Blues star" },
    { id: 2, name: "Voltas" },
    { id: 3, name: "LG" },
  ]);

  const [dfModels, setDfModels] = useState([
    { id: 1, model: "BLUESTAR G315L [GT350NEP]", vendorId: 1 },
    { id: 2, model: "VOLTAS 1.5T [VX450]", vendorId: 2 },
    { id: 3, model: "LG 2.0T [LS500]", vendorId: 3 },
    { id: 4, model: "BLUESTAR G420L [GT450NEP]", vendorId: 1 },
    { id: 5, model: "VOLTAS 2.0T [VX550]", vendorId: 2 },
  ]);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedDfModel, setSelectedDfModel] = useState(null);
  const [filteredModels, setFilteredModels] = useState([]);

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("N");

  const allocationOptions = [
    { value: "PO", label: "PO" },
    { value: "Distributor", label: "Distributor" },
    { value: "Depo", label: "Depo" },
  ];

  const statusOptions = [
    { value: "N", label: "Pending" },
    { value: "H", label: "Allocated" },
    { value: "X", label: "Rejected" },
  ];

  const entityOptions = {
    Distributor: [
      { value: "dist1", label: "Distributor 1" },
      { value: "dist2", label: "Distributor 2" },
      { value: "dist3", label: "Distributor 3" },
    ],
    Depo: [
      { value: "depo1", label: "Depo 1" },
      { value: "depo2", label: "Depo 2" },
      { value: "depo3", label: "Depo 3" },
    ],
    PO: [],
  };

  const serialOptions = {
    dist1: ["SN-001", "SN-002", "SN-003"],
    dist2: ["SN-004", "SN-005"],
    dist3: ["SN-006", "SN-007", "SN-008"],
    depo1: ["SN-101", "SN-102"],
    depo2: ["SN-201", "SN-202", "SN-203"],
    depo3: ["SN-301"],
  };

  const [stockData, setStockData] = useState({
    PO: [
      {
        poNumber: "PO000001",
        model: "BLUESTAR G315L [GT350NEP]",
        state: "Gujarat",
        stock: 20,
      },
      {
        poNumber: "PO000002",
        model: "BLUESTAR G315L [GT350NEP]",
        state: "Maharashtra",
        stock: 15,
      },
      // ... other PO stock data
    ],
    Distributor: [
      {
        distributorCode: "dist1",
        model: "BLUESTAR G315L [GT350NEP]",
        distributorName: "Distributor 1",
        stock: 10,
      },
      // ... other distributor stock data
    ],
    Depo: [
      {
        depoCode: "depo1",
        model: "BLUESTAR G315L [GT350NEP]",
        depoName: "Depo 1",
        stock: 7,
      },
      // ... other depo stock data
    ],
  });







  const getAvailableStock = (allocationType, selectedOption, model) => {
    if (!allocationType || !selectedOption || !model) return 0;

    const stockItems = stockData[allocationType];
    if (!stockItems) return 0;

    if (allocationType === "PO") {
      return stockItems
        .filter(
          (item) => item.poNumber === selectedOption && item.model === model
        )
        .reduce((sum, item) => sum + item.stock, 0);
    } else if (allocationType === "Distributor") {
      return stockItems
        .filter(
          (item) =>
            item.distributorCode === selectedOption && item.model === model
        )
        .reduce((sum, item) => sum + item.stock, 0);
    } else if (allocationType === "Depo") {
      return stockItems
        .filter(
          (item) => item.depoCode === selectedOption && item.model === model
        )
        .reduce((sum, item) => sum + item.stock, 0);
    }

    return 0;
  };

  useEffect(() => {
    if (selectedVendor) {
      const vendorModels = dfModels.filter(
        (model) => model.vendorId === selectedVendor.id
      );
      setFilteredModels(vendorModels);
      setSelectedDfModel(vendorModels[0] || null);
    } else {
      setFilteredModels([]);
      setSelectedDfModel(null);
    }
  }, [selectedVendor, dfModels]);

  // Set default dates to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setFromDate(formatDate(firstDay));
    setToDate(formatDate(lastDay));
  }, []);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleRowSelected = React.useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const handleClearSelected = () => {
    setToggleCleared(!toggleCleared);
    setSelectedRows([]);
  };

  const handleProcessClick = () => {
    console.log("Processing selected rows:", selectedRows);
    setShowDialog(true);
  };

  const handleDialogProcess = () => {
    if (!allocationType) {
      alert("Please select an allocation type");
      return;
    }

    // Check stock for each item individually
    for (const row of selectedRows) {
      const availableStock = getAvailableStock(
        allocationType,
        allocationType === "PO" ? selectedPoNumber : selectedEntity,
        row.DFModel
      );

      if (availableStock < row.Qty) {
        alert(
          `Insufficient stock for ${row.DFModel}. Available: ${availableStock}, Requested: ${row.Qty}`
        );
        return;
      }
    }

    // Proceed with allocation
    let allocationDetails = {};
    if (allocationType === "PO") {
      allocationDetails = {
        type: "PO",
        poNumber: selectedPoNumber,
        serialNumber: selectedDfSerialNumber,
      };
    } else {
      allocationDetails = {
        type: allocationType,
        entity: selectedEntity,
        serialNumber: selectedSerial,
      };
    }

    console.log(`Processing with:`, allocationDetails, selectedRows);
    alert(`${selectedRows.length} records allocated to ${allocationType}`);

    setShowDialog(false);
    setAllocationType("");
    setSelectedEntity("");
    setSelectedSerial("");
    setSelectedPoNumber("PO000001"); // Reset to default
    setSelectedDfSerialNumber("SN-001"); // Reset to default
    setToggleCleared(!toggleCleared);
    setSelectedRows([]);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setAllocationType("");
    setSelectedEntity("");
    setSelectedSerial("");
  };

  const handleViewStock = (row) => {
    const mslCode = row?.MslCode;
    $.ajax({
      url: `https://hrplcoretest-fforce.ssplbusiness.com/WEB/AssetsAllocation/GetDFStockCount?MSLCode=${mslCode}`,
      type: "GET",
      success: function (response) {
        if (response?.isSuccess === true) {
          try {
            const jsonArray = JSON.parse(response.res); // This gives you an array
            console.log(jsonArray,"GetDFStockCount")
    
            if (Array.isArray(jsonArray) && jsonArray.length > 0) {
              const stock = jsonArray[0]; // Since it's an array with one object
    
              setCurrentStockData({
                poStock: stock.POStock,
                distributorStock: stock.DistStock,
                depoStock: stock.DepoStock,
                details: {
                  ...row,
                  DFModel: row?.MName,
                  DealerName:row?.MSLName ,
                  DealerCode:row?.MslCode,// set it here if you want to use this name
                  DFModelNew:row?.DFModel

                },

              });
    
              setShowStockDialog(true);
            } else {
              console.error("Unexpected response format:", jsonArray);
              alert("No stock data found.");
            }
          } catch (err) {
            console.error("JSON parse error:", err);
            alert("Error parsing stock data.");
          }
        } else {
          alert("Failed to fetch stock data from server.");
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
        alert("Network or server error occurred.");
      }
    });
    

  };

  console.log(currentStockData,"currentStockData")

 




  //       const itemDate = new Date(item.RequestDate);
  //       const from = new Date(fromDate);
  //       const to = new Date(toDate);
  //       return itemDate >= from && itemDate <= to;
  //     });
  //   }

  //   // Filter by status
  //   if (statusFilter === "Pending") {
  //     result = result.filter(
  //       (item) =>
  //         item.FinalApprovalStatus !== "Approved" &&
  //         item.FinalApprovalStatus !== "Rejected"
  //     );
  //   } else if (statusFilter === "Allocated") {
  //     result = result.filter((item) => item.FinalApprovalStatus === "Approved");
  //   } else if (statusFilter === "Rejected") {
  //     result = result.filter((item) => item.FinalApprovalStatus === "Rejected");
  //   }

  //   setFilteredData(result);
  // };

  // useEffect(() => {
  //   const jsonArr = [
  //     {
  //       DealerCode: "c0000001",
  //       DealerName: "ABC",
  //       DFModel: "BLUESTAR G315L [GT350NEP]",
  //       Vendor: "Blues star",
  //       Qty: 2,
  //       RequestDate: "01-Mar-2025",
  //       RequestNo: 789,
  //       PaymentMode: "Online",
  //       DepositAmount: 8000,
  //       PaymentStatus: "Success",
  //       BankName: "HDFC",
  //       PaymentRefNo: 101,
  //       ChequeNo: 111525,
  //       ChequeDate: "01-Mar-2025",
  //       SubmittedBy: "Dhiraj(99000034)",
  //       LastApprovedBy: "Kamal Desai(9900028)",
  //       FinalApprovalStatus: "Approved",
  //       DFAssignFrom: "PO",
  //       PO_Dist_Depo: "PO000001",
  //       Stock: 50,
  //     },
  //     {
  //       DealerCode: "c0000002",
  //       DealerName: "XYZ",
  //       DFModel: "BLUESTAR G315L [GT350NEP]",
  //       Vendor: "Blues star",
  //       Qty: 1,
  //       RequestDate: "15-Mar-2025",
  //       RequestNo: 790,
  //       PaymentMode: "Cheque",
  //       DepositAmount: 4000,
  //       PaymentStatus: "Pending",
  //       BankName: "SBI",
  //       PaymentRefNo: 102,
  //       ChequeNo: 111526,
  //       ChequeDate: "15-Mar-2025",
  //       SubmittedBy: "Rahul(99000035)",
  //       LastApprovedBy: "",
  //       FinalApprovalStatus: "Pending",
  //       DFAssignFrom: "",
  //       PO_Dist_Depo: "",
  //       Stock: 0,
  //     },
  //     {
  //       DealerCode: "c0000003",
  //       DealerName: "DEF",
  //       DFModel: "VOLTAS 1.5T [VX450]",
  //       Vendor: "Voltas",
  //       Qty: 3,
  //       RequestDate: "20-Mar-2025",
  //       RequestNo: 791,
  //       PaymentMode: "Online",
  //       DepositAmount: 12000,
  //       PaymentStatus: "Success",
  //       BankName: "ICICI",
  //       PaymentRefNo: 103,
  //       ChequeNo: "",
  //       ChequeDate: "",
  //       SubmittedBy: "Priya(99000036)",
  //       LastApprovedBy: "Kamal Desai(9900028)",
  //       FinalApprovalStatus: "Rejected",
  //       DFAssignFrom: "",
  //       PO_Dist_Depo: "",
  //       Stock: 0,
  //     },
  //   ];
  //   setData(jsonArr);
  //   const pendingData = jsonArr.filter(
  //     (item) =>
  //       item.FinalApprovalStatus !== "Approved" &&
  //       item.FinalApprovalStatus !== "Rejected"
  //   );
  //   setFilteredData(pendingData);
  //   // Set status filter to "Pending" by default
  //   setStatusFilter("Pending");
  // }, []);


  const handleFilter = () => {
    if (!fromDate || !toDate || !statusFilter) {
      alert("Please select from date, to date and status.");
      return;
    }
  
    const formattedFromDate = dayjs(fromDate).format("DD-MMM-YYYY");
    const formattedToDate = dayjs(toDate).format("DD-MMM-YYYY");
    if (dayjs(fromDate).isAfter(dayjs(toDate))) {
      alert("From Date cannot be later than To Date.");
      return;
    }
  
    // Step 1: Call API
    $.ajax({
      url: `${Config}/AssetsAllocation/GetDFInfo?FromDate=${formattedFromDate}&ToDate=${formattedToDate}&Status=${statusFilter}`,
      type: "GET",
      success: function (response) {
        if (response?.isSuccess === true) {
          try {
            const jsonArray = JSON.parse(response.res);
  
            if (jsonArray?.Value?.ResponseCode === "Fail") {
              console.log("Failed to fetch data: " + jsonArray.Value.Message);
              setFilteredData([]); 
              return;
              
            }
  
            const rawData = jsonArray;
  
            // Step 3: Save data
            setFilteredData(rawData);    // filtered data for display

            console.log("filteredData", rawData)
  
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        } else {
          alert("Failed to fetch data from API");
        }
      },
      error: function (err) {
        console.error("AJAX error:", err);
      },
    });
  };
  const tableColumns = [
    {
      name: "View Stock",
      cell: (row) => (
        <button
          className="view-btn"
          onClick={() => handleViewStock(row)}
          disabled={row.FinalApprovalStatus === "Rejected"}
        >
          <FaEye /> View
        </button>
      ),
      width: "100px",
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Dealer Code",
      selector: (row) => `${row.MslCode}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Dealer Name",
      selector: (row) => `${row.MSLName}`,
      width: "200px",
      sortable: true,
      center: true,
    },
    {
      name: "DF Model",
      selector: (row) => `${row.MName}`,
      width: "250px",
      sortable: true,
      center: true,
    },
    {
      name: "Material Code",
      selector: (row) => `${row.MCode}`,
      width: "250px",
      sortable: true,
      center: true,
    },
    {
      name: "Vendor",
      selector: (row) => `${row.Vendor_Name}`,
      sortable: true,
      center: true,
    },
    {
      name: "Request Date",
      selector: (row) => `${row.CreatedDate}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Request No",
      selector: (row) => `${row.DFDetailNo}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Payment Mode",
      selector: (row) => `${row.PaymentMode}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Deposit Amount",
      selector: (row) => `${row.DepositAmt}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Payment Status",
      selector: (row) => `${row.PaymentStatus}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Bank Name",
      selector: (row) => `${row.BankName}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Payment ref no",
      selector: (row) => `${row.bankrefno}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Cheque No",
      selector: (row) => `${row.ChequeNo}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Cheque Date",
      selector: (row) => `${row.ChequeDate}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Submitted By",
      selector: (row) => `${row.SubmittedBy}`,
      width: "150px",
      sortable: true,
      center: true,
    },
    {
      name: "Approved by",
      selector: (row) => `${row.ApprovedBy}`,
      width: "200px",
      sortable: true,
      center: true,
    },
  ];


  const poStockDetails = [
    { poNumber: "PO000001", state: "Gujarat", vendor: "abc", stock: 20 },
    { poNumber: "PO000002", state: "Maharastra", vendor: "abc", stock: 15 },
    { poNumber: "PO000003", state: "Bihar", vendor: "abc", stock: 15 },
  ];

  // const distributorStockDetails = [
  //   { distributorCode: "DIST001", distributorName: "Distributor 1", stock: 10 },
  //   { distributorCode: "DIST002", distributorName: "Distributor 2", stock: 12 },
  //   { distributorCode: "DIST003", distributorName: "Distributor 3", stock: 8 },
  // ];
  const [distributorStockDetails , setDistributorStockDetails]=useState([])

  const viewdistributer = () => {

     console.log(filteredData,"currentstocj")
    const mslCode = filteredData?.MslCode;
    const DFModelNo = currentStockData?.details?.DFModelNew;
    console.log(currentStockData,mslCode,DFModelNo,"rowsggsjdgja")

  
    const apiUrl = `https://hrplcoretest-fforce.ssplbusiness.com/WEB/AssetsAllocation/GetDFStockDetails?MSLCode=${mslCode}&DFModelNo=${DFModelNo}`;
  
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: function (response) {
        if (response?.isSuccess === true) {
          try {
            const jsonArray = JSON.parse(response.res);
  
            if (jsonArray?.Value?.ResponseCode === "Fail") {
              console.log("Failed to fetch data: " + jsonArray.Value.Message);
              alert("Data Not Found")
              setShowStockDetailDialog(false)
              return;
            }
  
            const transformed = jsonArray.map((item) => ({
              distributorCode: item.MSLCode,
              distributorName: item.MSLName,
              stock: item.Cnt,
            }));
  
            setDistributorStockDetails(transformed);
            setShowStockDialog(true); // If you want to open a modal or section
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        } else {
          alert("Failed to fetch data");
        }
      },
      error: function (err) {
        console.error("AJAX error:", err);
      },
    });
  };
  
  


























  const depoStockDetails = [
    { depoCode: "DEPO001", depoName: "Depo 1", stock: 7 },
    { depoCode: "DEPO002", depoName: "Depo 2", stock: 8 },
    { depoCode: "DEPO003", depoName: "Depo 3", stock: 5 },
  ];

  const handleStockButtonClick = (type) => {
    setStockDetailType(type);
    // Set appropriate data based on type
    switch (type) {
      case "PO":
        setStockDetailData(poStockDetails);
        break;
      case "Distributor":
        setStockDetailData(distributorStockDetails);
        break;
      case "Depo":
        setStockDetailData(depoStockDetails);
        break;
      default:
        setStockDetailData([]);
    }
    setShowStockDetailDialog(true);
  };

  const handleRejectClick = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one request to reject");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to reject ${selectedRows.length} request(s)?`
      )
    ) {
      const updatedData = data.map((item) =>
        selectedRows.some((row) => row.RequestNo === item.RequestNo)
          ? { ...item, FinalApprovalStatus: "Rejected" }
          : item
      );

      setData(updatedData);
      setFilteredData(updatedData);
      setToggleCleared(!toggleCleared);
      setSelectedRows([]);
      alert(`${selectedRows.length} request(s) rejected successfully`);
    }
  };

  return (
    <Fragment>
      <div className="data-table-container" style={{ marginTop: "90px" }}>
        {/* Filter Controls */}
        <div className="filter-container">
          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button className="filter-btn" onClick={handleFilter}>
            <FaFilter /> Go
          </button>
        </div>

        <DataTable
          title="DF Allocation"
          columns={tableColumns}
          data={filteredData}
          striped
          highlightOnHover
          pagination
          selectableRows
          selectableRowDisabled={(row) =>
            row.FinalApprovalStatus === "Approved" ||
            row.FinalApprovalStatus === "Rejected"
          }
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={toggleCleared}
          selectableRowsNoSelectAll
          selectableRowsHighlight
          noContextMenu
        />

        {selectedRows.length > 0 && (
          <div className="button-container">
            <div className="action-buttons">
              <button
                className="action-btn clear-btn"
                onClick={handleClearSelected}
              >
                <FaTimes className="btn-icon" />
                Clear Selection
              </button>

              <button
                className="action-btn reject-btn"
                onClick={handleRejectClick}
              >
                <FaTimes className="btn-icon" />
                Reject Selected ({selectedRows.length})
              </button>

              <button
                className="action-btn change-model-btn"
                onClick={() => setShowChangeModelDialog(true)}
              >
                <FaEdit className="btn-icon" />
                Change DF Model ({selectedRows.length})
              </button>

              <button
                className="action-btn process-btn"
                onClick={handleProcessClick}
              >
                <FaCheck className="btn-icon" />
                Process Selected ({selectedRows.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Allocation Dialog */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <h3>Allocation Type</h3>
              <button className="close-btn" onClick={handleDialogClose}>
                <FaTimes />
              </button>
            </div>

            <div className="dialog-body">
              {/* Selected Requests Summary */}
              <div className="selected-requests-summary">
                <h4>Selected Requests ({selectedRows.length}):</h4>
                <div className="requests-list">
                  {selectedRows.map((row, index) => {
                    const availableStock =
                      allocationType &&
                      ((allocationType === "PO" && selectedPoNumber) ||
                        (allocationType !== "PO" && selectedEntity))
                        ? getAvailableStock(
                            allocationType,
                            allocationType === "PO"
                              ? selectedPoNumber
                              : selectedEntity,
                            row.DFModel
                          )
                        : null;

                    return (
                      <div key={index} className="request-item">
                        <span className="dealer-name">{row.DealerName}</span>
                        <span className="model-name">{row.DFModel}</span>
                        {availableStock !== null && (
                          <span
                            className={`available-stock ${
                              availableStock < row.Qty ? "low-stock" : ""
                            }`}
                          >
                            Available Stock: {availableStock}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="dialog-body">
                <div className="form-group">
                  <label htmlFor="allocation-type">Allocation Type:</label>
                  <select
                    id="allocation-type"
                    value={allocationType}
                    onChange={(e) => {
                      setAllocationType(e.target.value);
                      setSelectedEntity("");
                    }}
                    className="dropdown-select"
                  >
                    <option value="">-- Select allocation type --</option>
                    {allocationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PO Number Selection (shown when PO is selected) */}
                {allocationType === "PO" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="state-filter">Filter by State:</label>
                      <select
                        id="state-filter"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="dropdown-select"
                      >
                        {stateOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="po-number">PO Number:</label>
                      <select
                        id="po-number"
                        value={selectedPoNumber}
                        onChange={(e) => setSelectedPoNumber(e.target.value)}
                        className="dropdown-select"
                      >
                        {poNumbers
                          .filter(
                            (po) => !selectedState || po.state === selectedState
                          )
                          .map((po) => (
                            <option key={po.value} value={po.value}>
                              {po.label} ({po.state})
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}

                {/* DF Serial Number Selection (shown when PO is selected)
              {allocationType === "PO" && (
                <div className="form-group">
                  <label htmlFor="df-serial">DF Serial Number:</label>
                  <select
                    id="df-serial"
                    value={selectedDfSerialNumber}
                    onChange={(e) => setSelectedDfSerialNumber(e.target.value)}
                    className="dropdown-select"
                  >
                    {dfSerialNumbers.map((serial) => (
                      <option key={serial.value} value={serial.value}>
                        {serial.label}
                      </option>
                    ))}
                  </select>
                </div>
              )} */}

                {(allocationType === "Distributor" ||
                  allocationType === "Depo") && (
                  <div className="form-group">
                    <label htmlFor="entity-select">
                      Select {allocationType}:
                    </label>
                    <select
                      id="entity-select"
                      value={selectedEntity}
                      onChange={(e) => setSelectedEntity(e.target.value)}
                      className="dropdown-select"
                    >
                      <option value="">
                        -- Select {allocationType.toLowerCase()} --
                      </option>
                      {entityOptions[allocationType].map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedEntity &&
                  (allocationType === "Distributor" ||
                    allocationType === "Depo") && (
                    <div className="form-group">
                      <label htmlFor="serial-select">DF Serial Number:</label>
                      <select
                        id="serial-select"
                        value={selectedSerial}
                        onChange={(e) => setSelectedSerial(e.target.value)}
                        className="dropdown-select"
                      >
                        <option value="">-- Select serial number --</option>
                        {serialOptions[selectedEntity]?.map((serial) => (
                          <option key={serial} value={serial}>
                            {serial}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>

              <div className="dialog-footer">
                <button
                  className="dialog-btn cancel-btn"
                  onClick={handleDialogClose}
                >
                  Cancel
                </button>
                <button
                  className="dialog-btn confirm-btn"
                  onClick={handleDialogProcess}
                  disabled={
                    !allocationType ||
                    (allocationType === "PO" &&
                      (!selectedPoNumber || !selectedDfSerialNumber)) ||
                    ((allocationType === "Distributor" ||
                      allocationType === "Depo") &&
                      !selectedSerial)
                  }
                >
                  <FaCheck className="btn-icon" />
                  Allocate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Details Dialog */}
      {showStockDialog && currentStockData && (
        <div className="dialog-overlay">
          <div className="dialog-container stock-dialog">
            <div className="dialog-header">
              <h3>Stock Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowStockDialog(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="dialog-body">
              <div className="stock-details">
                <h4>
                  Dealer: {currentStockData.details.DealerName} (
                  {currentStockData.details.DealerCode})
                </h4>
                <h4>DF Model: {currentStockData?.details?.MName}</h4>

                <div className="stock-grid">
                  <div className="stock-item">
                    <h5>PO Stock</h5>
                    <div className="stock-value">
                      {currentStockData.poStock}
                    </div>
                  </div>
                  <div className="stock-item">
                    <h5>Distributor Stock</h5>
                    <div className="stock-value">
                      {currentStockData.distributorStock}
                    </div>
                  </div>
                  <div className="stock-item">
                    <h5>Depo Stock</h5>
                    <div className="stock-value">
                      {currentStockData.depoStock}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                className="dialog-btn cancel-btn"
                onClick={() => setShowStockDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Details Dialog */}
      {showStockDialog && currentStockData && (
        <div className="dialog-overlay">
          <div className="dialog-container stock-dialog">
            <div className="dialog-header">
              <h3>Stock Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowStockDialog(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="dialog-body">
              <div className="stock-details">
                <h4>
                  Dealer: {currentStockData.details.DealerName} (
                  {currentStockData.details.DealerCode})
                </h4>
                <h4>DF Model: {currentStockData.details.DFModel}</h4>

                <div className="stock-grid">
                  <div
                    className="stock-item clickable"
                    onClick={() => handleStockButtonClick("PO")}
                  >
                    <h5>PO Stock</h5>
                    <div className="stock-value">
                      {currentStockData.poStock}
                    </div>
                    <div className="stock-click-text" >Click for details</div>
                  </div>
                  <div
                    className="stock-item clickable"
                    onClick={() => handleStockButtonClick("Distributor")}
                  >
                    <h5>Distributor Stock</h5>
                    <div className="stock-value">
                      {currentStockData.distributorStock}
                    </div>
                    <div className="stock-click-text" onClick={viewdistributer}>Click for details</div>
                  </div>
                  <div
                    className="stock-item clickable"
                    onClick={() => handleStockButtonClick("Depo")}
                  >
                    <h5>Depo Stock</h5>
                    <div className="stock-value">
                      {currentStockData.depoStock}
                    </div>
                    <div className="stock-click-text">Click for details</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                className="dialog-btn cancel-btn"
                onClick={() => setShowStockDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Detail Dialog (for PO/Distributor/Depo details) */}
      {showStockDetailDialog && (
        <div className="dialog-overlay">
          <div className="dialog-container stock-detail-dialog">
            <div className="dialog-header">
              <h3>{stockDetailType} Stock Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowStockDetailDialog(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="dialog-body">
              <div className="stock-detail-table">
                <table>
                  <thead>
                    <tr>
                      {stockDetailType === "PO" && (
                        <>
                          <th>PO Number</th>
                          <th>State</th>
                          <th>Vendor</th>
                          <th>Stock</th>
                        </>
                      )}
                      {(stockDetailType === "Distributor" ||
                        stockDetailType === "Depo") && (
                        <>
                          <th>{stockDetailType} Code</th>
                          <th>{stockDetailType} Name</th>
                          <th>Stock</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {stockDetailData.map((item, index) => (
                      <tr key={index}>
                        {stockDetailType === "PO" && (
                          <>
                            <td>{item.poNumber}</td>
                            <td>{item.state}</td>
                            <td>{item.vendor}</td>
                            <td>{item.stock}</td>
                          </>
                        )}
                        {stockDetailType === "Distributor" && (
                          <>
                            <td>{item.distributorCode}</td>
                            <td>{item.distributorName}</td>
                            <td>{item.stock}</td>
                          </>
                        )}
                        {stockDetailType === "Depo" && (
                          <>
                            <td>{item.depoCode}</td>
                            <td>{item.depoName}</td>
                            <td>{item.stock}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dialog-footer">
              <button
                className="dialog-btn cancel-btn"
                onClick={() => setShowStockDetailDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangeModelDialog && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <h3>Change DF Model</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowChangeModelDialog(false);
                  setSelectedVendor(null);
                  setSelectedDfModel(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor:</label>
                <select
                  value={selectedVendor?.id || ""}
                  onChange={(e) => {
                    const vendorId = parseInt(e.target.value);
                    const vendor = vendors.find((v) => v.id === vendorId);
                    setSelectedVendor(vendor || null);
                  }}
                  className="dropdown-select"
                >
                  <option value="">-- Select Vendor --</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>DF Model:</label>
                <select
                  value={selectedDfModel?.id || ""}
                  onChange={(e) => {
                    const modelId = parseInt(e.target.value);
                    const model = filteredModels.find((m) => m.id === modelId);
                    setSelectedDfModel(model || null);
                  }}
                  className="dropdown-select"
                  disabled={!selectedVendor}
                >
                  <option value="">-- Select Model --</option>
                  {filteredModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="selected-rows-info">
                <p>
                  This change will affect {selectedRows.length} selected
                  record(s).
                </p>
                {selectedVendor && selectedDfModel && (
                  <p>
                    Changing to: {selectedDfModel.model} ({selectedVendor.name})
                  </p>
                )}
              </div>
            </div>

            <div className="dialog-footer">
              <button
                className="dialog-btn cancel-btn"
                onClick={() => {
                  setShowChangeModelDialog(false);
                  setSelectedVendor(null);
                  setSelectedDfModel(null);
                }}
              >
                Cancel
              </button>
              <button
                className="dialog-btn confirm-btn"
                onClick={() => {
                  if (!selectedVendor || !selectedDfModel) {
                    alert("Please select both vendor and model");
                    return;
                  }

                  const updatedData = data.map((item) =>
                    selectedRows.some((row) => row.id === item.id)
                      ? {
                          ...item,
                          DFModel: selectedDfModel.model,
                          Vendor: selectedVendor.name,
                        }
                      : item
                  );

                  setData(updatedData);
                  setFilteredData(updatedData);
                  setShowChangeModelDialog(false);
                  setSelectedVendor(null);
                  setSelectedDfModel(null);
                  alert(
                    `${selectedRows.length} record(s) updated successfully`
                  );
                }}
                disabled={!selectedVendor || !selectedDfModel}
              >
                <FaCheck className="btn-icon" />
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default DFAllocation;
