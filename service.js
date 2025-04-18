import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";
import "./css/ServiceableStateMaster.css";
import { Config } from "./Util";
import $ from "jquery";

const ServiceableStateMaster = () => {
  const [data, setData] = useState([]);
  const [indianStates, setIndianStates] = useState([]);
  const [serviceableStates, setServiceableStates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ state: "", serviceableState: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Fetching the data that come from Api
  useEffect(() => {
    $.ajax({
      url: `${Config}/AssetsAllocation/GetServiceableStateMatrix`,
      type: "GET",
      success: function (response) {
        if (response?.isSuccess === true) {
          try {
            const parsedRes = JSON.parse(response.res); // Parse the response to JSON (if not already JSON)
            console.log(parsedRes, "data");
            if (parsedRes?.Value?.ResponseCode === "Fail") {
              alert("Failed to fetch data: " + parsedRes.Value.Message);
            } else {
              setData(parsedRes); // Store the parsed JSON in state
              console.log(parsedRes, "Data We Get");
            }
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        } else {
          alert("Failed to fetch data");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error fetching data:", error);
      },
    });
  }, []);

  // Fetching Allstates
  useEffect(() => {
    $.ajax({
      url: "https://hrplcoretest-fforce.ssplbusiness.com/WEB/AssetsAllocation/GetAllStates",
      type: "GET",
      success: function (response) {
        if (response?.isSuccess === true) {
          const jsonArray = JSON.parse(response.res);

          try {
            if (jsonArray?.Value?.ResponseCode === "Fail") {
              console.log("Failed to fetch data: " + jsonArray.Value.Message);
            }

            setIndianStates(jsonArray);
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        } else {
          alert("Failed to fetch data");
        }
      },
    });
  }, []);

  // Fetching serviceable states
  useEffect(() => {
    $.ajax({
      url: "https://hrplcoretest-fforce.ssplbusiness.com/WEB/AssetsAllocation/GetServiceableState",
      type: "GET",
      success: function (response) {
        if (response?.isSuccess === true) {
          const jsonArray = JSON.parse(response.res);

          try {
            if (jsonArray?.Value?.ResponseCode === "Fail") {
              console.log("Failed to fetch data: " + jsonArray.Value.Message);
            }

           setServiceableStates(jsonArray);
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        } else {
          alert("Failed to fetch data");
        }
      },
    });
  }, []);

  //Adding new State and serviceable state
  const handleAdd = () => {
    // Validate fields
    if (!formData.state || !formData.serviceableState) {
      alert("Please select both state and serviceable state.");
      return;
    }

    // Prepare request payload
    const payload = {
      ServiceableStateMatrixNo: -1,
      ReceivingStateNo: Number(formData.state),
      ServiceableStateNo: Number(formData.serviceableState),
    };
    console.log(payload, "payload");

    // Make the API call to save the data
    $.ajax({
      url: `${Config}/AssetsAllocation/SaveServiceableState`,
      type: "POST",
      data: payload,
      success: function (response) {
        try {
          const parsedRes = JSON.parse(response.res);
          if (parsedRes?.Value?.ResponseCode === "Fail") {
            alert("Failed to add: " + parsedRes?.Value?.Message);
            return;
          } else {
            alert("Data Added Sucessfully");
            setShowAddModal(false);
          }

          $.ajax({
            url: `${Config}/AssetsAllocation/GetServiceableStateMatrix`,
            type: "GET",
            success: function (response) {
              if (response?.isSuccess === true) {
                try {
                  const parsedRes = JSON.parse(response.res); // Parse the response to JSON (if not already JSON)
                  console.log(parsedRes, "data");
                  if (parsedRes?.Value?.ResponseCode === "Fail") {
                    alert("Failed to fetch data: " + parsedRes.Value.Message);
                  } else {
                    setData(parsedRes); // Store the parsed JSON in state
                  }
                } catch (err) {
                  console.error("JSON parse error:", err);
                }
              } else {
                alert("Failed to fetch data");
              }
            },
            error: function (xhr, status, error) {
              console.error("Error fetching data:", error);
            },
          });
        } catch (err) {
          console.error("Failed to parse API response:", err);
          alert("Unexpected error occurred.");
        }
      },
    });
  };

  // Handle editing of an item
  const handleEdit = (row) => {
    setFormData({
      editId: row.ServiceableStateMatrixNo,
      state: row.ReceivingStateNo, // The state ID
      serviceableState: row.ServiceableStateNo, // The serviceable state ID
    });
    setIsEdit(true);
    setShowAddModal(true);
  };

  // Handle saving the edited data
  const handleSave = () => {
    // Validate that both state and serviceable state are selected
    if (!formData.state || !formData.serviceableState) {
      alert("Please fill in all the fields.");
      return;
    }

    // Prepare the data to update the selected row
    const updatedData = {
      ServiceableStateMatrixNo: formData.editId, // Use the unique ID for the record
      ReceivingStateNo: formData.state, // Updated state ID
      ServiceableStateNo: formData.serviceableState, // Updated serviceable state ID
    };
    console.log(updatedData, "updatedData");
    // Call the API to update the data on the server
    $.ajax({
      url: `${Config}/AssetsAllocation/SaveServiceableState`,
      type: "POST",
      data: updatedData,
      success: function (response) {
        if (response?.isSuccess === true) {
          console.log("Data updated successfully:", response);
          $.ajax({
            url: `${Config}/AssetsAllocation/GetServiceableStateMatrix`,
            type: "GET",
            success: function (response) {
              if (response?.isSuccess === true) {
                try {
                  const parsedRes = JSON.parse(response.res); // Parse the response to JSON (if not already JSON)
                  console.log(parsedRes, "data");
                  if (parsedRes?.Value?.ResponseCode === "Fail") {
                    alert("Failed to fetch data: " + parsedRes.Value.Message);
                  } else {
                    setData(parsedRes); 
                  }
                } catch (err) {
                  console.error("JSON parse error:", err);
                }
              } else {
                alert("Failed to fetch data");
              }
            },
            error: function (xhr, status, error) {
              console.error("Error fetching data:", error);
            },
          });

          setShowAddModal(false);
          setFormData({ state: "", serviceableState: "" });
          setEditingId(null);
          alert("Record updated successfully!");
        } else {
          console.error("Failed to update data:", response);
          alert("Failed to update data");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error updating data:", error);
        alert("Error occurred while updating data");
      },
    });
  };

  // Handle deleting a row
  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  // Columns for DataTable
  const columns = [
    {
      name: "State",
      selector: (row) => row.RcvStateName,
      sortable: true,
      headerStyle: {
        textAlign: "center",
        justifyContent: "center",
      },
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Serviceable State",
      selector: (row) => row.SrcStateName,
      sortable: true,
      headerStyle: {
        textAlign: "center",
        justifyContent: "center",
      },
      style: {
        textAlign: "center",
      },
    },
    {
      name: "Actions",
      cell: (row) =>
        editingId === row.id ? (
          <div className="action-buttons">
            <button onClick={() => handleSave(row.id)} className="save-btn">
              <FiSave />
            </button>
            <button onClick={() => setEditingId(null)} className="cancel-btn">
              <FiX />
            </button>
          </div>
        ) : (
          <div className="action-buttons">
            <button onClick={() => handleEdit(row)} className="edit-btn">
              <FiEdit2 />
            </button>
            <button onClick={() => handleDelete(row.id)} className="delete-btn">
              <FiTrash2 />
            </button>
          </div>
        ),
      headerStyle: {
        textAlign: "center",
        justifyContent: "center",
      },
      style: {
        textAlign: "center",
      },
    },
  ];

  return (
    <div className="serviceable-state-container">
      <div className="page-header">
        <h2>Serviceable State Master</h2>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Add New
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
        customStyles={{
          headCells: {
            style: {
              justifyContent: "center",
              textAlign: "center",
            },
          },
          cells: {
            style: {
              justifyContent: "center",
              textAlign: "center",
            },
          },
        }}
      />

      {/* Add New Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Serviceable State</h3>
            <div className="form-group">
              <label>State:</label>
              <select
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="form-control"
              >
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state.key} value={state.value}>
                    {state.Value}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Serviceable State:</label>
              <select
                value={formData.serviceableState}
                onChange={(e) =>
                  setFormData({ ...formData, serviceableState: e.target.value })
                }
                className="form-control"
              >
                <option value="">Select Serviceable State</option>
                {serviceableStates.map(( index) => (
                  <option key={index.Key} value={index.Key}>
                    {index.Value}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={isEdit === true ? handleSave : handleAdd}
                // onClick={handleAdd}
                disabled={!formData.state || !formData.serviceableState}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceableStateMaster;
