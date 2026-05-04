import React, { useState ,useEffect} from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Nav,
  Badge,
  Alert,
  Modal,
  ButtonGroup,
} from "react-bootstrap";
import LoadingWrapper from "../Common/LoadingWrapper";
import { useAuth } from "../../context/AuthContext";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Profile = () => {
  const { user, updateUser, updateProfile,getVehicles , addVehicle ,updateVehicle,deleteVehicle} = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  // Profile Data State
  const [profileData, setProfileData] = useState(user);

  // Vehicles State
  const [vehicles, setVehicles] = useState([]);
  const fetchVehicles = async () => {
      const data = await getVehicles(); // call context API
      setVehicles(data); // update state
  };
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Modal States
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form States
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_type: "",
    fuel_type: "",
    color: "",
    is_default: false,
    vehicle_latitude: "",
    vehicle_longitude: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Stats
  const [stats, setStats] = useState({
    totalRequests: 24,
    completedRequests: 22,
    averageRating: 4.7,
    totalSpent: 12500,
  });

  // Show Toast/Alert
  const showMessage = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Handle Profile Change
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // Save Profile with Loading
  const handleSaveProfile = async () => {
    setIsSaving(true);
    const formData = new FormData();
    const response = await updateProfile(profileData);
    
    setTimeout(() => {
      showMessage("Profile updated successfully!", "success");
      setIsEditing(false);
      setIsSaving(false);
    }, 1500);
  };

  // Handle Vehicle Form Change
  const handleVehicleChange = (e) => {
    setVehicleForm({
      ...vehicleForm,
      [e.target.name]: e.target.value,
    });
  };

  // Save Vehicle
  const handleSaveVehicle = async () => {
    setIsSavingVehicle(true);
    
      if (selectedVehicle) {
        let res = await updateVehicle(selectedVehicle.id,vehicleForm)
        console.log(res,"res");
        
        if(res?.statusCode == 201){
          showMessage(res?.message, "success");
        }else{
          showMessage(res?.message, "danger");
        }
        showMessage("Vehicle updated successfully!", "success");
      } else {
        let res = await addVehicle(vehicleForm);
        if(res?.statusCode == 201){
          showMessage(res?.message, "success");
        }else{
          showMessage(res?.message, "danger");
        }
      }
      fetchVehicles()
      setShowVehicleModal(false);
      setSelectedVehicle(null);
      setIsSavingVehicle(false);
  };

  // Edit Vehicle
  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm(vehicle);
    setShowVehicleModal(true);
  };

  // Delete Vehicle
  const handleDeleteVehicle = async(vehicleId) => {
    try {
      let response = await deleteVehicle(vehicleId)

      showMessage(response.message, "success");
      fetchVehicles()
    } catch (error) {
      showMessage(error, "danger");
    }
  };

  // Set Default Vehicle
  const handleSetDefault = (vehicleId) => {
    setVehicles(
      vehicles.map((v) => ({
        ...v,
        is_default: v.id === vehicleId,
      })),
    );
    showMessage("Default vehicle updated!", "success");
  };

  // Handle Password Change
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage("Passwords do not match!", "danger");
      return;
    }
    
    setIsChangingPassword(true);
    
    setTimeout(() => {
      showMessage('Password changed successfully!', 'success');
      setShowPasswordModal(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setIsChangingPassword(false);
    }, 1500);
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    setTimeout(() => {
      showMessage("Account deletion request submitted.", "info");
      setShowDeleteModal(false);
      setIsDeleting(false);
    }, 1500);
  };

  // Load Stats with Loading
  const loadStats = async () => {
    setIsLoadingStats(true);
    setTimeout(() => {
      setStats({
        totalRequests: 24,
        completedRequests: 22,
        averageRating: 4.7,
        totalSpent: 12500,
      });
      setIsLoadingStats(false);
    }, 1000);
  };

  return (
    <Container fluid className="p-4">
      {/* Alert Message */}
      {showAlert && (
        <Alert
          variant={alertVariant}
          onClose={() => setShowAlert(false)}
          dismissible
          className="position-fixed top-0 end-0 m-3"
          style={{ zIndex: 9999, minWidth: "300px" }}
        >
          {alertMessage}
        </Alert>
      )}

      {/* Header with Loading Link */}
      <div className="text-left mb-5">
        <h2 className="fw-bold mb-2">My Profile</h2>
        <p className="text-muted">
          Manage your account details and preferences
        </p>
        {/* <LoadingWrapper 
          as="a" 
          href="#"
          loading={isLoadingStats}
          loadingText="Refreshing stats..."
          loadingPosition="right"
          className="text-decoration-none small"
          onClick={(e) => {
            e.preventDefault();
            loadStats();
          }}
        >
          <i className="bi bi-arrow-repeat me-1"></i>
          Refresh Stats
        </LoadingWrapper> */}
      </div>

      <Row>
        <Col lg={6} md={6} sm={12}>
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="text-center p-4">
              <div className="position-relative d-inline-block mb-3">
                <div
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto text-white"
                  style={{
                    width: "100px",
                    height: "100px",
                    fontSize: "2.5rem",
                  }}
                >
                  {profileData.full_name.charAt(0).toUpperCase()}
                </div>
              </div>

              <h4 className="fw-bold mb-1">{profileData.full_name}</h4>
              <div className="mb-3">
                <Badge bg="success" className="me-1">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Verified Account
                </Badge>
              </div>

              <hr className="my-3" />

              <div className="text-start">
                <div className="mb-2">
                  <i className="bi bi-telephone-fill text-muted me-2"></i>
                  <span>{profileData.phone_number}</span>
                </div>
                <div className="mb-2">
                  <i className="bi bi-envelope-fill text-muted me-2"></i>
                  <span>{profileData.email}</span>
                </div>
                <div>
                  <i className="bi bi-geo-alt-fill text-muted me-2"></i>
                  <span className="small">{profileData.address}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {/* Left Column - Profile Summary */}
        <Col lg={6} md={6} sm={12} className="mb-4">
          {/* Quick Stats with Loading Overlay */}
          <LoadingWrapper
            loading={isLoadingStats}
            overlay={true}
            loadingText="Loading stats..."
            overlayColor="rgba(255, 255, 255, 0.9)"
          >
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">Quick Stats</h6>
                <Row>
                  <Col xs={6} className="mb-3">
                    <div className="text-muted small">Total Requests</div>
                    <h3 className="fw-bold mb-0">{stats.totalRequests}</h3>
                  </Col>
                  <Col xs={6} className="mb-3">
                    <div className="text-muted small">Completed</div>
                    <h3 className="fw-bold mb-0">{stats.completedRequests}</h3>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Rating</div>
                    <div className="d-flex align-items-center">
                      <h3 className="fw-bold mb-0 me-1">
                        {stats.averageRating}
                      </h3>
                      <i className="bi bi-star-fill text-warning"></i>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Total Spent</div>
                    <h3 className="fw-bold mb-0">₹{stats.totalSpent}</h3>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </LoadingWrapper>
        </Col>

        {/* Right Column - Tabs */}
        <Col lg={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <Nav
                variant="tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
              >
                <Nav.Item>
                  <Nav.Link eventKey="personal">
                    <i className="bi bi-person me-2"></i>Personal Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="vehicles">
                    <i className="bi bi-car-front me-2"></i>Vehicles
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="settings">
                    <i className="bi bi-gear me-2"></i>Settings
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security">
                    <i className="bi bi-shield-lock me-2"></i>Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div>
                  <div className="d-flex justify-content-end mb-4 gap-2">
                    {!isEditing ? (
                      <LoadingWrapper
                        as="button"
                        variant="outline-primary"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Edit Profile
                      </LoadingWrapper>
                    ) : (
                      <>
                        <LoadingWrapper
                          as="button"
                          variant="outline-secondary"
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Cancel
                        </LoadingWrapper>
                        <LoadingWrapper
                          as="button"
                          variant="primary"
                          onClick={handleSaveProfile}
                          loading={isSaving}
                          loadingText="Saving..."
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Save Changes
                        </LoadingWrapper>
                      </>
                    )}
                  </div>

                  <Form>
                    <Row className="mb-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Full Name</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="text"
                            name="full_name"
                            value={profileData.full_name}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                            loadingPosition="right"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            disabled
                          />
                          <Form.Text className="text-muted">
                            {/* Email cannot be changed */}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Phone Number</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="tel"
                            name="phone_number"
                            value={profileData.phone_number}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Emergency Contact Name</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="text"
                            name="emergency_contact_name"
                            value={profileData.emergency_contact_name}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Emergency Contact Phone</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="tel"
                            name="emergency_contact_phone"
                            value={profileData.emergency_contact_phone}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Emergency Contact Relation</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="tel"
                            name="emergency_contact_relation"
                            value={profileData.emergency_contact_relation}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Home Address</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="text"
                            name="home_address"
                            value={profileData.home_address}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Home Latitude</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="text"
                            name="home_latitude"
                            value={profileData.home_latitude}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Home Longitude</Form.Label>
                          <LoadingWrapper
                            as="input"
                            type="text"
                            name="home_longitude"
                            value={profileData.home_longitude}
                            onChange={handleProfileChange}
                            disabled={!isEditing || isSaving}
                            className="form-control"
                            loading={isSaving}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </div>
              )}

              {/* Vehicles Tab */}
              {activeTab === "vehicles" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                      My Vehicles ({vehicles.length})
                    </h5>
                    <LoadingWrapper
                      as="button"
                      variant="primary"
                      onClick={() => {
                        setSelectedVehicle(null);
                        setVehicleForm({
                          vehicle_number: "",
                          vehicle_make: "",
                          vehicle_model: "",
                          vehicle_year: "",
                          vehicle_type: "SUV",
                        });
                        setShowVehicleModal(true);
                      }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Vehicle
                    </LoadingWrapper>
                  </div>

                  <LoadingWrapper
                    loading={isLoadingVehicles}
                    overlay={true}
                    loadingText="Loading vehicles..."
                  >
                    {vehicles.length === 0 ? (
                      <div className="text-center py-5">
                        <i
                          className="bi bi-car-front"
                          style={{ fontSize: "4rem" }}
                        ></i>
                        <h6 className="mt-3 text-muted">
                          No vehicles added yet
                        </h6>
                        <LoadingWrapper
                          as="button"
                          variant="outline-primary"
                          className="mt-2"
                        >
                          Add Your First Vehicle
                        </LoadingWrapper>
                      </div>
                    ) : (
                      vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="mb-3 shadow-sm">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="d-flex">
                                <div className="me-3">
                                  <i
                                    className="bi bi-car-front"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    {vehicle.vehicle_make}{" "}
                                    {vehicle.vehicle_model}
                                  </h6>
                                  <div className="small text-muted mb-2">
                                    {vehicle.vehicle_number} •{" "}
                                    {vehicle.vehicle_year}
                                  </div>
                                  <div>
                                    <Badge bg="secondary" className="me-1">
                                      {vehicle.vehicle_type}
                                    </Badge>
                                    {vehicle.is_default && (
                                      <Badge bg="primary">Default</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <ButtonGroup size="sm">
                                  <LoadingWrapper
                                    as="button"
                                    variant="outline-primary"
                                    onClick={() => handleEditVehicle(vehicle)}
                                    loading={isSavingVehicle}
                                    loadingText=""
                                    showSpinner={true}
                                    spinnerSize="sm"
                                  >
                                    <ModeEditIcon></ModeEditIcon>
                                  </LoadingWrapper>
                                  <LoadingWrapper
                                    as="button"
                                    variant="outline-danger"
                                    loadingText="deleting..."
                                    onClick={() =>
                                      handleDeleteVehicle(vehicle.id)
                                    }
                                  >
                                    <DeleteForeverIcon></DeleteForeverIcon>
                                  </LoadingWrapper>
                                </ButtonGroup>
                              </div>
                            </div>
                            {!vehicle.is_default && (
                              <div className="mt-2 text-end">
                                <LoadingWrapper
                                  as="a"
                                  href="#"
                                  className="text-decoration-none small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleSetDefault(vehicle.id);
                                  }}
                                >
                                  Set as Default
                                </LoadingWrapper>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </LoadingWrapper>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h5 className="fw-bold mb-4">Notification Preferences</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div>
                        <i className="bi bi-bell me-2"></i>
                        <strong>Push Notifications</strong>
                        <div className="small text-muted">
                          Receive push notifications
                        </div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="push-switch"
                        defaultChecked
                      />
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div>
                        <i className="bi bi-envelope me-2"></i>
                        <strong>Email Notifications</strong>
                        <div className="small text-muted">
                          Receive email updates
                        </div>
                      </div>
                      <Form.Check
                        type="switch"
                        id="email-switch"
                        defaultChecked
                      />
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div>
                        <i className="bi bi-phone me-2"></i>
                        <strong>SMS Notifications</strong>
                        <div className="small text-muted">
                          Receive SMS alerts
                        </div>
                      </div>
                      <Form.Check type="switch" id="sms-switch" />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <Alert variant="warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Keep your account secure with strong passwords
                  </Alert>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div>
                        <i className="bi bi-key me-2"></i>
                        <strong>Change Password</strong>
                        <div className="small text-muted">
                          Update your account password
                        </div>
                      </div>
                      <LoadingWrapper
                        as="button"
                        variant="outline-primary"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change Password
                      </LoadingWrapper>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="bg-danger bg-opacity-10 p-4 rounded">
                    <h6 className="text-danger fw-bold mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Danger Zone
                    </h6>
                    <Alert variant="danger">
                      This action cannot be undone. This will permanently delete
                      your account.
                    </Alert>
                    <LoadingWrapper
                      as="button"
                      variant="outline-danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Delete Account
                    </LoadingWrapper>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vehicle Modal */}
      <Modal
        show={showVehicleModal}
        onHide={() => !isSavingVehicle && setShowVehicleModal(false)}
        size="lg"
        className="mt-6"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Vehicle Number</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="text"
                    name="vehicle_number"
                    placeholder="e.g., MH 04 AB 1234"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value={vehicleForm.vehicle_number}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Vehicle Make</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="text"
                    name="vehicle_make"
                    placeholder="e.g., Honda"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value={vehicleForm.vehicle_make}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Vehicle Model</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="text"
                    name="vehicle_model"
                    placeholder="e.g., City"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value={vehicleForm.vehicle_model}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="number"
                    name="vehicle_year"
                    placeholder="e.g., 2022"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value={vehicleForm.vehicle_year}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Vehicle Type</Form.Label>
                  <LoadingWrapper
                    as="select"
                    name="vehicle_type"
                    className="form-select"
                    onChange={handleVehicleChange}
                    value={vehicleForm.vehicle_type}
                  >
                    <option>Select Type</option>
                    <option value='car'>Car</option>
                    <option value='bike'>Bike</option>
                    <option value='truck'>Truck</option>
                  </LoadingWrapper>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Fuel Type</Form.Label>
                  <LoadingWrapper
                    as="select"
                    name="fuel_type"
                    className="form-select"
                    onChange={handleVehicleChange}
                    value={vehicleForm.fuel_type}
                  >
                    <option>Select Fuel</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                  </LoadingWrapper>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Color</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="text"
                    name="color"
                    placeholder="e.g., White"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value={vehicleForm.color}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3 d-flex align-items-center">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Set as Default"
                    name="is_default"
                    onChange={handleVehicleChange}
                    value={1}
                    checked={vehicleForm.is_default === 1}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Latitude</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="text"
                    name="vehicle_latitude"
                    placeholder="Enter Latitude"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value ={vehicleForm.vehicle_latitude}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Longitude</Form.Label>
                  <LoadingWrapper
                    as="input"
                    type="text"
                    name="vehicle_longitude"
                    placeholder="Enter Longitude"
                    className="form-control"
                    onChange={handleVehicleChange}
                    value ={vehicleForm.vehicle_longitude}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <LoadingWrapper
            as="button"
            variant="secondary"
            onClick={() => setShowVehicleModal(false)}
            disabled={isSavingVehicle}
          >
            Cancel
          </LoadingWrapper>
          <LoadingWrapper
            as="button"
            variant="primary"
            onClick={handleSaveVehicle}
            loading={isSavingVehicle}
            loadingText={selectedVehicle ? "Updating..." : "Adding..."}
          >
            {selectedVehicle ? "Update Vehicle" : "Add Vehicle"}
          </LoadingWrapper>
        </Modal.Footer>
      </Modal>

      {/* Password Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => !isChangingPassword && setShowPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <LoadingWrapper
                as="input"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                disabled={isChangingPassword}
                className="form-control"
                loading={isChangingPassword}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <LoadingWrapper
                as="input"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                disabled={isChangingPassword}
                className="form-control"
                loading={isChangingPassword}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <LoadingWrapper
                as="input"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                disabled={isChangingPassword}
                className="form-control"
                loading={isChangingPassword}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <LoadingWrapper
            as="button"
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
            disabled={isChangingPassword}
          >
            Cancel
          </LoadingWrapper>
          <LoadingWrapper
            as="button"
            variant="primary"
            onClick={handleChangePassword}
            loading={isChangingPassword}
            loadingText="Changing Password..."
          >
            Update Password
          </LoadingWrapper>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !isDeleting && setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning!</strong> This action is permanent and cannot be
            undone!
          </Alert>
          <Form.Group>
            <Form.Label>
              Type <strong>DELETE</strong> to confirm
            </Form.Label>
            <LoadingWrapper
              as="input"
              type="text"
              placeholder="DELETE"
              disabled={isDeleting}
              className="form-control"
              loading={isDeleting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <LoadingWrapper
            as="button"
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </LoadingWrapper>
          <LoadingWrapper
            as="button"
            variant="danger"
            onClick={handleDeleteAccount}
            loading={isDeleting}
            loadingText="Deleting..."
          >
            <i className="bi bi-trash me-2"></i>
            Delete Account
          </LoadingWrapper>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;
