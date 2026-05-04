import React, { useState } from "react";
import { Container, Form, Button, Row, Col, Card} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { Link} from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role_id: "1",
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    home_address: "",
    home_latitude: "",
    home_longitude: "",
    workshop_name: "", // mechanic only
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        home_latitude: pos.coords.latitude,
        home_longitude: pos.coords.longitude,
      }));
    });
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <Card className="p-4 shadow">
        <h2 className="text-center mb-4">Roadside Assistance</h2>
        <h3 className="text-center mb-4">Create Account</h3>

        <Form onSubmit={handleSubmit}>
          {/* Role */}
          <Form.Group className="mb-3">
            <Form.Label>Select Role</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="User"
                name="role_id"
                value="1"
                checked={formData.role_id === "1"}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Mechanic"
                name="role_id"
                value="2"
                checked={formData.role_id === "2"}
                onChange={handleChange}
              />
            </div>
          </Form.Group>

          {/* Basic Info */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>PIN (4-6 digits)</Form.Label>
            <Form.Control
              type="password"
              name="password"
              maxLength={6}
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Mechanic Only */}
          {formData.role_id === "2" && (
            <Form.Group className="mb-3">
              <Form.Label>Workshop Name</Form.Label>
              <Form.Control
                name="workshop_name"
                value={formData.workshop_name}
                onChange={handleChange}
              />
            </Form.Group>
          )}

          {/* Emergency */}
          <h5 className="mt-3">Emergency Contact</h5>

          <Row>
            <Col md={4}>
              <Form.Control
                placeholder="Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="mb-2"
              />
            </Col>

            <Col md={4}>
              <Form.Control
                placeholder="Phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className="mb-2"
              />
            </Col>

            <Col md={4}>
              <Form.Control
                placeholder="Relation"
                name="emergency_contact_relation"
                value={formData.emergency_contact_relation}
                onChange={handleChange}
                className="mb-2"
              />
            </Col>
          </Row>

          {/* Address */}
          <h5 className="mt-3">Home Address</h5>

          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={2}
              name="home_address"
              value={formData.home_address}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="outline-secondary" onClick={getLocation}>
            Get Current Location
          </Button>

          <Row className="mt-2">
            <Col md={6}>
              <Form.Control
                placeholder="Latitude"
                value={formData.home_latitude}
                disabled
              />
            </Col>
            <Col md={6}>
              <Form.Control
                placeholder="Longitude"
                value={formData.home_longitude}
                disabled
              />
            </Col>
          </Row>

          {/* Submit */}
          <Button
            type="submit"
            className="w-100 mt-4"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          <Link to="/login" className="text-decoration-none mt-2">
            Have an account? Sign In
          </Link>
        </Form>
      </Card>
    </Container>
  );
};

export default Register;